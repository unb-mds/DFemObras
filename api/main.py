from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import duckdb
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="DF em Obras API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://unb-mds.github.io",
        "http://localhost:5500",      
        "http://127.0.0.1:5500"       
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.getenv("DB_PATH")

@app.get("/obras")
def get_obras():
    con = duckdb.connect(DB_PATH, read_only=True)
    
    try:
        cursor = con.execute("SELECT * FROM stg_obras_completas")
        cols = [desc[0] for desc in cursor.description]
        results = [dict(zip(cols, row)) for row in cursor.fetchall()]
        
        return {
            "total": len(results),
            "data": results
        }
    finally:
        con.close()

@app.get("/")
def home():
    return {"status": "API DF em Obras rodando perfeitamente!"}