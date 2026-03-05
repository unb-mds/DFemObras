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
    print("Conectando ao MotherDuck para buscar ranking de sobrecusto...")
    try:
        con = duckdb.connect(f'md:?motherduck_token={token}')
        
        stats_query = """
            SELECT count(*), sum(valor_estimado) 
            FROM obras_df.main.dim_obras_financeiro
        """
        stats_res = con.execute(stats_query).fetchone()
        
        ranking_query = """
            SELECT obra_nome, valor_estimado, valor_total_pago, percentual_pago
            FROM obras_df.main.dim_obras_financeiro
            WHERE percentual_pago > 100
            ORDER BY percentual_pago DESC
            LIMIT 3
        """
        ranking = con.execute(ranking_query).fetchall()
        con.close()
        
        return {
            "total_obras": stats_res[0] or 0,
            "investimento_total": stats_res[1] or 0,
            "top_3_sobrecusto": ranking
        }
    except Exception as e:
        print(f"❌ Erro no MotherDuck: {e}")
        return None

def build_prompt(data):
    """
    Monta o texto base forçando o encurtamento para caber em 1 tweet
    """
    obras_texto = ""
    for i, obra in enumerate(data['top_3_sobrecusto'], 1):
        nome = obra[0][:35] + "..." if len(obra[0]) > 35 else obra[0]
        estimado = (obra[1] or 0) / 1e6
        pago = (obra[2] or 0) / 1e6
        perc = obra[3] or 0
        
        linha = (
            f"{i}. {nome} | Prev: R${estimado:.1f}M -> "
            f"Pago: R${pago:.1f}M ({perc:.0f}%)\n"
        )
        obras_texto += linha

    investimento_bi = data['investimento_total'] / 1e9

    return f"""
    Atue como o perfil 'DF em Obras'. Escreva um ÚNICO tweet impactante:
    1. Diga: "Monitoramos {data['total_obras']} obras (R$ {investimento_bi:.1f} bi)."
    2. Liste este absurdo: as 3 obras que mais estouraram o orçamento:
    {obras_texto}
    3. Cobre o @Gov_DF.
    4. OBRIGATÓRIO: NUNCA ultrapasse 280 caracteres. Seja cortante, 
       use emojis de alerta (🚨) e não use hashtags longas.
    """

def generate_gemini_thread(api_key, data):
    client = genai.Client(api_key=api_key)
    prompt = build_prompt(data)
    
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest", 
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
            print("✅ Ranking financeiro postado com sucesso no X!")
        except Exception as e:
            print(f"❌ Erro ao postar no X: {e}")

if __name__ == "__main__":
    main()