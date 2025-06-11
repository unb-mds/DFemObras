// Global variables for filtering
let mapa;
let todasAsObras = [];
let marcadoresAtuais = [];
let filteredObras = [];

// RA boundary definitions
const raBoundaries = {
    "RA I - Brasília": {
        latMin: -15.85, latMax: -15.75,
        lonMin: -47.95, lonMax: -47.85
    },
    "RA II - Gama": {
        latMin: -16.05, latMax: -15.95,
        lonMin: -48.10, lonMax: -48.00
    },
    "RA III - Taguatinga": {
        latMin: -15.85, latMax: -15.80,
        lonMin: -48.10, lonMax: -48.00
    },
    "RA IV - Brazlândia": {
        latMin: -15.75, latMax: -15.65,
        lonMin: -48.25, lonMax: -48.15
    },
    "RA V - Sobradinho": {
        latMin: -15.70, latMax: -15.60,
        lonMin: -47.85, lonMax: -47.75
    },
    "RA VI - Planaltina": {
        latMin: -15.65, latMax: -15.55,
        lonMin: -47.70, lonMax: -47.60
    },
    "RA VII - Paranoá": {
        latMin: -15.80, latMax: -15.70,
        lonMin: -47.75, lonMax: -47.65
    },
    "RA VIII - Núcleo Bandeirante": {
        latMin: -15.90, latMax: -15.85,
        lonMin: -47.95, lonMax: -47.90
    },
    "RA IX - Ceilândia": {
        latMin: -15.85, latMax: -15.80,
        lonMin: -48.15, lonMax: -48.05
    },
    "RA X - Guará": {
        latMin: -15.85, latMax: -15.80,
        lonMin: -47.98, lonMax: -47.90
    },
    "RA XI - Cruzeiro": {
        latMin: -15.80, latMax: -15.75,
        lonMin: -47.95, lonMax: -47.90
    },
    "RA XII - Samambaia": {
        latMin: -15.90, latMax: -15.85,
        lonMin: -48.15, lonMax: -48.05
    },
    "RA XIII - Santa Maria": {
        latMin: -16.05, latMax: -15.95,
        lonMin: -48.05, lonMax: -47.95
    },
    "RA XIV - São Sebastião": {
        latMin: -15.95, latMax: -15.85,
        lonMin: -47.85, lonMax: -47.75
    },
    "RA XV - Recanto das Emas": {
        latMin: -16.00, latMax: -15.90,
        lonMin: -48.10, lonMax: -48.00
    },
    "RA XVI - Lago Sul": {
        latMin: -15.90, latMax: -15.82,
        lonMin: -47.85, lonMax: -47.75
    },
    "RA XVII - Riacho Fundo": {
        latMin: -15.90, latMax: -15.85,
        lonMin: -48.05, lonMax: -47.95
    },
    "RA XVIII - Lago Norte": {
        latMin: -15.75, latMax: -15.70,
        lonMin: -47.85, lonMax: -47.75
    },
    "RA XIX - Candangolândia": {
        latMin: -15.87, latMax: -15.82,
        lonMin: -47.95, lonMax: -47.90
    },
    "RA XX - Águas Claras": {
        latMin: -15.85, latMax: -15.82,
        lonMin: -48.02, lonMax: -47.98
    }
};

function inicializaMapa() {
    const bounds = L.latLngBounds(
        L.latLng(-16.1000, -48.2000),
        L.latLng(-15.5000, -47.5000)
    );

    mapa = L.map('map', {
        center: [-15.802825, -47.798767],
        zoom: 10.4,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
}

function determinarRA(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
        return 'RA não identificada';
    }

    for (const [ra, bounds] of Object.entries(raBoundaries)) {
        if (lat >= bounds.latMin && lat <= bounds.latMax &&
            lon >= bounds.lonMin && lon <= bounds.lonMax) {
            return ra;
        }
    }

    if (lat >= -15.85 && lat <= -15.75 && lon >= -47.95 && lon <= -47.85) {
        return "RA I - Brasília";
    } else if (lat >= -15.90 && lat <= -15.75 && lon >= -48.20 && lon <= -47.85) {
        return "Região Oeste do DF";
    } else if (lat >= -16.10 && lat <= -15.85 && lon >= -48.20 && lon <= -47.85) {
        return "Região Sul do DF";
    }

    return "RA não identificada";
}

function formatarBRL(valor) {
    if (!valor) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/, '');
}

function formatDate(dateString) {
    if (!dateString) return 'Não informada';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return dateString;
    }
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

