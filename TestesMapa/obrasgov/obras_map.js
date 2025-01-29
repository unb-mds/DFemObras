const axios = require('axios');
const fs = require('fs');
const pLimit = require('p-limit');

const cache = new Map(); // Cache local para armazenar geometrias já buscadas
const limit = pLimit(1); // Limitar a 1 requisição simultânea para reduzir carga
const falhas = []; // Armazena IDs de obras com falha

// Função para buscar obras com paginação
async function fetchObrasPorUF(uf, pagina = 0, tamanhoDaPagina = 5) {
    const url = `https://api.obrasgov.gestao.gov.br/obrasgov/api/projeto-investimento?uf=${uf}&pagina=${pagina}&tamanhoDaPagina=${tamanhoDaPagina}`;

    try {
        const response = await axios.get(url);

        if (response.data && Array.isArray(response.data.content)) {
            console.log(`Página ${pagina} carregada com ${response.data.content.length} obras.`);
            return response.data;
        } else {
            console.error("Formato inesperado de resposta ao buscar obras.");
            return { content: [], totalElements: 0 };
        }
    } catch (error) {
        console.error(`Erro ao buscar obras da página ${pagina}:`, error.message);
        return { content: [], totalElements: 0 };
    }
}

// Função para buscar a geometria de uma obra com retries e delay
async function fetchWithRetry(url, retries = 5) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return response.data;
            }

            if (response.status === 429 || response.status === 503) {
                const retryAfter = response.headers["retry-after"];
                const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000;
                console.log(`Rate limited. Retrying after ${delay / 1000} seconds.`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`Request failed with status ${response.status}`);
            }
        } catch (error) {
            console.error(`Erro na tentativa ${attempt + 1}:`, error.message);
        }
    }

    throw new Error("Max retries exceeded");
}

async function fetchGeometria(idUnico) {
    if (cache.has(idUnico)) {
        return cache.get(idUnico);
    }

    const url = `https://api.obrasgov.gestao.gov.br/obrasgov/api/geometria?idUnico=${idUnico}`;
    try {
        const geometria = await fetchWithRetry(url);
        if (geometria && geometria[0]) {
            cache.set(idUnico, geometria);
        }
        return geometria;
    } catch (error) {
        falhas.push(idUnico);
        throw new Error(`Erro ao buscar geometria para ID ${idUnico}: ${error.message}`);
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

// Função para salvar dados em um arquivo JSON
async function saveToJsonFile(data, filename) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Dados salvos no arquivo ${filename}`);
    } catch (error) {
        console.error(`Erro ao salvar o arquivo ${filename}:`, error.message);
    }
}

// Função principal
async function main() {
    const uf = "DF";
    const tamanhoDaPagina = 10; // Tamanho configurado para 10 obras por página
    let pagina = 0;
    let obrasComGeometria = [];
    let totalElements = null;
    let paginasVaziasConsecutivas = 0; // Contador de páginas vazias consecutivas
    const limitePaginasVazias = 5; // Limite para parar o loop

    console.log("Buscando dados das obras...");

    while (true) {
        const response = await fetchObrasPorUF(uf, pagina, tamanhoDaPagina);
        const { content: obras } = response;

        if (pagina === 0 && response.totalElements) {
            totalElements = response.totalElements; // Captura o número total de obras
            console.log(`Número total de obras (relatado pela API): ${totalElements}`);
        }

        if (obras.length === 0) {
            paginasVaziasConsecutivas++;
            console.log(`Página ${pagina} vazia. (${paginasVaziasConsecutivas}/${limitePaginasVazias} páginas vazias consecutivas)`);

            if (paginasVaziasConsecutivas >= limitePaginasVazias) {
                console.log("Muitas páginas vazias consecutivas. Encerrando o loop.");
                break;
            }

            pagina++;
            await new Promise(resolve => setTimeout(resolve, 30000)); // Delay entre páginas
            continue;
        }

        paginasVaziasConsecutivas = 0; // Reseta o contador se encontrar uma página com dados

        const obrasProcessadas = await Promise.all(
            obras.map((obra) =>
                limit(async () => {
                    try {
                        const geometriaData = await fetchGeometria(obra.idUnico);

                        if (geometriaData && geometriaData[0] && geometriaData[0].geometriaWkt) {
                            const coords = extractLatLong(geometriaData[0].geometriaWkt);
                            if (coords) {
                                obra.latitude = coords.latitude;
                                obra.longitude = coords.longitude;
                            }
                        }
                        return obra;
                    } catch (error) {
                        console.error(`Erro ao processar geometria para ID ${obra.idUnico}:`, error.message);
                        obra.latitude = null;
                        obra.longitude = null;
                        return obra;
                    }
                })
            )
        );

        obrasComGeometria = [...obrasComGeometria, ...obrasProcessadas];
        pagina++;

        if (obrasComGeometria.length >= totalElements) break;

        console.log(`Pausa entre páginas por 30 segundos. Processadas ${obrasComGeometria.length} obras.`);
        await new Promise(resolve => setTimeout(resolve, 30000)); // Delay entre páginas
    }

    console.log("Salvando resultados...");
    await saveToJsonFile(obrasComGeometria, 'obras_com_lat_long.json');

    if (falhas.length > 0) {
        console.log("IDs com falhas:", falhas);
        await saveToJsonFile(falhas, 'falhas.json');
    }

    console.log(`Processamento concluído. Total de obras processadas: ${obrasComGeometria.length}`);
}

main().catch((error) => console.error("Erro na execução principal:", error.message));
