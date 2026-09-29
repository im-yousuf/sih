"""
Dynamometer Card Model for sucker-rod pump analysis.

Generates synthetic surface dynamometer cards for known operating states and
classifies them using feature extraction (load range, asymmetry, flatness, area).

Card shapes follow the qualitative patterns described in:
  Gibbs (1963), "Computing Downhole Pump Cards from Surface Dynamometer Cards",
  SPE Journal Vol. 3 No. 1.
"""

import random
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
        def zeros(n):
            """Always return a plain Python list — safe for both index and slice ops."""
            return [0.0] * int(n)

        @staticmethod
        def sin(x):
            return math.sin(x)

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
        def std(data):
            return math.sqrt(np.var(data))

        @staticmethod
        def max(data):
            lst = list(data)
            return max(lst) if lst else 0.0

        @staticmethod
        def min(data):
            lst = list(data)
            return min(lst) if lst else 0.0

        @staticmethod
        def trapz(y, x):
            total = 0.0
            for i in range(len(y) - 1):
                total += (y[i] + y[i + 1]) * (x[i + 1] - x[i]) / 2.0
            return total

        @staticmethod
        def array(data):
            return list(data)

        @staticmethod
        def random_normal_array(loc, scale, n):
            """Safe replacement for np.random.normal(loc, scale, n)."""
            return [random.gauss(loc, scale) for _ in range(n)]

        @staticmethod
        def random_normal(loc=0.0, scale=1.0):
            return random.gauss(loc, scale)


def _noise(scale, n):
    """Return a list of n Gaussian noise samples with std=scale."""
    if NUMPY_AVAILABLE:
        return np.random.normal(0.0, scale, n)
    return [random.gauss(0.0, scale) for _ in range(n)]


from typing import Dict, Tuple, List
from enum import Enum


class DynamometerClassification(Enum):
    NORMAL = "normal"
    WARNING = "warning"
    ROD_FLOAT = "rod_float"
    SEVERE_ROD_FLOAT = "severe_rod_float"
    IMPACT_LOADING = "impact_loading"
    PUMP_OFF = "pump_off"
    GAS_LOCK = "gas_lock"


