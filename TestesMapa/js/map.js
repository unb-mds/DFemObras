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
fetch('../TesteObrasgov/obras_com_lat_long.json') // Caminho do arquivo JSON
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON.');
        }
        return response.json();
    })
    .then(data => {
        // Itera sobre as obras e cria marcadores no mapa
        data.forEach((obra, index) => {
            const { nome, fontesDeRecurso, latitude, longitude, localizacao } = obra;

            // Verifica se a obra possui coordenadas
            if (!latitude || !longitude) {
                console.warn(`Obra "${nome}" index ${index} ignorada por falta de coordenadas.`);
                return;
            }

            // Cria o marcador no mapa
            const marker = L.marker([latitude, longitude]).addTo(map);

            // Valor investido formatado
            const valor = fontesDeRecurso?.[0]?.valorInvestimentoPrevisto || 0;
            const valorBRL = formatarBRL(valor);

            // Conteúdo do popup com link para detalhamento
            const popupContent = `
                <div>
                    <h3>${nome}</h3>
                    <p><strong>Valor Previsto:</strong> ${valorBRL}</p>
                    <p><strong>Localização:</strong> ${localizacao || 'Não informada'}</p>
                    <a href="detalhamento.html?obra=${index}" target="_blank" style="color: blue; text-decoration: underline;">
                        Ver detalhes
                    </a>
                </div>
            `;

            // Associa o popup ao marcador
            marker.bindPopup(popupContent);
        });
    })
    .catch(error => {
        console.error('Erro ao carregar as obras:', error);
    });
