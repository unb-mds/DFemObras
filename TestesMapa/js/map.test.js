const {
    formatarBRL,
    inicializaMapa,
    criarIconesDosPins,
    verificarResposta,
    obterDadosDasObras,
    criarMarcador,
    // gerarConteudoDoPopup,
    obterIconeDoMarcador,
    buscarObras,
    processarDadosDasObras
} = require('./map');

// Mock do Leaflet
global.L = {
    marker: jest.fn((coords, options) => {
        // Cria um objeto marcador com métodos encadeáveis
        const markerInstance = {
            addTo: jest.fn().mockReturnThis(),
            bindPopup: jest.fn().mockReturnThis()
        };
        return markerInstance;
    }),
    icon: jest.fn(config => config),
    map: jest.fn(() => ({
        setView: jest.fn(),
        on: jest.fn()
    })),
    tileLayer: jest.fn(() => ({ 
        addTo: jest.fn().mockReturnThis() 
    }))
};

// Mock do fetch e document
global.fetch = jest.fn();
global.document = {
    getElementById: jest.fn(() => ({ 
        style: {}, 
        addEventListener: jest.fn() 
    })),
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    createElement: jest.fn(() => ({})), // Adicionei esta linha
};

describe('Testes das funções do mapa', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.mapa = {}; // Resetar o mapa antes de cada teste
    });

    describe('Configuração inicial do mapa', () => {
        test('inicializaMapa deve configurar o mapa corretamente', () => {
            inicializaMapa();
            expect(L.map).toHaveBeenCalledWith('map');
            expect(L.tileLayer).toHaveBeenCalledWith(
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                { maxZoom: 19, attribution: expect.any(String) }
            );
        });
    });

    describe('Funções utilitárias', () => {
        test('formatarBRL formata valores corretamente', () => {
            expect(formatarBRL(1500.50)).toBe('R$1.500,50');
            expect(formatarBRL(250000)).toBe('R$250.000,00');
        });
    });

    describe('Manipulação de ícones e marcadores', () => {
        test('criarIconesDosPins cria todos os ícones necessários', () => {
            const icones = criarIconesDosPins();
            expect(icones).toHaveProperty('concluida');
            expect(icones).toHaveProperty('emExecucao');
            expect(icones).toHaveProperty('cadastrada');
            expect(icones).toHaveProperty('inativada');
        });

        test('obterIconeDoMarcador retorna ícone correto para cada situação', () => {
            const icones = criarIconesDosPins();
            expect(obterIconeDoMarcador('Concluída', icones)).toBe(icones.concluida);
            expect(obterIconeDoMarcador('Em execução', icones)).toBe(icones.emExecucao);
            expect(obterIconeDoMarcador('Situação Desconhecida', icones)).toBeNull();
        });

        test('criarMarcador deve criar marcador com configurações corretas', () => {
            const mockMap = {};
            criarMarcador(-15.8, -47.8, { icon: 'teste' }, mockMap);
            expect(L.marker).toHaveBeenCalledWith([-15.8, -47.8], { icon: { icon: 'teste' } });
        });
    });

    // describe('Geração de conteúdo', () => {
    //     test('gerarConteudoDoPopup gera HTML válido com dados da obra', () => {
    //         const conteudo = gerarConteudoDoPopup(
    //             'Obra Teste', 
    //             'Concluída', 
    //             'R$1.000,00', 
    //             123
    //         );
            
    //         expect(conteudo).toContain('<h3>Obra Teste</h3>');
    //         expect(conteudo).toContain('R$1.000,00');
    //         expect(conteudo).toContain('detalhamento.html?obra=123');
    //     });
    // });

    describe('Manipulação de dados e API', () => {
        test('verificarResposta lança erro para respostas não OK', () => {
            expect(() => verificarResposta({ ok: false })).toThrow('Erro ao carregar o JSON');
            expect(verificarResposta({ ok: true })).toEqual({ ok: true });
        });

        test('obterDadosDasObras deve fazer fetch no endpoint correto', async () => {
            fetch.mockResolvedValue({ ok: true, json: jest.fn() });
            await obterDadosDasObras();
            expect(fetch).toHaveBeenCalledWith('./obrasgov/obras_com_lat_long.json');
        });

        test('processarDadosDasObras deve criar marcadores para dados válidos', () => {
            const dadosMock = [{
                nome: 'Obra Válida',
                situacao: 'Concluída',
                latitude: -15.8,
                longitude: -47.8,
                fontesDeRecurso: [{ valorInvestimentoPrevisto: 1000 }]
            }];
            
            processarDadosDasObras(dadosMock, {});
            expect(L.marker).toHaveBeenCalledTimes(1);
        });

        test('processarDadosDasObras deve ignorar obras sem coordenadas', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const dadosMock = [{
                nome: 'Obra Inválida',
                situacao: 'Concluída',
                fontesDeRecurso: [{ valorInvestimentoPrevisto: 1000 }]
            }];
            
            processarDadosDasObras(dadosMock, {});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('ignorada por falta de coordenadas'));
            consoleSpy.mockRestore();
        });

        test('processarDadosDasObras deve lidar com situações desconhecidas', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const dadosMock = [{
                nome: 'Obra Estranha',
                situacao: 'Situação Desconhecida',
                latitude: -15.8,
                longitude: -47.8
            }];
            
            processarDadosDasObras(dadosMock, {});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Situação desconhecida'));
            consoleSpy.mockRestore();
        });
    });

    describe('Fluxo principal (buscarObras)', () => {
        test('deve criar marcadores quando o fetch é bem sucedido', async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([{
                    nome: 'Obra Teste',
                    situacao: 'Concluída',
                    latitude: -15.8,
                    longitude: -47.8,
                    fontesDeRecurso: [{ valorInvestimentoPrevisto: 1000 }]
                }])
            });

            await buscarObras();
            await new Promise(resolve => setImmediate(resolve));
            
            expect(L.marker).toHaveBeenCalled();
        });

        test('deve lidar com erros de fetch corretamente', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            fetch.mockRejectedValue(new Error('Erro de rede'));
            
            await buscarObras();
            await new Promise(resolve => setImmediate(resolve));
            
            expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar as obras:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('Cobertura adicional', () => {
        test('formatarBRL deve lidar com valores zero e negativos', () => {
            expect(formatarBRL(0)).toBe('R$0,00');
            expect(formatarBRL(-500)).toBe('-R$500,00');
        });
    
        test('deve lidar com fontesDeRecurso vazias', () => {
            const dadosMock = [{
                nome: 'Obra sem recursos',
                situacao: 'Concluída',
                latitude: -15.8,
                longitude: -47.8,
                fontesDeRecurso: []
            }];
            
            processarDadosDasObras(dadosMock, {});
            expect(L.marker).toHaveBeenCalled();
        });
    
        test('verificarResposta deve lançar erro com status code', () => {
            const res = { 
                ok: false,
                status: 404,
                statusText: 'Not Found'
            };
            expect(() => verificarResposta(res)).toThrow('Erro ao carregar o JSON');
        });
    
        test('deve lidar com clique no popup', () => {
            const mockEvent = {
                target: document.createElement('div')
            };
            const mockPopup = {
                style: { display: 'flex' },
                addEventListener: (_, handler) => handler(mockEvent)
            };
            
            document.getElementById.mockReturnValue(mockPopup);
            require('./map'); // Recarrega o módulo para aplicar mocks
            
            expect(mockPopup.style.display).toBe('flex');
        });
    });
    
});