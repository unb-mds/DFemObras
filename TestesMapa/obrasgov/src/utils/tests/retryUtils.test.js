const axios = require('axios');
const { fetchWithRetry } = require('../retryUtils');

// Mock do axios para simular requisições
jest.mock('axios');

describe('fetchWithRetry', () => {
    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        jest.clearAllMocks();
    });

    test('deve retornar os dados na primeira tentativa com sucesso', async () => {
        const mockData = { success: true };
        axios.get.mockResolvedValue({ status: 200, data: mockData });

        const result = await fetchWithRetry('https://api.example.com/data');
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    test('deve tentar novamente após um erro 429 (Too Many Requests) e retornar os dados', async () => {
        const mockData = { success: true };
        const mockError429 = { response: { status: 429, headers: { 'retry-after': '1' } } };
        const mockSuccess = { status: 200, data: mockData };

        // Simula uma falha na primeira tentativa e sucesso na segunda
        axios.get.mockImplementationOnce(() => Promise.reject(mockError429))
              .mockImplementationOnce(() => Promise.resolve(mockSuccess));

        const result = await fetchWithRetry('https://api.example.com/data');
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('deve tentar novamente após um erro 503 (Service Unavailable) e retornar os dados', async () => {
        const mockData = { success: true };
        const mockError503 = { response: { status: 503, headers: { 'retry-after': '1' } } };
        const mockSuccess = { status: 200, data: mockData };

        // Simula uma falha na primeira tentativa e sucesso na segunda
        axios.get.mockImplementationOnce(() => Promise.reject(mockError503))
              .mockImplementationOnce(() => Promise.resolve(mockSuccess));

        const result = await fetchWithRetry('https://api.example.com/data');
        expect(result).toEqual(mockData);
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('deve lançar um erro após exceder o número máximo de tentativas', async () => {
        const mockError429 = { response: { status: 429, headers: { 'retry-after': '1' } } };

        // Simula falhas em todas as tentativas
        axios.get.mockRejectedValue(mockError429);

        await expect(fetchWithRetry('https://api.example.com/data', 3)).rejects.toThrow('Max retries exceeded');
        expect(axios.get).toHaveBeenCalledTimes(3);
    });

    test('deve usar um delay exponencial entre as tentativas', async () => {
        const mockError429 = { response: { status: 429 } }; // Sem cabeçalho 'retry-after'
        const mockSuccess = { status: 200, data: { success: true } };

        // Simula falhas nas primeiras tentativas e sucesso na última
        axios.get.mockImplementationOnce(() => Promise.reject(mockError429))
              .mockImplementationOnce(() => Promise.reject(mockError429))
              .mockImplementationOnce(() => Promise.resolve(mockSuccess));

        // Usa timers falsos para simular o tempo de espera
        jest.useFakeTimers();

        const startTime = Date.now();
        const fetchPromise = fetchWithRetry('https://api.example.com/data', 3);

        // Avança o tempo para simular os delays
        jest.advanceTimersByTime(1000); // Primeiro delay: 1s
        jest.advanceTimersByTime(2000); // Segundo delay: 2s

        const result = await fetchPromise;
        const endTime = Date.now();

        expect(result).toEqual({ success: true });
        expect(axios.get).toHaveBeenCalledTimes(3);

        // Verifica se o tempo total está dentro do esperado (delay exponencial)
        const elapsedTime = endTime - startTime;
        expect(elapsedTime).toBeGreaterThanOrEqual(1000 + 2000); // 1s + 2s (exponencial)

        // Restaura os timers reais
        jest.useRealTimers();
    });
});