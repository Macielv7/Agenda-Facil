import random
import pandas as pd
from datetime import datetime, timedelta

# Dicionário de mapeamento dos meses em português para o número correspondente (1 a 12)
MESES_MAP = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
}

# Domínios definidos nas regras de negócio
VENDEDORES = [
    'Alexandre Borba', 'Camila Resende', 'Fernanda Castelo', 
    'Patrícia Vasconcelos', 'Ricardo Magalhães', 'Tiago Drummond'
]

REGIOES = ['Centro-Oeste', 'Nordeste', 'Norte', 'Sudeste', 'Sul']

PRODUTOS = ['Anel Ouro', 'Anel Prata', 'Pingente', 'Pulseira Ouro']

FORMAS_PAGAMENTO = ['Boleto Bancário', 'Cartão de Crédito', 'Pix']

ANOS = [2019, 2020, 2021]

# Faixas de preço realistas por produto para simular dados mais ricos
PRODUTO_PRECOS = {
    'Anel Ouro': (1200.0, 3200.0),
    'Anel Prata': (150.0, 500.0),
    'Pingente': (180.0, 850.0),
    'Pulseira Ouro': (2200.0, 5800.0)
}

# Lista robusta de clientes brasileiros caso o Faker não esteja disponível ou para fallback rápido
FALLBACK_CLIENTES = [
    'Saulo Lacerda', 'Aline Ferreira', 'Bruno Vasconcelos', 'Clara Mendonça',
    'Eduardo Rocha', 'Fernanda Souza', 'Gustavo Lima', 'Helena Castro',
    'Igor Nogueira', 'Juliana Ramos', 'Lucas Martins', 'Mariana Oliveira',
    'Otávio Rezende', 'Priscila Costa', 'Rodrigo Alves', 'Beatriz Santos',
    'Gabriel Pires', 'Larissa Cavalcanti', 'Thiago Moreira', 'Vanessa Dias',
    'Felipe Mello', 'Camila Pinto', 'Leonardo Teixeira', 'Amanda Cunha',
    'Rafael Ribeiro', 'Letícia Fonseca', 'Matheus Carvalho', 'Gabriela Gomes'
]

def generate_mock_data(n_records: int = 400) -> pd.DataFrame:
    """
    Gera programaticamente um conjunto de dados simulados contendo registros completos
    que respeitam estritamente a estrutura e regras de negócio.
    
    Esta função está completamente isolada da renderização visual do Streamlit,
    permitindo substituição direta por chamadas de API reais.
    
    Parameters:
    n_records (int): Número de registros a serem gerados (padrão 400, aceita entre 300 e 500).
    
    Returns:
    pd.DataFrame: DataFrame pandas contendo os dados gerados.
    """
    # Garantir que o número de registros está no intervalo solicitado
    if not (300 <= n_records <= 500):
        n_records = random.randint(300, 500)
        
    # Tenta importar o Faker para nomes de clientes mais variados
    try:
        from faker import Faker
        fake = Faker('pt_BR')
        use_faker = True
    except ImportError:
        use_faker = False

    data_list = []
    
    # Garantir semente fixa para reprodutibilidade das simulações nas demonstrações acadêmicas,
    # mas mantendo a variedade.
    random.seed(42)
    
    for _ in range(n_records):
        # Escolhe ano e mês de forma aleatória e uniforme
        ano = random.choice(ANOS)
        mes = random.choice(list(MESES_MAP.keys()))
        mes_num = MESES_MAP[mes]
        
        # Determinar o último dia do mês para gerar uma data válida
        if mes_num in [4, 6, 9, 11]:
            ultimo_dia = 30
        elif mes_num == 2:
            # Ano bissexto para 2020
            ultimo_dia = 29 if ano == 2020 else 28
        else:
            ultimo_dia = 31
            
        dia = random.randint(1, ultimo_dia)
        
        # Criar a data no formato YYYY-MM-DD
        data_obj = datetime(ano, mes_num, dia)
        data_str = data_obj.strftime("%Y-%m-%d")
        
        # Seleções aleatórias baseadas nos domínios
        vendedor = random.choice(VENDEDORES)
        regiao = random.choice(REGIOES)
        produto = random.choice(PRODUTOS)
        forma_pagamento = random.choice(FORMAS_PAGAMENTO)
        
        # Gerar nome do cliente usando Faker ou lista de fallback
        if use_faker:
            # Garante formato apenas de primeiro e último nome para limpeza visual
            cliente = fake.first_name() + " " + fake.last_name()
        else:
            cliente = random.choice(FALLBACK_CLIENTES)
            
        # Calcular valor realista baseado no produto
        preco_min, preco_max = PRODUTO_PRECOS[produto]
        # Arredonda para valores múltiplos de 10 ou 50 para parecer mais realista comercialmente
        valor = round(random.uniform(preco_min, preco_max) / 10.0) * 10.0
        
        data_list.append({
            'data': data_str,
            'ano': ano,
            'mes': mes,
            'vendedor': vendedor,
            'cliente': cliente,
            'regiao': regiao,
            'produto': produto,
            'valor': valor,
            'forma_pagamento': forma_pagamento
        })
        
    # Ordenar o dataframe por data para consistência cronológica geral
    df = pd.DataFrame(data_list)
    df = df.sort_values(by='data').reset_index(drop=True)
    
    return df

if __name__ == '__main__':
    # Teste rápido do script de geração
    test_df = generate_mock_data(400)
    print(f"Geração de dados de teste concluída com sucesso!")
    print(f"Total de registros: {len(test_df)}")
    print(test_df.head(5))
