// Inicializar o mapa
const map = L.map('map').setView([-15.802825, -47.798767], 10.4);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

fetch('obras/obras.json') // Caminho do JSON
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o JSON');
        }
        return response.json();
    })
    .then(data => {
        // Varrer as obras e criar marcadores
        data.forEach(obra => {
            const { nome, valor, lat, long } = obra;

            // Cria o marcador
            const marker = L.marker([lat, long]).addTo(map);

            // Conteúdo do popup
            const popupContent = `
                <div>
                    <h3>${nome}</h3>
                    <p><strong>Valor:</strong> R$ ${valor.toLocaleString()}</p>
                </div>
            `;

            // Adicionar popup ao marcador
            marker.bindPopup(popupContent);
        });
    })
    .catch(error => {
        console.error('Erro ao carregar as obras:', error);
    });


// Exibir coordenadas no console ao clicar no mapa
map.on('click', (e) => {
    console.log(`Coordenadas: ${e.latlng}`);
});
