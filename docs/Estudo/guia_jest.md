
# Guia de Introdução ao Jest

O **Jest** é um framework de testes JavaScript desenvolvido pelo Facebook. Ele é amplamente utilizado para testes de aplicações Node.js, React, e muito mais. Com suporte nativo a mocks, snapshots e cobertura de código, o Jest é uma escolha poderosa para testes em projetos modernos.

## Instalação

Para instalar o Jest no seu projeto, use o npm ou yarn:

```
npm install --save-dev jest
```

Ou:

```
yarn add --dev jest
```

Certifique-se de adicionar um script no seu `package.json` para rodar os testes:

```json
"scripts": {
  "test": "jest"
}
```

Para executar os testes, basta usar o comando:

```
npm test
```

## Estrutura Básica de Testes

### Convenção de Nomes

1. Os arquivos de teste devem ter a extensão `.test.js` ou `.spec.js` (por exemplo, `example.test.js`).
2. Os testes são agrupados em blocos `describe` e definidos com `test` ou `it`.

Exemplo:

```javascript
// example.test.js
function soma(a, b) {
  return a + b;
}

test('soma 1 + 2 para retornar 3', () => {
  expect(soma(1, 2)).toBe(3);
});
```

## Funcionalidades Principais

### 1. Testando Valores

O Jest fornece diversos métodos de asserção para verificar valores.

```javascript
test('verifica valores primitivos', () => {
  expect(1 + 1).toBe(2); // igualdade estrita
  expect({ nome: 'Alice' }).toEqual({ nome: 'Alice' }); // igualdade profunda
  expect(null).toBeNull();
  expect(5).toBeGreaterThan(4);
  expect('jest').toMatch(/jest/);
});
```

### 2. Testes Assíncronos

O Jest suporta testes assíncronos com `async/await`, Promises ou callbacks.

```javascript
async function fetchDados() {
  return { id: 1, nome: 'Alice' };
}

test('testa dados assíncronos', async () => {
  const dados = await fetchDados();
  expect(dados).toEqual({ id: 1, nome: 'Alice' });
});
```

### 3. Agrupando Testes

Você pode organizar testes com blocos `describe`.

```javascript
describe('Operações matemáticas', () => {
  test('soma 1 + 2 para retornar 3', () => {
    expect(1 + 2).toBe(3);
  });

  test('subtração 5 - 3 para retornar 2', () => {
    expect(5 - 3).toBe(2);
  });
});
```

### 4. Setup e Teardown

Configure o ambiente de teste com `beforeEach`, `afterEach`, `beforeAll` e `afterAll`.

```javascript
let contador = 0;

beforeEach(() => {
  contador += 1;
});

afterEach(() => {
  contador = 0;
});

test('verifica o contador', () => {
  expect(contador).toBe(1);
});
```

## Trabalhando com Mocks

### Funções Mock

O Jest facilita a criação de funções mock para substituir implementações reais.

```javascript
const mockFunc = jest.fn();

mockFunc.mockReturnValueOnce('resultado 1').mockReturnValue('resultado padrão');

test('testa função mock', () => {
  expect(mockFunc()).toBe('resultado 1'); // Primeira chamada
  expect(mockFunc()).toBe('resultado padrão'); // Segunda chamada
});
```

### Mock de Módulos

Use o Jest para mockar módulos inteiros.

```javascript
jest.mock('./api'); // Mocka o módulo `api.js`
const api = require('./api');

api.getDados.mockResolvedValue({ id: 1, nome: 'Alice' });

test('mocka chamada de API', async () => {
  const dados = await api.getDados();
  expect(dados).toEqual({ id: 1, nome: 'Alice' });
});
```

### Snapshot Testing

Snapshots permitem capturar o estado de um componente ou função para comparações futuras.

```javascript
test('usa snapshot', () => {
  const dados = { id: 1, nome: 'Alice' };
  expect(dados).toMatchSnapshot();
});
```

### Cobertura de Código

Para verificar a cobertura de código, execute:

```
npm test -- --coverage
```

Isso gera um relatório detalhado de quais partes do código foram testadas.

## Boas Práticas

- Escreva testes pequenos e focados.
- Use mocks para isolar dependências externas.
- Mantenha os snapshots atualizados com o comando `jest -u`.
- Integre o Jest no seu pipeline de CI/CD.

## Recursos Úteis

- [Documentação Oficial do Jest](https://jestjs.io/)
- [API do Jest](https://jestjs.io/docs/api)
