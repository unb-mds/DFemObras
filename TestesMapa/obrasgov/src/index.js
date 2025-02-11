const pLimit = require('p-limit');
const apiService = require('./services/apiService');
const fileService = require('./services/fileService');
const obraModel = require('./models/obraModel');

const limit = pLimit(1); // Limitar a 1 requisição simultânea para reduzir carga
const falhas = []; // Armazena IDs de obras com falha

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
        const response = await apiService.fetchObrasPorUF(uf, pagina, tamanhoDaPagina);
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
                    const obraProcessada = await obraModel.processObra(obra);
                    return obraProcessada;
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
    await fileService.saveToJsonFile(obrasComGeometria, 'obras_com_lat_long.json');

    if (falhas.length > 0) {
        console.log("IDs com falhas:", falhas);
        await fileService.saveToJsonFile(falhas, 'falhas.json');
    }

    console.log(`Processamento concluído. Total de obras processadas: ${obrasComGeometria.length}`);
}

main().catch((error) => console.error("Erro na execução principal:", error.message));