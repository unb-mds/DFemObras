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
        // Varrer as obras e criar marcadores
        data.forEach((obra, index) => {
            const { nome, fontesDeRecurso, latitude, longitude, situacao } = obra;
            
            //Verifica se tem latitude e longitude no JSON
            if(!latitude || !longitude){
                console.error(`Obra ${index}: "${nome}" ---> ignorada por falta de coordenadas.`);
                return;
            }
            
            /*Ignorando as obras "Cadastradas" para melhor visualização dos pins*/
            if(situacao == 'Cadastrada'){
                console.log(`Obra ${index} ignorada por ser "Cadastrada" Nome da obra:"${nome}"`)
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

            const valor = fontesDeRecurso?.[0]?.valorInvestimentoPrevisto;
            const valorBRL = formatarBRL(valor);

            // Conteúdo do popup
            const popupContent = `
                <div>
                    <h3>${nome}</h3>
                    <p><strong>Situação:</strong> ${situacao}</p>
                    <p><strong>Valor Previsto:</strong> ${valorBRL}</p>
                </div>
            `;

            // Adicionar popup ao marcador
            marker.bindPopup(popupContent);

            console.log(`Obra ${index + 1} foi carregada: "${nome}"`);
        });
    })
    .catch(error => {
        console.error('Erro ao carregar as obras:', error);
    });


// Exibir coordenadas no console ao clicar no mapa
map.on('click', (e) => {
    console.log(`Coordenadas: ${e.latlng}`);
});
