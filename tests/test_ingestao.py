import pandas as pd
from data_eng.ingestion.ingestao_obras import process_obras_dataframe

def test_process_obras_dataframe_cleans_nans():
    dados_sujos = [
        {"idUnico": "1", "nome": "Obra 1", "situacao": "nan"},
        {"idUnico": "2", "nome": "Obra 2", "situacao": "None"}
    ]
    
    df = process_obras_dataframe(dados_sujos)
    
    assert df.iloc[0]['situacao'] is None
    assert df.iloc[1]['situacao'] is None
    assert len(df) == 2