import os
from pathlib import Path

import duckdb
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

os.environ['HOME'] = '/tmp'

env_path = Path(__file__).resolve().parent.parent / ".env"
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

token = os.getenv("MOTHERDUCK_TOKEN")
app = FastAPI(title="DF em Obras API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/obras")
def get_obras():
    if not token:
        return {"error": "Token do MotherDuck não configurado."}

    try:
        os.environ['HOME'] = '/tmp'
        
        con = duckdb.connect(f"md:?motherduck_token={token}")
        
        con.execute("SET home_directory='/tmp';")
        
        cursor = con.execute("SELECT * FROM obras_df.main.stg_obras_completas")
        
        cols = [desc[0] for desc in cursor.description]
        results = [dict(zip(cols, row)) for row in cursor.fetchall()]
        
        return {
            "total": len(results), 
            "data": results
        }
        
    except Exception as e:
        return {"error": f"Erro de conexão MotherDuck: {str(e)}"}
    finally:
        if 'con' in locals():
            con.close()

@app.get("/")
def home():
    return {"status": "API working!"}