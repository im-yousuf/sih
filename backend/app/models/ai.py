from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    condition = Column(String)
    rod_float_probability = Column(Float)
    impact_loading_risk = Column(Float)
    recommended_spm = Column(Float)
    recommended_vfd_frequency = Column(Float)
    confidence = Column(Float)
    reasoning = Column(JSON)
    approved = Column(Boolean, default=False)
    approved_by = Column(String)
    approved_at = Column(DateTime)
    result = Column(JSON)

    well = relationship("Well", back_populates="ai_recommendations")
