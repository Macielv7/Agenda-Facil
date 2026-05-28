import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from data_generator import generate_mock_data

# ==============================================================================
# CONFIGURAÇÕES DA PÁGINA
# ==============================================================================
st.set_page_config(
    page_title="Dashboard de Vendas Premium | Agenda Fácil",
    page_icon="💎",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# CSS CUSTOMIZADO - DESIGN SYSTEM & PREMIUM UI/UX
# ==============================================================================
def apply_custom_css():
    """
    Injeta estilos CSS personalizados na página para obter uma estética Dark Mode 
    premium, com efeitos de glow, cards arredondados e fontes modernas.
    """
    st.markdown("""
        <style>
        /* Importação de fonte moderna */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        
        /* Modificações globais de fonte */
        html, body, [class*="css"], .stMarkdown {
            font-family: 'Outfit', sans-serif;
        }
        
        /* Ajuste do fundo geral do Streamlit */
        .stApp {
            background-color: #0f0f1a;
            color: #ffffff;
        }
        
        /* Estilização da Sidebar */
        section[data-testid="stSidebar"] {
            background-color: #1a1a2e !important;
            border-right: 1px solid #18697a;
        }
        
        section[data-testid="stSidebar"] .stMarkdown h1, 
        section[data-testid="stSidebar"] .stMarkdown h2, 
        section[data-testid="stSidebar"] .stMarkdown h3 {
            color: #10c291 !important;
            font-weight: 700;
        }

        /* Estilização de títulos de seções */
        .section-title {
            color: #ffffff;
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid #10c291;
            padding-left: 10px;
        }
        
        /* Estilização de containers de KPI Premium */
        .kpi-container {
            background-color: #1a1a2e;
            border: 1px solid #18697a;
            border-radius: 12px;
            padding: 22px 18px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            margin-bottom: 10px;
        }
        
        .kpi-container:hover {
            border-color: #10c291;
            box-shadow: 0 6px 20px rgba(16, 194, 145, 0.2);
            transform: translateY(-3px);
        }
        
        .kpi-title {
            color: #a0a0c0;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 8px;
        }
        
        .kpi-value {
            color: #ffffff;
            font-size: 1.85rem;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .kpi-trend {
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        /* Estilização estilosa para os boxes do Plotly no Streamlit */
        .element-container iframe {
            border-radius: 12px !important;
        }
        
        /* Customização dos expanders de dados */
        .streamlit-expanderHeader {
            background-color: #1a1a2e !important;
            border: 1px solid #18697a !important;
            border-radius: 8px !important;
            color: #ffffff !important;
            font-weight: 600 !important;
        }

        .streamlit-expanderContent {
            background-color: #111124 !important;
            border: 1px solid #18697a !important;
            border-top: none !important;
            border-radius: 0 0 8px 8px !important;
        }
        </style>
    """, unsafe_allow_html=True)

# ==============================================================================
# CARREGAMENTO DOS DADOS (COM CACHE)
# ==============================================================================
@st.cache_data
def load_data(n_registros: int = 400) -> pd.DataFrame:
    """
    Função de carregamento e formatação inicial dos dados, utilizando cache
    para garantir alta performance na navegação e filtragem.
    """
    # Gera os dados através do módulo gerador isolado
    df = generate_mock_data(n_registros)
    
    # Define a ordem categórica correta para os meses
    ordem_meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
    df['mes'] = pd.Categorical(df['mes'], categories=ordem_meses, ordered=True)
    
    # Conversão do campo de data para datetime se necessário para ordenações
    df['data'] = pd.to_datetime(df['data'])
    
    return df

# ==============================================================================
# FILTRAGEM DINÂMICA
# ==============================================================================
def filter_data(df: pd.DataFrame, anos_sel: list, regioes_sel: list, vendedores_sel: list) -> pd.DataFrame:
    """
    Aplica os filtros dinâmicos selecionados na barra lateral.
    Se nenhuma opção for selecionada para um filtro, assume que todas as opções estão ativas.
    """
    df_filtrado = df.copy()
    
    if anos_sel:
        df_filtrado = df_filtrado[df_filtrado['ano'].isin(anos_sel)]
    if regioes_sel:
        df_filtrado = df_filtrado[df_filtrado['regiao'].isin(regioes_sel)]
    if vendedores_sel:
        df_filtrado = df_filtrado[df_filtrado['vendedor'].isin(vendedores_sel)]
        
    return df_filtrado

# ==============================================================================
# FUNÇÃO PRINCIPAL DA APLICAÇÃO
# ==============================================================================
def main():
    # Injeta a folha de estilo customizada
    apply_custom_css()
    
    # Título do App com gradiente e logo premium
    st.markdown("""
        <div style='display: flex; align-items: center; gap: 15px; margin-bottom: 25px;'>
            <div style='background: linear-gradient(135deg, #10c291 0%, #5170ff 100%); 
                        padding: 10px 14px; border-radius: 12px; font-size: 1.8rem; box-shadow: 0 4px 15px rgba(16, 194, 145, 0.4);'>
                💎
            </div>
            <div>
                <h1 style='margin: 0; font-size: 2.1rem; font-weight: 700; background: linear-gradient(90deg, #ffffff 0%, #a0a0c0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>
                    SalesInsight Premium
                </h1>
                <p style='margin: 0; color: #10c291; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.5px;'>
                    DASHBOARD DE ANÁLISE EXPLORATÓRIA & MÉTRICAS COMERCIAIS
                </p>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    # Carrega os dados base
    df_base = load_data(450)  # Gera 450 registros fictícios robustos
    
    # ==========================================================================
    # 1. BARRA LATERAL (SIDEBAR) - FILTROS DINÂMICOS
    # ==========================================================================
    st.sidebar.markdown("""
        <div style='text-align: center; margin-bottom: 20px;'>
            <h2 style='margin: 0; font-size: 1.6rem;'>Filtros Globais</h2>
            <p style='margin: 0; color: #a0a0c0; font-size: 0.8rem;'>Personalize sua análise em tempo real</p>
        </div>
        <hr style='border: 0.5px solid #18697a; margin-bottom: 25px;'>
    """, unsafe_allow_html=True)
    
    # Obter opções dinâmicas dos dados
    opcoes_anos = sorted(df_base['ano'].unique().tolist())
    opcoes_regioes = sorted(df_base['regiao'].unique().tolist())
    opcoes_vendedores = sorted(df_base['vendedor'].unique().tolist())
    
    # Widgets de Filtros (Multiselect)
    anos_selecionados = st.sidebar.multiselect(
        "Selecione os Anos:",
        options=opcoes_anos,
        placeholder="Todos os Anos"
    )
    
    regioes_selecionadas = st.sidebar.multiselect(
        "Selecione as Regiões:",
        options=opcoes_regioes,
        placeholder="Todas as Regiões"
    )
    
    vendedores_selecionados = st.sidebar.multiselect(
        "Selecione os Vendedores:",
        options=opcoes_vendedores,
        placeholder="Todos os Vendedores"
    )
    
    # Nota explicativa na barra lateral
    st.sidebar.markdown("""
        <br><br>
        <hr style='border: 0.5px solid #18697a; margin-bottom: 15px;'>
        <div style='background-color: #111124; padding: 12px; border-radius: 8px; border-left: 3px solid #18697a;'>
            <p style='margin: 0; font-size: 0.75rem; color: #a0a0c0; line-height: 1.4;'>
                💡 <b>Dica de UX:</b> Modifique qualquer filtro acima para atualizar instantaneamente todos os KPIs e visualizações gráficas de performance.
            </p>
        </div>
        <p style='text-align: center; font-size: 0.7rem; color: #555577; margin-top: 30px;'>
            Projeto Acadêmico • Dashboard Streamlit 2026
        </p>
    """, unsafe_allow_html=True)
    
    # Aplicar Filtros aos dados
    df_filtrado = filter_data(df_base, anos_selecionados, regioes_selecionadas, vendedores_selecionados)
    
    # Se os filtros resultarem em um DataFrame vazio, exibir alerta amigável
    if df_filtrado.empty:
        st.warning("⚠️ Nenhum registro encontrado para a combinação de filtros selecionada. Exibindo dados completos por padrão.")
        df_filtrado = df_base
        
    # ==========================================================================
    # 2. LINHA 1 - CARDS DE KPI (Métricas Principais)
    # ==========================================================================
    receita_total = df_filtrado['valor'].sum()
    total_pedidos = len(df_filtrado)
    ticket_medio = receita_total / total_pedidos if total_pedidos > 0 else 0
    clientes_unicos = df_filtrado['cliente'].nunique()
    
    kpi_col1, kpi_col2, kpi_col3, kpi_col4 = st.columns(4)
    
    with kpi_col1:
        st.markdown(f"""
            <div class="kpi-container">
                <div class="kpi-title">Receita Total</div>
                <div class="kpi-value">R$ {receita_total:,.2f}</div>
                <div class="kpi-trend" style="color: #10c291;">
                    <span>📈 Meta Atingida</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
    with kpi_col2:
        st.markdown(f"""
            <div class="kpi-container">
                <div class="kpi-title">Total de Pedidos</div>
                <div class="kpi-value">{total_pedidos:,}</div>
                <div class="kpi-trend" style="color: #5170ff;">
                    <span>📦 Transações Ativas</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
    with kpi_col3:
        st.markdown(f"""
            <div class="kpi-container">
                <div class="kpi-title">Ticket Médio</div>
                <div class="kpi-value">R$ {ticket_medio:,.2f}</div>
                <div class="kpi-trend" style="color: #10c291;">
                    <span>💎 Valor Premium</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
    with kpi_col4:
        st.markdown(f"""
            <div class="kpi-container">
                <div class="kpi-title">Clientes Únicos</div>
                <div class="kpi-value">{clientes_unicos}</div>
                <div class="kpi-trend" style="color: #5170ff;">
                    <span>👤 Base de Compras</span>
                </div>
            </div>
        """, unsafe_allow_html=True)

    st.write("") # Espaçador

    # ==========================================================================
    # 3. LINHA 2 - EVOLUÇÃO TEMPORAL E VENDEDORES
    # ==========================================================================
    col_tempo, col_vendedor = st.columns([1.6, 1.0])
    
    with col_tempo:
        st.markdown('<div class="section-title">Evolução Mensal da Receita</div>', unsafe_allow_html=True)
        
        # Agrupamento cronológico dos dados por mês
        df_mes = df_filtrado.groupby('mes', as_index=False, observed=False)['valor'].sum()
        
        # Criação do Gráfico de Área/Linha
        fig_tempo = px.area(
            df_mes,
            x='mes',
            y='valor',
            labels={'mes': 'Mês', 'valor': 'Receita Total (R$)'},
            markers=True
        )
        
        # Customização visual do gráfico para a paleta Dark Mode
        fig_tempo.update_traces(
            line_color='#5170ff',
            line_width=3,
            fillcolor='rgba(81, 112, 255, 0.15)',
            marker=dict(size=8, color='#10c291', symbol='circle'),
            hovertemplate="<b>Mês:</b> %{x}<br><b>Receita:</b> R$ %{y:,.2f}<extra></extra>"
        )
        
        fig_tempo.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=10, r=10, t=10, b=10),
            height=340,
            xaxis=dict(
                showgrid=False,
                tickfont=dict(color='#a0a0c0', size=11),
                title=None
            ),
            yaxis=dict(
                showgrid=True,
                gridcolor='rgba(255,255,255,0.05)',
                tickfont=dict(color='#a0a0c0', size=11),
                title=None
            )
        )
        st.plotly_chart(fig_tempo, use_container_width=True, config={'displayModeBar': False})
        
    with col_vendedor:
        st.markdown('<div class="section-title">Ranking de Vendedores</div>', unsafe_allow_html=True)
        
        # Agrupamento de receita por vendedor ordenado
        df_vend = df_filtrado.groupby('vendedor', as_index=False)['valor'].sum()
        df_vend = df_vend.sort_values(by='valor', ascending=True) # Ascending para o gráfico de barras horizontais
        
        # Criação do Gráfico de Barras Horizontais
        fig_vend = px.bar(
            df_vend,
            y='vendedor',
            x='valor',
            orientation='h',
            labels={'vendedor': 'Vendedor', 'valor': 'Receita (R$)'}
        )
        
        fig_vend.update_traces(
            marker_color='#10c291',
            marker_line=dict(width=0),
            hovertemplate="<b>Vendedor:</b> %{y}<br><b>Total Vendido:</b> R$ %{x:,.2f}<extra></extra>"
        )
        
        fig_vend.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=10, r=10, t=10, b=10),
            height=340,
            xaxis=dict(
                showgrid=True,
                gridcolor='rgba(255,255,255,0.05)',
                tickfont=dict(color='#a0a0c0', size=11),
                title=None
            ),
            yaxis=dict(
                showgrid=False,
                tickfont=dict(color='#a0a0c0', size=11),
                title=None
            )
        )
        st.plotly_chart(fig_vend, use_container_width=True, config={'displayModeBar': False})

    st.write("") # Espaçador

    # ==========================================================================
    # 4. LINHA 3 - GRÁFICOS DE DISTRIBUIÇÃO E COMPOSIÇÃO
    # ==========================================================================
    col_regiao, col_composição = st.columns(2)
    
    with col_regiao:
        st.markdown('<div class="section-title">Participação por Região</div>', unsafe_allow_html=True)
        
        # Agrupamento por região
        df_reg = df_filtrado.groupby('regiao', as_index=False)['valor'].sum()
        
        # Gráfico Donut de Regiões
        fig_reg = px.pie(
            df_reg,
            values='valor',
            names='regiao',
            hole=0.45,
            color_discrete_sequence=['#10c291', '#5170ff', '#18697a', '#7400b8', '#560bad']
        )
        
        fig_reg.update_traces(
            textinfo='percent+label',
            hovertemplate="<b>Região:</b> %{label}<br><b>Receita:</b> R$ %{value:,.2f}<br><b>Proporção:</b> %{percent}<extra></extra>"
        )
        
        fig_reg.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=10, r=10, t=10, b=10),
            height=340,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=-0.1,
                xanchor="center",
                x=0.5,
                font=dict(color='#a0a0c0', size=11)
            )
        )
        st.plotly_chart(fig_reg, use_container_width=True, config={'displayModeBar': False})
        
    with col_composição:
        st.markdown('<div class="section-title">Forma de Pagamento por Produto</div>', unsafe_allow_html=True)
        
        # Agrupamento de Produto e Forma de Pagamento
        df_pag_prod = df_filtrado.groupby(['forma_pagamento', 'produto'], as_index=False)['valor'].sum()
        
        # Gráfico de Barras Empilhadas
        fig_pag_prod = px.bar(
            df_pag_prod,
            x='forma_pagamento',
            y='valor',
            color='produto',
            barmode='stack',
            color_discrete_sequence=['#10c291', '#5170ff', '#18697a', '#a2d2ff'],
            labels={'forma_pagamento': 'Forma de Pagamento', 'valor': 'Receita (R$)', 'produto': 'Produto'}
        )
        
        fig_pag_prod.update_traces(
            hovertemplate="<b>Pagamento:</b> %{x}<br><b>Produto:</b> %{fullData.name}<br><b>Total:</b> R$ %{y:,.2f}<extra></extra>"
        )
        
        fig_pag_prod.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=10, r=10, t=10, b=10),
            height=340,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=-0.1,
                xanchor="center",
                x=0.5,
                font=dict(color='#a0a0c0', size=11)
            ),
            xaxis=dict(
                showgrid=False,
                tickfont=dict(color='#a0a0c0', size=11),
                title=None
            ),
            yaxis=dict(
                showgrid=True,
                gridcolor='rgba(255,255,255,0.05)',
                tickfont=dict(color='#a0a0c0', size=11),
                title=None
            )
        )
        st.plotly_chart(fig_pag_prod, use_container_width=True, config={'displayModeBar': False})

    st.write("") # Espaçador

    # ==========================================================================
    # 5. LINHA 4 - VISUALIZAÇÃO DOS DADOS INTEGRAL E FILTRADA
    # ==========================================================================
    st.markdown('<div class="section-title">Explorador de Dados Detalhados</div>', unsafe_allow_html=True)
    
    with st.expander("🔍 Clique para visualizar a tabela completa de transações filtradas", expanded=False):
        # Clonar para exibição e formatar de forma limpa
        df_exibicao = df_filtrado.copy()
        
        # Formatar a data para string visual DD/MM/YYYY
        df_exibicao['data'] = df_exibicao['data'].dt.strftime('%d/%m/%Y')
        
        # Renomear as colunas para o usuário final
        df_exibicao = df_exibicao.rename(columns={
            'data': 'Data da Venda',
            'ano': 'Ano',
            'mes': 'Mês',
            'vendedor': 'Vendedor',
            'cliente': 'Nome do Cliente',
            'regiao': 'Região',
            'produto': 'Produto Adquirido',
            'valor': 'Valor Cobrado (R$)',
            'forma_pagamento': 'Meio de Pagamento'
        })
        
        # Exibição do st.dataframe
        st.dataframe(
            df_exibicao,
            use_container_width=True,
            column_order=[
                'Data da Venda', 'Vendedor', 'Nome do Cliente', 
                'Região', 'Produto Adquirido', 'Valor Cobrado (R$)', 'Meio de Pagamento'
            ]
        )
        
        # Botão de exportação
        csv = df_filtrado.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Exportar Dados Filtrados em CSV",
            data=csv,
            file_name='vendas_filtradas.csv',
            mime='text/csv',
        )

if __name__ == '__main__':
    main()
