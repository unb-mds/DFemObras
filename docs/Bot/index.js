// Importando a biblioteca twitter-api-v2
const { TwitterApi } = require('twitter-api-v2');

// Credenciais da API do Twitter (substitua pelos seus dados)
const client = new TwitterApi({
  appKey: '3b8ls3ARWTWb47BALxkpcxZgn',
  appSecret: 'r7c3k5jv3xgzVi89pqIi4tHkMIdWr5u915iC5qBfwwhb5jgWEt',
  accessToken: '1857930392487211008-e3eL55ngLkeZNBdsPTzonKI5W5ni7I',
  accessSecret: 'EJ4dXYJqv379ntTPNUFTYoFIESTgMWsIO0gUpW1GrDAyI',
});

// Função para enviar um tweet
async function sendTweet() {
  try {
    // Envia um tweet
    const tweet = await client.v2.tweet('Olá, mundo! Este é um tweet automatizado!');
    console.log('Tweet enviado com sucesso:', tweet.data.text);
  } catch (error) {
    console.error('Erro ao enviar o tweet:', error);
  }
}

// Chama a função para enviar o tweet
sendTweet();
