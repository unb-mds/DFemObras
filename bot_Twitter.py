
import cohere
import tweepy


import json  # Para manipulação de JSON

co = cohere.ClientV2("API_COHERE_KEY")
# Inicializando o cliente Cohere com sua chave de API
co = cohere.ClientV2("*****************************")

# Inicializando o cliente Tweepy com suas chaves de acesso
api = tweepy.Client(
    consumer_key="API_CONSUMER_KEY_X",
    consumer_secret="API_CONSUMER_SECRET_X",
    access_token="API_ACCESS_TOKEN_X",
    access_token_secret="API_ACCESS_TOKEN_SECRET_X"
    consumer_key='*****************************',
    consumer_secret='*************************',
    access_token='*****************************',
    access_token_secret='*********************'
)

try:
    message = "Me explique a ligação entre linguagens de programação e seus frameworks."
    # Enviando a requisição para o Cohere gerar a resposta
    response = co.chat(
        model="command-r-plus", 
        messages=[{"role": "user", "content": message}]
    )

    # Imprimindo toda a resposta do Cohere para entender sua estrutura
    print("Resposta do Cohere:", response)
    
    tweet = api.create_tweet(text='Testagem de código.')
    print("Tweet enviado com sucesso:", tweet) 
    

   
    tweet_text = response.message[0].content['text']  
    print("Texto do tweet:", tweet_text)

    data_to_save = {
        'request': 'Fale um pouco sobre o linguagens de programação',
        'response': tweet_text
    }

    # Salvando as mensagens geradas em um arquivo JSON  
    with open("cohere_resposta.json", "w") as json_file:
        json.dump(data_to_save, json_file, indent=4)

    print("Arquivo JSON salvo com sucesso como 'cohere_resposta.json'")

except Exception as e:
    print("Algo deu erro:", e)