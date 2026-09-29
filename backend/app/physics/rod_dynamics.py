"""
Rod Dynamics Model based on Gibbs wave equation (1D damped wave equation)
Solves: u_tt = c^2 * u_xx - 2*beta*u_t
where c = sqrt(E/rho) is the wave speed, beta is the damping coefficient.

Reference: Gibbs (1963), "Computing Downhole Pump Cards from Surface Dynamometer Cards"
SPE Journal, Vol. 3, No. 1
"""

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    import math
    NUMPY_AVAILABLE = False

    class np:
        @staticmethod
        def linspace(start, stop, num):
            if num == 1:
                return [start]
            return [start + (stop - start) * i / (num - 1) for i in range(num)]

        @staticmethod
        def zeros(shape):
            if isinstance(shape, int):
                return [0.0] * shape
            return [[0.0 for _ in range(shape[1])] for _ in range(shape[0])]

        @staticmethod
        def mean(data):
            lst = list(data)
            return sum(lst) / len(lst) if lst else 0.0

        @staticmethod
        def var(data):
            lst = list(data)
            if not lst:
                return 0.0
            m = sum(lst) / len(lst)
            return sum((x - m) ** 2 for x in lst) / len(lst)

        @staticmethod
        def max(data):
            lst = list(data)
            return max(lst) if lst else 0.0

        @staticmethod
        def sqrt(x):
            return math.sqrt(x)

        @staticmethod
        def sin(x):
            return math.sin(x)

        @staticmethod
        def pi():
            return math.pi

        pi = math.pi

from typing import Dict, List, Tuple


