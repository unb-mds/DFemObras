import cohere
import tweepy
import json  # Para manipulação de JSON

# Inicializando o cliente Cohere com sua chave de API
co = cohere.ClientV2("Vrz2s8oKpdVjS6NIHL2VW84iLGfL5YhcxHJnvYU9")

# Inicializando o cliente Tweepy com suas chaves de acesso
api = tweepy.Client(
    consumer_key='TXoi2SCmbNjANj2KGaB76oQkr',
    consumer_secret='OLDH3hKFyhlhZWRv6CpD7qsp3IvkwBlYdasju6d7Du0yEQ7AXi',
    access_token='1857930392487211008-uvaBwIj2GhzFt9gXfY4CVvE26Lcudw',
    access_token_secret='7yLQPwh6UPMXIZAT1G0GAdgfHNpDEh2N0fJJMErHjriGr'
)

try:
    # Enviando a requisição para o Cohere gerar a resposta
    response = co.chat(
        model="command-r-plus", 
        messages=[{"role": "user", "content": "Fale um pouco sobre o flamengo"}]
    )

    # Imprimindo toda a resposta do Cohere para entender sua estrutura
    print("Resposta do Cohere:", response)

    # Acessando o texto da resposta corretamente
    tweet_text = response.message[0].content['text']  # Acessando o texto gerado corretamente
    print("Texto do tweet:", tweet_text)

    # Criando o tweet com o texto gerado pelo Cohere
    #tweet = api.create_tweet(text=tweet_text)
    #print("Tweet enviado com sucesso:", tweet.data['text'])

    # Gerando o arquivo JSON com as mensagens
    data_to_save = {
        'request': 'Fale um pouco sobre o flamengo',
        'response': tweet_text
    }

    # Salvando as mensagens geradas em um arquivo JSON
    with open("cohere_resposta.json", "w") as json_file:
        json.dump(data_to_save, json_file, indent=4)

    print("Arquivo JSON salvo com sucesso como 'cohere_resposta.json'")

except Exception as e:
    print("Algo deu erro:", e)
