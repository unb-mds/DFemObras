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
        try_cast(fontesDeRecurso[1].valorInvestimentoPrevisto as FLOAT) as valor_estimado,
        try_cast(qdtEmpregosGerados as INTEGER) as empregos_gerados,
        try_cast(populacaoBeneficiada as INTEGER) as populacao_beneficiada,

        try_cast(regexp_extract(geometriaWkt, 'POINT \(([-\d.]+) ([-\d.]+)\)', 1) as FLOAT) as longitude,
        try_cast(regexp_extract(geometriaWkt, 'POINT \(([-\d.]+) ([-\d.]+)\)', 2) as FLOAT) as latitude,

        cep,
        endereco,
        uf,
        especie,
        natureza,
        isModeladaPorBim as is_bim,
        fontesDeRecurso as fontes_recurso,
        executores,
        subTipos as sub_tipos,

        row_number() over (
            partition by idUnico 
            order by dataSituacao desc, dataCadastro desc
        ) as row_num

    from raw_data
    where nome not ilike '%Ronald%'
      and idUnico is not null
)

select * exclude (row_num)
from renamed
where longitude is not null 
  and latitude is not null
  and row_num = 1 
  and (data_fim_prevista is null or data_fim_prevista >= data_inicio_prevista)