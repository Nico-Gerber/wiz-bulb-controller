import asyncio

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from fastapi.responses import JSONResponse 

from pydantic import BaseModel

from pywizlight import wizlight, PilotBuilder, discovery


from database import  get_bulbs, get_bulb_by_mac



router = APIRouter(prefix="/bulb", tags=["bulb"])


class BulbIp(BaseModel):
    ip: str

@router.post("/On")
async def bulb_on(req: BulbIp):
    light = wizlight(req.ip)
    await light.turn_on()
    state = await light.updateState()
    return {"status": state.get_state()}

    
@router.post("/Off")
async def bulb_off(req: BulbIp):
    light = wizlight(req.ip)
    await light.turn_off()
    state = await light.updateState()
    return {"status": state.get_state()}

class BrightnessRequest(BaseModel):
    ip: str
    value: int

@router.post("/Brightness")
async def brightness(req: BrightnessRequest):
    scaled = int(req.value / 100 * 255)  
    light = wizlight(req.ip)      
    await light.turn_on(PilotBuilder(brightness=scaled))
    state = await light.updateState()
    return {"status": state.get_brightness()}    


class TempRequest(BaseModel):
    ip: str
    temp: int

@router.post("/Temp")
async def brightness(req: TempRequest):
    light = wizlight(req.ip)     
    await light.turn_on(PilotBuilder(colortemp=req.temp))
    state = await light.updateState()
    return {"status": state.get_colortemp()}  

class ColorRequest(BaseModel):
    ip: str
    r: int
    g: int
    b: int

@router.post("/Color")
async def color(req: ColorRequest):
    light = wizlight(req.ip)
    await light.turn_on(PilotBuilder(rgb=(req.r, req.g, req.b)))
    state = await light.updateState()
    return {"status": state.get_rgb()}  

@router.post("/turn_off_all")
async def turn_off():
    bulbs = get_bulbs()
    for bulb in bulbs:
        light = wizlight(bulb.ip)
        try:
            await light.turn_off()      
        finally:
            await light.async_close() 
    return {"status": "Bulbs Off"}

@router.post("/turn_all_on")
async def turn_on():
    bulbs = get_bulbs()
    for bulb in bulbs:
        light = wizlight(bulb.ip)
        try:
            await light.turn_on()
        finally:
            await light.async_close()
    return {"status": "Bulbs On"}


class GroupRequest(BaseModel):
    group_id: int

@router.post("/turn_group_on")
async def turn_on_group(req: GroupRequest):
    bulbs = get_bulbs()
    for bulb in bulbs:
        if bulb.group_id == req.group_id:
            light = wizlight(bulb.ip)
            try:
                await light.turn_on()
            finally:
                await light.async_close()
    return {"Group": " ON"}

@router.post("/turn_group_off")
async def turn_on_group(req: GroupRequest):
    bulbs = get_bulbs()
    for bulb in bulbs:
        if bulb.group_id == req.group_id:
            light = wizlight(bulb.ip)
            try:
                await light.turn_off()
            finally:
                await light.async_close()
    return {"Group": "Off"}



class LightMac(BaseModel):
    mac: str


@router.post('/on_with_mac')
async def turn_on_with_mac(req: LightMac):
    bulb = get_bulb_by_mac(req.mac)
    if not bulb:
        raise HTTPException(status_code=404, detail="Bulb not found")

    light = wizlight(bulb.ip)
    try:
        await light.turn_on()
    finally:
        await light.async_close()
    return {"Bulb": "ON"}


@router.post('/off_with_mac')
async def turn_on_with_mac(req: LightMac):
    bulb = get_bulb_by_mac(req.mac)
    if not bulb:
        raise HTTPException(status_code=404, detail="Bulb not found")

    light = wizlight(bulb.ip)
    try:
        await light.turn_off()
    finally:
        await light.async_close()
    return {"Bulb": "Off"}


class SceneRequest(BaseModel):
    group_id: int
    scene_id: int
    scene_needs_rgb: bool    

@router.post("/scene")
async def apply_scene(req: SceneRequest):
    bulbs = get_bulbs()
    apply_all = (req.group_id == 0)
    for bulb in bulbs:
        if not apply_all and bulb.group_id != req.group_id:
            continue
   
        if req.scene_needs_rgb and not bulb.is_rgb:
            continue
        light = wizlight(bulb.ip)
        try:
            print(f"{req.scene_id!r} {type(req.scene_id)} bulb_is_rgb={bulb.is_rgb}")
            await light.turn_on(PilotBuilder(scene=req.scene_id))
        finally:
            await light.async_close()
    return {"status": "scene applied"}

    


        


