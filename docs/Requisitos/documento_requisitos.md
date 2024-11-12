# Documento de Requisitos

## 1. Introdução
### Objetivo
Este documento define os requisitos para o projeto de Mapeamento de Obras do grupo 07 da disciplina de Métodos de Desenvolvimento de Software 2024.2, focado em exibir dados de obras do DF através de um mapa interativo.

### Escopo
Desenvolver uma aplicação web que mostre obras do DF com um mapa interativo, utilizando dados fornecidos pela API ObrasGov.

### Tecnologias
- **Front-end**: HTML, CSS, JavaScript
- **APIs**: ObrasGov e Google Maps

## 2. Descrição Geral
### Visão Geral do Sistema
O sistema exibirá um mapa interativo com um pin para cada obra. O usuário poderá clicar nos pins para ver detalhes e aplicar filtros de data, andamento e outros critérios.

### Objetivos do Usuário
- Visualizar obras em andamento.
- Acessar detalhes das obras.
- Localizar as obras por região e status.

## 3. Requisitos Funcionais
### Épico: Mapa Interativo de Obras
- **Feature**: Cada pin no mapa mostra informações detalhadas, como valor gasto, data inicial e documentos relacionados à obra.

### Épico: Lista Detalhada de Obras Públicas
- **Feature**: Extrair informações sobre as empresas responsáveis por cada obra.
- **Feature**: Apresentar um resumo das obras por região administrativa, incluindo o número de obras e o valor gasto.
- **Feature**: Recurso de Feedback e Denúncia

### Épico: Filtros de Pesquisa
- **Feature**: Permitir filtros de pesquisa por cidade, data, e estado (em execução, concluída, inacabada).

### Épico: Web Scraping
- **Feature**: Realizar web scraping para obter informações que não estejam disponíveis na API ObrasGov.

## 4. Requisitos Não-Funcionais
### Usabilidade
- A interface deve ser visualmente agradável e fácil de usar, com elementos organizados de maneira lógica.
- Proporcionar uma experiência de usuário intuitiva, facilitando a navegação e o uso das funcionalidades.

---

