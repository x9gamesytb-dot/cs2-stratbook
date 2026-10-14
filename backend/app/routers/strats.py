from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any

from ..database import get_db
from ..models.strat import Strat
from ..schemas.strat import StratCreate, StratUpdate, StratOut

router = APIRouter(prefix="/strats", tags=["Strat Book"])

@router.get("", response_model=List[StratOut])
def get_strats(
    map_name: Optional[str] = Query(None, description="Mirage, Inferno, Nuke, Anubis, Ancient, Dust II, Vertigo"),
    buy_phase: Optional[str] = Query(None, description="Pistol, Eco / Semi-buy, Force buy, Full buy"),
    side: Optional[str] = Query(None, description="T-Side, CT-Side"),
    category: Optional[str] = Query(None, description="Execution, Mid Control, Retake Setup, etc."),
    search: Optional[str] = Query(None, description="Recherche textuelle dans le titre ou les notes"),
    db: Session = Depends(get_db)
):
    query = db.query(Strat)
    
    if map_name:
        query = query.filter(Strat.map_name.ilike(f"%{map_name}%"))
    if buy_phase:
        query = query.filter(Strat.buy_phase == buy_phase)
    if side:
        query = query.filter(Strat.side == side)
    if category:
        query = query.filter(Strat.category == category)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Strat.title.ilike(search_pattern)) | 
            (Strat.description.ilike(search_pattern))
        )
    
    return query.order_by(Strat.map_name.asc(), Strat.side.asc(), Strat.title.asc()).all()

@router.get("/maps/summary", response_model=Dict[str, int])
def get_strats_map_summary(db: Session = Depends(get_db)):
    results = db.query(Strat.map_name, func.count(Strat.id)).group_by(Strat.map_name).all()
    return {row[0]: row[1] for row in results}

@router.get("/{strat_id}", response_model=StratOut)
def get_strat(strat_id: int, db: Session = Depends(get_db)):
    strat = db.query(Strat).filter(Strat.id == strat_id).first()
    if not strat:
        raise HTTPException(status_code=404, detail="Stratégie non trouvée.")
    return strat

@router.post("", response_model=StratOut, status_code=201)
def create_strat(strat_in: StratCreate, db: Session = Depends(get_db)):
    data = strat_in.model_dump()
    # Conversion Pydantic models in pins to dicts if needed
    if "pins" in data and data["pins"]:
        data["pins"] = [p if isinstance(p, dict) else p.model_dump() for p in data["pins"]]
    strat = Strat(**data)
    db.add(strat)
    db.commit()
    db.refresh(strat)
    return strat

@router.put("/{strat_id}", response_model=StratOut)
def update_strat(strat_id: int, strat_in: StratUpdate, db: Session = Depends(get_db)):
    strat = db.query(Strat).filter(Strat.id == strat_id).first()
    if not strat:
        raise HTTPException(status_code=404, detail="Stratégie non trouvée.")
    
    update_data = strat_in.model_dump(exclude_unset=True)
    if "pins" in update_data and update_data["pins"] is not None:
        update_data["pins"] = [p if isinstance(p, dict) else p.model_dump() for p in update_data["pins"]]

    for key, value in update_data.items():
        setattr(strat, key, value)
    
    db.commit()
    db.refresh(strat)
    return strat

@router.delete("/{strat_id}", status_code=204)
def delete_strat(strat_id: int, db: Session = Depends(get_db)):
    strat = db.query(Strat).filter(Strat.id == strat_id).first()
    if not strat:
        raise HTTPException(status_code=404, detail="Stratégie non trouvée.")
    db.delete(strat)
    db.commit()
    return None
