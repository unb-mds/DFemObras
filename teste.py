import tweepy
import cohere
import time

# Credenciais da API do Twitter (v2)
twitter_bearer_token = 'AAAAAAAAAAAAAAAAAAAAAHQRxAEAAAAAZ%2Fc2oOos9whFTj1L5Knc5AzV7vg%3DjyqHqZYDhcOnqx8zHcimInvlIqW94IJrJg0wti8QfrZvWhMa09'

# Credenciais da API do Cohere
cohere_api_key = 'SUA_API_KEY_DO_COHEREVrz2s8oKpdVjS6NIHL2VW84iLGfL5YhcxHJnvYU9'

# Autenticando no Twitter usando o Bearer Token (API v2)
client = tweepy.Client(bearer_token=twitter_bearer_token)

# Inicializando a API do Cohere
co = cohere.Client(cohere_api_key)

# Função para gerar um comentário usando o Cohere
def gerar_comentario():
    prompt = "Crie um comentário interessante sobre tecnologia."
    response = co.generate(
        model='xlarge',  # ou o modelo que você preferir
        prompt=prompt,
        max_tokens=50,  # Quantidade de tokens (tamanho do comentário)
        temperature=0.7,  # Controla a criatividade do texto
        stop_sequences=["."]
    )
    return response.generations[0].text.strip()

# Função para comentar em um tweet específico
def comentar_no_tweet(tweet_id, comentario):
    try:
        client.create_tweet(
            status=comentario,
            in_reply_to_tweet_id=tweet_id
        )
        print(f"Comentado no tweet {tweet_id} com: {comentario}")
    except tweepy.TweepError as e:
        print(f"Erro ao comentar: {e}")

# Função principal
def main():
    while True:
        # Exemplo: pegar o último tweet de uma conta específica (API v2)
        response = client.get_users_tweets(id="usuario_exemplo", max_results=1)
        
        if response.data:
            tweet = response.data[0]
            tweet_id = tweet.id
            comentario = gerar_comentario()  # Gera o comentário com o Cohere
            comentar_no_tweet(tweet_id, comentario)  # Comenta no tweet
            
        # Aguarda 60 segundos antes de tentar comentar novamente
        time.sleep(60)

if __name__ == "__main__":
    main()
