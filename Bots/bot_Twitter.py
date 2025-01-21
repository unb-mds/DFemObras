import os
import cohere
import tweepy
from dotenv import load_dotenv
import json
from PIL import Image, ImageDraw, ImageFont

def load_config():
    load_dotenv()
    config = {
        "cohere_api_key": os.getenv("API_COHERE_KEY"),
        "twitter_consumer_key": os.getenv("API_CONSUMER_KEY_X"),
        "twitter_consumer_secret": os.getenv("API_CONSUMER_SECRET_X"),
        "twitter_access_token": os.getenv("API_ACCESS_TOKEN_X"),
        "twitter_access_token_secret": os.getenv("API_ACCESS_TOKEN_SECRET_X")
    }
    return config

def get_cohere_client(api_key):
    return cohere.ClientV2(api_key)

def get_twitter_client(config):
    client_v2 = tweepy.Client(
        consumer_key=config["twitter_consumer_key"],
        consumer_secret=config["twitter_consumer_secret"],
        access_token=config["twitter_access_token"],
        access_token_secret=config["twitter_access_token_secret"]
    )

    client_v1 = tweepy.API(
        tweepy.OAuth1UserHandler(
            consumer_key=config["twitter_consumer_key"],
            consumer_secret=config["twitter_consumer_secret"],
            access_token=config["twitter_access_token"],
            access_token_secret=config["twitter_access_token_secret"]
        )
    )

    return client_v2, client_v1

def generate_message(cohere_client, prompt):
    try:
        response = cohere_client.chat(
            model="command-r-plus",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.message.content[0].text
    except Exception as e:
        print("Erro ao gerar mensagem:", e)
        return None

def post_message(twitter_client, message):
    try:
        tweet = twitter_client.create_tweet(text=message)
        print("Tweet enviado com sucesso:", tweet)
        return tweet
    except Exception as e:
        print("Erro ao enviar o tweet:", e)
        return None

def load_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print(f"Arquivo {file_path} não encontrado.")
        return None
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}")
        return None

def save_image(data, file_path):
    try:
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))

        width, height = 800, 1200
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)

        font_path = "C:/Windows/Fonts/arial.ttf"
        font = ImageFont.truetype(font_path, size=10)
        y_offset = 10

        for obra in data:
            nome_obra = obra.get('nome', 'Nome não disponível')
            meta_global = obra.get('metaGlobal', 'Meta global não disponível')
            latitude = obra.get('latitude', 'Latitude não disponível')
            longitude = obra.get('longitude', 'Longitude não disponível')

            tomadores = obra.get('tomadores', [])
            tomadores_nomes = ', '.join([tomador.get('nome', 'Nome não disponível') for tomador in tomadores])

            draw.text((10, y_offset), f"Nome: {nome_obra}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Meta Global: {meta_global}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Latitude: {latitude}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Longitude: {longitude}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Tomadores: {tomadores_nomes}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Status: {obra.get('status', 'Não especificado')}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Data Final Prevista: {obra['dataFinalPrevista']}", fill="black", font=font)
            y_offset += 20
            draw.text((10, y_offset), f"Descrição: {obra['descricao']}", fill="black", font=font)
            y_offset += 40

            if y_offset > height - 50:
                break

        image.save(file_path)
        print(f"Imagem salva em {file_path}")
        image.show()
    except Exception as e:
        print(f"Erro ao gerar a imagem: {e}")

def post_image(twitter_client_v2, twitter_client_v1, image):
    try:
        if image:
            if not os.path.exists(image):
                print(f"Erro: Arquivo de imagem não encontrado - {image}")
                return None
            
            media = twitter_client_v1.media_upload(image)

            tweet = twitter_client_v2.create_tweet(media_ids=[media.media_id])

            print("Tweet enviado com sucesso:", tweet)
            return tweet
    except Exception as e:
        print("Erro ao enviar o tweet:", e)
        return None

    
def run_bot(out_image_path):
    # try:
    #     config = load_config()
    #     cohere_client = get_cohere_client(config["cohere_api_key"])
    #     twitter_client = get_twitter_client(config)

    #     prompt = (
    #         "Explique em até extritamente 280 caracteres, qual foi a última obra feita no DF, Brasil. "
    #     )
    #     message = generate_message(cohere_client, prompt)
        
    #     if message:
    #         print("Mensagem gerada:", message)
    #         response = post_message(twitter_client, message)
    #         print("Resposta da API do Twitter:", response)
    #     else:
    #         print("Nenhuma mensagem foi gerada.")
    # except Exception as e:
    #     print("Erro durante a execução:", e)

    try:
        config = load_config()
        twitter_client_v2, twitter_client_v1 = get_twitter_client(config)

        if os.path.exists(out_image_path):
            post_image(twitter_client_v2, twitter_client_v1, out_image_path)
        else:
            print(f"Imagem não encontrada no caminho: {out_image_path}")
    except Exception as e:
        print("Erro durante a execução do bot:", e)

def html_generate(obra):
    
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
    <title>Anomalias</title>
    </head>
    <body>
    """
    for obras in obra:
        nome_obra = obras.get('nome', 'Nome não disponível')
        meta_global = obras.get('metaGlobal', 'Meta global não disponível')
        latitude = obras.get('latitude', 'Latitude não disponível')
        longitude = obras.get('longitude', 'Longitude não disponível')

        tomadores = obras.get('tomadores', [])
        tomadores_nomes = ', '.join([tomador.get('nome', 'Nome não disponível') for tomador in tomadores])

        html_content += f"   <p>Nome: {nome_obra}<p>\n   <p>Meta: {meta_global}<p>\n   <p>Latitude: {latitude}<p>\n   <p>Longitude: {longitude}<p>\n   <p>Tomadores: {tomadores_nomes}<p>\n   <p>Status: {obras.get('status', 'Não especificado')}<p>\n   <p>Data Final Prevista: {obras['dataFinalPrevista']}<p>\n   <p>Descrição: {obras['descricao']}<p>\n   <p>&nbsp;</p>"
        
    html_content += """    
    </body>
    </html>
    """
    with open("arquivo.html", "w", encoding="utf-8") as file:
        file.write(html_content)

def main():
    json_file_path = "C:\\Users\\lunat\\OneDrive\\Área de Trabalho\\Projeto\\2024-2-Squad07\\TesteObrasgov\\obras_com_lat_long.json"
    output_image_path = "C:\\Users\\lunat\\OneDrive\\Área de Trabalho\\Projeto\\2024-2-Squad07\\Bots\imagens\\obras_atrasadas.png"

    data = load_json(json_file_path)

    if data:
        obras_atrasadas = [
            obra for obra in data
            if obra['dataFinalPrevista'] and obra['dataFinalPrevista'] < "2024-01-01" and obra['dataFinalEfetiva'] is None
        ]
        save_image(obras_atrasadas, output_image_path)
        html_generate(obras_atrasadas)
        run_bot(output_image_path)

if __name__ == "__main__":
    main()