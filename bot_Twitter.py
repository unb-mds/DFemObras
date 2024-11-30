import cohere
import tweepy

co = cohere.ClientV2("<<api.cohere>>")

api = tweepy.Client(
    consumer_key='<<consumer_key>>',
    consumer_secret='<<consumer_secret>>',
    access_token='<<access_token>>',
    access_token_secret='<<access_token_secret>>'
)

try:
    response = co.chat(
        model="command-r-plus", 
        messages=[{"role": "user", "content": "Fale um pouco sobre como são feitas as obras com verba pública em até 20 linhas."}]
    )
    
    print("Resposta do Cohere:", response)

    #Essas maneiras não dão certo
    tweet_text = response["response"]["text"] 
    tweet_text = response.messages[0]['text']
    
    tweet = api.create_tweet(text=tweet_text)
    print("Tweet enviado com sucesso:", tweet.data['text']) 

except Exception as e:
    print("Algo deu erro:", e)
