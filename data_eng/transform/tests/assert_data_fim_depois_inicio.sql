select
    obra_id,
    data_inicio_prevista,
    data_fim_prevista
from {{ ref('stg_obras_completas') }}
where data_fim_prevista < data_inicio_prevista