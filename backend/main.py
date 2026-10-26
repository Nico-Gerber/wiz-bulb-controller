# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from singleBulbEndPoint import router as singleBulbRouter

from crudBulbs import router as findBulbsRouter

from groups import router as groupsRouter

from macros import router as macroRouter

from database import create_db_and_tables




app = FastAPI()

# Allow connections from your React development server URL
origins = [
    "http://localhost:5173",  # Default Vite port
    "http://localhost:3000",  # Default Create React App port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP actions (GET, POST, etc.)
    allow_headers=["*"],  # Allow all request headers
)



app.include_router(singleBulbRouter)

app.include_router(findBulbsRouter)


app.include_router(groupsRouter)


app.include_router(macroRouter)


@app.get("/api/data")
async def get_data():
    return {"message": "Hello from the FastAPI backend!"}

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
