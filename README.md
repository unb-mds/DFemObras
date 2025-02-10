# DFemObras
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cayoalencar_2024-2-Squad07&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Cayoalencar_2024-2-Squad07)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Cayoalencar_2024-2-Squad07&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Cayoalencar_2024-2-Squad07)

Este repositório será utilizado pelo Grupo 7 para o desenvolvimento de um projeto da disciplina de *Métodos de Desenvolvimento de Software*. O projeto se trata da construção de um software de Mapeamento de Obras e Serviços Públicos.

## 📋 Sumário
- [👥 Grupo 07](#-grupo-07)
- [📌 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🚀 Como Contribuir](#-como-contribuir)
- [🛠️ Arquitetura](#-arquitetura)
- [📄 Requisitos](#-requisitos)
- [📂 Documentação](#-documentação)
- [💡 Suporte](#-suporte)

## 👥 Grupo 07

| Nome        | GitHub             |
|---------------------|--------------------|
| Cayo Felipe Alencar Câmara   | [Cayoalencar](https://github.com/Cayoalencar) |
| João Pedro Rodrigues Gomes da Silva   | [JpRodrigues2](https://github.com/JpRodrigues2)  |
| Julia dos Reis Teixeira Massuda  | [JuliaReis18](https://github.com/JuliaReis18) |
| Caio Melo Borges  | [CaioMelo25](https://github.com/CaioMelo25) |
| Marcos Vinícius Lima Bezerra  | [marcoslbz](https://github.com/marcoslbz) |
| Nathan Batista Santos  | [Nathan-bs](https://github.com/Nathan-bs) |

## 📌 Tecnologias Utilizadas
- Node.js
- Axios
- Leaflet.js
- Python
- Tweepy
- Cohere API

## 🚀 Como Contribuir

Se você deseja contribuir com este projeto, siga os passos abaixo para configurar o ambiente e começar a colaborar:

### Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:
- [Node.js](https://nodejs.org/) e npm (Node Package Manager)
- [Python 3.8+](https://www.python.org/)
- [pip](https://pip.pypa.io/en/stable/) para gerenciar pacotes Python
- [Git](https://git-scm.com/) para versionamento de código
- [dotenv](https://pypi.org/project/python-dotenv/) para gerenciar variáveis de ambiente

### Passo a Passo

1. **Clone o Repositório**
   ```bash
   git clone https://github.com/unb-mds/2024-2-Squad07
   cd 2024-2-Squad07
   ```

2. **Configuração do Backend em Node.js**
   - Navegue até o diretório do projeto em Node.js.
   ```bash
   cd ObrasGov
   ```
   - Instale as dependências.
   ```bash
   npm install
   ```
 
3. **Configuração do Mapa**
   - Navegue até o diretório do mapa.
   ```bash
   cd Mapa
   ```
   - Instale as dependências.
   ```bash
   npm install
   ```

4. **Configuração do BOT**
   - Navegue até o diretório BOT.
   ```bash
   cd Bots
   ```

   - Instale as dependências do Python.
   ```bash
   pip install tweepy
   pip install cohere
   pip install python-dotenv
   ```
   - Crie um arquivo `.env` no diretório principal do projeto e adicione as variáveis de ambiente necessárias, como chaves de API para o Cohere e Tweepy.

5. **Executando o Projeto**
   - Para rodar o backend em Node.js:
     ```bash
     npm start
     ```
   - Para rodar o frontend:
     ```bash
     npm start
     ```
   - Para executar os scripts Python:
     ```bash
     python bot_Twitter.py
     ```

6. **Testes e Pull Requests**
   - Teste suas alterações localmente para garantir que tudo funciona como esperado.
   - Crie uma nova branch para suas alterações.
     ```bash
     git checkout -b minha-nova-feature
     ```
   - Faça commit das alterações e envie para o repositório.
     ```bash
     git add .
     git commit -m "Descrição das alterações"
     git push origin minha-nova-feature
     ```
   - Abra um Pull Request descrevendo suas contribuições.

## 🛠️ Arquitetura
A arquitetura do projeto pode ser encontrada [neste link](https://unb-mds.github.io/2024-2-Squad07/arquitetura).

## 📄 Requisitos
Os requisitos do projeto estão disponíveis [neste link](https://unb-mds.github.io/2024-2-Squad07/requisitos).

## 📂 Documentação
A documentação do projeto pode ser encontrada [neste link](https://unb-mds.github.io/2024-2-Squad07/).

## 💡 Suporte
Se encontrar problemas durante a configuração, abra uma issue no repositório ou entre em contato.

