from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class VFDOperation(Base):
    __tablename__ = "vfd_operations"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    frequency = Column(Float)
    target_frequency = Column(Float)
    current_spm = Column(Float)
    target_spm = Column(Float)
    motor_speed = Column(Float)
    power_consumption = Column(Float)
    efficiency = Column(Float)
    status = Column(String)

    well = relationship("Well", back_populates="vfd_operations")
