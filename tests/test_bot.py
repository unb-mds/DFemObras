from Bots.bot_twitter import build_prompt


def test_build_prompt_correct_formatting():
    mock_data = {
        "total_obras": 100,
        "investimento_total": 2500000000, 
        "top_5_atrasadas": [
            ("Hospital de Brazlândia", 10000000.0, "2023-12-31"),
            ("Viaduto da Estrutural", 5000000.0, "2024-01-01")
        ]
    }
    
    prompt = build_prompt(mock_data)
    
    assert "100 obras" in prompt
    assert "2.5 bilhões" in prompt
    assert "Hospital de Brazlândia" in prompt
    assert "@Gov_DF" in prompt
    assert "https://unb-mds.github.io/DFemObras/" in prompt

def test_build_prompt_empty_ranking():
    mock_data = {
        "total_obras": 0,
        "investimento_total": 0,
        "top_5_atrasadas": []
    }
    prompt = build_prompt(mock_data)
    assert "0 obras" in prompt
    assert "0.0 bilhões" in prompt