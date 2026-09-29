from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    temperature = Column(Float)
    pressure = Column(Float)
    flow_rate = Column(Float)
    spm = Column(Float)
    rod_load = Column(Float)
    surface_vibration = Column(Float)
    motor_load = Column(Float)
    vfd_frequency = Column(Float)
    pump_efficiency = Column(Float)
    production_rate = Column(Float)
    energy_consumption = Column(Float)

    well = relationship("Well", back_populates="telemetry")
