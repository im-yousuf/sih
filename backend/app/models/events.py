from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class RodEvent(Base):
    __tablename__ = "rod_events"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    severity = Column(String)
    depth = Column(Float)
    load = Column(Float)
    description = Column(String)
    resolved = Column(Boolean, default=False)

    well = relationship("Well", back_populates="rod_events")

class PumpEvent(Base):
    __tablename__ = "pump_events"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    severity = Column(String)
    description = Column(String)
    resolved = Column(Boolean, default=False)

    well = relationship("Well", back_populates="pump_events")
