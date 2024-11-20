### Como usar a API do ChatGPT-4 com Node.js para criar um Bot no Twitter

Neste tutorial, vamos aprender como usar a API do ChatGPT-4, da OpenAI, juntamente com o Node.js para criar um bot que interage no Twitter. O bot responderá automaticamente a menções ou postagens no Twitter utilizando a API do ChatGPT.

### Pré-requisitos:
1. **Conta na OpenAI**: Acesso à API do ChatGPT-4.
2. **Conta no Twitter**: Para criar um bot que interage com o Twitter.
3. **Node.js e npm**: Instalados em seu computador.

### Passos para configurar o bot:

#### 1. Criação de uma aplicação no Twitter
Primeiro, você precisará criar uma aplicação no Twitter e obter as chaves de API.

- Vá até [Twitter Developer Portal](https://developer.twitter.com/en/apps) e crie um novo projeto.
- Após a criação, você obterá os seguintes tokens que serão usados para autenticar a aplicação:
  - **API Key**
  - **API Key Secret**
  - **Access Token**
  - **Access Token Secret**

Esses dados são necessários para interagir com a API do Twitter.

#### 2. Configuração da OpenAI (API do ChatGPT)
- Vá até [OpenAI API](https://platform.openai.com/signup) e crie uma conta, caso ainda não tenha.
- Após a criação da conta, obtenha sua chave de API para utilizar o modelo ChatGPT-4.

#### 3. Instalar dependências do Node.js
Crie uma pasta para o projeto e inicialize um novo projeto Node.js.

```bash
mkdir twitter-chatgpt-bot
cd twitter-chatgpt-bot
npm init -y
```

Agora, instale as dependências necessárias:

```bash
npm install axios twitter-api-v2 dotenv
```

- **axios**: Para fazer requisições HTTP à API do ChatGPT.
- **twitter-api-v2**: Biblioteca para interagir com a API do Twitter.
- **dotenv**: Para carregar variáveis de ambiente de um arquivo `.env`.

#### 4. Criar o arquivo `.env`
No diretório do seu projeto, crie um arquivo `.env` para armazenar suas credenciais de API de forma segura.

```env
TWITTER_API_KEY=seu_api_key
TWITTER_API_SECRET=seu_api_secret
TWITTER_ACCESS_TOKEN=seu_access_token
TWITTER_ACCESS_TOKEN_SECRET=seu_access_token_secret
OPENAI_API_KEY=sua_api_key_openai
```

#### 5. Criar o código do bot
Agora, crie o arquivo `bot.js` e adicione o seguinte código:

```javascript
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');

// Carregar as credenciais do Twitter e OpenAI
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const openaiApiKey = process.env.OPENAI_API_KEY;

// Função para chamar a API do ChatGPT-4
const getChatGptResponse = async (inputText) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente útil no Twitter.'
        },
        {
          role: 'user',
          content: inputText
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao comunicar com o ChatGPT:', error);
  }
};

// Função para monitorar e responder às menções no Twitter
const monitorMentions = async () => {
  try {
    // Pega as últimas menções ao seu perfil no Twitter
    const mentions = await twitterClient.v2.mentionsTimeline();

    for (let tweet of mentions.data) {
      const user = tweet.author_id;
      const tweetText = tweet.text;

      console.log(`Menção de @${tweet.username}: ${tweetText}`);

      // Ignorar se o tweet já foi respondido
      if (tweetText.includes('@')) continue;

      const responseText = await getChatGptResponse(tweetText);

      // Responder ao tweet
      await twitterClient.v2.reply(responseText, tweet.id);
      console.log(`Respondendo com: ${responseText}`);
    }
  } catch (error) {
    console.error('Erro ao monitorar menções:', error);
  }
};

// Monitorar as menções a cada 30 segundos
setInterval(monitorMentions, 30000);
```

### Explicação do código:
1. **Autenticação com a API do Twitter**: O `twitterApi` é autenticado usando as credenciais armazenadas no arquivo `.env`.
2. **Chamada à API do ChatGPT-4**: A função `getChatGptResponse` envia uma requisição para a OpenAI, passando a mensagem do usuário. A resposta do ChatGPT é retornada e utilizada para gerar uma resposta no Twitter.
3. **Monitoramento de menções**: A função `monitorMentions` verifica as menções ao perfil do bot no Twitter e, para cada nova menção, chama o ChatGPT para gerar uma resposta.
4. **Resposta automática**: O bot responde automaticamente aos tweets mencionando seu perfil.

### 6. Teste o bot
Para testar, basta rodar o script:

```bash
node bot.js
```
links úteis : https://youtu.be/tx5Ged6NrBs?si=nJa-O6YTp3jhsvx5

https://www.youtube.com/watch?v=RF5_MPSNAtU&list=PLRqwX-V7Uu6atTSxoRiVnSuOn6JHnq2yV

O bot começará a monitorar as menções no Twitter e responderá com base nas mensagens recebidas.

