
# 🏗️ DF em Obras (Versão 2.0)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cayoalencar_2024-2-Squad07&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Cayoalencar_2024-2-Squad07)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Cayoalencar_2024-2-Squad07&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Cayoalencar_2024-2-Squad07)

O **DF em Obras** é uma plataforma de fiscalização cidadã que monitora investimentos e prazos de obras públicas no Distrito Federal, utilizando dados da API ObrasGov.

> [!IMPORTANT]  
> **Evolução 2.0:** Originalmente desenvolvido como um projeto acadêmico da disciplina de MDS (UnB), a versão 2.0 foi totalmente reestruturada por **Caio Melo Borges**. A nova arquitetura utiliza o conceito de *Modern Data Stack*, focando em automação, integridade de dados via dbt e inteligência artificial generativa.

---

## 📋 Sumário
- [📍 Links do Projeto](#-links-do-projeto)
- [🛠️ Arquitetura v2.0](#️-arquitetura-v20)
- [📂 Estrutura do Repositório](#-estrutura-do-repositório)
- [🚀 Como Contribuir](#-como-contribuir)
- [👥 Créditos e Histórico](#-créditos-e-histórico)
- [📄 Documentação Original](#-documentação-original)

---

## 📍 Links do Projeto
* **Mapa Interativo:** [unb-mds.github.io/DFemObras/](https://unb-mds.github.io/DFemObras/)
* **Perfil de Fiscalização (X/Twitter):** [@DFemObras](https://x.com/DFemObras)

---

## 🛠️ Arquitetura v2.0
A versão atual abandonou processos manuais por um pipeline de dados automatizado e resiliente:

* **Ingestão:** Scripts Python com lógica de `MERGE` (Upsert) para evitar duplicidade.
* **Data Warehouse:** [MotherDuck](https://motherduck.com/) (DuckDB gerenciado na nuvem).
* **Transformação (ELT):** **dbt (data build tool)** para modelagem e testes de qualidade.
* **IA Generativa:** **Google Gemini API** para análise inteligente de atrasos e redação de relatórios.
* **Orquestração:** **GitHub Actions** gerenciando 4 estágios (CI, Ingestão, Build e Bot).
* **Qualidade de Código:** **Ruff** (Linting) e **Pytest** (Testes Unitários).

---

## 📂 Estrutura do Repositório
* `.github/workflows/`: Automação completa do pipeline e integração contínua.
* `data_eng/`: Core da engenharia de dados (ingestão e integração).
* `Bots/`: Scripts do bot social e integração com o modelo Gemini.
* `tests/`: Suite de testes para garantir a consistência das métricas reportadas.
* `js/`: Estrutura e automações do mapa.

---

## 🚀 Como Contribuir

Para rodar o projeto localmente ou contribuir com o desenvolvimento:

### 1. Preparando o Ambiente
```bash
# Clone o repositório
git clone [https://github.com/unb-mds/DFemObras.git](https://github.com/unb-mds/DFemObras.git)
cd DFemObras

# Crie e ative sua venv
python3 -m venv venv_bot
source venv_bot/bin/activate

# Instale as dependências
pip install -r requirements.txt
pip install -r requirements-dev.txt

```

### 2. Linting e Testes (CI Local)

Garantir que os testes passem é obrigatório para qualquer Pull Request:

```bash
# Verificar estilo de código
ruff check .

# Executar testes unitários
python3 -m pytest

```

---

## 👥 Créditos e Histórico

### Grupo Original (MDS - 2024.2)

Este projeto nasceu do esforço do **Grupo 07** da UnB:

| Nome | GitHub |
| --- | --- |
| Cayo Felipe Alencar Câmara | [@Cayoalencar](https://github.com/Cayoalencar) |
| João Pedro Rodrigues Gomes da Silva | [@JpRodrigues2](https://github.com/JpRodrigues2) |
| Julia dos Reis Teixeira Massuda | [@JuliaReis18](https://github.com/JuliaReis18) |
| **Caio Melo Borges (Responsável v2.0)** | [@CaioMelo25](https://github.com/CaioMelo25) |
| Marcos Vinícius Lima Bezerra | [@marcoslbz](https://github.com/marcoslbz) |
| Nathan Batista Santos | [@Nathan-bs](https://github.com/Nathan-bs) |

---

## 📄 Documentação Original

As definições de requisitos e a documentação técnica inicial da disciplina podem ser acessadas [neste link](https://unb-mds.github.io/DFemObras/documenta%C3%A7%C3%A3o/index.html).

## 🤖 Perfil X

Link do nosso perfil no X: [neste link](https://x.com/DFemObras).



## 🛠️ Arquitetura

A arquitetura do projeto pode ser encontrada [neste link](https://unb-mds.github.io/DFemObras/documenta%C3%A7%C3%A3o/index.html).



## 📄 Requisitos

Os requisitos do projeto estão disponíveis [neste link](https://unb-mds.github.io/DFemObras/documenta%C3%A7%C3%A3o/index.html)



## 📂 Documentação

A documentação do projeto pode ser encontrada [neste link](https://unb-mds.github.io/DFemObras/documenta%C3%A7%C3%A3o/index.html).



## 💡 Suporte

Se encontrar problemas durante a configuração, abra uma issue no repositório ou entre em contato.
