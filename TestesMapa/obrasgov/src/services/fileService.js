const fs = require('fs');

function saveToJsonFile(data, filename) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Dados salvos no arquivo ${filename}`);
    } catch (error) {
        console.error(`Erro ao salvar o arquivo ${filename}:`, error.message);
    }
}

module.exports = {
    saveToJsonFile
};