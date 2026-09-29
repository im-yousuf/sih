from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class ReservoirParameters(Base):
    __tablename__ = "reservoir_parameters"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    initial_temperature = Column(Float)
    current_temperature = Column(Float)
    initial_pressure = Column(Float)
    current_pressure = Column(Float)
    porosity = Column(Float)
    permeability = Column(Float)
    oil_saturation = Column(Float)
    water_saturation = Column(Float)
    thermal_conductivity = Column(Float)
    heat_capacity = Column(Float)
    thermal_radius = Column(Float)
    thermal_decline_rate = Column(Float)
    viscosity = Column(Float)
    mobility = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    well = relationship("Well", back_populates="reservoir_parameters")
