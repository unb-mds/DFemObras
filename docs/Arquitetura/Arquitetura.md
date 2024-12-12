# ⚙️ Arquitetura do Projeto: Mapeamento de Obras Públicas do DF

## 📂 Introdução

O sistema de mapeamento de obras públicas no DF foi desenvolvido para permitir que qualquer cidadão interessado tenha acesso a dados relevantes referentes ao andamento das obras públicas. A aplicação web oferece um **mapa interativo** contendo informações detalhadas sobre as obras, além de contar com um **robô (Bot)** responsável por denunciar anomalias nas obras na rede social **X**. 

O modelo arquitetural adotado no projeto foi o **modelo em camadas**, proporcionando:
- 🌐 **Flexibilidade e modularidade**
- ▶️ **Fácil manutenção**
- ⬆️ **Escalabilidade**

## 🔨 Objetivos com a Escolha da Arquitetura

### 🔠 2.1 Modularidade
- Separar responsabilidades em camadas distintas.

### ⬆️ 2.2 Escalabilidade
- Facilitar a expansão do sistema para novos requisitos.

### 🔧 2.3 Manutenibilidade
- Atualizar e corrigir erros de forma mais ágil.

### ⚙️ 2.4 Desempenho
- Otimizar a performance sem comprometer a qualidade do código.

---

## 📊 Descrição das Camadas

### 🔲 3.1 Camada de Apresentação

Esta camada é responsável pela **interação com o usuário**, apresentando a interface web com:

- **Mapa interativo** com pinos clicáveis que exibem detalhes das obras ao serem selecionados.
- Construída com:
  - **HTML**
  - **CSS**
  - **JavaScript**

### 🔀 3.2 Camada de Aplicação (Lógica de Negócios)

Essa camada gerencia:

- **Regras de negócios**
- **Interação com APIs externas**
- **Processamento de dados**

Se divide em dois componentes:

1. **Backend**:
   - Responsável por gerar o mapa e requisitar informações das obras por meio de APIs externas.
2. **Robô (Bot)**:
   - Detecta anomalias e as reporta na rede social **X**.

#### ✨ APIs Requisitadas pelo Backend

- **Obras Gov**: API que fornece dados necessários sobre as obras públicas.
- **Leaflet**: API utilizada para gerar o mapa interativo.

#### ✨ APIs Requisitadas pelo Robô (Bot)

- **X API**: Responsável por enviar as anomalias em formato de tweet.
- **Cohere**: IA generativa que cria mensagens humanizadas para o reporte das anomalias.

### 📁 3.3 Camada de Dados

A camada de dados utiliza **arquivos JSON** para armazenar informações. Características:

- Representação de dados como:
  - Objetos JSON
  - Listas de objetos JSON
- Manipulação facilitada com bibliotecas e frameworks JSON.
- Armazenamento em:
  - Sistema de arquivos local
  - Serviços de armazenamento em nuvem (☁️).

---
