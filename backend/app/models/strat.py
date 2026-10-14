from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from ..database import Base

class Strat(Base):
    __tablename__ = "strats"

    id = Column(Integer, primary_key=True, index=True)
    map_name = Column(String(50), nullable=False, index=True) # Mirage, Inferno, Nuke, Anubis, Ancient, Dust II, Vertigo
    title = Column(String(120), nullable=False)
    buy_phase = Column(String(50), default="Full buy") # Pistol, Eco / Semi-buy, Force buy, Full buy
    side = Column(String(20), default="T-Side")       # T-Side, CT-Side
    category = Column(String(50), default="Execution") # Execution, Mid Control, Default, Retake Setup, Anti-Eco, Utility Setups
    description = Column(Text, default="")
    
    # Player / Role Assignments
    assigned_roles = Column(JSON, default=dict)
    # e.g. {"IGL": "Calls contact B", "Entry": "Opens Ramp with Flash", "Support": "Throws Window & Jungle smokes"}
    
    callouts = Column(JSON, default=list) # List of zone tags e.g. ["A Site", "Palace", "Jungle"]
    
    # Tactical pins on the map radar:
    # [
    #   {
    #     "id": "pin-1",
    #     "x": 42.5,   # percentage on 0-100 radar coordinate
    #     "y": 68.2,
    #     "type": "smoke", # smoke, flash, molotov, he, retake, position, boost
    #     "side": "T-Side",
    #     "title": "Window Smoke from T Spawn",
    #     "description": "Align with garbage can, aim at antenna tip, jumpthrow.",
    #     "throw_type": "Jumpthrow", # Left-click, Jumpthrow, Run-throw, W-jumpthrow
    #     "player_role": "Support"
    #   }
    # ]
    pins = Column(JSON, default=list)
    drawing_data = Column(JSON, default=list) # Vector drawing strokes & shapes for tactical strat schemas

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
