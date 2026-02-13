with raw_data as (
    select * from {{ source('obras_gov', 'raw_obras') }}
),

renamed as (
    select
        idUnico as obra_id,
        nome as obra_nome,
        situacao as obra_situacao,
        
        try_cast(dataInicialPrevista as DATE) as data_inicio_prevista,
        try_cast(dataFinalPrevista as DATE) as data_fim_prevista,
        try_cast(dataCadastro as DATE) as data_cadastro,
        try_cast(dataSituacao as DATE) as data_situacao_atual,

        try_cast(qdtEmpregosGerados as INTEGER) as empregos_gerados,
        try_cast(populacaoBeneficiada as INTEGER) as populacao_beneficiada,

        regexp_extract(geometriaWkt, 'POINT \(([-\d.]+) ([-\d.]+)\)', 1)::FLOAT as longitude,
        regexp_extract(geometriaWkt, 'POINT \(([-\d.]+) ([-\d.]+)\)', 2)::FLOAT as latitude,

        cep,
        endereco,
        uf,

        especie,
        natureza,
        isModeladaPorBim as is_bim,
        
        fontesDeRecurso as fontes_recurso,
        executores,
        subTipos as sub_tipos

    from raw_data
    where nome not ilike '%Ronald%'
      and obra_id is not null
)

select * from renamed