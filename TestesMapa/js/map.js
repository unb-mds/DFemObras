// Inicializar o mapa 
let mapa;

function inicializaMapa() {
    // Definir os limites do DF
    const bounds = L.latLngBounds(
        L.latLng(-16.1000, -48.2000), // Sudoeste do DF
        L.latLng(-15.5000, -47.5000)  // Nordeste do DF
    );

    // Criar o mapa com restrições
    mapa = L.map('map', {
        center: [-15.802825, -47.798767], // Posição inicial
        zoom: 10.4,   // Zoom inicial
        minZoom: 10,  // Zoom mínimo permitido
        maxZoom: 18,  // Zoom máximo permitido
        maxBounds: bounds,  // Limites do mapa para o DF
        maxBoundsViscosity: 1.0 // Mantém o usuário dentro da área
    });

    // Adicionar camada do OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
}


if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        inicializaMapa();
        buscarObras();
        const popup = document.getElementById('popup');
        const fecharPopup = document.getElementById('close-popup');

        // Mostra o popup quando a página é carregada
        popup.style.display = 'flex';

        // Fecha o popup ao clicar no botão "X"
        fecharPopup.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        // Fecha o popup ao clicar fora do conteúdo
        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.style.display = 'none';
            }
        });
    });
}

function formatarBRL(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/, '');
}

// Função para criar os ícones dos pins
function criarIconesDosPins() {
    return {
        concluida: L.icon({
            iconUrl: './js/pins/concluida.png',
            iconSize: [30, 30],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
        emExecucao: L.icon({
            iconUrl: './js/pins/em_execucao.png',
            iconSize: [30, 30],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
        cadastrada: L.icon({
            iconUrl: './js/pins/cadastrada.png',
            iconSize: [30, 30],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
        inativada: L.icon({
            iconUrl: './js/pins/inativada.png',
            iconSize: [30, 30],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
    };
}

// Função para validar a resposta da API
function verificarResposta(resposta) {
    if (!resposta.ok) {
        throw new Error('Erro ao carregar o JSON');
    }
    return resposta;
}

// Função para obter os dados das obras
function obterDadosDasObras() {
    return fetch('./obrasgov/obras_com_lat_long.json')
        .then(verificarResposta)
        .then(resposta => resposta.json());
}

// Função para criar um marcador no mapa
function criarMarcador(lat, lng, icone, mapa) {
    return L.marker([lat, lng], { icon: icone }).addTo(mapa);
}

// Função para gerar conteúdo do popup
function gerarConteudoDoPopup(nome, situacao, valorBRL, indice) {
    return `
        <div style="font-family: Arial, sans-serif; padding: 10px; width: 250px; background-color:rgb(255, 255, 255);">
            <h3 style="font-size: 18px; margin-bottom: 10px; color: #333;">${nome}</h3>

            <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong style="color: #333;">Valor Previsto:</strong> ${valorBRL}</p>
            <a href="detalhamento.html?obra=${indice}" target="_blank" style="display: block; margin-top: 10px; text-align: center; padding: 8px; background-color: #133e79; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
                Ver detalhes
            </a>
        </div>
    `;
}

// Função para determinar o ícone correto
function obterIconeDoMarcador(situacao, icones) {
    const mapaIcones = {
        'Concluída': icones.concluida,
        'Em execução': icones.emExecucao,
        'Cadastrada': icones.cadastrada,
        'Inativada': icones.inativada
    };
    return mapaIcones[situacao] || null;
}

// Função principal para processar os dados
function processarDadosDasObras(dados, mapa) {
    const icones = criarIconesDosPins();
    
    dados.forEach((obra, indice) => {
        const { nome, fontesDeRecurso, latitude, longitude, situacao} = obra;
        
        // Validação de coordenadas
        if (!latitude || !longitude) {
            console.log(`Obra ${indice}: "${nome}" ignorada por falta de coordenadas.`);
            return;
        }

        // Seleção de ícone
        const iconeMarcador = obterIconeDoMarcador(situacao, icones);
        if (!iconeMarcador) {
            console.warn(`Situação desconhecida: ${situacao} na obra ${nome}`);
            return;
        }

        // Criação do marcador
        const marcador = criarMarcador(latitude, longitude, iconeMarcador, mapa);
        
        // Configuração do popup
        const valor = fontesDeRecurso?.[0]?.valorInvestimentoPrevisto || 0;
        const conteudoPopup = gerarConteudoDoPopup(nome, situacao, formatarBRL(valor), indice);
        marcador.bindPopup(conteudoPopup);
    });
}

// Função principal modificada
function buscarObras() {
    obterDadosDasObras()
        .then(dados => processarDadosDasObras(dados, mapa))
        .catch(error => console.error('Erro ao carregar as obras:', error));
}

// Exportações para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatarBRL,
        inicializaMapa,
        criarIconesDosPins,
        verificarResposta,
        obterDadosDasObras,
        criarMarcador,
        buscarObras,
        gerarConteudoDoPopup,
        obterIconeDoMarcador,
        processarDadosDasObras
    };
}

// Exibir coordenadas no console ao clicar no mapa
// mapa.on('click', (e) => {
//     console.log(`Coordenadas: ${e.latlng}`);
// });