const {
    formatarBRL,
    criarIconesDosPins,
    verificarResposta,
    gerarConteudoDoPopup,
    obterIconeDoMarcador,
    processarDadosDasObras
} = require('./map');

// Mock do Leaflet
global.L = {
    marker: jest.fn((coords, options) => {
        // Cria um objeto marcador com os métodos addTo e bindPopup
        const marcador = {
            addTo: jest.fn(() => marcador), // Retorna o próprio marcador para possibilitar o encadeamento
            bindPopup: jest.fn()
        };
        return marcador;
    }),
    icon: jest.fn()
};

// Configura o mock de L.icon para retornar o próprio objeto de configuração
global.L.icon.mockImplementation((config) => config);

// Mock do fetch
global.fetch = jest.fn();

// Mock do document
global.document = {
    getElementById: jest.fn(() => ({})),
    addEventListener: jest.fn()
};

describe('Testes das funções do mapa', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('formatarBRL formata valores corretamente', () => {
        expect(formatarBRL(1500.50)).toBe('R$1.500,50');
    });

    test('criarIconesDosPins cria ícones corretamente', () => {
        const icones = criarIconesDosPins();
        expect(icones).toHaveProperty('concluida');
        expect(L.icon).toHaveBeenCalledTimes(4);
    });

    test('verificarResposta lança erro para resposta não OK', () => {
        const resOk = { ok: true };
        const resNok = { ok: false };
        expect(() => verificarResposta(resNok)).toThrow();
        expect(verificarResposta(resOk)).toBe(resOk);
    });

    test('obterIconeDoMarcador retorna ícone correto', () => {
        const icones = criarIconesDosPins();
        expect(obterIconeDoMarcador('Concluída', icones)).toBe(icones.concluida);
        expect(obterIconeDoMarcador('Invalid', icones)).toBeNull();
    });

    test('gerarConteudoDoPopup gera HTML válido', () => {
        const conteudo = gerarConteudoDoPopup('Obra Teste', 'Concluída', 'R$1.000,00');
        expect(conteudo).toContain('<h3>Obra Teste</h3>');
        expect(conteudo).toContain('R$1.000,00');
    });

    test('processarDadosDasObras processa dados corretamente', () => {
        const dadosMock = [{
            nome: 'Obra Teste',
            situacao: 'Concluída',
            latitude: -15.8,
            longitude: -47.8,
            fontesDeRecurso: [{ valorInvestimentoPrevisto: 1000 }]
        }];
        
        const mapaMock = {};
        processarDadosDasObras(dadosMock, mapaMock);
        expect(L.marker).toHaveBeenCalled();
    });
});
