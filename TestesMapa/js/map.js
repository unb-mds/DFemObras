// Inicializa o mapa na posição e zoom padrão
const map = L.map('map').setView([-14.235, -51.9253], 4); // Coordenadas aproximadas do Brasil

// Adiciona o tile layer do mapa (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Função para formatar valores em BRL
function formatarBRL(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Carrega os dados do arquivo JSON com as obras
fetch('../TesteObrasgov/obras_com_lat_long.json') // Ajustar o caminho do JSON conforme necessário
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON.');
        }
        return response.json();
    })
    .then(data => {
        const pinIcons = {
            concluida: L.icon({
                iconUrl: '/TestesMapa/js/pins/concluida.png',
                iconSize: [32, 32], // Tamanho do ícone
                iconAnchor: [16, 32], // Ponto de ancoragem
                popupAnchor: [0, -32], // Ponto de ancoragem do popup
            }),
            emExecucao: L.icon({
                iconUrl: '/TestesMapa/js/pins/em_execucao.png',
                iconSize: [35, 35],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            }),
            cadastrada: L.icon({
                iconUrl: '/TestesMapa/js/pins/cadastrada.png',
                iconSize: [35, 35],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            }),
            inativada: L.icon({
                iconUrl: '/TestesMapa/js/pins/inativada.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            }),
        };

        // Itera sobre as obras e cria marcadores no mapa
        data.forEach((obra, index) => {
            const { nome, fontesDeRecurso, latitude, longitude, situacao, localizacao } = obra;

            // Verifica se a obra possui coordenadas
            if (!latitude || !longitude) {
                console.warn(`Obra "${nome}" index ${index} ignorada por falta de coordenadas.`);
                return;
            }

            // Escolhe o ícone com base na situação
            let markerIcon;
            if (situacao === 'Concluída') {
                markerIcon = pinIcons.concluida;
            } else if (situacao === 'Em execução') {
                markerIcon = pinIcons.emExecucao;
            } else if (situacao === 'Cadastrada') {
                markerIcon = pinIcons.cadastrada;
            } else if (situacao === 'Inativada') {
                markerIcon = pinIcons.inativada;
            } else {
                console.warn(`Obra ${index} situação "${situacao}" desconhecida. Nome da obra: "${nome}"`);
                return;
            }

            // Cria o marcador com o ícone personalizado
            const marker = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);

            // Valor investido formatado
            const valor = fontesDeRecurso?.[0]?.valorInvestimentoPrevisto || 0;
            const valorBRL = formatarBRL(valor);

            // Conteúdo do popup com link para detalhamento
            const popupContent = `
                <div>
                    <h3>${nome}</h3>
                    <p><strong>Situação:</strong> ${situacao}</p>
                    <p><strong>Valor Previsto:</strong> ${valorBRL}</p>
                    <p><strong>Localização:</strong> ${localizacao || 'Não informada'}</p>
                    <a href="detalhamento.html?obra=${index}" target="_blank" style="color: blue; text-decoration: underline;">
                        Ver detalhes
                    </a>
                </div>
            `;

            // Associa o popup ao marcador
            marker.bindPopup(popupContent);

            console.log(`Obra ${index + 1} foi carregada: "${nome}"`);
        });
    })
    .catch(error => {
        console.error('Erro ao carregar as obras:', error);
    });
