# Dashboard - Agenda Fácil

Dashboard em Streamlit para análise exploratória e métricas comerciais.

## Como rodar

```powershell
cd dashboard
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run app.py
```

## Estrutura

- `app.py`: aplicação principal do dashboard
- `data_generator.py`: geração dos dados fictícios usados na demo
- `requirements.txt`: dependências mínimas
- `.streamlit/config.toml`: tema e configuração visual
