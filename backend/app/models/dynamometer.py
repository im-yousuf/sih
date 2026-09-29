from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class DynamometerCard(Base):
    __tablename__ = "dynamometer_cards"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    position_data = Column(JSON)
    load_data = Column(JSON)
    classification = Column(String)
    rod_float_probability = Column(Float)
    impact_loading_risk = Column(Float)
    mechanical_stress = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    well = relationship("Well", back_populates="dynamometer_cards")
