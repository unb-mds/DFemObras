document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://dfemobras-fw923fvm3-caiomelo25s-projects.vercel.app/obras');
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }

        const obras = result.data || result;

        const coresPins = {
            'Em execução': '#133E79',  
            'Concluída': '#008040',    
            'Cadastrada': '#FFFF00',   
            'Paralisada': '#D62828',   
            'Cancelada': '#808080',    
            'Inativada': '#F77F00'    
        };

        const faixas = [
            { label: 'Até 100k', min: 0, max: 100000 },
            { label: '100k - 500k', min: 100001, max: 500000 },
            { label: '500k - 1M', min: 500001, max: 1000000 },
            { label: '1M - 5M', min: 1000001, max: 5000000 },
            { label: 'Acima de 5M', min: 5000001, max: Infinity }
        ];

        let totalInvestido = 0;
        let obrasAlerta = 0;
        const contagemSituacao = {};
        const contagemPorFaixa = faixas.map(() => 0);

        obras.forEach(obra => {
            const sit = obra.obra_situacao || 'Outros';
            const valor = parseFloat(obra.valor_estimado) || 0;

            totalInvestido += valor;

            contagemSituacao[sit] = (contagemSituacao[sit] || 0) + 1;

            if (sit === 'Paralisada' || sit === 'Inativada') obrasAlerta++;

            faixas.forEach((faixa, index) => {
                if (valor >= faixa.min && valor <= faixa.max) {
                    contagemPorFaixa[index]++;
                }
            });
        });

        document.getElementById('total-investimento').innerText = 
            totalInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('contagem-alerta').innerText = obrasAlerta;

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

        const obrasComSobrecusto = obras.filter(obra => (obra.percentual_pago || 0) > 100);
        obrasComSobrecusto.sort((a, b) => b.percentual_pago - a.percentual_pago);
        
        const top10 = obrasComSobrecusto.slice(0, 10);

        const labelsSobrecusto = top10.map(obra => {
            let nome = obra.obra_nome || 'Obra sem nome';
            return nome.length > 45 ? nome.substring(0, 45) + '...' : nome;
        });
        const dadosSobrecusto = top10.map(obra => Math.round(obra.percentual_pago));

        new Chart(document.getElementById('barrasSobrecusto'), {
            type: 'bar',
            data: {
                labels: labelsSobrecusto,
                datasets: [{
                    label: '% pago',
                    data: dadosSobrecusto,
                    backgroundColor: '#d62828', 
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', 
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.raw}% do orçamento inicial pago`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'Percentual Pago (%)' }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro no Dashboard:', error);
        document.querySelector('.dashboard-container').innerHTML = 
            '<p style="text-align:center; padding:50px; color:#d62828; font-weight:bold;">Erro ao carregar dados da API. Verifique o console.</p>';
    }
});