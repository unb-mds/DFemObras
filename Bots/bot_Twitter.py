import os
import cohere
import tweepy
from dotenv import load_dotenv
import json
from PIL import Image, ImageDraw, ImageFont
import time

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

def save_image(data, output_dir):
    try:
        # Certificando-se de que o diretório de saída existe
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        width, height = 800, 1200
        font_path = "C:/Windows/Fonts/arial.ttf"
        font = ImageFont.truetype(font_path, size=10)

        images_created = 0
        items_per_image = len(data) // 4 + (1 if len(data) % 4 != 0 else 0)

        for i in range(4):
            start_idx = i * items_per_image
            end_idx = start_idx + items_per_image
            obras_slice = data[start_idx:end_idx]

            if not obras_slice:
                break

            image = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(image)
            y_offset = 10

            for obra in obras_slice:
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

            # Corrigir a construção do caminho de saída
            output_path = os.path.join(output_dir, f"obras_atrasadas_{i + 1}.png")
            image.save(output_path)
            print(f"Imagem {i + 1} salva em {output_path}")

            images_created += 1

        print(f"Total de imagens criadas: {images_created}")
    except Exception as e:
        print(f"Erro ao gerar as imagens: {e}")


def post_images(twitter_client_v2, twitter_client_v1, image_paths):
    media_ids = []

    for image in image_paths:
        if not os.path.exists(image):
            print(f"Erro: Arquivo de imagem não encontrado - {image}")
            continue

        try:
            # Verifica o status do limite antes de fazer o upload
            remaining, reset_timestamp, limit = get_rate_limit_status(twitter_client_v1)
            
            while remaining == 0:  # Enquanto não houver requisições restantes, aguarde
                current_time = int(time.time())
                wait_time = reset_timestamp - current_time + 5  # 5 segundos de folga
                print(f"Limite de requisições atingido. Aguardando {wait_time} segundos antes de tentar novamente.")
                time.sleep(wait_time)  # Espera até o reset do limite
                remaining, reset_timestamp, limit = get_rate_limit_status(twitter_client_v1)  # Verifica novamente

            # Upload da mídia
            media = twitter_client_v1.media_upload(image)
            media_ids.append(media.media_id)
            print(f"Imagem {image} carregada com sucesso.")
            time.sleep(3)  # Pausa entre uploads

        except tweepy.TweepError as e:
            if e.api_code == 429:  # Se o erro for relacionado ao limite
                print("Limite de requisições atingido. Aguardando...")
                # Pegando o tempo de reset do limite a partir dos headers
                reset_time = int(e.response.headers.get('x-rate-limit-reset'))
                current_time = int(time.time())
                wait_time = reset_time - current_time + 5  # 5 segundos de folga
                print(f"Aguardando {wait_time} segundos antes de tentar novamente.")
                time.sleep(wait_time)
                # Reavalia o status após aguardar
                return post_images(twitter_client_v2, twitter_client_v1, image_paths)  # Tentativa novamente após o reset

    # Se todas as imagens foram carregadas, envia o tweet
    if media_ids:
        try:
            tweet = twitter_client_v2.create_tweet(media_ids=media_ids)
            print("Tweet enviado com sucesso:", tweet)
            return tweet
        except tweepy.TweepError as e:
            print("Erro ao enviar o tweet:", e)
            return None
    else:
        print("Nenhuma imagem foi carregada.")
        return None
def run_bot(out_image_dir):
    try:
        config = load_config()
        twitter_client_v2, twitter_client_v1 = get_twitter_client(config)

        # Verificar se o diretório de imagens existe
        if not os.path.exists(out_image_dir):
            print(f"Erro: Diretório de imagens não encontrado - {out_image_dir}")
            return

        # Listar todas as imagens geradas no diretório
        image_files = [f for f in os.listdir(out_image_dir) if f.endswith('.png')]

        # Verificar se existem imagens para enviar
        if not image_files:
            print("Nenhuma imagem encontrada para enviar.")
            return

        # Enviar uma imagem por vez
        for image_file in image_files:
            image_path = os.path.join(out_image_dir, image_file)

            if os.path.exists(image_path):
                # Fazer o upload da imagem
                media = twitter_client_v1.media_upload(image_path)

                # Enviar o tweet com a imagem
                tweet = twitter_client_v2.create_tweet(media_ids=[media.media_id])
                print(f"Tweet enviado com sucesso: {tweet}")
                time.sleep(3)  # Adicionar uma pausa de 3 segundos entre uploads

            else:
                print(f"Imagem não encontrada: {image_path}")

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
    json_file_path = r"C:\projetos\2024-2-Squad07\TesteObrasgov\obras_com_lat_long.json"

    # Caminho do diretório onde as imagens serão salvas (sem o nome do arquivo)
    output_dir = r"C:\projetos\2024-2-Squad07\Bots\imagens"

    data = load_json(json_file_path)

    if data:
        obras_atrasadas = [
            obra for obra in data
            if obra['dataFinalPrevista'] and obra['dataFinalPrevista'] < "2024-01-01" and obra['dataFinalEfetiva'] is None
        ]
        save_image(obras_atrasadas, output_dir)
        run_bot(output_dir)

# Executando o bot
if __name__ == "__main__":
    main()
