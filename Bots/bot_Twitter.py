import os
import cohere
import tweepy
from dotenv import load_dotenv
import json
from PIL import Image, ImageDraw, ImageFont
import os

class Config:
    """Gerencia as configurações e autenticação do sistema."""
    def __init__(self):
        load_dotenv()
        self.cohere_api_key = os.getenv("API_COHERE_KEY")
        self.twitter_consumer_key = os.getenv("API_CONSUMER_KEY_X")
        self.twitter_consumer_secret = os.getenv("API_CONSUMER_SECRET_X")
        self.twitter_access_token = os.getenv("API_ACCESS_TOKEN_X")
        self.twitter_access_token_secret = os.getenv("API_ACCESS_TOKEN_SECRET_X")

    def get_cohere_client(self):
        return cohere.ClientV2(self.cohere_api_key)

    def get_twitter_client(self):
        return tweepy.Client(
            consumer_key=self.twitter_consumer_key,
            consumer_secret=self.twitter_consumer_secret,
            access_token=self.twitter_access_token,
            access_token_secret=self.twitter_access_token_secret
        )#


class MessageGenerator:
    """Responsável por gerar mensagens usando o Cohere."""
    def __init__(self, cohere_client):
        self.cohere_client = cohere_client

    def generate_message(self, prompt):
        try:
            response = self.cohere_client.chat(
                model="command-r-plus",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.message.content[0].text
        except Exception as e:
            print("Erro ao gerar mensagem:", e)
            return None


class TwitterManager:
    """Gerencia a publicação de tweets."""
    def __init__(self, twitter_client):
        self.twitter_client = twitter_client

    def post_tweet(self, message):
        try:
            tweet = self.twitter_client.create_tweet(text=message)
            print("Tweet enviado com sucesso:", tweet)
            return tweet
        except Exception as e:
            print("Erro ao enviar o tweet:", e)
            return None


class BotManager:
    """Gerencia o fluxo principal do bot."""
    def __init__(self):
        self.config = Config()
        self.cohere_client = self.config.get_cohere_client()
        self.twitter_client = self.config.get_twitter_client()

        self.message_generator = MessageGenerator(self.cohere_client)
        self.twitter_manager = TwitterManager(self.twitter_client)

    def run(self):
        try:
            prompt = (
                "Explique em 4 linhas, até 50 caracteres por linha e em tópicos como estão sendo organizadas as obras do DF"
            )
            message = self.message_generator.generate_message(prompt)
            if message:
                print("Mensagem gerada:", message)
                response = self.twitter_manager.post_tweet(message)
                print("Resposta da API do Twitter:", response)
            else:
                print("Nenhuma mensagem foi gerada.")
        except Exception as e:
            print("Ocorreu um erro durante a execução:", e)
            
class JsonManager:
    def __init__(self):
        self.path

import json
from PIL import Image, ImageDraw, ImageFont
import os

class JSONReader:
    """Classe para ler e processar arquivos JSON."""

    # Caminho onde a imagem será salva
    file_path = "C:/projetos/2024-2-Squad07/TesteObrasgov/obras_com_lat_long.json"
    output_image = "C:/projetos/2024-2-Squad07/Bots/imagens/obras_atrasadas.png"  # Caminho completo da imagem

    @staticmethod
    def load_json(file_path):
        """Carrega o arquivo JSON."""
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

    @staticmethod
    def save_image(data, file_path):
        """Gera uma imagem com as obras atrasadas."""
        try:
            # Verificar se o diretório existe, senão, criar
            if not os.path.exists(os.path.dirname(file_path)):
                os.makedirs(os.path.dirname(file_path))

            # Criar uma imagem branca de fundo
            width, height = 800, 600
            image = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(image)

              # Usar uma fonte externa, por exemplo, 'Arial.ttf'
            font_path = "C:/Windows/Fonts/arial.ttf"  # Caminho da fonte
            font = ImageFont.truetype(font_path, size=10)  # Ajuste o tamanho conforme necessário

            y_offset = 10  # Iniciar a escrita no topo

            for obra in data:
             nome_obra = obra.get('nome', 'Nome não disponível')
             meta_global = obra.get('metaGlobal', 'Meta global não disponível')
             latitude = obra.get('latitude', 'Latitude não disponível')
             longitude = obra.get('longitude', 'Longitude não disponível')
            
            # Acessando o nome dos tomadores
             tomadores = obra.get('tomadores', [])
             tomadores_nomes = ', '.join([tomador.get('nome', 'Nome não disponível') for tomador in tomadores])

            # Desenhando os dados na imagem
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
             y_offset += 40  # Deixar um espaço maior entre as obras

            # Se a imagem ultrapassar o limite, parar de escrever
             if y_offset > height - 100:
              break

            image.save(file_path)
            print(f"Imagem das obras atrasadas salva em {file_path}")
            image.show()  # Abre a imagem gerada para visualização
        except Exception as e:
            print(f"Erro ao gerar a imagem: {e}")

# Filtragem de obras atrasadas
data = JSONReader.load_json(JSONReader.file_path)
obras_atrasadas = [obra for obra in data if obra['dataFinalPrevista'] and obra['dataFinalPrevista'] < "2024-01-01" and obra['dataFinalEfetiva'] is None]

# Gerar a imagem e exibir antes de enviar para o Twitter
JSONReader.save_image(obras_atrasadas, JSONReader.output_image)


if __name__ == "__main__":
    bot = BotManager()
    bot.run()
