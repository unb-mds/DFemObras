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
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        width, height = 1800, 1200

        try:
            font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" 
            if not os.path.exists(font_path):
                font_path = "./assets/fonts/arial.ttf"  
            font = ImageFont.truetype(font_path, size=20)
        except Exception as e:
            print(f"Erro ao carregar a fonte: {e}. Usando fonte padrão.")
            font = ImageFont.load_default()
  

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

                lines = [
                    f"Nome: {nome_obra}",
                    f"Meta Global: {meta_global}",
                    f"Latitude: {latitude}",
                    f"Longitude: {longitude}",
                    f"Tomadores: {tomadores_nomes}",
                    f"Status: {obra.get('status', 'Não especificado')}",
                    f"Data Final Prevista: {obra['dataFinalPrevista']}",
                    f"Descrição: {obra['descricao']}"
                ]

                for line in lines:
                   
                    text_bbox = draw.textbbox((10, y_offset), line, font=font)
                    text_height = text_bbox[3] - text_bbox[1]

                   
                    if y_offset + text_height > height - 50:
                        break

                   
                    clean_line = line.replace("\u200b", "").encode("utf-8", "ignore").decode("utf-8")
                    draw.text((10, y_offset), clean_line, fill="black", font=font)
                    y_offset += text_height + 10  

                
                y_offset += 30

               
                if y_offset > height - 50:
                    break

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
            media = twitter_client_v1.media_upload(image)
            media_ids.append(media.media_id)
            print(f"Imagem {image} carregada com sucesso.")
            time.sleep(3)  

        except tweepy.TweepError as e:
            if e.api_code == 429: 
                print("Limite de requisições atingido. Aguardando...")
                reset_time = int(e.response.headers.get('x-rate-limit-reset'))
                current_time = int(time.time())
                wait_time = reset_time - current_time + 5  
                print(f"Aguardando {wait_time} segundos antes de tentar novamente.")
                time.sleep(wait_time)
                return post_images(twitter_client_v2, twitter_client_v1, image_paths)

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
        cohere_client = get_cohere_client(config["cohere_api_key"])
        twitter_client_v2, twitter_client_v1 = get_twitter_client(config)

        if not os.path.exists(out_image_dir):
            print(f"Erro: Diretório de imagens não encontrado - {out_image_dir}")
            return

        image_files = [f for f in os.listdir(out_image_dir) if f.endswith('.png')]

        if not image_files:
            print("Nenhuma imagem encontrada para enviar.")
            return

        for image_file in image_files:
            image_path = os.path.join(out_image_dir, image_file)

            if os.path.exists(image_path):
                media = twitter_client_v1.media_upload(image_path)

                prompt = "Crie uma mensagem criativa para acompanhar essa imagem como um boletim semanal de reporte de obras atrasadas em no máximo 100 caracteres e adicione este link https://unb-mds.github.io/DFemObras/anomalias.html ao texto indicando que lá existem mais informações e marque o perfil do gdf e inclua este perfil https://x.com/Gov_DF com o padrão de marcar no tweet."
                message = generate_message(cohere_client, prompt)

                if message:
                    tweet = twitter_client_v2.create_tweet(text=message, media_ids=[media.media_id])
                    print(f"Tweet enviado com sucesso: {tweet}")
                else:
                    tweet = twitter_client_v2.create_tweet(media_ids=[media.media_id])
                    print(f"Tweet enviado com sucesso (sem mensagem): {tweet}")

                time.sleep(3)
            else:
                print(f"Imagem não encontrada: {image_path}")

    except Exception as e:
        print("Erro durante a execução do bot:", e)


def html_generate(obra):

    directory = "TestesMapa"
    if not os.path.exists(directory):
        os.makedirs(directory) 

    file_path = os.path.join(directory, "anomalias.html")

    html_content = """
        <!DOCTYPE html>
    <html>
        <head>
            <link rel="icon" type="image/png" href="https://img.icons8.com/color/48/crane.png">
            <meta charset="UTF-8">
            <title>Anomalias</title>
            <link rel="stylesheet" href="css/style.css">
         </head>
    <body>
         <header>
            <img src="data:image/png;base64,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" alt="Logo da UnB" class="logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Bandeira_do_Distrito_Federal_%28Brasil%29.svg" alt="imagem gdf" width="92" class="logo">

         <div class="title">
            <h1>MAPEAMENTO DE OBRAS</h1>
            <p class="subtitle">"Facilitando o acesso às informações que constroem o DF."</p>
         </div>

         <input type="checkbox" id="menu-toggle">
            <label for="menu-toggle" class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </label>

         <nav>
            <a href="index.html">Home</a>
            <a href="sobre_o_projeto.html">Sobre o Projeto</a>
            <a href="contato.html">Contato</a>
            <a href="anomalias.html">Anomalias</a>
         </nav>
         </header>
      <main>
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
       </main>

      <footer>
         <p>&copy; 2024 Mapeamento de Obras | DF em Obras</p>
      </footer>
    </body>
    </html>
    """
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(html_content)
    print(f"Arquivo HTML gerado em: {file_path}")

def main():
    json_file_path = r"./TestesMapa/obrasgov/src/obras_com_lat_long.json"
    output_dir = r"./Bots/imagens"

    data = load_json(json_file_path)

    if data:
        obras_atrasadas = [
            obra for obra in data
            if obra['dataFinalPrevista'] and obra['dataFinalPrevista'] < "2024-01-01" and obra['dataFinalEfetiva'] is None
        ]
        save_image(obras_atrasadas, output_dir)
        html_generate(obras_atrasadas)
        run_bot(output_dir)

if __name__ == "__main__":
    main()
