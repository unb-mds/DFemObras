const fs = require('fs');
const { saveToJsonFile } = require('../fileService');

jest.mock('fs'); // Mock do módulo fs

describe('fileService', () => {
    test('deve salvar dados em um arquivo JSON com sucesso', () => {
        const data = [{ id: 1, nome: 'Obra 1' }];
        const filename = 'test.json';

        saveToJsonFile(data, filename);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            filename,
            JSON.stringify(data, null, 2),
            'utf-8'
        );
    });

    test('deve lidar com erro ao salvar arquivo JSON', () => {
        const data = [{ id: 1, nome: 'Obra 1' }];
        const filename = 'test.json';

        fs.writeFileSync.mockImplementation(() => {
            throw new Error('Erro ao salvar arquivo');
        });

        expect(() => saveToJsonFile(data, filename)).not.toThrow();
    });
});