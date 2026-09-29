from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class SRPOperation(Base):
    __tablename__ = "srp_operations"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    spm = Column(Float)
    stroke_length = Column(Float)
    rod_load = Column(Float)
    surface_vibration = Column(Float)
    pump_efficiency = Column(Float)
    downhole_pressure = Column(Float)
    displacement = Column(Float)
    velocity = Column(Float)
    status = Column(String)

    well = relationship("Well", back_populates="srp_operations")
