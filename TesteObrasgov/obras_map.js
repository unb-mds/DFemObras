const axios = require('axios');
const fs = require('fs');

// Função para buscar obras
async function fetchObras() {
    try {
        const url = 'https://api.obrasgov.gestao.gov.br/obrasgov/api/projeto-investimento?uf=DF&pagina=0&tamanhoDaPagina=10';
        console.log(`Fazendo requisição para: ${url}`);

        const response = await axios.get(url);

        if (response.data && Array.isArray(response.data.content)) {
            const obras = response.data.content;

            if (obras.length > 0) {
                console.log("Dados recebidos com sucesso.");
                return obras;
            } else {
                console.log("Nenhuma obra encontrada na resposta da API.");
                return [];
            }
        } else {
            console.log("Formato inesperado de resposta.");
            return [];
        }
    } catch (error) {
        if (error.response) {
            console.error("Erro no servidor:", error.response.status, error.response.statusText);
            console.error("Detalhes do erro:", error.response.data);
        } else if (error.request) {
            console.error("Nenhuma resposta da API:", error.request);
        } else {
            console.error("Erro ao configurar a requisição:", error.message);
        }
        return [];
    }
}

// Função para buscar a geometria de uma obra
async function fetchGeometria(idUnico) {
    try {
        const url = `https://api.obrasgov.gestao.gov.br/obrasgov/api/geometria?idUnico=${idUnico}`;
        const response = await axios.get(url);

        console.log(`Resposta para ID ${idUnico}:`, JSON.stringify(response.data, null, 2)); // Log para depuração

        if (response.data && response.data[0] && response.data[0].geometriaWkt) {
            return response.data[0].geometriaWkt;
        } else {
            console.error(`Geometria não encontrada para a obra com ID ${idUnico}`);
            return null;
        }
    } catch (error) {
        console.error(`Erro ao buscar geometria para a obra ${idUnico}:`, error.message);
        return null;
    }
}

// Função para salvar dados em um arquivo JSON
async function saveToJsonFile(data, filename) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Dados salvos no arquivo ${filename}`);
    } catch (error) {
        console.error(`Erro ao salvar o arquivo ${filename}:`, error.message);
    }
}

// Função para extrair latitude e longitude do geometriaWkt
function extractLatLong(geometriaWkt) {
    const match = geometriaWkt.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
        return {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2]),
        };
    }
    return null;
}

// Função principal
async function main() {
    console.log("Buscando dados das obras...");
    const obras = await fetchObras();

    if (obras.length > 0) {
        const obrasComGeometria = await Promise.all(
            obras.map(async (obra) => {
                try {
                    const geometriaWkt = await fetchGeometria(obra.idUnico);
                    if (geometriaWkt) {
                        const coords = extractLatLong(geometriaWkt);
                        if (coords) {
                            obra.latitude = coords.latitude;
                            obra.longitude = coords.longitude;
                        } else {
                            obra.latitude = null;
                            obra.longitude = null;
                        }
                    } else {
                        obra.latitude = null;
                        obra.longitude = null;
                    }
                    return obra;
                } catch (error) {
                    console.error(`Erro ao associar geometria para obra ${obra.idUnico}`);
                    return obra; // Retorna a obra sem a geometria em caso de erro
                }
            })
        );

        // Exibir os dados para verificar se cada obra tem suas coordenadas corretas
        console.log("Obras com latitude e longitude:");
        console.log(JSON.stringify(obrasComGeometria, null, 2));

        // Salvar os dados no arquivo JSON
        await saveToJsonFile(obrasComGeometria, 'obras_com_lat_long.json');
    } else {
        console.log("Não foi possível obter os dados das obras.");
    }
}

main();
