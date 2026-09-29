from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String)
    parameter = Column(String)
    value = Column(Float)
    threshold = Column(Float)
    prediction = Column(String)
    recommended_action = Column(String)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String)
    acknowledged_at = Column(DateTime)

    well = relationship("Well", back_populates="alerts")
