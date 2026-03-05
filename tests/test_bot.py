from Bots.bot_twitter import build_prompt


def test_build_prompt_correct_formatting():
    mock_data = {
        "total_obras": 100,
        "investimento_total": 2500000000,
        "top_3_sobrecusto": [
            ("Hospital de Brazlândia", 10000000.0, 15000000.0, 150.0),
            ("Viaduto da Estrutural", 5000000.0, 6000000.0, 120.0)
        ]
    }
    
    prompt = build_prompt(mock_data)
    
    assert "Hospital de Brazlândia" in prompt
    assert "15.0M" in prompt
    assert "150%" in prompt
    assert "2.5 bi" in prompt

def test_build_prompt_empty_ranking():
    mock_data = {
        "total_obras": 0,
        "investimento_total": 0,
        "top_3_sobrecusto": []
    }
    prompt = build_prompt(mock_data)
    
    assert "Monitoramos 0 obras" in prompt