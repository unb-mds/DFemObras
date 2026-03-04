WITH obras AS (
    SELECT * FROM {{ ref('stg_obras_completas') }} 
),

financeiro AS (
    SELECT * FROM {{ ref('int_pagamentos_por_obra') }}
)

SELECT
    o.*,
    
    COALESCE(f.quantidade_empenhos, 0) AS quantidade_empenhos,
    COALESCE(f.valor_total_pago, 0) AS valor_total_pago,
    
    ROUND(
        (f.valor_total_pago / NULLIF(o.valor_estimado, 0)) * 100, 2
    ) AS percentual_pago

FROM obras o
LEFT JOIN financeiro f 
    ON o.obra_id = f.id_obra