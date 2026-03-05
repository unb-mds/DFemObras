WITH pagamentos AS (
    SELECT * FROM {{ ref('stg_execucao_financeira') }}
)

SELECT
    id_obra,
    COUNT(1) AS quantidade_empenhos,
    
    SUM(valor_empenho) AS valor_total_pago
FROM pagamentos
GROUP BY 1