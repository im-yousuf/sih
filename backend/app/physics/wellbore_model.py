"""
Wellbore Model — fluid flow, heat transfer, and pressure drop along the tubing string.

Temperature profile: linear geothermal gradient between surface and reservoir,
  with a thermal influence zone near the perforations.

Pressure profile: hydrostatic head plus Darcy-Weisbach viscous pressure drop.
  ΔP_friction = f * (L/D) * (ρv²/2)   (Darcy-Weisbach)
  ΔP_hydro    = ρ * g * Δz
  where effective diameter D_eff = D_tubing - D_rod (annular flow).

Reference:
  Beggs & Brill (1973), "A Study of Two-Phase Flow in Inclined Pipes",
  JPT Vol. 25 No. 5.
"""

import math

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

    class np:
        pi = math.pi

        @staticmethod
        def linspace(start, stop, num):
            if num == 1:
                return [start]
            return [start + (stop - start) * i / (num - 1) for i in range(num)]

        @staticmethod
        def ones(n):
            return [1.0] * int(n)


def _to_list(arr) -> list:
    """Convert numpy array or plain list to a plain Python list."""
    if NUMPY_AVAILABLE and hasattr(arr, 'tolist'):
        return arr.tolist()
    return list(arr)


def _safe_index(arr, idx: int):
    """Index into either a numpy array or a plain list."""
    return float(arr[idx])


