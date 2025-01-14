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

def generate_message(co_client, message_prompt):
    try:
        response = co_client.chat(
            model="command-r-plus",
            messages=[{"role": "user", "content": message_prompt}]
        )
        return response.message.content[0].text
    except Exception as e:
        print("Erro ao gerar mensagem:", e)
        return None


def post_tweet(api_client, message):
    try:
        tweet = api_client.create_tweet(text=message)
        print("Tweet enviado com sucesso:", tweet)
        return tweet
    except Exception as e:
        print("Erro ao enviar o tweet:", e)
        return None

def main():
    try:
        message_prompt = ("Explique em 4 linhas, até 50 caracteres por linha e em tópicos como estão sendo organizadas as obras do DF")
        
        mensagem_principal = generate_message(co, message_prompt)
        print("Mensagem gerada:", mensagem_principal)

        response = post_tweet(api, mensagem_principal)
        print("Resposta da API do Twitter:", response)

    except Exception as e:
        print("Ocorreu um erro:", e)


if __name__ == "__main__":
    main()
