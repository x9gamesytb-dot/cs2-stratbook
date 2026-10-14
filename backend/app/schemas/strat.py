from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class TacticalPin(BaseModel):
    id: Optional[str] = None
    x: float
    y: float
    type: str # smoke, flash, molotov, he, retake, position, boost, callout
    side: Optional[str] = "T-Side"
    title: str
    description: Optional[str] = ""
    throw_type: Optional[str] = "Left-click" # Left-click, Jumpthrow, Run-throw, W-jumpthrow, Right-click
    player_role: Optional[str] = "All"
    image_url: Optional[str] = "" # Optional screenshot/lineup image

class StratBase(BaseModel):
    map_name: str
    title: str
    buy_phase: Optional[str] = "Full buy"
    side: Optional[str] = "T-Side"
    category: Optional[str] = "Execution"
    description: Optional[str] = ""
    assigned_roles: Optional[Dict[str, str]] = {}
    callouts: Optional[List[str]] = []
    pins: Optional[List[TacticalPin]] = []
    drawing_data: Optional[List[Any]] = []

class StratCreate(StratBase):
    pass

class StratUpdate(BaseModel):
    map_name: Optional[str] = None
    title: Optional[str] = None
    buy_phase: Optional[str] = None
    side: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    assigned_roles: Optional[Dict[str, str]] = None
    callouts: Optional[List[str]] = None
    pins: Optional[List[TacticalPin]] = None
    drawing_data: Optional[List[Any]] = None

class StratOut(StratBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