class WellboreModel:
    """
    Simulates wellbore temperature, pressure and viscosity profiles along the
    tubing string from surface (depth=0) to TD (depth=self.depth).
    """

    def __init__(self, wellbore_params: dict):
        self.depth            = wellbore_params.get('depth',            1500.0)   # m
        self.casing_depth     = wellbore_params.get('casing_depth',     1400.0)   # m
        self.tubing_depth     = wellbore_params.get('tubing_depth',     1450.0)   # m
        self.pump_depth       = wellbore_params.get('pump_depth',       1300.0)   # m
        self.perforation_depth= wellbore_params.get('perforation_depth',1350.0)   # m
        self.tubing_diameter  = wellbore_params.get('tubing_diameter',  0.076)    # m  (3 in)
        self.casing_diameter  = wellbore_params.get('casing_diameter',  0.178)    # m  (7 in)
        self.rod_diameter     = wellbore_params.get('rod_diameter',     0.025)    # m  (1 in)

        # Annular effective diameter (hydraulic diameter of tubing-rod annulus)
        self.D_eff = self.tubing_diameter - self.rod_diameter   # m

        # Oil density (heavy crude, API~18)
        self.oil_density = 940.0   # kg/m³

        # Spatial discretisation
        self.num_segments   = 100
        self.segment_length = self.depth / (self.num_segments - 1)

        if NUMPY_AVAILABLE:
            self.depths              = np.linspace(0.0, self.depth, self.num_segments)
            self.temperature_profile = np.linspace(25.0, 45.0, self.num_segments)
            self.pressure_profile    = np.linspace(101.0, 500.0, self.num_segments)
            self.viscosity_profile   = np.ones(self.num_segments) * 1000.0
        else:
            self.depths              = np.linspace(0.0, self.depth, self.num_segments)
            self.temperature_profile = np.linspace(25.0, 45.0, self.num_segments)
            self.pressure_profile    = np.linspace(101.0, 500.0, self.num_segments)
            self.viscosity_profile   = np.ones(self.num_segments)
            self.viscosity_profile   = [v * 1000.0 for v in self.viscosity_profile]

    # ------------------------------------------------------------------
    # Profile updates
    # ------------------------------------------------------------------

    def update_temperature_profile(self, reservoir_temp: float,
                                   surface_temp: float = 25.0):
        """
        Linear geothermal gradient from surface_temp to reservoir_temp,
        with a ±50 m thermal influence zone around the perforations that
        pulls the local temperature 30 % closer to the reservoir temperature.
        """
        n   = self.num_segments
        T_s = surface_temp
        T_r = reservoir_temp
        L   = self.depth
        perf= self.perforation_depth

        new_profile = [0.0] * n
        for i in range(n):
            z = _safe_index(self.depths, i)
            # Linear gradient
            T_linear = T_s + (T_r - T_s) * (z / L)
            # Thermal influence near perforations
            if abs(z - perf) < 50.0:
                T_linear += (T_r - T_linear) * 0.30
            new_profile[i] = T_linear

        if NUMPY_AVAILABLE:
            import numpy
            self.temperature_profile = numpy.array(new_profile)
        else:
            self.temperature_profile = new_profile

    def update_pressure_profile(self, flow_rate_m3_per_day: float,
                                viscosity_cP: float):
        """
        Build a pressure profile from bottom (reservoir) to surface.

        P(z) = P_reservoir  -  ΔP_hydro(z_res → z)  -  ΔP_friction(z_res → z)

        Hydrostatic:
            ΔP_hydro = ρ_oil * g * Δz          [Pa]

        Darcy-Weisbach friction (laminar, annular flow):
            Re = ρ * v * D_eff / μ
            f  = 64/Re   (laminar, Re < 2300)
            f  = 0.316 * Re^(-0.25)  (Blasius turbulent)
            ΔP_friction / dz = f/(D_eff) * ρ*v²/2   per metre

        Final units: kPa (divided by 1000 after Pa calculation).
        """
        n    = self.num_segments
        g    = 9.81          # m/s²
        rho  = self.oil_density

        # Flow velocity in the tubing-rod annulus
        A_annulus = math.pi / 4.0 * (self.tubing_diameter**2 - self.rod_diameter**2)
        Q_m3s     = max(flow_rate_m3_per_day, 0.1) / 86400.0   # m³/s
        v         = Q_m3s / A_annulus                           # m/s

        mu_Pa_s   = max(viscosity_cP, 1.0) * 1e-3              # Pa·s
        Re        = rho * v * self.D_eff / (mu_Pa_s + 1e-12)

        if Re < 2300.0:
            f_darcy = 64.0 / (Re + 1e-6)
        else:
            f_darcy = 0.316 * (Re ** -0.25)   # Blasius

        # Friction pressure gradient (Pa/m)
        dP_friction_per_m = f_darcy / self.D_eff * rho * v**2 / 2.0

        # Reservoir (bottom) pressure — approximate from hydrostatic column
        P_reservoir_kPa = 101.3 + rho * g * self.depth / 1000.0   # kPa

        new_profile = [0.0] * n
        for i in range(n):
            z = _safe_index(self.depths, i)          # depth from surface
            dz = self.depth - z                       # distance above reservoir
            P_Pa = (P_reservoir_kPa * 1000.0
                    - rho * g * dz
                    - dP_friction_per_m * dz)
            new_profile[i] = max(101.3, P_Pa / 1000.0)   # kPa, min = atm

        if NUMPY_AVAILABLE:
            import numpy
            self.pressure_profile = numpy.array(new_profile)
        else:
            self.pressure_profile = new_profile

    def update_viscosity_profile(self, temperature_profile, viscosity_model):
        """
        Recompute viscosity at every node using the Andrade viscosity model.
        Works with both numpy arrays and plain lists for temperature_profile.
        """
        n = self.num_segments
        new_visc = [0.0] * n
        for i in range(n):
            T = float(temperature_profile[i])
            new_visc[i] = viscosity_model.calculate_viscosity(T)

        if NUMPY_AVAILABLE:
            import numpy
            self.viscosity_profile = numpy.array(new_visc)
        else:
            self.viscosity_profile = new_visc

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------

    def calculate_flow_resistance(self, depth: float) -> float:
        """Viscosity-area ratio at the given depth (Pa·s / m²)."""
        idx = min(int(depth / self.segment_length), self.num_segments - 1)
        visc = _safe_index(self.viscosity_profile, idx)
        area = math.pi * ((self.tubing_diameter / 2)**2
                          - (self.rod_diameter   / 2)**2)
        return visc / (area + 1e-12)

    def get_depth_parameters(self, depth: float) -> dict:
        idx = min(int(depth / self.segment_length), self.num_segments - 1)
        return {
            'depth':           depth,
            'temperature':     _safe_index(self.temperature_profile, idx),
            'pressure':        _safe_index(self.pressure_profile,    idx),
            'viscosity':       _safe_index(self.viscosity_profile,   idx),
            'flow_resistance': self.calculate_flow_resistance(depth),
        }

    def get_wellbore_state(self) -> dict:
        return {
            'depth':               self.depth,
            'casing_depth':        self.casing_depth,
            'tubing_depth':        self.tubing_depth,
            'pump_depth':          self.pump_depth,
            'perforation_depth':   self.perforation_depth,
            'temperature_profile': _to_list(self.temperature_profile),
            'pressure_profile':    _to_list(self.pressure_profile),
            'viscosity_profile':   _to_list(self.viscosity_profile),
            'model_type':          'DARCY-WEISBACH WELLBORE MODEL',
        }