// Enhanced function to get obras data with RA
function obterDadosDasObras() {
    return fetch('./obrasgov/obras_com_lat_long.json')
    // TestesMapa/obrasgov/src/obras_com_lat_long.json
        .then(verificarResposta)
        .then(resposta => resposta.json())
        .then(dados => {
            // Add RA information to each obra
            return dados.map((obra, index) => {
                if (obra.latitude && obra.longitude) {
                    obra.regiao_administrativa = determinarRA(obra.latitude, obra.longitude);
                } else {
                    obra.regiao_administrativa = 'RA não identificada';
                }
                obra.indice = index;
                return obra;
            });
        });
}

// Função para criar um marcador no mapa
function criarMarcador(lat, lng, icone, mapa) {
    return L.marker([lat, lng], { icon: icone }).addTo(mapa);
}

// Enhanced popup content without external link
function gerarConteudoDoPopup(nome, situacao, valorBRL, indice, ra) {
    return `
        <div style="font-family: Arial, sans-serif; padding: 10px; width: 280px; background-color:rgb(255, 255, 255);">
            <h3 style="font-size: 18px; margin-bottom: 10px; color: #333;">${nome}</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong style="color: #333;">🏛️ Região Administrativa:</strong> ${ra || 'RA não identificada'}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong style="color: #333;">📊 Situação:</strong> ${situacao}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong style="color: #333;">💰 Valor Previsto:</strong> ${valorBRL}</p>
            <button onclick="mostrarDetalhesObra(${indice})" style="display: block; width: 100%; margin-top: 10px; text-align: center; padding: 8px; background-color: #133e79; color: white; border: none; border-radius: 4px; font-size: 14px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); cursor: pointer;">
                📋 Ver detalhes
            </button>
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
    return mapaIcones[situacao] || icones.cadastrada;
}

// Enhanced function to process obras data
function processarDadosDasObras(dados, mapa) {
    const icones = criarIconesDosPins();
    todasAsObras = dados;
    filteredObras = [...dados];
    marcadoresAtuais = [];
    
    updateFilterStatus(`Processando ${dados.length} obras...`);

    dados.forEach((obra, indice) => {
        const { nome, fontesDeRecurso, latitude, longitude, situacao, regiao_administrativa } = obra;
        
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
        
        // Store marker with RA info for filtering
        marcadoresAtuais.push({
            marker: marcador,
            obra: obra,
            indice: indice,
            ra: regiao_administrativa || 'RA não identificada'
        });
        
        // Configuração do popup
        const valor = fontesDeRecurso?.[0]?.valorInvestimentoPrevisto || 0;
        const ra = regiao_administrativa || 'RA não identificada';
        const conteudoPopup = gerarConteudoDoPopup(nome, situacao, formatarBRL(valor), indice, ra);
        marcador.bindPopup(conteudoPopup);
    });

    updateFilterStatus(`${marcadoresAtuais.length} obras carregadas`);
    popularFiltros();
    displayObrasList(); // Add this line to show the initial list
    logRADistribution();
}

// Function to check if obra is delayed
function isObraAtrasada(obra) {
    if (!obra.dataFinalPrevista || obra.situacao === 'Concluída') {
        return false;
    }
    
    const dataFinalPrevista = new Date(obra.dataFinalPrevista);
    const hoje = new Date();
    
    return hoje > dataFinalPrevista && obra.situacao !== 'Concluída';
}

// Enhanced function to populate filter dropdowns
function popularFiltros() {
    popularDropdownRA();
    popularDropdownSituacao();
    popularDropdownEspecie();
}

function popularDropdownRA() {
    const selectElement = document.getElementById('ra-filter');
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">Todas as RAs</option>';
    
    const rasDisponiveis = obterRAsDisponiveis();
    rasDisponiveis.forEach(ra => {
        const option = document.createElement('option');
        option.value = ra;
        option.textContent = ra;
        selectElement.appendChild(option);
    });
}

function popularDropdownSituacao() {
    const selectElement = document.getElementById('situacao-filter');
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">Todas as Situações</option>';
    
    const situacoes = [...new Set(todasAsObras.map(obra => obra.situacao).filter(Boolean))];
    situacoes.sort().forEach(situacao => {
        const option = document.createElement('option');
        option.value = situacao;
        option.textContent = situacao;
        selectElement.appendChild(option);
    });
}

function popularDropdownEspecie() {
    const selectElement = document.getElementById('especie-filter');
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">Todas as Espécies</option>';
    
    const especies = [...new Set(todasAsObras.map(obra => obra.especie).filter(Boolean))];
    especies.sort().forEach(especie => {
        const option = document.createElement('option');
        option.value = especie;
        option.textContent = especie;
        selectElement.appendChild(option);
    });
}

// Function to get available RAs
function obterRAsDisponiveis() {
    const ras = new Set();
    todasAsObras.forEach(obra => {
        if (obra.regiao_administrativa && obra.regiao_administrativa !== 'RA não identificada') {
            ras.add(obra.regiao_administrativa);
        }
    });
    return Array.from(ras).sort();
}

function logRADistribution() {
    const raStats = {};
    todasAsObras.forEach(obra => {
        const ra = obra.regiao_administrativa || 'RA não identificada';
        raStats[ra] = (raStats[ra] || 0) + 1;
    });
    console.log('📊 Distribuição por RA:', raStats);
}

// Enhanced filtering function
function aplicarFiltros() {
    const raFilter = document.getElementById('ra-filter')?.value || '';
    const situacaoFilter = document.getElementById('situacao-filter')?.value || '';
    const especieFilter = document.getElementById('especie-filter')?.value || '';
    const atrasoFilter = document.getElementById('atraso-filter')?.value || '';
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

    // Filter the obras
    filteredObras = todasAsObras.filter(obra => {
        const matchRA = !raFilter || obra.regiao_administrativa === raFilter;
        const matchSituacao = !situacaoFilter || obra.situacao === situacaoFilter;
        const matchEspecie = !especieFilter || obra.especie === especieFilter;
        const matchSearch = !searchTerm || 
            obra.nome?.toLowerCase().includes(searchTerm) ||
            obra.descricao?.toLowerCase().includes(searchTerm) ||
            obra.endereco?.toLowerCase().includes(searchTerm);
        
        // Delay filter logic
        let matchAtraso = true;
        if (atrasoFilter === 'atrasadas') {
            matchAtraso = isObraAtrasada(obra);
        } else if (atrasoFilter === 'no-prazo') {
            matchAtraso = !isObraAtrasada(obra);
        }

        return matchRA && matchSituacao && matchEspecie && matchSearch && matchAtraso;
    });

    // Update markers and list
    updateMarkersVisibility();
    displayObrasList();
    
    // Update status
    const atrasadas = filteredObras.filter(obra => isObraAtrasada(obra)).length;
    updateFilterStatus(`${filteredObras.length} obras exibidas (${atrasadas} atrasadas)`);
}

// Function to update markers visibility
function updateMarkersVisibility() {
    let contador = 0;
    marcadoresAtuais.forEach(item => {
        const isVisible = filteredObras.some(obra => obra.indice === item.indice);
        
        if (isVisible) {
            item.marker.addTo(mapa);
            contador++;
        } else {
            mapa.removeLayer(item.marker);
        }
    });
}

// Function to display obras list in sidebar
function displayObrasList() {
    const obrasList = document.getElementById('obras-list');
    if (!obrasList) {
        console.log('📋 Elemento obras-list não encontrado');
        return;
    }
    
    obrasList.innerHTML = '';
    
    if (filteredObras.length === 0) {
        obrasList.innerHTML = '<div class="loading">Nenhuma obra encontrada</div>';
        return;
    }
    
    filteredObras.forEach((obra, index) => {
        const obraElement = createObraElement(obra, index);
        obrasList.appendChild(obraElement);
    });
}

// Function to create obra element for sidebar list
function createObraElement(obra, index) {
    const div = document.createElement('div');
    div.className = 'obra-item';
    div.dataset.index = obra.indice;
    
    // Add delay class if obra is delayed
    if (isObraAtrasada(obra)) {
        div.classList.add('atrasada');
    }
    
    const statusClass = getStatusClass(obra.situacao);
    const valor = obra.fontesDeRecurso?.[0]?.valorInvestimentoPrevisto || 0;
    
    div.innerHTML = `
        <div class="obra-title">${obra.nome || 'Nome não informado'}</div>
        <div class="obra-info"><strong>🏛️ RA:</strong> ${obra.regiao_administrativa || 'Não identificada'}</div>
        <div class="obra-info"><strong>📍 Endereço:</strong> ${obra.endereco || 'Não informado'}</div>
        <div class="obra-info"><strong>🏗️ Espécie:</strong> ${obra.especie || 'Não informada'}</div>
        <div class="obra-info"><strong>💰 Valor:</strong> ${formatarBRL(valor)}</div>
        <div class="obra-info"><strong>📅 Previsão:</strong> ${formatDate(obra.dataInicialPrevista)} - ${formatDate(obra.dataFinalPrevista)}</div>
        ${isObraAtrasada(obra) ? '<div class="obra-info" style="color: #d32f2f;"><strong>⏰ Status:</strong> ATRASADA</div>' : ''}
        <span class="obra-status ${statusClass}">${obra.situacao || 'Status não informado'}</span>
    `;
    
    div.addEventListener('click', () => selectProject(obra.indice));
    
    return div;
}

// Function to get status class
function getStatusClass(situacao) {
    if (!situacao) return 'status-cadastrada';
    
    const status = situacao.toLowerCase();
    if (status.includes('cadastrada')) return 'status-cadastrada';
    if (status.includes('execução') || status.includes('execucao')) return 'status-execucao';
    if (status.includes('concluída') || status.includes('concluida')) return 'status-concluida';
    if (status.includes('inativada')) return 'status-inativada';
    return 'status-cadastrada';
}

// Function to select project (highlight and center on map)
function selectProject(indice) {
    // Remove previous highlights
    document.querySelectorAll('.obra-item').forEach(item => {
        item.classList.remove('highlighted');
    });
    
    // Highlight selected item
    const selectedElement = document.querySelector(`[data-index="${indice}"]`);
    if (selectedElement) {
        selectedElement.classList.add('highlighted');
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Center map on selected obra
    const obra = todasAsObras.find(o => o.indice === indice);
    if (obra && obra.latitude && obra.longitude) {
        mapa.setView([obra.latitude, obra.longitude], 15);
        
        // Find and open popup for the marker
        const markerItem = marcadoresAtuais.find(m => m.indice === indice);
        if (markerItem && markerItem.marker) {
            markerItem.marker.openPopup();
        }
    }
}

// Enhanced clear filters function
function limparFiltros() {
    // Reset all filters
    document.getElementById('ra-filter').value = '';
    document.getElementById('situacao-filter').value = '';
    document.getElementById('especie-filter').value = '';
    document.getElementById('atraso-filter').value = '';
    document.getElementById('search-input').value = '';
    
    // Reset filtered data
    filteredObras = [...todasAsObras];
    
    // Show all markers
    marcadoresAtuais.forEach(item => {
        item.marker.addTo(mapa);
    });
    
    // Update display
    displayObrasList();
    updateFilterStatus(`${marcadoresAtuais.length} obras exibidas (todas)`);
}

// Enhanced controls initialization
function inicializarControlesDeFiltro() {
    const clearButton = document.getElementById('clear-filters');
    const raFilter = document.getElementById('ra-filter');
    const situacaoFilter = document.getElementById('situacao-filter');
    const especieFilter = document.getElementById('especie-filter');
    const atrasoFilter = document.getElementById('atraso-filter');
    const searchInput = document.getElementById('search-input');
    
    // Add event listeners for real-time filtering
    if (raFilter) raFilter.addEventListener('change', aplicarFiltros);
    if (situacaoFilter) situacaoFilter.addEventListener('change', aplicarFiltros);
    if (especieFilter) especieFilter.addEventListener('change', aplicarFiltros);
    if (atrasoFilter) atrasoFilter.addEventListener('change', aplicarFiltros);
    if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
    if (clearButton) clearButton.addEventListener('click', limparFiltros);
}

// Modal functions - Fix the element IDs
function mostrarDetalhesObra(indice) {
    const obra = todasAsObras[indice];
    if (!obra) return;

    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-body'); // Changed from 'modal-content'

    if (!modal || !modalContent) {
        console.error('Modal elements not found');
        return;
    }

    modalContent.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #133e79;">
                <h3 style="color: #133e79; margin-bottom: 10px;">📋 Informações Gerais</h3>
                <div style="display: grid; gap: 8px;">
                    <div><strong>Nome:</strong> ${obra.nome || 'Não informado'}</div>
                    <div><strong>ID Único:</strong> ${obra.idUnico || 'Não informado'}</div>
                    <div><strong>Situação:</strong> <span style="background: #e3f2fd; padding: 2px 8px; border-radius: 12px; color: #1565c0; font-weight: bold;">${obra.situacao || 'Não informada'}</span></div>
                    <div><strong>Espécie:</strong> ${obra.especie || 'Não informada'}</div>
                    <div><strong>Natureza:</strong> ${obra.natureza || 'Não informada'}</div>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                <h3 style="color: #27ae60; margin-bottom: 10px;">📍 Localização</h3>
                <div style="display: grid; gap: 8px;">
                    <div><strong>🏛️ Região Administrativa:</strong> ${obra.regiao_administrativa || 'Não identificada'}</div>
                    <div><strong>Endereço:</strong> ${obra.endereco || 'Não informado'}</div>
                    <div><strong>CEP:</strong> ${obra.cep || 'Não informado'}</div>
                    <div><strong>UF:</strong> ${obra.uf || 'Não informada'}</div>
                    <div><strong>Coordenadas:</strong> ${obra.latitude || 'N/A'}, ${obra.longitude || 'N/A'}</div>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                <h3 style="color: #e74c3c; margin-bottom: 10px;">📝 Descrição</h3>
                <div style="line-height: 1.6;">${obra.descricao || 'Descrição não disponível'}</div>
            </div>

            ${obra.funcaoSocial ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #9b59b6;">
                <h3 style="color: #9b59b6; margin-bottom: 10px;">🎯 Função Social</h3>
                <div style="line-height: 1.6;">${obra.funcaoSocial}</div>
            </div>
            ` : ''}

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12;">
                <h3 style="color: #f39c12; margin-bottom: 10px;">📅 Cronograma</h3>
                <div style="display: grid; gap: 8px;">
                    <div><strong>Data de Cadastro:</strong> ${formatDate(obra.dataCadastro)}</div>
                    <div><strong>Início Previsto:</strong> ${formatDate(obra.dataInicialPrevista)}</div>
                    <div><strong>Fim Previsto:</strong> ${formatDate(obra.dataFinalPrevista)}</div>
                    <div><strong>Início Efetivo:</strong> ${formatDate(obra.dataInicialEfetiva)}</div>
                    <div><strong>Fim Efetivo:</strong> ${formatDate(obra.dataFinalEfetiva)}</div>
                </div>
            </div>

            ${obra.fontesDeRecurso && obra.fontesDeRecurso.length > 0 ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
                <h3 style="color: #28a745; margin-bottom: 10px;">💰 Investimento</h3>
                <div><strong>Valor Previsto:</strong> ${formatarBRL(obra.fontesDeRecurso[0]?.valorInvestimentoPrevisto || 0)}</div>
            </div>
            ` : ''}

            ${obra.populacaoBeneficiada ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8;">
                <h3 style="color: #17a2b8; margin-bottom: 10px;">👥 População Beneficiada</h3>
                <div style="display: grid; gap: 8px;">
                    <div><strong>Quantidade:</strong> ${obra.populacaoBeneficiada}</div>
                    <div><strong>Descrição:</strong> ${obra.descPopulacaoBeneficiada || 'Não informada'}</div>
                </div>
            </div>
            ` : ''}

            ${obra.qdtEmpregosGerados ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6f42c1;">
                <h3 style="color: #6f42c1; margin-bottom: 10px;">👷 Empregos Gerados</h3>
                <div>${obra.qdtEmpregosGerados}</div>
            </div>
            ` : ''}
        </div>
    `;

    modal.style.display = 'block';
}

function inicializarModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function updateFilterStatus(message) {
    const statusElement = document.getElementById('filter-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('📍 Filter Status:', message);
}

// Enhanced popup management with localStorage
function gerenciarPopupInicial() {
    const popup = document.getElementById('popup');
    const fecharPopup = document.getElementById('close-popup');
    
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('dfemobras_popup_seen');
    
    if (!hasSeenPopup && popup) {
        popup.style.display = 'flex';
        
        if (fecharPopup) {
            fecharPopup.addEventListener('click', () => {
                popup.style.display = 'none';
                localStorage.setItem('dfemobras_popup_seen', 'true');
            });
        }
        
        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.style.display = 'none';
                localStorage.setItem('dfemobras_popup_seen', 'true');
            }
        });
    }
}

function buscarObras() {
    updateFilterStatus('🔄 Carregando obras...');
    
    obterDadosDasObras()
        .then(dados => {
            console.log(`📊 ${dados.length} obras carregadas com informações de RA`);
            processarDadosDasObras(dados, mapa);
        })
        .catch(error => {
            console.error('❌ Erro ao carregar as obras:', error);
            updateFilterStatus('❌ Erro ao carregar obras');
        });
}

// Make function globally available
window.mostrarDetalhesObra = mostrarDetalhesObra;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Inicializando mapa principal com sidebar...');
        inicializaMapa();
        inicializarControlesDeFiltro();
        inicializarModal();
        gerenciarPopupInicial();
        buscarObras();
    });
}

// Exports for testing
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
        processarDadosDasObras,
        determinarRA,
        aplicarFiltros,
        limparFiltros,
        popularFiltros,
        mostrarDetalhesObra
    };
}