// Importando a biblioteca twitter-api-v2
const { TwitterApi } = require('twitter-api-v2');

// Credenciais da API do Twitter (substitua pelos seus dados)
const client = new TwitterApi({
<<<<<<< HEAD
  appKey: '*******',
  appSecret: '******',
  accessToken: '*********',
  accessSecret: '********',
=======
  appKey: '',
  appSecret: '',
  accessToken: '',
  accessSecret: '',
>>>>>>> 5f618a4798a490f0692efb42d9a39d74a54a6f0b
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
