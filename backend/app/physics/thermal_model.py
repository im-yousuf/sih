"""
DIGITAL TWIN DEMONSTRATION MODEL
Thermal Model based on Bober-Lantz framework for CSS operations
This is a demonstration model for prototype purposes
"""

try:
    import numpy as np
except ImportError:
    import math
    class np:
        @staticmethod
        def exp(x):
            if isinstance(x, list):
                return [math.exp(val) for val in x]
            return math.exp(x)
        @staticmethod
        def linspace(start, stop, num):
            return [start + (stop - start) * i / (num - 1) for i in range(num)]
        @staticmethod
        def pi():
            return math.pi

from typing import Dict, Tuple
from datetime import datetime, timedelta

class ThermalModel:
    """
    Simulates reservoir heating and cooling during CSS operations
    Based on Bober-Lantz thermal model framework
    """

    def __init__(self, reservoir_params: Dict):
        self.reservoir_temperature = reservoir_params.get('initial_temperature', 45.0)  # °C
        self.steam_temperature = reservoir_params.get('steam_temperature', 250.0)  # °C
        self.porosity = reservoir_params.get('porosity', 0.25)
        self.permeability = reservoir_params.get('permeability', 500.0)  # mD
        self.thermal_conductivity = reservoir_params.get('thermal_conductivity', 2.0)  # W/(m·K)
        self.heat_capacity = reservoir_params.get('heat_capacity', 2000.0)  # J/(kg·K)
        self.thermal_radius = reservoir_params.get('thermal_radius', 10.0)  # m
        self.thermal_decline_rate = reservoir_params.get('thermal_decline_rate', 0.1)  # 1/day

        self.current_temperature = self.reservoir_temperature
        self.time_since_injection = 0.0  # days

    def calculate_temperature_profile(self, radius: np.ndarray, time: float) -> np.ndarray:
        """
        Calculate temperature as function of radius and time
        Uses simplified thermal diffusion equation
        """
        thermal_diffusivity = self.thermal_conductivity / (self.porosity * self.heat_capacity * 1000)
        
        # Simplified thermal front propagation
        thermal_front = np.sqrt(4 * thermal_diffusivity * time * 86400)  # Convert days to seconds
        
        temperature_profile = self.reservoir_temperature + \
                            (self.steam_temperature - self.reservoir_temperature) * \
                            np.exp(-np.pi * radius**2 / (4 * thermal_diffusivity * time * 86400 + 1e-6))
        
        return temperature_profile

    def simulate_injection(self, duration: float, injection_rate: float) -> Dict:
        """
        Simulate steam injection phase
        duration: days
        injection_rate: tons/day
        """
        # Calculate heating
        heating_efficiency = 0.85
        temperature_increase = (injection_rate * duration * heating_efficiency * 
                              (self.steam_temperature - self.reservoir_temperature) / 
                              (self.porosity * self.heat_capacity * 1000 * self.thermal_radius**2 * np.pi))
        
        self.current_temperature = min(self.steam_temperature * 0.9, 
                                     self.reservoir_temperature + temperature_increase)
        self.thermal_radius = self.thermal_radius * (1 + 0.1 * duration)
        
        return {
            'temperature': self.current_temperature,
            'thermal_radius': self.thermal_radius,
            'temperature_increase': temperature_increase
        }

    def simulate_soak(self, duration: float) -> Dict:
        """
        Simulate soak phase - heat redistribution
        duration: days
        """
        # Temperature equalizes during soak
        cooling_factor = np.exp(-0.05 * duration)
        temperature_drop = (self.current_temperature - self.reservoir_temperature) * (1 - cooling_factor)
        
        self.current_temperature -= temperature_drop
        self.time_since_injection += duration
        
        return {
            'temperature': self.current_temperature,
            'temperature_drop': temperature_drop,
            'time_since_injection': self.time_since_injection
        }

    def simulate_production(self, duration: float, production_rate: float) -> Dict:
        """
        Simulate production phase - thermal decline
        duration: days
        production_rate: m3/day
        """
        # Thermal decline during production
        cooling_rate = self.thermal_decline_rate * (1 + production_rate / 100.0)
        temperature_drop = (self.current_temperature - self.reservoir_temperature) * cooling_rate * duration
        
        self.current_temperature -= temperature_drop
        self.time_since_injection += duration
        
        return {
            'temperature': self.current_temperature,
            'temperature_drop': temperature_drop,
            'time_since_injection': self.time_since_injection
        }

    def predict_temperature(self, time_horizon: float) -> Dict:
        """
        Predict future temperature
        time_horizon: days
        """
        predicted_temp = self.reservoir_temperature + \
                        (self.current_temperature - self.reservoir_temperature) * \
                        np.exp(-self.thermal_decline_rate * time_horizon)
        
        return {
            'predicted_temperature': predicted_temp,
            'time_horizon': time_horizon,
            'confidence': 0.85  # Demo confidence value
        }

    def get_thermal_state(self) -> Dict:
        """
        Get current thermal state
        """
        return {
            'current_temperature': self.current_temperature,
            'reservoir_temperature': self.reservoir_temperature,
            'thermal_radius': self.thermal_radius,
            'time_since_injection': self.time_since_injection,
            'thermal_decline_rate': self.thermal_decline_rate,
            'model_type': 'DIGITAL TWIN DEMONSTRATION MODEL'
        }
