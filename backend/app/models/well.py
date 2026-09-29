from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Well(Base):
    __tablename__ = "wells"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    field = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    depth = Column(Float)
    reservoir_depth = Column(Float)
    api_gravity = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reservoir_parameters = relationship("ReservoirParameters", back_populates="well", uselist=False)
    wellbore_parameters = relationship("WellboreParameters", back_populates="well", uselist=False)
    telemetry = relationship("Telemetry", back_populates="well")
    css_cycles = relationship("CSSCycle", back_populates="well")
    srp_operations = relationship("SRPOperation", back_populates="well")
    vfd_operations = relationship("VFDOperation", back_populates="well")
    dynamometer_cards = relationship("DynamometerCard", back_populates="well")
    rod_events = relationship("RodEvent", back_populates="well")
    pump_events = relationship("PumpEvent", back_populates="well")
    predictions = relationship("Prediction", back_populates="well")
    ai_recommendations = relationship("AIRecommendation", back_populates="well")
    simulation_runs = relationship("SimulationRun", back_populates="well")
    optimization_results = relationship("OptimizationResult", back_populates="well")
    alerts = relationship("Alert", back_populates="well")
