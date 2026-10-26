from fastapi import APIRouter

from pydantic import BaseModel

from database import get_macros, delete_macro, set_macro, get_macros_for_target


router = APIRouter(prefix="/macros", tags=["macro"])


class MacroModel(BaseModel):
    key: str
    action: str
    target_type: str
    target_id: str | None


class MacroId(BaseModel):
    id: int


@router.post("/set")
async def set_macro_endpoint(req: MacroModel):
    set_macro(req.target_type, req.target_id, req.action, req.key)
    return {"status": "Macro set"}


@router.get("/get")
async def get():
    return {"macros": get_macros()}


@router.post("/delete")
async def delete(req: MacroId):
    delete_macro(req.id)
    return {"status": "Macro deleted"}


@router.get("/for_target")
async def macros_for_target(target_type: str, target_id: str):
    macros = get_macros_for_target(target_type, target_id)
    return {"macros": macros}
