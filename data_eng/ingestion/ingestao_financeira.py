import os
import time
import pandas as pd
import requests
import duckdb
from dotenv import load_dotenv, find_dotenv

def main():
    load_dotenv(find_dotenv())
    token = os.environ.get("MOTHERDUCK_TOKEN")
    if not token:
        raise ValueError("ERRO: Variável de ambiente MOTHERDUCK_TOKEN não encontrada.")
    
    print("Conectando ao banco de dados...")
    con = duckdb.connect(f"md:?motherduck_token={token}")
    
    print("Buscando IDs únicos das obras...")
    query_ids = "SELECT DISTINCT idUnico FROM obras_df.raw_obras WHERE idUnico IS NOT NULL"
    ids_df = con.execute(query_ids).df()
    lista_ids = ids_df['idUnico'].tolist()
    
    print(f"Encontrados {len(lista_ids)} IDs. Iniciando extração financeira...")
    
    todos_empenhos = []
    
    for id_unico in lista_ids:
        url = f"https://api.obrasgov.gestao.gov.br/obrasgov/api/execucao-financeira?idUnico={id_unico}&idProjetoInvestimento={id_unico}&page=0&size=1000"
        
        try:
            response = requests.get(url, headers={'accept': '*/*'}, timeout=10)
            if response.status_code == 200:
                dados = response.json()
                
                if isinstance(dados, dict):
                    conteudo = dados.get("content", [])
                elif isinstance(dados, list):
                    conteudo = dados
                else:
                    conteudo = []
                
                if conteudo:
                    empenhos_validos = []
                    for empenho in conteudo:
                        id_retornado = str(empenho.get('idProjetoInvestimento', empenho.get('idUnico', ''))).strip()
                        if id_retornado == str(id_unico).strip():
                            empenhos_validos.append(empenho)
                            
                    todos_empenhos.extend(empenhos_validos)
                    
        except Exception as e:
            print(f"Erro ao buscar dados da obra {id_unico}: {e}")
        
        time.sleep(0.2)
        
    if not todos_empenhos:
        print("Nenhum dado financeiro encontrado. Encerrando o processo.")
        return
        
    print(f"Extração concluída! {len(todos_empenhos)} registros financeiros REAIS encontrados.")
    
    df_financeiro = pd.DataFrame(todos_empenhos)
    
    print("Substituindo a tabela corrompida no MotherDuck pelos dados limpos...")
    con.register("df_staging_fin", df_financeiro)
    
    con.execute("""
        CREATE OR REPLACE TABLE obras_df.raw_execucao_financeira AS 
        SELECT * FROM df_staging_fin
    """)
    
    print("Sucesso! Ingestão financeira finalizada e banco atualizado.")

if __name__ == "__main__":
    main()