document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://dfemobras-caiomelo25-caiomelo25s-projects.vercel.app/obras');
        const result = await response.json();
        const obras = result.data;

        // 1. Configurações Visuais 
        const coresPins = {
            'Em execução': '#133E79',  
            'Concluída': '#008040',    
            'Cadastrada': '#FFFF00',   
            'Paralisada': '#D62828',   
            'Cancelada': '#808080',    
            'Inativada': '#F77F00'    
        };

        // 2. Definição das Faixas de Valor
        const faixas = [
            { label: 'Até 100k', min: 0, max: 100000 },
            { label: '100k - 500k', min: 100001, max: 500000 },
            { label: '500k - 1M', min: 500001, max: 1000000 },
            { label: '1M - 5M', min: 1000001, max: 5000000 },
            { label: 'Acima de 5M', min: 5000001, max: Infinity }
        ];

        // 3. Variáveis de Processamento
        let totalInvestido = 0;
        let obrasAlerta = 0;
        const contagemSituacao = {};
        const contagemPorFaixa = faixas.map(() => 0);

        obras.forEach(obra => {
            const sit = obra.obra_situacao || 'Outros';
            const valor = parseFloat(obra.valor_estimado) || 0;

            // Soma para o Card de Total
            totalInvestido += valor;

            // Conta para o Gráfico de Pizza
            contagemSituacao[sit] = (contagemSituacao[sit] || 0) + 1;

            // Conta para os Alertas
            if (sit === 'Paralisada' || sit === 'Inativada') obrasAlerta++;

            // Classifica na Faixa de Valor (Histograma)
            faixas.forEach((faixa, index) => {
                if (valor >= faixa.min && valor <= faixa.max) {
                    contagemPorFaixa[index]++;
                }
            });
        });

        // 5. Atualização dos Cards Superiores
        document.getElementById('total-investimento').innerText = 
            totalInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('contagem-alerta').innerText = obrasAlerta;

        // 6. Renderização do Gráfico de Pizza (Volume por Situação)
        new Chart(document.getElementById('pizzaSituacao'), {
            type: 'pie',
            data: {
                labels: Object.keys(contagemSituacao),
                datasets: [{
                    data: Object.values(contagemSituacao),
                    backgroundColor: Object.keys(contagemSituacao).map(s => coresPins[s] || '#ccc'),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });

        // 7. Renderização do Gráfico de Barras (Histograma de Quantidade)
        new Chart(document.getElementById('barrasValores'), {
            type: 'bar',
            data: {
                labels: faixas.map(f => f.label),
                datasets: [{
                    label: 'Quantidade de Obras',
                    data: contagemPorFaixa,
                    backgroundColor: 'rgba(19, 62, 121, 0.8)', 
                    borderColor: '#133E79',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'Número de Obras' }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro no Dashboard:', error);
        document.querySelector('.dashboard-container').innerHTML = 
            '<p style="text-align:center; padding:50px;">Erro ao carregar dados da API.</p>';
    }
});