class RodDynamicsModel:
    """
    Simulates sucker rod dynamics using the 1D damped wave equation (Gibbs method).

    Governing equation (in non-dimensional form):
        u_tt = c^2 * u_xx - 2*beta*u_t

    Finite-difference scheme (explicit, central differences in x and t):
        u[i,n+1] = (2*u[i,n] - u[i,n-1]*(1 - beta*dt) + alpha^2*(u[i+1,n] - 2*u[i,n] + u[i-1,n]))
                   / (1 + beta*dt)
    where alpha = c*dt/dx (Courant number, must be <= 1 for stability).
    """

    def __init__(self, rod_params: Dict):
        self.rod_length = rod_params.get('rod_length', 1300.0)       # m
        self.rod_diameter = rod_params.get('rod_diameter', 0.025)     # m
        self.rod_density = rod_params.get('rod_density', 7850.0)      # kg/m³ (steel)
        self.youngs_modulus = rod_params.get('youngs_modulus', 2.1e11) # Pa (steel)
        self.damping_coefficient = rod_params.get('damping_coefficient', 0.5)  # 1/s

        # Derived constants
        self.wave_speed = (self.youngs_modulus / self.rod_density) ** 0.5   # m/s (~5172 m/s for steel)
        self.rod_area = 3.14159 * (self.rod_diameter / 2) ** 2              # m²
        self.rod_mass_per_length = self.rod_density * self.rod_area          # kg/m
        self.rod_weight_per_length = self.rod_mass_per_length * 9.81         # N/m

        # Spatial discretisation — 50 nodes along the rod
        self.num_segments = 50
        self.segment_length = self.rod_length / (self.num_segments - 1)      # dx

        if NUMPY_AVAILABLE:
            self.depths = np.linspace(0, self.rod_length, self.num_segments)
            # Two time levels needed for the explicit scheme
            self.u_prev = np.zeros(self.num_segments)   # u[n-1]
            self.u_curr = np.zeros(self.num_segments)   # u[n]
            self.velocity = np.zeros(self.num_segments)
            self.load = np.zeros(self.num_segments)
            self.stress = np.zeros(self.num_segments)
        else:
            self.depths = np.linspace(0, self.rod_length, self.num_segments)
            self.u_prev = [0.0] * self.num_segments
            self.u_curr = [0.0] * self.num_segments
            self.velocity = [0.0] * self.num_segments
            self.load = [0.0] * self.num_segments
            self.stress = [0.0] * self.num_segments

        # Keep a displacement alias for compatibility
        self.displacement = self.u_curr

        # Choose time step to satisfy Courant condition: alpha = c*dt/dx <= 1
        self.dt = 0.8 * self.segment_length / self.wave_speed   # s (Courant ≈ 0.8)

    # ------------------------------------------------------------------
    # Surface boundary condition
    # ------------------------------------------------------------------
    def calculate_surface_displacement(self, spm: float, stroke_length: float,
                                       time: float) -> float:
        """
        Polished-rod displacement at the surface (top boundary condition).
        Uses a harmonic (sinusoidal) approximation:
            u_surface(t) = (S/2) * (1 - cos(omega*t))
        so displacement goes from 0 (bottom of stroke) to S (top of stroke).
        """
        omega = 2.0 * 3.14159 * spm / 60.0   # rad/s
        return (stroke_length / 2.0) * (1.0 - _cos(omega * time))

    def calculate_surface_velocity(self, spm: float, stroke_length: float,
                                   time: float) -> float:
        """d/dt of surface displacement."""
        omega = 2.0 * 3.14159 * spm / 60.0
        return (stroke_length / 2.0) * omega * _sin(omega * time)

    # ------------------------------------------------------------------
    # Wave equation solver
    # ------------------------------------------------------------------
    def solve_wave_equation(self, surface_displacement: float,
                            surface_velocity: float,
                            fluid_resistance: float,
                            time_step: float = None) -> Tuple:
        """
        Advance the wave equation one time step using an explicit finite-difference
        scheme with damping and viscous fluid resistance at each node.

        Scheme:
            u_new[i] = ( 2*u[i] - u_prev[i]*(1 - beta*dt)
                         + alpha^2*(u[i+1] - 2*u[i] + u[i-1])
                         - f_fluid[i]*dt^2 / (rod_mass_per_length) )
                       / (1 + beta*dt)

        Top BC:  u_new[0]  = surface_displacement  (prescribed motion)
        Bottom BC: pump boundary — loads at pump include fluid column weight and
                   a dashpot term for the fluid resistance.
        """
        dt = self.dt if time_step is None else time_step
        dx = self.segment_length
        c = self.wave_speed
        beta = self.damping_coefficient

        # Courant number
        alpha_sq = (c * dt / dx) ** 2   # must be <= 1 for stability; enforced by dt choice

        n = self.num_segments

        if NUMPY_AVAILABLE:
            u_new = self.u_curr.copy()
        else:
            u_new = list(self.u_curr)

        # Surface boundary condition (top node = polished rod)
        u_new[0] = surface_displacement

        # Interior nodes
        for i in range(1, n - 1):
            # Viscous fluid force per unit length at this node
            fluid_force = fluid_resistance * self.velocity[i]  # N/m

            u_new[i] = (
                2.0 * self.u_curr[i]
                - self.u_prev[i] * (1.0 - beta * dt)
                + alpha_sq * (self.u_curr[i + 1] - 2.0 * self.u_curr[i] + self.u_curr[i - 1])
                - fluid_force * dt * dt / self.rod_mass_per_length
            ) / (1.0 + beta * dt)

        # Pump boundary condition (bottom node):
        # The pump plunger load balances the fluid column hydrostatic load plus
        # a viscous damping term.  Simplified as a dashpot BC:
        #   E*A * du/dx = F_fluid_column + c_pump * du/dt
        # We use a first-order approximation:
        fluid_column_force = fluid_resistance * self.rod_length   # total fluid load (N)
        pump_load_normalised = fluid_column_force / (self.youngs_modulus * self.rod_area)
        u_new[n - 1] = u_new[n - 2] - pump_load_normalised * dx

        # Update time levels
        self.u_prev = self.u_curr if not NUMPY_AVAILABLE else self.u_curr.copy()
        self.u_curr = u_new
        self.displacement = self.u_curr  # keep alias in sync

        # Velocity (central difference in time, but we only have two levels here;
        # use backward difference as a safe fallback)
        for i in range(n):
            self.velocity[i] = (self.u_curr[i] - self.u_prev[i]) / (dt + 1e-12)

        # Load and stress profiles
        for i in range(n):
            # Strain = du/dx (central where possible, one-sided at boundaries)
            if i == 0:
                strain = (self.u_curr[1] - self.u_curr[0]) / dx
            elif i == n - 1:
                strain = (self.u_curr[n - 1] - self.u_curr[n - 2]) / dx
            else:
                strain = (self.u_curr[i + 1] - self.u_curr[i - 1]) / (2.0 * dx)

            self.stress[i] = self.youngs_modulus * strain  # Pa

            # Total polished-rod load at depth z[i]:
            #   F(z) = E*A*strain + W_r*(L - z)  (rod weight below node)
            depth_below = self.rod_length - self.depths[i]
            self.load[i] = (self.stress[i] * self.rod_area
                            + self.rod_weight_per_length * depth_below) / 1000.0  # → kN

        if NUMPY_AVAILABLE:
            return self.u_curr, self.load
        else:
            return list(self.u_curr), list(self.load)

    # ------------------------------------------------------------------
    # Risk calculations
    # ------------------------------------------------------------------
    def calculate_rod_float_probability(self) -> float:
        """
        Rod float occurs when the rod string is moving downward faster than the
        fluid can fall — net upward fluid force on the rods exceeds gravity.

        Indicator: fraction of nodes with negative (downward) velocity exceeding
        a critical threshold.
        """
        critical_velocity = -0.3   # m/s downward threshold
        count_floating = 0
        n = self.num_segments

        if NUMPY_AVAILABLE:
            downstroke_mask = self.velocity < critical_velocity
            count_floating = int(downstroke_mask.sum())
        else:
            count_floating = sum(1 for v in self.velocity if v < critical_velocity)

        fraction = count_floating / n

        # Map to probability: 0 fraction → 0.05 base risk; 1.0 fraction → 0.98
        probability = 0.05 + 0.93 * min(1.0, fraction * 3.0)
        return round(min(1.0, probability), 3)

    def calculate_impact_loading_risk(self) -> float:
        """
        Impact loading risk is driven by high load variance (sudden shock loads)
        and by peak load exceeding the structural design load.

        Design load = E * A * yield_strain, approximated here as 0.7 * max_expected.
        """
        if NUMPY_AVAILABLE:
            load_var = float(np.var(self.load))
            peak_load = float(np.max(self.load))
        else:
            load_list = list(self.load)
            load_var = np.var(load_list)
            peak_load = max(load_list) if load_list else 0.0

        # Reference loads for this rod string (kN)
        design_load = 50.0    # max rated load kN

        # Variance contribution (normalised)
        var_risk = min(1.0, load_var / (design_load ** 2 * 0.1 + 1e-6))
        # Peak-load contribution
        peak_risk = min(1.0, max(0.0, (peak_load - design_load * 0.8) / (design_load * 0.2 + 1e-6)))

        risk = 0.15 + 0.5 * var_risk + 0.35 * peak_risk
        return round(min(1.0, risk), 3)

    # ------------------------------------------------------------------
    # State accessors
    # ------------------------------------------------------------------
    def get_rod_state(self, depth: float) -> Dict:
        segment_idx = int(depth / self.segment_length)
        segment_idx = min(segment_idx, self.num_segments - 1)
        return {
            'depth': depth,
            'displacement': float(self.u_curr[segment_idx]),
            'velocity': float(self.velocity[segment_idx]),
            'load': float(self.load[segment_idx]),
            'stress': float(self.stress[segment_idx]),
        }

    def get_rod_dynamics_state(self) -> Dict:
        if NUMPY_AVAILABLE:
            disp_list = self.u_curr.tolist()
            vel_list = self.velocity.tolist()
            load_list = self.load.tolist()
            stress_list = self.stress.tolist()
        else:
            disp_list = list(self.u_curr)
            vel_list = list(self.velocity)
            load_list = list(self.load)
            stress_list = list(self.stress)

        return {
            'displacement_profile': disp_list,
            'velocity_profile': vel_list,
            'load_profile': load_list,
            'stress_profile': stress_list,
            'rod_float_probability': self.calculate_rod_float_probability(),
            'impact_loading_risk': self.calculate_impact_loading_risk(),
            'model_type': 'GIBBS WAVE EQUATION - 1D DAMPED FINITE DIFFERENCE',
        }


# ---------------------------------------------------------------------------
# Helper trig functions that work whether numpy is imported or not
# ---------------------------------------------------------------------------
def _cos(x: float) -> float:
    if NUMPY_AVAILABLE:
        return float(np.cos(x))
    import math
    return math.cos(x)


def _sin(x: float) -> float:
    if NUMPY_AVAILABLE:
        return float(np.sin(x))
    import math
    return math.sin(x)
