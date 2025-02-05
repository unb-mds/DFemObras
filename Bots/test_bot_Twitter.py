import os
import json
from unittest.mock import MagicMock
from bot_Twitter import load_json, post_message, generate_message, save_image, html_generate

def test_load_json_success():
    test_file = "test.json"
    sample_data = [{"nome": "Obra 1", "descricao": "Teste"}]

    with open(test_file, "w", encoding="utf-8") as file:
        json.dump(sample_data, file)

    data = load_json(test_file)
    assert data == sample_data

    os.remove(test_file)

def test_load_json_failure():
    non_existent_file = "non_existent.json"
    data = load_json(non_existent_file)
    assert data is None

def test_generate_message_success():
    mock_cohere = MagicMock()
    mock_cohere.chat.return_value.message.content[0].text = "Mensagem gerada com sucesso!"

    prompt = "Explique algo em 280 caracteres."
    response = generate_message(mock_cohere, prompt)
    assert response == "Mensagem gerada com sucesso!"

def test_generate_message_failure():
    mock_cohere = MagicMock()
    mock_cohere.chat.side_effect = Exception("Erro na API Cohere")

    prompt = "Explique algo em 280 caracteres."
    response = generate_message(mock_cohere, prompt)

    assert response is None

def test_post_message_success():
    mock_twitter_client = MagicMock()
    mock_twitter_client.create_tweet.return_value = {"data": {"id": 12345, "text": "Teste de tweet"}}

    message = "Teste de postagem no Twitter"
    tweet = post_message(mock_twitter_client, message)

    assert tweet["data"]["text"] == "Teste de tweet"
    assert tweet["data"]["id"] == 12345

def test_post_message_failure():
    mock_twitter_client = MagicMock()
    mock_twitter_client.create_tweet.side_effect = Exception("Erro na API do Twitter")

    message = "Teste de postagem no Twitter"
    tweet = post_message(mock_twitter_client, message)

    assert tweet is None

def test_save_image_success(tmpdir):
    obras = [
        {
            "nome": "Obra 1",
            "metaGlobal": "Meta 1",
            "latitude": "-23.5505",
            "longitude": "-46.6333",
            "tomadores": [{"nome": "Tomador 1"}],
            "status": "Em andamento",
            "dataFinalPrevista": "2023-12-31",
            "descricao": "Descrição da obra 1"
        },
        {
            "nome": "Obra 2",
            "metaGlobal": "Meta 2",
            "latitude": "-22.9068",
            "longitude": "-43.1729",
            "tomadores": [{"nome": "Tomador 2"}],
            "status": "Concluída",
            "dataFinalPrevista": "2023-11-30",
            "descricao": "Descrição da obra 2"
        }
    ]

    output_dir = tmpdir.mkdir("image_test")
    save_image(obras, str(output_dir))

    image_files = [f for f in os.listdir(output_dir) if f.endswith('.png')]
    assert len(image_files) > 0 

    for image_file in image_files:
        image_path = os.path.join(output_dir, image_file)
        assert os.path.exists(image_path)

def test_save_image_failure(tmpdir):
    obras = []
    output_dir = tmpdir.mkdir("image_test_empty")
    save_image(obras, str(output_dir))

    image_files = [f for f in os.listdir(output_dir) if f.endswith('.png')]
    assert len(image_files) == 0 

def test_html_generate_success(tmpdir):
    obras = [
        {
            "nome": "Obra 1",
            "metaGlobal": "Meta 1",
            "latitude": "-23.5505",
            "longitude": "-46.6333",
            "tomadores": [{"nome": "Tomador 1"}],
            "status": "Em andamento",
            "dataFinalPrevista": "2023-12-31",
            "descricao": "Descrição da obra 1"
        },
        {
            "nome": "Obra 2",
            "metaGlobal": "Meta 2",
            "latitude": "-22.9068",
            "longitude": "-43.1729",
            "tomadores": [{"nome": "Tomador 2"}],
            "status": "Concluída",
            "dataFinalPrevista": "2023-11-30",
            "descricao": "Descrição da obra 2"
        }
    ]

    output_dir = tmpdir.mkdir("html_test")
    html_generate(obras)

    file_path = os.path.join("TestesMapa", "anomalias.html")
    assert os.path.exists(file_path)

    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
        assert "Obra 1" in content
        assert "Obra 2" in content
        assert "Tomador 1" in content
        assert "Tomador 2" in content

    os.remove(file_path)

def test_html_generate_failure(tmpdir):
    obras = []
    html_generate(obras)

    file_path = os.path.join("TestesMapa", "anomalias.html")
    assert os.path.exists(file_path)

    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
        assert "<p>Nome: Nome não disponível<p>" not in content  

    os.remove(file_path)