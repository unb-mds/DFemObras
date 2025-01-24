import os
import json
from unittest.mock import MagicMock
from bot_Twitter import load_json, post_message, generate_message

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
