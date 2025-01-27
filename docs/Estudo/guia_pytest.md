
# Guia de Introdução ao Pytest

O **pytest** é um framework poderoso e popular para testes em Python. Ele é fácil de usar, altamente configurável e suporta testes unitários, de integração e funcionais.

## Instalação

Para instalar o pytest, utilize o gerenciador de pacotes `pip`:

```
pip install pytest
```

Para verificar se foi instalado corretamente:

```
pytest --version
```

## Estrutura Básica de Testes

### Convenção de Nomes

1. Os arquivos de teste devem começar com `test_` ou terminar com `_test.py` (por exemplo, `test_example.py`).
2. As funções de teste devem começar com `test_`.

Exemplo:
```python
# test_example.py
def test_soma():
    assert 1 + 1 == 2
```

### Executando Testes

Para rodar os testes, basta usar o comando:

```
pytest
```

Opcionalmente, você pode especificar o arquivo de teste:

```
pytest test_example.py
```

## Funcionalidades Principais

### 1. Asserts Simples

O pytest utiliza o `assert` nativo do Python para verificar condições.

```python
def test_soma():
    assert 1 + 1 == 2

def test_subtracao():
    assert 5 - 3 == 2
```

### 2. Testes Parametrizados

Permite executar o mesmo teste com diferentes entradas.

```python
import pytest

@pytest.mark.parametrize("x, y, esperado", [
    (1, 1, 2),
    (2, 3, 5),
    (10, 5, 15),
])
def test_soma_parametrizada(x, y, esperado):
    assert x + y == esperado
```

### 3. Fixures

As fixtures são usadas para configurar o ambiente de teste, como inicializar banco de dados ou carregar dados.

```python
import pytest

@pytest.fixture
def dados_exemplo():
    return {"nome": "Alice", "idade": 30}

def test_dados(dados_exemplo):
    assert dados_exemplo["nome"] == "Alice"
    assert dados_exemplo["idade"] == 30
```

### 4. Marcação de Testes

Você pode marcar testes para agrupá-los ou aplicá-los condicionalmente.

```python
import pytest

@pytest.mark.lento
def test_processamento_lento():
    assert sum(range(1000000)) > 0
```

Execute apenas testes marcados como `lento`:

```
pytest -m lento
```

### 5. Captura de Exceções

O pytest permite verificar se uma exceção foi lançada corretamente.

```python
import pytest

def dividir(a, b):
    if b == 0:
        raise ValueError("Divisão por zero não é permitida!")
    return a / b

def test_dividir():
    with pytest.raises(ValueError, match="Divisão por zero não é permitida!"):
        dividir(10, 0)
```

---

## Trabalhando com Mock

O **mock** é usado para simular comportamentos de funções, classes ou objetos em testes. Ele é particularmente útil para isolar partes do código que interagem com dependências externas, como APIs ou bancos de dados.

Para usar o mock com pytest, utilize o módulo `unittest.mock`.

### Exemplo Básico de Mock

```python
from unittest.mock import Mock

def buscar_usuario(api_client, user_id):
    return api_client.get(f"/users/{user_id}")

def test_buscar_usuario():
    # Criando um mock para o cliente de API
    mock_api_client = Mock()
    mock_api_client.get.return_value = {"id": 1, "nome": "Alice"}

    # Chamando a função com o mock
    resultado = buscar_usuario(mock_api_client, 1)

    # Verificando se o mock foi chamado corretamente
    mock_api_client.get.assert_called_once_with("/users/1")

    # Validando o retorno
    assert resultado == {"id": 1, "nome": "Alice"}
```

### Patchando Funções ou Objetos

O `patch` permite substituir funções ou classes em módulos durante os testes.

```python
from unittest.mock import patch

def enviar_email(servico_email, destinatario, mensagem):
    servico_email.enviar(destinatario, mensagem)

@patch("modulo.servico_email")  # Substituindo o objeto `servico_email` no módulo
def test_enviar_email(mock_servico_email):
    enviar_email(mock_servico_email, "teste@exemplo.com", "Olá, mundo!")

    # Verifica se o método `enviar` foi chamado com os argumentos corretos
    mock_servico_email.enviar.assert_called_once_with(
        "teste@exemplo.com", "Olá, mundo!"
    )
```

### Combinação com Fixtures

O mock pode ser integrado a fixtures para testes mais complexos.

```python
import pytest
from unittest.mock import Mock

@pytest.fixture
def mock_api_client():
    client = Mock()
    client.get.return_value = {"status": "ok"}
    return client

def test_api_integration(mock_api_client):
    resultado = mock_api_client.get("/status")
    mock_api_client.get.assert_called_once_with("/status")
    assert resultado == {"status": "ok"}
```

---

## Relatórios e Saídas

### Saída de Testes Verbosa

Para ver mais detalhes sobre os testes executados, utilize:

```
pytest -v
```

### Gerar Relatórios HTML

Com o plugin `pytest-html`, você pode criar relatórios HTML detalhados.

Instalação:

```
pip install pytest-html
```

Uso:

```
pytest --html=report.html
```

---

## Boas Práticas

- Escreva testes pequenos e objetivos.
- Use nomes descritivos para funções e arquivos.
- Utilize fixtures para evitar duplicação de código.
- Integre o pytest no seu pipeline de CI/CD.

## Recursos Úteis

- [Documentação Oficial do Pytest](https://docs.pytest.org/)
- [Plugins para pytest](https://plugincompat.herokuapp.com/)
