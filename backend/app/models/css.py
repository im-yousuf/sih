from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class CSSCycle(Base):
    __tablename__ = "css_cycles"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    cycle_number = Column(Integer)
    injection_start = Column(DateTime)
    injection_end = Column(DateTime)
    soak_start = Column(DateTime)
    soak_end = Column(DateTime)
    production_start = Column(DateTime)
    production_end = Column(DateTime)
    steam_volume = Column(Float)
    steam_injection_rate = Column(Float)
    injection_pressure = Column(Float)
    target_temperature = Column(Float)
    production_cutoff = Column(Float)
    steam_oil_ratio = Column(Float)
    cycle_production = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    well = relationship("Well", back_populates="css_cycles")
