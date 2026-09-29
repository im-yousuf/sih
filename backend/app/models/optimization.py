from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    optimization_type = Column(String)
    objective = Column(JSON)
    constraints = Column(JSON)
    current_state = Column(JSON)
    optimized_state = Column(JSON)
    expected_improvement = Column(JSON)
    confidence = Column(Float)
    applied = Column(Boolean, default=False)
    applied_at = Column(DateTime)

    well = relationship("Well", back_populates="optimization_results")
