from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class WellboreParameters(Base):
    __tablename__ = "wellbore_parameters"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    casing_depth = Column(Float)
    tubing_depth = Column(Float)
    rod_string_length = Column(Float)
    rod_diameter = Column(Float)
    tubing_diameter = Column(Float)
    pump_depth = Column(Float)
    perforation_depth = Column(Float)
    deviation_angle = Column(Float)
    wellbore_diameter = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    well = relationship("Well", back_populates="wellbore_parameters")
