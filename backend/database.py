from sqlmodel import Field, SQLModel, create_engine, Session, select

engine = create_engine("sqlite:///bulbs.db", connect_args={"check_same_thread": False})


class LightGroup(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)


class Bulb(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    mac: str = Field(index=True, unique=True)
    ip: str
    name: str
    order: int = Field(default=0)
    group_id: int | None = Field(default=None, foreign_key="lightgroup.id")
    is_rgb: bool


class Macro (SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    key: str
    action: str
    target_type: str
    target_id: str | None = Field(default=None)


 
  

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def save_bulb(mac: str, ip: str, name: str, is_rgb: bool):
    with Session(engine) as session:
        existing = session.exec(select(Bulb).where(Bulb.mac == mac)).first()
        if existing:
            existing.ip = ip
            session.add(existing)
        else:
            session.add(Bulb(mac=mac, ip=ip, name=name, is_rgb=is_rgb))
        session.commit()

def get_bulbs():
    with Session(engine) as session:
        return session.exec(select(Bulb).order_by(Bulb.order)).all()
    
def update_light_name(mac: str, newname: str):
    with Session(engine) as session:
        light_to_update = session.exec(select(Bulb).where(Bulb.mac == mac)).first()
        light_to_update.name = newname
        session.commit()

def remove_light(mac: str):
    with Session(engine) as session:
        light_to_delete = session.exec(select(Bulb).where(Bulb.mac == mac)).first()
        session.delete(light_to_delete)
        session.commit()

def update_ip(mac: str, ip: str ):
    with Session(engine) as session:
        light_to_update = session.exec(select(Bulb).where(Bulb.mac == mac)).first()
        light_to_update.ip = ip
        session.commit()

def update_order(mac: str, order: int):
    with Session(engine) as session:
        bulb = session.exec(select(Bulb).where(Bulb.mac == mac)).first()
        if bulb:
            bulb.order = order
            session.add(bulb)
            session.commit()


def create_new_group(name: str):
    with Session(engine) as session:
        new_group = LightGroup(name= name)
        session.add(new_group)
        session.commit()
        session.refresh(new_group)

def get_groups():
    with Session (engine) as session:
        return session.exec(select(LightGroup)).all()
    
def update_group_name(id: int, new_name: str):
    with Session (engine) as session:
        group_to_update = session.exec(select(LightGroup).where(LightGroup.id == id)).first()
        group_to_update.name = new_name
        session.commit()
def delete_group(id: int):
    with Session (engine) as session:
        group_to_delete = session.exec(select(LightGroup).where(LightGroup.id == id)).first()
        session.delete(group_to_delete)
        session.commit()

def update_light_group(mac: int, group_id: int):
    with Session (engine) as session:
        light_to_update = session.exec(select(Bulb).where(Bulb.mac == mac)).first()
        light_to_update.group_id = group_id
        session.commit()


def create_macro(key: str, action: str, target_type: str, target_id: str | None):
    with Session(engine) as session:
        macro = Macro(key=key, action=action, target_type=target_type, target_id=target_id)
        session.add(macro)
        session.commit()
        session.refresh(macro)
        return macro

def get_macros():
    with Session(engine) as session:
        return session.exec(select(Macro)).all()

def delete_macro(id: int):
    with Session(engine) as session:
        macro = session.exec(select(Macro).where(Macro.id == id)).first()
        if macro:
            session.delete(macro)
            session.commit()


def set_macro(target_type: str, target_id: str, action: str, key: str):
    with Session(engine) as session:
        existing = session.exec(
            select(Macro).where(
                Macro.target_type == target_type,
                Macro.target_id == target_id,
                Macro.action == action
            )
        ).first()
        if existing:
            existing.key = key             
            session.add(existing)
        else:
            session.add(Macro(             
                target_type=target_type,
                target_id=target_id,
                action=action,
                key=key
            ))
        session.commit()


def get_macros_for_target(target_type: str, target_id: str):
    with Session(engine) as session:
        return session.exec(
            select(Macro).where(
                Macro.target_type == target_type,
                Macro.target_id == target_id
            )
        ).all()
    
def get_bulb_by_mac(mac: str):
    with Session(engine) as session:
        return session.exec(select(Bulb).where(Bulb.mac == mac)).first()
    

def clear_bulbs_in_group(group_id: int):
    with Session(engine) as session:
        bulbs = session.exec(select(Bulb).where(Bulb.group_id == group_id)).all()
        for bulb in bulbs:
            bulb.group_id = None
            session.add(bulb)
        session.commit()



def delete_macros_for_target(target_type: str, target_id: str):
    with Session(engine) as session:
        macros = session.exec(
            select(Macro).where(
                Macro.target_type == target_type,
                Macro.target_id == target_id
            )
        ).all()
        for macro in macros:
            session.delete(macro)
        session.commit()