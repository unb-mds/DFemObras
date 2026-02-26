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

// Converte data de AAAA-MM-DD para DD/MM/AAAA
function formatarDataBR(dataIso) {
    if (!dataIso || dataIso === '---') return '---';
    const partes = dataIso.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataIso; 
}

// Função para criar os ícones dos pins
function criarIconesDosPins() {
    const configuracaoComum = {
        iconSize: [30, 30],   
        iconAnchor: [15, 30],    
        popupAnchor: [0, -30],  
    };

    return {
        concluida: L.icon({
            iconUrl: './js/pins/concluida.png',
            ...configuracaoComum
        }),
        emExecucao: L.icon({
            iconUrl: './js/pins/em_execucao.png',
            ...configuracaoComum
        }),
        cadastrada: L.icon({
            iconUrl: './js/pins/cadastrada.png',
            ...configuracaoComum
        }),
        inativada: L.icon({
            iconUrl: './js/pins/inativada.png',
            ...configuracaoComum
        }),
        paralisada: L.icon({
            iconUrl: './js/pins/paralisada.png',
            ...configuracaoComum
        }),
        cancelada: L.icon({
            iconUrl: './js/pins/cancelada.png',
            ...configuracaoComum
        })
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
    return fetch("https://dfemobras-caiomelo25-caiomelo25s-projects.vercel.app/obras")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log("Dados recebidos:", result);
        
        processarDadosDasObras(result, mapa); 
    })
    .catch(error => {
        console.error("Erro crítico no fetch:", error);
    });
}

// Função para criar um marcador no mapa
function criarMarcador(lat, lng, icone, mapa) {
    return L.marker([lat, lng], { icon: icone }).addTo(mapa);
}

// Função para gerar conteúdo do popup
function gerarConteudoDoPopup(nome, situacao, valorBRL, id) {
    return `
        <div class="popup-custom">
            <h3 style="margin-bottom:10px;">${nome}</h3>
            <p><strong>Valor:</strong> ${valorBRL}</p>
            <button onclick="abrirModalDetalhes('${id}')" style="width:100%; background:#133e79; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; margin-top:10px;">
                Ver mais detalhes
            </button>
        </div>
    `;
}

// Função para determinar o ícone correto
function obterIconeDoMarcador(situacao, icones) {
    const mapaIcones = {
        'Em execução': icones.emExecucao,
        'Concluída': icones.concluida,
        'Cadastrada': icones.cadastrada,
        'Inativada': icones.inativada,
        'Paralisada': icones.paralisada, 
        'Cancelada': icones.cancelada    
    };

    return mapaIcones[situacao] || icones.cadastrada;
}

// Função principal para processar os dados
function processarDadosDasObras(dados, mapa) {
    const listaDeObras = (dados && dados.data) ? dados.data : dados;

    if (!Array.isArray(listaDeObras)) {
        console.error("Erro: A função esperava uma lista, mas recebeu:", dados);
        return;
    }

    const icones = criarIconesDosPins();
    
    window.dadosObrasCache = listaDeObras;

    listaDeObras.forEach((obra) => {
        const { obra_nome, latitude, longitude, obra_situacao } = obra;
        
        if (!latitude || !longitude) return;

        const idUnico = obra.id || obra.id_obra || obra.obra_nome;

        const iconeMarcador = obterIconeDoMarcador(obra_situacao, icones);
        if (!iconeMarcador) return;

        const marcador = criarMarcador(latitude, longitude, iconeMarcador, mapa);
        
        const valorExibicao = obra.valor_estimado 
            ? formatarBRL(obra.valor_estimado) 
            : "Não informado";

        const conteudoPopup = gerarConteudoDoPopup(obra_nome, obra_situacao, valorExibicao, idUnico);
        
        marcador.bindPopup(conteudoPopup);
    });
}

// Função principal modificada
function buscarObras() {
    obterDadosDasObras()
        .then(result => processarDadosDasObras(result.data, mapa))
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

function abrirModalDetalhes(id) {
    const obra = window.dadosObrasCache.find(o => (o.id || o.obra_nome) === id);
    
    if (!obra) return;

    const body = document.getElementById('detalhes-body');
    
    body.innerHTML = `
        <h2 style="color:#133e79; margin-bottom:20px; border-bottom:2px solid #133e79; padding-bottom:10px;">${obra.obra_nome}</h2>
        <p><strong>Valor Previsto:</strong> R$ ${obra.valor_estimado?.toLocaleString('pt-BR') || '---'}</p>
        <p><strong>Situação:</strong> ${obra.obra_situacao}</p>
        <p><strong>Localização:</strong> ${obra.endereco || 'Não informada'}</p>
        <p><strong>Descrição:</strong> ${obra.descricao || 'Não informada'}</p>
        <p><strong>Início Previsto:</strong> ${formatarDataBR(obra.data_inicio_prevista)}</p>
        <p><strong>Fim Previsto:</strong> ${formatarDataBR(obra.data_fim_prevista)}</p>
        <p><strong>Natureza:</strong> ${obra.natureza || '---'}</p>
    `;

    document.getElementById('modal-detalhes').style.display = 'flex';
}

document.querySelector('.close-button').onclick = () => {
    document.getElementById('modal-detalhes').style.display = 'none';
};

window.onclick = (event) => {
    const modal = document.getElementById('modal-detalhes');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

function fecharModal() {
    const modal = document.getElementById('modal-detalhes');
    if (modal) {
        modal.style.display = 'none';
    }
}