class DynamometerModel:
    """
    Generates and classifies surface dynamometer cards.

    Card generation physics:
    ─────────────────────────
    A normal dynamometer card is a closed loop in (position, load) space.
    The upstroke load is higher than downstroke because the rod string carries
    the full fluid column weight on the way up, but the standing valve opens on
    the downstroke so the rods are unloaded.

    Known fault signatures:
      • Rod float   — downstroke load collapses to a flat, noisy plateau because
                      the fluid column never fully loads the rods downward.
      • Impact load — a sharp load spike occurs when the pump plunger hits the
                      fluid on the downstroke after a period of gas/void.
      • Pump off    — reduced card area; both upstroke and downstroke loads are
                      lower because there is little/no fluid to lift.
    """

    def __init__(self, params: Dict):
        self.stroke_length = params.get('stroke_length', 2.5)   # m
        self.max_load = params.get('max_load', 50.0)            # kN  (upstroke peak)
        self.min_load = params.get('min_load', 10.0)            # kN  (downstroke base)
        self.spm = params.get('spm', 5.0)

    # ------------------------------------------------------------------
    # Card generation
    # ------------------------------------------------------------------
    def generate_dynamometer_card(self, operating_state: str) -> Tuple[List[float], List[float]]:
        """
        Generate a surface dynamometer card for the given operating state.

        Returns (position, load) each as a list of NUM_POINTS floats.
        position is in metres (0 → stroke_length → 0) forming a closed loop.
        load is in kN.
        """
        NUM = 100
        half = NUM // 2   # 50 points upstroke, 50 points downstroke

        # Build position: 0 → S (upstroke) then S → 0 (downstroke)
        if NUMPY_AVAILABLE:
            pos_up = np.linspace(0.0, self.stroke_length, half)
            pos_down = np.linspace(self.stroke_length, 0.0, half)
            position = list(np.concatenate([pos_up, pos_down]))
        else:
            pos_up = np.linspace(0.0, self.stroke_length, half)
            pos_down = np.linspace(self.stroke_length, 0.0, half)
            position = pos_up + pos_down

        load_up = [0.0] * half
        load_down = [0.0] * half
        noise_small = _noise(0.5, half)
        noise_medium = _noise(1.5, half)

        S = self.stroke_length
        Lmax = self.max_load
        Lmin = self.min_load
        Lrange = Lmax - Lmin

        if operating_state == "normal":
            # Upstroke: sinusoidal rise from Lmin to Lmax
            # Downstroke: sinusoidal drop from Lmax back to Lmin
            for i in range(half):
                phase = i / (half - 1)
                load_up[i]   = Lmin + Lrange * math.sin(phase * math.pi / 2.0) + noise_small[i]
                load_down[i] = Lmax - Lrange * math.sin(phase * math.pi / 2.0) + noise_small[i]

        elif operating_state == "rod_float":
            # Upstroke behaves normally; downstroke collapses to a flat plateau
            # (rods float — fluid load doesn't drop)
            flat_load = Lmax * 0.55
            for i in range(half):
                phase = i / (half - 1)
                load_up[i]   = Lmin + Lrange * math.sin(phase * math.pi / 2.0) + noise_small[i]
                load_down[i] = flat_load + noise_medium[i]   # flat / irregular

        elif operating_state == "impact_loading":
            # Upstroke normal; downstroke has a sharp spike when plunger
            # slams into fluid after gas/void
            spike_start = int(half * 0.55)
            spike_end   = int(half * 0.70)
            for i in range(half):
                phase = i / (half - 1)
                load_up[i] = Lmin + Lrange * math.sin(phase * math.pi / 2.0) + noise_small[i]
                if spike_start <= i <= spike_end:
                    # Impact spike — load exceeds rated max by ~20–40 %
                    spike_mag = Lmax * (1.3 + 0.1 * random.random())
                    load_down[i] = spike_mag + noise_medium[i]
                else:
                    load_down[i] = Lmin * 0.8 + noise_small[i]

        elif operating_state == "pump_off":
            # Reduced card area: both strokes carry much less load
            # because there is no fluid column to lift
            for i in range(half):
                phase = i / (half - 1)
                reduced_max = Lmin + Lrange * 0.35
                load_up[i]   = Lmin + (reduced_max - Lmin) * math.sin(phase * math.pi / 2.0) + noise_small[i]
                load_down[i] = reduced_max - (reduced_max - Lmin) * math.sin(phase * math.pi / 2.0) + noise_small[i]

        else:
            # Default to normal
            for i in range(half):
                phase = i / (half - 1)
                load_up[i]   = Lmin + Lrange * math.sin(phase * math.pi / 2.0) + noise_small[i]
                load_down[i] = Lmax - Lrange * math.sin(phase * math.pi / 2.0) + noise_small[i]

        load = load_up + load_down
        return position, load

    # ------------------------------------------------------------------
    # Card classification
    # ------------------------------------------------------------------
    def classify_dynamometer_card(self, position: List[float], load: List[float]) -> Dict:
        """
        Classify a dynamometer card using extracted features.

        Features:
          load_range  — difference between max and min load (kN)
          load_std    — standard deviation of the full load trace
          load_area   — area enclosed by the card (∫ load d_position), proportional
                        to work done per stroke
          asymmetry   — |mean_upstroke − mean_downstroke| / (mean_upstroke + mean_downstroke)
          flatness    — 1 / (downstroke_variance + ε); high → flat downstroke → rod float
        """
        n = len(load)
        half = n // 2

        if NUMPY_AVAILABLE:
            load_arr = np.array(load, dtype=float)
            pos_arr  = np.array(position, dtype=float)
        else:
            load_arr = list(load)
            pos_arr  = list(position)

        # Scalar feature extraction (safe for both numpy arrays and plain lists)
        load_max   = float(np.max(load_arr))
        load_min   = float(np.min(load_arr))
        load_range = load_max - load_min
        load_std   = float(np.std(load_arr))
        load_area  = abs(float(np.trapz(load_arr, pos_arr)))

        upstroke   = load_arr[:half]
        downstroke = load_arr[half:]
        mean_up    = float(np.mean(upstroke))
        mean_down  = float(np.mean(downstroke))
        asymmetry  = abs(mean_up - mean_down) / (mean_up + mean_down + 1e-6)

        down_var   = float(np.var(downstroke))
        flatness   = 1.0 / (down_var + 1e-6)

        # ── Classification thresholds ──────────────────────────────────
        classification = DynamometerClassification.NORMAL
        confidence = 0.88
        rod_float_probability = 0.05
        impact_loading_risk   = 0.05

        if flatness > 0.8 and asymmetry > 0.4:
            # Very flat + very asymmetric → severe rod float
            classification = DynamometerClassification.SEVERE_ROD_FLOAT
            rod_float_probability = 0.94
            confidence = 0.90
        elif flatness > 0.4 and asymmetry > 0.25:
            # Moderately flat downstroke → rod float
            classification = DynamometerClassification.ROD_FLOAT
            rod_float_probability = 0.78
            confidence = 0.83
        elif load_std > 6.0 and asymmetry > 0.35:
            # High variance + asymmetric → impact loading
            classification = DynamometerClassification.IMPACT_LOADING
            impact_loading_risk = 0.80
            confidence = 0.81
        elif load_area < self.max_load * self.stroke_length * 0.35:
            # Small card area → pump off
            classification = DynamometerClassification.PUMP_OFF
            confidence = 0.79
        elif asymmetry > 0.15:
            # Mild asymmetry → warning
            classification = DynamometerClassification.WARNING
            rod_float_probability = 0.20
            confidence = 0.75

        # Mechanical stress level
        if load_max > self.max_load * 1.15:
            mechanical_stress = "HIGH"
        elif load_max > self.max_load * 0.90:
            mechanical_stress = "MODERATE"
        else:
            mechanical_stress = "NORMAL"

        return {
            'classification': classification.value,
            'confidence': round(confidence, 3),
            'rod_float_probability': round(rod_float_probability, 3),
            'impact_loading_risk': round(impact_loading_risk, 3),
            'mechanical_stress': mechanical_stress,
            'features': {
                'load_range': round(load_range, 2),
                'load_std':   round(load_std, 2),
                'load_area':  round(load_area, 2),
                'asymmetry':  round(asymmetry, 4),
                'flatness':   round(flatness, 4),
            },
            'model_type': 'FEATURE-BASED DYNAMOMETER CLASSIFIER',
        }

    # ------------------------------------------------------------------
    # Combined accessor
    # ------------------------------------------------------------------
    def get_dynamometer_state(self, operating_state: str) -> Dict:
        position, load = self.generate_dynamometer_card(operating_state)
        classification = self.classify_dynamometer_card(position, load)
        return {
            'position': position,
            'load': load,
            'classification': classification,
            'operating_state': operating_state,
        }
