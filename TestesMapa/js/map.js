// Inicializar o mapa

  
const map = L.map('map').setView([-15.802825, -47.798767], 10.4);

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('close-popup');
  
    // Mostra o popup quando a página é carregada
    popup.style.display = 'flex';
  
    // Fecha o popup ao clicar no botão "X"
    closePopup.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  
    // Fecha o popup ao clicar fora do conteúdo
    popup.addEventListener('click', (event) => {
      if (event.target === popup) {
        popup.style.display = 'none';
      }
    });
  });


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function formatarBRL(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

fetch('../TesteObrasgov/obras_com_lat_long.json') // Caminho do JSON
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o JSON');
        }
        console.log("JSON carregado!")
        return response.json();
    })
    .then(data => {
        // Varrer as obras e criar marcadores
        data.forEach((obra, index) => {
            const { nome, fontesDeRecurso, latitude, longitude } = obra;
            
            //Verifica se tem latitude e longitude no JSON
            if(!latitude || !longitude){
                console.warn(`Obra "${nome}" index ${index} ignorada por falta de coordenadas.`);
                return;
            }

            // Cria o marcador
            const marker = L.marker([latitude, longitude]).addTo(map);

            const valor = fontesDeRecurso?.[0]?.valorInvestimentoPrevisto;
            const valorBRL = formatarBRL(valor)

            // Conteúdo do popup
            const popupContent = `
                <div>
                    <h3>${nome}</h3>
                    <p><strong>Valor Previsto:</strong> ${valorBRL}</p>
                </div>
            `;

            // Adicionar popup ao marcador
            marker.bindPopup(popupContent);

            console.log(`Obra ${index + 1} foi carregada: "${nome}" `);

        });
    })
    .catch(error => {
        console.error('Erro ao carregar as obras:', error);
    });


// Exibir coordenadas no console ao clicar no mapa
map.on('click', (e) => {
    console.log(`Coordenadas: ${e.latlng}`);
});
