import os

import duckdb
import tweepy
from dotenv import load_dotenv
from google import genai


def load_config():
    load_dotenv()
    return {
        "gemini_api_key": os.getenv("GEMINI_API_KEY"),
        "motherduck_token": os.getenv("MOTHERDUCK_TOKEN"),
        "twitter_consumer_key": os.getenv("API_CONSUMER_KEY_X"),
        "twitter_consumer_secret": os.getenv("API_CONSUMER_SECRET_X"),
        "twitter_access_token": os.getenv("API_ACCESS_TOKEN_X"),
        "twitter_access_token_secret": os.getenv("API_ACCESS_TOKEN_SECRET_X")
    }

def get_data_from_motherduck(token):
    print("Conectando ao MotherDuck para buscar ranking...")
    try:
        con = duckdb.connect(f'md:?motherduck_token={token}')
        
        stats_query = """
            SELECT count(*), sum(valor_estimado) 
            FROM obras_df.main.stg_obras_completas
        """
        stats_res = con.execute(stats_query).fetchone()
        
        ranking_query = """
            SELECT obra_nome, valor_estimado, data_fim_prevista
            FROM obras_df.main.stg_obras_completas
            WHERE (obra_situacao IN ('Paralisada', 'Inativada') 
               OR (data_fim_prevista < CURRENT_DATE AND data_fim_prevista IS NULL))
            ORDER BY valor_estimado DESC
            LIMIT 5
        """
        ranking = con.execute(ranking_query).fetchall()
        con.close()
        
        return {
            "total_obras": stats_res[0],
            "investimento_total": stats_res[1] or 0,
            "top_5_atrasadas": ranking
        }
    except Exception as e:
        print(f"❌ Erro no MotherDuck: {e}")
        return None

def build_prompt(data):
    """
    Isolamos a montagem do texto. 
    O Pytest vai usar essa função para validar se o bot falaria besteira.
    """
    obras_texto = ""
    for i, obra in enumerate(data['top_5_atrasadas'], 1):
        linha = f"{i}. {obra[0]} | Valor: R$ {obra[1]:,.2f} | Previsão: {obra[2]}\n"
        obras_texto += linha

    investimento_bi = data['investimento_total'] / 1e9

    return f"""
    Atue como o perfil 'DF em Obras'. Escreva um tweet impactante:
    1. Comece com: "Atualmente, monitoramos {data['total_obras']} obras que somam 
       mais de R$ {investimento_bi:.1f} bilhões em investimentos."
    2. Liste as 5 obras atrasadas mais caras abaixo:
    {obras_texto}
    3. Finalize cobrando o @Gov_DF e o @govbr pela transparência e conclusão.
    4. Adicione o link: https://unb-mds.github.io/DFemObras/
    5. Máximo 280 caracteres.
    """

def generate_gemini_thread(api_key, data):
    client = genai.Client(api_key=api_key)
    prompt = build_prompt(data)
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"❌ Erro no Gemini: {e}")
        return None

def main():
    config = load_config()
    data = get_data_from_motherduck(config["motherduck_token"])
    
    if not data:
        return

    tweet_text = generate_gemini_thread(config["gemini_api_key"], data)
    
    if tweet_text:
        print(f"--- Tweet Gerado ---\n{tweet_text}\n-------------------")
        try:
            client = tweepy.Client(
                consumer_key=config["twitter_consumer_key"],
                consumer_secret=config["twitter_consumer_secret"],
                access_token=config["twitter_access_token"],
                access_token_secret=config["twitter_access_token_secret"]
            )
            client.create_tweet(text=tweet_text)
            print("✅ Ranking de atrasos postado com sucesso no X!")
        except Exception as e:
            print(f"❌ Erro ao postar no X: {e}")

if __name__ == "__main__":
    main()