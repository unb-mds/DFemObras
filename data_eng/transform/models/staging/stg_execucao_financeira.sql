WITH source AS (
    SELECT * FROM {{ source('obras_gov', 'raw_execucao_financeira') }}
),

renamed_and_casted AS (
    SELECT
        CAST(idProjetoInvestimento AS VARCHAR) AS id_obra,

        CAST(valorEmpenho AS DOUBLE) AS valor_empenho,

        CAST(numeroNotaEmpenhoGerada AS VARCHAR) AS numero_nota_empenho,
        CAST(numeroProcesso AS VARCHAR) AS numero_processo,
        
        descricaoEmpenho AS descricao_empenho,
        nomeEsferaOrcamentaria AS esfera_orcamentaria,
        nomeFavorecido AS nome_empresa_favorecida,
        autorEmenda AS autor_emenda

    FROM source
    WHERE idProjetoInvestimento IS NOT NULL
)

SELECT * FROM renamed_and_casted