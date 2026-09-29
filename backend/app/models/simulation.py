from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    scenario_name = Column(String)
    parameters = Column(JSON)
    results = Column(JSON)
    baseline_comparison = Column(JSON)
    status = Column(String)
    created_by = Column(String)

    well = relationship("Well", back_populates="simulation_runs")
