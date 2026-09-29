from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    prediction_type = Column(String)
    time_horizon = Column(String)
    predicted_value = Column(Float)
    confidence = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    features = Column(JSON)
    model_version = Column(String)

    well = relationship("Well", back_populates="predictions")
