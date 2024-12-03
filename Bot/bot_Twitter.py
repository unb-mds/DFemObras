import os
import cohere
import tweepy
from dotenv import load_dotenv
#Traz as chaves da API
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
    message = "Me explique a ligação entre linguagens de programação e seus frameworks."
    response = co.chat(
        model="command-r-plus", 
        messages=[{"role": "user", "content": message}]
    )
    print("Resposta do Cohere:", response)
    
    tweet = api.create_tweet(text='Testagem de código.')
    print("Tweet enviado com sucesso:", tweet) 
    
except Exception as e:
    print("Algo deu erro:", e)