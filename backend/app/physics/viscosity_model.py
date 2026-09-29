"""
DIGITAL TWIN DEMONSTRATION MODEL
Viscosity Model for heavy crude oil
This is a demonstration model for prototype purposes
"""

try:
    import numpy as np
except ImportError:
    import math
    class np:
        @staticmethod
        def exp(x):
            return math.exp(x)
        @staticmethod
        def sin(x):
            return math.sin(x)

from typing import Dict, Optional
from enum import Enum

class RheologyModel(Enum):
    NEWTONIAN = "newtonian"
    POWER_LAW = "power_law"
    BINGHAM_PLASTIC = "bingham_plastic"
    HERSCHEL_BULKLEY = "herschel_bulkley"
    CARREAU_YASUDA = "carreau_yasuda"

class ViscosityModel:
    """
    Temperature-dependent viscosity model for heavy crude
    Implements Andrade equation and configurable rheological models
    """

    def __init__(self, params: Dict):
        self.base_viscosity = params.get('base_viscosity', 1000.0)  # cP at reference temperature
        self.reference_temperature = params.get('reference_temperature', 20.0)  # °C
        self.activation_energy = params.get('activation_energy', 15000.0)  # J/mol
        self.gas_constant = 8.314  # J/(mol·K)
        
        self.rheology_model = RheologyModel(params.get('rheology_model', 'power_law'))
        
        # Rheological parameters
        self.consistency_index = params.get('consistency_index', 500.0)  # Pa·s^n
        self.flow_behavior_index = params.get('flow_behavior_index', 0.8)  # dimensionless
        self.yield_stress = params.get('yield_stress', 5.0)  # Pa
        self.zero_shear_viscosity = params.get('zero_shear_viscosity', 10000.0)  # cP
        self.infinite_shear_viscosity = params.get('infinite_shear_viscosity', 10.0)  # cP
        self.transition_time = params.get('transition_time', 1.0)  # s
        self.power_law_index = params.get('power_law_index', 0.5)  # dimensionless

    def calculate_viscosity(self, temperature: float, shear_rate: Optional[float] = None) -> float:
        """
        Calculate viscosity at given temperature and shear rate
        Uses Andrade equation for temperature dependence
        """
        # Convert temperature to Kelvin
        T = temperature + 273.15
        T_ref = self.reference_temperature + 273.15
        
        # Andrade equation for temperature dependence
        viscosity_at_temp = self.base_viscosity * np.exp(
            (self.activation_energy / self.gas_constant) * (1/T - 1/T_ref)
        )
        
        # Apply rheological model if shear rate is provided
        if shear_rate is not None:
            viscosity_at_temp = self.apply_rheology(viscosity_at_temp, shear_rate)
        
        return viscosity_at_temp

    def apply_rheology(self, viscosity: float, shear_rate: float) -> float:
        """
        Apply rheological model based on shear rate
        """
        if self.rheology_model == RheologyModel.NEWTONIAN:
            return viscosity
        
        elif self.rheology_model == RheologyModel.POWER_LAW:
            # Power law model
            apparent_viscosity = self.consistency_index * (shear_rate ** (self.flow_behavior_index - 1))
            return min(viscosity, apparent_viscosity)
        
        elif self.rheology_model == RheologyModel.BINGHAM_PLASTIC:
            # Bingham plastic model
            if shear_rate > 0:
                apparent_viscosity = self.yield_stress / shear_rate + viscosity
            else:
                apparent_viscosity = float('inf')
            return apparent_viscosity
        
        elif self.rheology_model == RheologyModel.HERSCHEL_BULKLEY:
            # Herschel-Bulkley model
            if shear_rate > 0:
                apparent_viscosity = (self.yield_stress / shear_rate + 
                                    self.consistency_index * (shear_rate ** (self.flow_behavior_index - 1)))
            else:
                apparent_viscosity = float('inf')
            return apparent_viscosity
        
        elif self.rheology_model == RheologyModel.CARREAU_YASUDA:
            # Carreau-Yasuda model
            eta_0 = self.zero_shear_viscosity
            eta_inf = self.infinite_shear_viscosity
            lambda_t = self.transition_time
            n = self.power_law_index
            a = 2  # Yasuda parameter
            
            viscosity_term = eta_inf + (eta_0 - eta_inf) * \
                           (1 + (lambda_t * shear_rate) ** a) ** ((n - 1) / a)
            return min(viscosity, viscosity_term)
        
        return viscosity

    def calculate_mobility(self, viscosity: float, permeability: float) -> float:
        """
        Calculate fluid mobility (k/μ)
        """
        return permeability / viscosity

    def predict_viscosity(self, temperature_forecast: Dict) -> Dict:
        """
        Predict viscosity based on temperature forecast
        """
        predicted_viscosities = []
        for temp in temperature_forecast['temperatures']:
            visc = self.calculate_viscosity(temp)
            predicted_viscosities.append(visc)
        
        return {
            'predicted_viscosities': predicted_viscosities,
            'time_points': temperature_forecast['time_points'],
            'model_type': 'DIGITAL TWIN DEMONSTRATION MODEL',
            'rheology_model': self.rheology_model.value
        }

    def get_viscosity_state(self, temperature: float) -> Dict:
        """
        Get current viscosity state
        """
        viscosity = self.calculate_viscosity(temperature)
        
        return {
            'current_viscosity': viscosity,
            'temperature': temperature,
            'rheology_model': self.rheology_model.value,
            'mobility': self.calculate_mobility(viscosity, 500.0),  # Default permeability
            'model_type': 'DIGITAL TWIN DEMONSTRATION MODEL - DEMO/CALIBRATION REQUIRED'
        }
