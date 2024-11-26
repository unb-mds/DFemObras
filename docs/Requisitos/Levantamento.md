# Documento de Requisitos

## 1.0 Introdução

### 1.1 Objetivo
Este documento especifica os requisitos para o desenvolvimento do projeto **Mapeamento de Obras** do grupo 07, parte da disciplina de **Métodos de Desenvolvimento de Software 2024.2**.  
O objetivo do projeto é exibir dados de obras públicas do Distrito Federal por meio de um mapa interativo.

### 1.2 Escopo
O sistema será uma aplicação web que:  
- Apresenta obras públicas do DF utilizando um mapa interativo.  
- Integra dados fornecidos pela **API ObrasGov** e **Google Maps**.  
- Oferece recursos de visualização, detalhamento e filtros para facilitar o acesso às informações.

### 1.3 Tecnologias Utilizadas
- **Front-end:** HTML, CSS, JavaScript  
- **APIs:** ObrasGov e Google Maps  

---

## 2. Descrição Geral

### 2.1 Visão Geral do Sistema
O sistema permitirá que os usuários visualizem um mapa interativo com pinos representando obras públicas.  
Ao clicar em um pino, os detalhes da obra serão exibidos.  
O sistema incluirá funcionalidades de filtros para personalizar as informações exibidas.  

### 2.2 Objetivos do Usuário
- Visualizar obras públicas em andamento, concluídas ou inacabadas.  
- Acessar informações detalhadas das obras, como valores, datas e status.  
- Filtrar obras por região, status ou período de execução.  

---

## 3. Requisitos Funcionais

Os requisitos foram organizados em épicos e suas respectivas features:

### 3.1 Épico: Mapa Interativo de Obras
- **Feature:** Exibir um pino no mapa para cada obra com informações detalhadas, incluindo:  
  - Valor investido.  
  - Data de início e previsão de término.  
  - Documentos relacionados.  

### 3.2 Épico: Lista Detalhada de Obras Públicas
- **Feature:** Apresentar uma lista detalhada com informações sobre as empresas responsáveis por cada obra.  
- **Feature:** Fornecer um resumo por região administrativa, destacando:  
  - Número total de obras.  
  - Valor total investido.  
- **Feature:** Permitir que usuários enviem feedbacks e denúncias sobre as obras.  

### 3.3 Épico: Filtros de Pesquisa
- **Feature:** Oferecer filtros para busca por:  
  - Cidade.  
  - Período de execução.  
  - Status da obra (em execução, concluída, inacabada).  

### 3.4 Épico: Web Scraping
- **Feature:** Realizar web scraping para complementar informações não disponíveis na API ObrasGov.  

---

## 4. Requisitos Não-Funcionais

### 4.1 Usabilidade
- A interface deve ser **intuitiva e amigável**, com elementos visuais organizados logicamente.  
- O design deve ser **responsivo**, garantindo uma boa experiência em diferentes dispositivos (desktop, tablet, mobile).  
- O sistema deve facilitar a navegação e o uso das funcionalidades.  