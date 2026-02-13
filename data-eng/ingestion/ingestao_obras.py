import requests
import pandas as pd
import duckdb
import time

UF = "DF"
PAGE_SIZE = 100
DB_PATH = "../db/obras_df.duckdb"

def fetch_with_retry(url, retries=5, backoff_factor=2):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for i in range(retries):
        try:
            print(f"Tentativa {i+1}: {url}")
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            
            print(f"Status Erro: {response.status_code}")
            
            if response.status_code == 429: 
                wait = backoff_factor ** i
                print(f"Rate Limit. Aguardando {wait}s...")
                time.sleep(wait)
            elif response.status_code >= 500: 
                print("Erro no servidor governamental. Aguardando estabilização...")
                time.sleep(5)
            else:
                return None

        except requests.exceptions.Timeout:
            print("Erro: Timeout do servidor.")
        except requests.exceptions.ConnectionError:
            print("Erro: Falha na conexão de rede.")
        except Exception as e:
            print(f"Erro inesperado: {str(e)}")
            
        time.sleep(backoff_factor)
    return None

def get_already_processed_ids(con):
    """Verifica quais obras já estão no banco para não repetir"""
    try:
        res = con.execute("SELECT idUnico FROM raw_obras").fetchall()
        return set([r[0] for r in res])
    except:
        return set()

def main():
    con = duckdb.connect(DB_PATH)
    processed_ids = get_already_processed_ids(con)
    page = len(processed_ids) // PAGE_SIZE
    
    print(f"Iniciando extração. {len(processed_ids)} obras encontradas. Retomando da página {page}...")

    while True:
        url = f"https://api.obrasgov.gestao.gov.br/obrasgov/api/projeto-investimento?uf={UF}&pagina={page}&tamanhoDaPagina={PAGE_SIZE}"
        data = fetch_with_retry(url)
        
        if data is None:
            print(f"Erro crítico: Não foi possível obter dados da página {page} após 5 tentativas. Interrompendo para evitar dados incompletos.")
            break 

        obras = data.get('content', [])
        if not obras: 
            print(f"Página {page} retornou vazia. Extração finalizada.")
            break

        novas_obras = []
        for obra in obras:
            if obra['idUnico'] in processed_ids:
                continue 
            
            print(f"Processando nova obra: {obra['idUnico']}")
            geo_url = f"https://api.obrasgov.gestao.gov.br/obrasgov/api/geometria?idUnico={obra['idUnico']}"
            geo_data = fetch_with_retry(geo_url)
            obra['geometriaWkt'] = geo_data[0]['geometriaWkt'] if geo_data else None
            
            novas_obras.append(obra)
            time.sleep(0.3)

        if novas_obras:
            df_page = pd.DataFrame(novas_obras)
            
            colunas_para_texto = [
                'dataInicialEfetiva', 'dataFinalEfetiva', 'dataCadastro', 
                'dataSituacao', 'dataInicialPrevista', 'dataFinalPrevista',
                'observacoesPertinentes', 'qdtEmpregosGerados', 'populacaoBeneficiada'
            ]
            
            for col in colunas_para_texto:
                if col in df_page.columns:
                    df_page[col] = df_page[col].astype(str).replace(['None', 'nan', 'NaN'], None)
            
            tabelas_existentes = [t[0] for t in con.execute("SHOW TABLES").fetchall()]
            
            if 'raw_obras' not in tabelas_existentes:
                con.execute("CREATE TABLE raw_obras AS SELECT * FROM df_page")
                print(f"Tabela raw_obras criada com {len(novas_obras)} obras.")
            else:
                con.append("raw_obras", df_page)
                print(f"Página {page} processada. {len(novas_obras)} novas obras adicionadas.")
        
        page += 1
        time.sleep(1)

    print("Extração concluída!")

if __name__ == "__main__":
    main()