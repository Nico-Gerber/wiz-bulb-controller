import asyncio

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from fastapi.responses import JSONResponse 

from pydantic import BaseModel

from pywizlight import wizlight, PilotBuilder, discovery

import psutil

import ipaddress

import socket

from database import create_new_group, get_groups, update_group_name, delete_group, clear_bulbs_in_group, delete_macros_for_target



router = APIRouter(prefix="/group", tags=["group"])


class GroupModel(BaseModel):
    name: str

@router.post("/create")
async def create(req: GroupModel):
    create_new_group(req.name)
    return {"Group": "created"}

@router.get("/get")
async def get():
    return {"groups": get_groups()}


class UpdateGroupNameModel(BaseModel):
    id: int
    new_name: str

@router.post("/update_name")
async def create(req: UpdateGroupNameModel):
    update_group_name(req.id, req.new_name)
    return {"Group": "Name Updated"}


class DeleteGroup(BaseModel):
    id: int

@router.post("/delete")
async def delete(req: DeleteGroup):
    clear_bulbs_in_group(req.id)
    delete_macros_for_target("group", str(req.id))
    delete_group(req.id)
    return {"Group": " Deleted"}


    