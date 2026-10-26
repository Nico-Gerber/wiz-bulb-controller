import asyncio



from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from fastapi.responses import JSONResponse 

from pydantic import BaseModel

from pywizlight import wizlight, PilotBuilder, discovery

import psutil

import ipaddress

import socket


discovery_lock = asyncio.Lock()

from database import save_bulb, get_bulbs, update_light_name, remove_light, update_ip, update_order, update_light_group, delete_macros_for_target


class BulbRequest(BaseModel):
    mac: str
    ip: str
    name: str
    is_rgb: bool




router = APIRouter(prefix="/find", tags=["find"])





def get_network_details():
    interfaces = psutil.net_if_addrs()
    for iface_name, iface_addresses in interfaces.items():
        for address in iface_addresses:
            if address.family == socket.AF_INET and address.address != "127.0.0.1":
                print(f"Interface: {iface_name}")
                print(f"  IP Address:  {address.address}")
                print(f"  Subnet Mask: {address.netmask}")
                print("-" * 30)
                return address.address, address.netmask  
    return None, None


def get_broadcast():
    ip, mask = get_network_details()
    iface = ipaddress.IPv4Interface(f"{ip}/{mask}")
    return str(iface.network.broadcast_address)



@router.post("")
async def find_bulb():
     broadcast = get_broadcast()

     async with discovery_lock:
        bulbs = await discovery.discover_lights(broadcast_space=str(broadcast))

        info_list = []

        saved_bulbs = get_bulbs()

        saved_macs = {b.mac for b in saved_bulbs}

        
            


        for bulb in bulbs:
                if bulb.mac in saved_macs:     
                    continue
                try:    
                    state = await bulb.updateState()
                    bulb_type = await bulb.get_bulbtype()

                    info_list.append({
                        "ip": bulb.ip,
                        "mac": bulb.mac,
                        "name": bulb_type.name,
                        "is_on": state.get_state(),
                        "is_rgb": bulb_type.features.color,
                    })
                finally:
                    await bulb.async_close()
    
     return info_list
# the ADD button calls this
@router.post("/add")
async def add_bulb(bulb: BulbRequest):   
    save_bulb(bulb.mac, bulb.ip, bulb.name, bulb.is_rgb )
    return {"status": "saved"}

# load saved bulbs (e.g. on app load, instead of scanning)
def build_result(b, is_on, brightness, is_rgb, color_temp, red, green, blue,
                 cold_white, warm_white, max_temp, min_temp, ip=None):
    return {
        "mac": b.mac,
        "ip": ip or b.ip,
        "name": b.name,
        "group_id": b.group_id,
        "is_on": is_on, "brightness": brightness, "is_rgb": is_rgb,
        "color_temp": color_temp,
        "red": red, "green": green, "blue": blue,
        "cold_white": cold_white, "warm_white": warm_white,
        "max_temp": max_temp, "min_temp": min_temp,
    }


async def read_bulb(b, ip):
    """Unicast to one bulb, return its result dict. Raises on failure."""
    light = wizlight(ip)

    try:
        state = await asyncio.wait_for(light.updateState(), timeout=3)
        bulb_type = await light.get_bulbtype()

        rgb = state.get_rgb()
        red, green, blue = rgb if rgb is not None else (None, None, None)

        brightness_value = state.get_brightness()
        brightness = (
            int(brightness_value / 255 * 100)
            if brightness_value is not None
            else 0
        )

        return build_result(
            b,
            is_on=state.get_state(),
            brightness=brightness,
            is_rgb=bulb_type.features.color,
            color_temp=state.get_colortemp(),
            red=red,
            green=green,
            blue=blue,
            cold_white=state.get_cold_white(),
            warm_white=state.get_warm_white(),
            max_temp=bulb_type.kelvin_range.max,
            min_temp=bulb_type.kelvin_range.min,
            ip=ip,
        )

    finally:
        await light.async_close()

def offline_result(b):
    """Couldn't reach this bulb — return safe defaults."""
    return build_result(
        b, is_on=False, brightness=50, is_rgb=b.is_rgb, color_temp=None,
        red=None, green=None, blue=None, cold_white=None, warm_white=None,
        max_temp=None, min_temp=None,
    )


@router.get("/saved")
async def saved_bulbs():
    bulbs = get_bulbs()
    result = []
    unreachable = []
    
    

    # First pass: try each saved IP (fast unicast)
    for b in bulbs:
        try:
            result.append(await read_bulb(b, b.ip))
        except Exception:
            unreachable.append(b)

    # Only scan if something failed
    if unreachable:
        async with discovery_lock: 

            broadcast = get_broadcast()
            discovered = await discovery.discover_lights(broadcast_space=broadcast)
            try:
                mac_to_ip = {d.mac: d.ip for d in discovered}
                # collect IPs already in use by REACHABLE bulbs (first pass succeeded)
                used_ips = {r["ip"] for r in result}

                for b in unreachable:
                    new_ip = mac_to_ip.get(b.mac)
                    if new_ip and new_ip not in used_ips:        # ← reject already-used IPs
                        light = wizlight(new_ip)
                        try:
                            state = await light.updateState()
                            matches = state.get_mac() == b.mac
                        finally:
                            await light.async_close()
                        if matches:
                            update_ip(b.mac, new_ip)
                            used_ips.add(new_ip)                   # ← mark it used
                            result.append(await read_bulb(b, new_ip))
                        else:
                            result.append(offline_result(b))
                    else:
                        result.append(offline_result(b))          # no IP, or IP already taken
            finally:
                for d in discovered:
                    await d.async_close()

    return {"bulbs": result}

class ChageNameModel(BaseModel):
    mac: str
    new_name: str


@router.post("/updateName")
async def light(light: ChageNameModel):
    update_light_name(light.mac, light.new_name)
    return {"status": "updated"}



class MacRequest(BaseModel):
    mac: str


@router.post("/delete")
async def light(light: MacRequest):
    delete_macros_for_target("bulb", light.mac)
    remove_light(light.mac)
    return {"status": "deleted"}


class ReorderRequest(BaseModel):
    order: list[str]   # list of macs in their new sequence

@router.post("/reorder")
async def reorder(req: ReorderRequest):
    for index, mac in enumerate(req.order):
        update_order(mac, index)   # mac's position = its index in the list
    return {"status": "reordered"}


class UpdateGroupRequest(BaseModel):
    mac: str
    group_id: int

@router.post("/update_group")
async def update_group(req: UpdateGroupRequest):
    update_light_group(req.mac, req.group_id)
    return {"status": "Group Updated"}