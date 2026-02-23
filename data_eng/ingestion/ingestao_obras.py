import os
import time
import duckdb
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("MOTHERDUCK_TOKEN")

UF = "DF"
PAGE_SIZE = 100

def fetch_with_retry(url, retries=5, backoff_factor=2):
    """Faz a requisição com lógica de retry."""
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
    }
    for i in range(retries):
        try:
            print(f"Tentativa {i+1}: {url}")
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                return response.json()
            if response.status_code == 429: 
                time.sleep(backoff_factor ** i)
            else:
                time.sleep(backoff_factor)
        except Exception as e:
            print(f"Erro: {e}")
            time.sleep(backoff_factor)
    return None

def process_obras_dataframe(obras_list):
    """
    Transforma a lista de dicionários em um DataFrame limpo.
    Esta é a função que o Pytest vai testar!
    """
    if not obras_list:
        return None
        
    df = pd.DataFrame(obras_list)
    
    # Limpeza de tipos e substituição de nulos para o DuckDB
    for col in df.columns:
        # Quebramos a linha para o Ruff não reclamar do comprimento (E501)
        df[col] = (
            df[col]
            .astype(str)
            .replace(['None', 'nan', 'NaN', 'nan'], None)
        )
    return df

def main():
    con = duckdb.connect(f"md:obras_df?motherduck_token={token}")
    
    con.execute("""
        CREATE TABLE IF NOT EXISTS raw_obras (
            idUnico VARCHAR PRIMARY KEY,
            nome VARCHAR,
            situacao VARCHAR,
            valorTotalInvestimento DOUBLE,
            dataFinalPrevista VARCHAR,
            geometriaWkt VARCHAR
        )
    """)

    try:
        res = con.execute("SELECT idUnico FROM raw_obras").fetchall()
        processed_ids = set([r[0] for r in res])
    except Exception: # Corrigido o 'bare except' (E722)
        processed_ids = set()

    page = 0 
    print(f"🔄 Sincronização. {len(processed_ids)} obras conhecidas.")

    while True:
        url = (
            f"https://api.obrasgov.gestao.gov.br/obrasgov/api/projeto-investimento?"
            f"uf={UF}&pagina={page}&tamanhoDaPagina={PAGE_SIZE}"
        )
        data = fetch_with_retry(url)
        
        if data is None or not data.get('content'):
            print(f"✅ Sincronização finalizada na página {page}.")
            break

        obras_da_pagina = data.get('content', [])
        obras_para_processar = []

        for obra in obras_da_pagina:
            id_obra = obra['idUnico']
            
            if id_obra not in processed_ids:
                print(f"✨ Nova obra: {id_obra}")
                geo_url = f"https://api.obrasgov.gestao.gov.br/obrasgov/api/geometria?idUnico={id_obra}"
                geo_data = fetch_with_retry(geo_url)
                obra['geometriaWkt'] = geo_data[0]['geometriaWkt'] if geo_data else None
                processed_ids.add(id_obra)
            else:
                obra['geometriaWkt'] = None 
            
            obras_para_processar.append(obra)

        if obras_para_processar:
            # Chamamos a nova função aqui!
            df_page = process_obras_dataframe(obras_para_processar)

            con.register("df_staging", df_page)
            con.execute("""
                MERGE INTO raw_obras AS destino
                USING df_staging AS origem
                ON destino.idUnico = origem.idUnico
                WHEN MATCHED THEN
                    UPDATE SET 
                        situacao = origem.situacao,
                        valorTotalInvestimento = origem.valorTotalInvestimento,
                        dataFinalPrevista = origem.dataFinalPrevista,
                        dataSituacao = origem.dataSituacao
                WHEN NOT MATCHED THEN
                    INSERT BY NAME
            """)
            print(f"📄 Página {page} processada.")

        page += 1
        time.sleep(0.5)

    con.close()
    print("🚀 Base de dados atualizada!")

if __name__ == "__main__":
    main()