"""
DIGITAL TWIN DEMONSTRATION MODEL
Rod Float Detection and Classification
This is a demonstration model for prototype purposes
"""

try:
    import numpy as np
except ImportError:
    import math
    
    class np:
        @staticmethod
        def mean(data):
            return sum(data) / len(data) if data else 0.0
        
        @staticmethod
        def var(data):
            if not data:
                return 0.0
            m = np.mean(data)
            return sum((x - m) ** 2 for x in data) / len(data)
        
        @staticmethod
        def max(data):
            return max(data) if data else 0.0

from typing import Dict
from enum import Enum

class RodFloatSeverity(Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class RodFloatDetector:
    """
    Detects and classifies rod float conditions
    Uses dynamometer card analysis and rod dynamics
    """

    def __init__(self, params: Dict):
        self.velocity_threshold = params.get('velocity_threshold', 0.5)  # m/s
        self.load_threshold = params.get('load_threshold', 15.0)  # kN
        self.vibration_threshold = params.get('vibration_threshold', 2.0)  # mm/s

    def detect_rod_float(self, rod_dynamics: Dict, dynamometer: Dict, 
                        surface_vibration: float) -> Dict:
        """
        Detect rod float using multiple indicators
        """
        # Extract features
        downstroke_velocity = np.mean([v for v in rod_dynamics['velocity_profile'] if v < 0])
        min_load = min(dynamometer['load'])
        load_variance = np.var(dynamometer['load'])
        
        # Calculate individual risk factors
        velocity_risk = self._calculate_velocity_risk(downstroke_velocity)
        load_risk = self._calculate_load_risk(min_load, load_variance)
        vibration_risk = self._calculate_vibration_risk(surface_vibration)
        
        # Combine risks
        total_risk = 0.4 * velocity_risk + 0.4 * load_risk + 0.2 * vibration_risk
        
        # Determine severity
        if total_risk < 0.2:
            severity = RodFloatSeverity.NONE
        elif total_risk < 0.4:
            severity = RodFloatSeverity.LOW
        elif total_risk < 0.6:
            severity = RodFloatSeverity.MODERATE
        elif total_risk < 0.8:
            severity = RodFloatSeverity.HIGH
        else:
            severity = RodFloatSeverity.CRITICAL
        
        return {
            'severity': severity.value,
            'probability': total_risk,
            'velocity_risk': velocity_risk,
            'load_risk': load_risk,
            'vibration_risk': vibration_risk,
            'downstroke_velocity': downstroke_velocity,
            'min_load': min_load,
            'surface_vibration': surface_vibration,
            'model_type': 'SIMULATED CLASSIFICATION'
        }

    def _calculate_velocity_risk(self, velocity: float) -> float:
        """
        Calculate risk based on downstroke velocity
        """
        if velocity > 0:
            return 0.0
        risk = abs(velocity) / self.velocity_threshold
        return min(1.0, risk)

    def _calculate_load_risk(self, min_load: float, load_variance: float) -> float:
        """
        Calculate risk based on load characteristics
        """
        if min_load > self.load_threshold:
            load_risk = 0.0
        else:
            load_risk = (self.load_threshold - min_load) / self.load_threshold
        
        variance_risk = min(1.0, load_variance / 25.0)
        
        return 0.6 * load_risk + 0.4 * variance_risk

    def _calculate_vibration_risk(self, vibration: float) -> float:
        """
        Calculate risk based on surface vibration
        """
        return min(1.0, vibration / self.vibration_threshold)

    def get_recommendation(self, detection_result: Dict) -> Dict:
        """
        Generate recommendation based on detection result
        """
        severity = detection_result['severity']
        probability = detection_result['probability']
        
        if severity in ['none', 'low']:
            return {
                'action': 'monitor',
                'spm_change': 0.0,
                'reason': 'Rod float risk is low. Continue normal operation.'
            }
        elif severity == 'moderate':
            return {
                'action': 'reduce_spm',
                'spm_change': -0.5,
                'reason': 'Moderate rod float risk detected. Reduce pump speed.'
            }
        elif severity == 'high':
            return {
                'action': 'reduce_spm_significantly',
                'spm_change': -1.0,
                'reason': 'High rod float risk. Significant pump speed reduction required.'
            }
        else:  # critical
            return {
                'action': 'emergency_stop',
                'spm_change': -5.0,
                'reason': 'Critical rod float risk. Immediate intervention required.'
            }
