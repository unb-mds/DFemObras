import tweepy

api = tweepy.Client(
    consumer_key='',
    consumer_secret='',
    access_token='',
    access_token_secret=''
)

try:
    tweet = api.create_tweet(text='Perfil destinado ao mapeamento das obras do governo.')
    print(tweet) 
except:
    print("Algo deu erro.")