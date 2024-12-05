import os
import cohere
import tweepy
from dotenv import load_dotenv

load_dotenv()
API_COHERE_KEY = os.getenv("API_COHERE_KEY")
API_CONSUMER_KEY_X = os.getenv("API_CONSUMER_KEY_X")
API_CONSUMER_SECRET_X = os.getenv("API_CONSUMER_SECRET_X")
API_ACCESS_TOKEN_X = os.getenv("API_ACCESS_TOKEN_X")
API_ACCESS_TOKEN_SECRET_X = os.getenv("API_ACCESS_TOKEN_SECRET_X")

co = cohere.ClientV2(API_COHERE_KEY)

api = tweepy.Client(
    consumer_key=API_CONSUMER_KEY_X,
    consumer_secret=API_CONSUMER_SECRET_X,
    access_token=API_ACCESS_TOKEN_X,
    access_token_secret=API_ACCESS_TOKEN_SECRET_X
)

try:
    message = "Explique em 4 linhas, até 50 caracteres por linha e em tópicos de onde vêm as verbas para obras públicas."
    response = co.chat(
        model="command-r-plus", 
        messages=[{"role": "user", "content": message}]
    )

    mensagem_principal = response.message.content[0].text
    print(mensagem_principal)

    tweet = api.create_tweet(text=mensagem_principal)
    print("Tweet enviado com sucesso:", tweet) 
    
except Exception as e:
    print("Algo deu erro:", e)