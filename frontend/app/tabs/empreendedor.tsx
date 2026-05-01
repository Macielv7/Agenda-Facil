import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import {
  agendamentosService, servicosService,
  Agendamento, Servico,
} from '../../services/apiService';

// ─── Helpers ─────────────────────────────────────────────────
function getDias() {
  const hoje = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    const shorts = ['DOM.','SEG.','TER.','QUA.','QUI.','SEX.','SÁB.'];
    return { short: shorts[d.getDay()], day: d.getDate(), date: d };
  });
}

function isMesmoDia(dataHora: string, date: Date) {
  try {
    const d = new Date(dataHora);
    return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  } catch { return false; }
}

function formatHora(dataHora: string) {
  try { return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  catch { return dataHora; }
}

const STATUS_COR: Record<string,string> = { confirmado:'#22C55E', pendente:'#F59E0B', cancelado:'#EF4444', concluido:'#6366F1' };
const STATUS_BG: Record<string,string>  = { confirmado:'#DCFCE7', pendente:'#FEF3C7', cancelado:'#FEE2E2', concluido:'#EDE9FE' };
const STATUS_LABEL: Record<string,string> = { confirmado:'Confirmado', pendente:'Pendente', cancelado:'Cancelado', concluido:'Concluído' };

const CATEGORIAS = ['beleza','saude','bem-estar'];

// ─── Modal de Serviço ─────────────────────────────────────────
function ServicoModal({ visible, servico, onClose, onSalvo }: {
  visible: boolean;
  servico: Servico | null;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('30');
  const [categoria, setCategoria] = useState('beleza');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (servico) {
      setNome(servico.nome);
      setDescricao(servico.descricao || '');
      setPreco(String(servico.preco));
      setDuracao(String(servico.duracao_min));
      setCategoria(servico.categoria);
    } else {
      setNome(''); setDescricao(''); setPreco(''); setDuracao('30'); setCategoria('beleza');
    }
    setErro('');
  }, [servico, visible]);

  const salvar = async () => {
    if (!nome.trim() || !preco.trim()) { setErro('Nome e preço são obrigatórios.'); return; }
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) { setErro('Preço inválido.'); return; }
    setLoading(true); setErro('');
    try {
      const dados = { nome: nome.trim(), descricao: descricao.trim() || undefined, preco: precoNum, duracao_min: parseInt(duracao) || 30, categoria };
      if (servico) {
        await servicosService.atualizar(servico.id, dados);
      } else {
        await servicosService.criar(dados as any);
      }
      onSalvo();
    } catch (e: any) { setErro(e.message || 'Erro ao salvar.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={ms.header}>
          <TouchableOpacity onPress={onClose}><Text style={ms.cancelar}>Cancelar</Text></TouchableOpacity>
          <Text style={ms.titulo}>{servico ? 'Editar Serviço' : 'Novo Serviço'}</Text>
          <TouchableOpacity onPress={salvar} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={ms.salvar}>Salvar</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={ms.body} keyboardShouldPersistTaps="handled">
          {erro ? <Text style={ms.erro}>{erro}</Text> : null}

          <Text style={ms.label}>Nome *</Text>
          <TextInput style={ms.input} value={nome} onChangeText={setNome} placeholder="Ex: Corte masculino" placeholderTextColor={Colors.gray400} />

          <Text style={ms.label}>Descrição</Text>
          <TextInput style={[ms.input, { height: 80 }]} value={descricao} onChangeText={setDescricao} placeholder="Descreva o serviço..." placeholderTextColor={Colors.gray400} multiline />

          <Text style={ms.label}>Preço (R$) *</Text>
          <TextInput style={ms.input} value={preco} onChangeText={setPreco} placeholder="0,00" placeholderTextColor={Colors.gray400} keyboardType="decimal-pad" />

          <Text style={ms.label}>Duração (minutos)</Text>
          <TextInput style={ms.input} value={duracao} onChangeText={setDuracao} placeholder="30" placeholderTextColor={Colors.gray400} keyboardType="number-pad" />

          <Text style={ms.label}>Categoria</Text>
          <View style={ms.catRow}>
            {CATEGORIAS.map(c => (
              <TouchableOpacity key={c} style={[ms.catBtn, categoria === c && ms.catAtivo]} onPress={() => setCategoria(c)}>
                <Text style={[ms.catTxt, categoria === c && ms.catTxtAtivo]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────
export default function EmpreendedorScreen() {
  const { usuario, logout } = useAuth();

  // Guard de role
  useEffect(() => {
    if (usuario && usuario.tipo !== 'empreendedor') {
      router.replace('/tabs');
    }
  }, [usuario]);

  const DIAS = getDias();
  const [diaIdx, setDiaIdx] = useState(0);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizando, setAtualizando] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicoEdit, setServicoEdit] = useState<Servico | null>(null);

  const carregar = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [ag, svcs] = await Promise.all([
        agendamentosService.listar(),
        usuario?.id ? servicosService.listar({ empreendedor_id: usuario.id }) : Promise.resolve([]),
      ]);
      setAgendamentos(ag);
      setServicos(svcs);
    } catch (e: any) { Alert.alert('Erro', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [usuario?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const hoje = new Date();
  const inicioSemana = (() => { const d = new Date(); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); return d; })();
  const agHoje = agendamentos.filter(a => isMesmoDia(a.data_hora, hoje) && a.status !== 'cancelado').length;
  const agSemana = agendamentos.filter(a => { try { const d=new Date(a.data_hora); return d>=inicioSemana && a.status!=='cancelado'; } catch{return false;} }).length;
  const receita = agendamentos.filter(a => { try { const d=new Date(a.data_hora); return d>=inicioSemana && a.status==='concluido'; } catch{return false;} }).reduce((s,a)=>s+a.valor,0);
  const pendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const diaSelecionado = DIAS[diaIdx];
  const agDia = agendamentos.filter(a => isMesmoDia(a.data_hora, diaSelecionado.date) && a.status !== 'cancelado').sort((a,b)=>new Date(a.data_hora).getTime()-new Date(b.data_hora).getTime());

  const atualizarStatus = async (id: number, status: 'confirmado'|'cancelado'|'concluido') => {
    const labels: Record<string,string> = { confirmado:'Confirmar', cancelado:'Cancelar', concluido:'Concluir' };
    Alert.alert(labels[status], `Deseja ${labels[status].toLowerCase()} este agendamento?`, [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', style: status==='cancelado'?'destructive':'default', onPress: async () => {
        setAtualizando(id);
        try {
          await agendamentosService.atualizarStatus(id, status);
          setAgendamentos(prev => prev.map(a => a.id===id ? {...a, status} : a));
        } catch (e: any) { Alert.alert('Erro', e.message); }
        finally { setAtualizando(null); }
      }},
    ]);
  };

  const excluirServico = (s: Servico) => {
    Alert.alert('Desativar serviço', `Deseja desativar "${s.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desativar', style: 'destructive', onPress: async () => {
        try { await servicosService.remover(s.id); carregar(); }
        catch (e: any) { Alert.alert('Erro', e.message); }
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); }},
    ]);
  };

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(true); }} tintColor="#fff" />}
      >
        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroOla}>Olá, {usuario?.nome?.split(' ')[0]}! 👋</Text>
              <Text style={s.heroRole}>{usuario?.profissao || 'Empreendedor'} · {servicos.length} serviço{servicos.length!==1?'s':''}</Text>
            </View>
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutTxt}>→</Text>
            </TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={s.statsRow}>
              {[{v:agHoje,l:'Hoje'},{v:agSemana,l:'Semana'},{v:`R$${receita.toFixed(0)}`,l:'Receita'}].map(st=>(
                <View key={st.l} style={s.statCard}>
                  <Text style={s.statVal}>{st.v}</Text>
                  <Text style={s.statLbl}>{st.l}</Text>
                </View>
              ))}
            </View>
          )}
          {pendentes > 0 && (
            <View style={s.pendBadge}><Text style={s.pendTxt}>⏰ {pendentes} aguardando confirmação</Text></View>
          )}
        </View>

        {/* ── Agenda ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Agenda do dia</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.diasRow}>
            {DIAS.map((d, i) => {
              const temAg = agendamentos.some(a => isMesmoDia(a.data_hora, d.date) && a.status !== 'cancelado');
              return (
                <TouchableOpacity key={i} style={[s.dayBtn, diaIdx===i && s.dayBtnAtivo]} onPress={() => setDiaIdx(i)}>
                  <Text style={[s.dayShort, diaIdx===i && s.dayTxtAtivo]}>{d.short}</Text>
                  <Text style={[s.dayNum, diaIdx===i && s.dayTxtAtivo]}>{d.day}</Text>
                  {temAg && <View style={[s.dot, diaIdx===i && s.dotAtivo]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={s.row}>
            <Text style={s.bookTitle}>Agendamentos ({agDia.length})</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/agendamentos')}><Text style={s.verTodos}>Ver todos →</Text></TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>
          ) : agDia.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyE}>📭</Text><Text style={s.emptyT}>Nenhum agendamento neste dia</Text></View>
          ) : agDia.map(a => (
            <View key={a.id} style={s.bookCard}>
              <View style={s.bookTop}>
                <View style={s.bookLeft}>
                  <View style={s.avatar}><Text>👤</Text></View>
                  <View>
                    <Text style={s.clientNome}>{a.cliente_nome}</Text>
                    <Text style={s.clientSvc}>{a.servico_nome}</Text>
                  </View>
                </View>
                <View style={[s.statusBadge,{backgroundColor:STATUS_BG[a.status]}]}>
                  <Text style={[s.statusTxt,{color:STATUS_COR[a.status]}]}>{STATUS_LABEL[a.status]}</Text>
                </View>
              </View>
              <View style={s.bookMeta}>
                <Text style={s.metaTxt}>🕐 {formatHora(a.data_hora)}</Text>
                <Text style={s.metaTxt}>⏱ {a.duracao_min}min</Text>
                <Text style={[s.metaTxt,{color:Colors.primary,fontWeight:'700',marginLeft:'auto' as any}]}>R$ {a.valor.toFixed(2)}</Text>
              </View>
              {atualizando === a.id ? <ActivityIndicator color={Colors.primary} style={{marginTop:8}}/> : (
                a.status === 'pendente' ? (
                  <View style={s.actionRow}>
                    <TouchableOpacity style={s.confirmBtn} onPress={()=>atualizarStatus(a.id,'confirmado')}><Text style={s.confirmTxt}>✅ Confirmar</Text></TouchableOpacity>
                    <TouchableOpacity style={s.refuseBtn} onPress={()=>atualizarStatus(a.id,'cancelado')}><Text style={s.refuseTxt}>❌ Recusar</Text></TouchableOpacity>
                  </View>
                ) : a.status === 'confirmado' ? (
                  <View style={s.actionRow}>
                    <TouchableOpacity style={s.concludeBtn} onPress={()=>atualizarStatus(a.id,'concluido')}><Text style={s.concludeTxt}>🏁 Concluído</Text></TouchableOpacity>
                    <TouchableOpacity style={s.refuseBtn} onPress={()=>atualizarStatus(a.id,'cancelado')}><Text style={s.refuseTxt}>Cancelar</Text></TouchableOpacity>
                  </View>
                ) : null
              )}
            </View>
          ))}
        </View>

        {/* ── Serviços ── */}
        <View style={s.section}>
          <View style={s.row}>
            <Text style={s.sectionTitle}>Meus Serviços</Text>
            <TouchableOpacity style={s.novoBtn} onPress={()=>{setServicoEdit(null);setModalVisible(true);}}>
              <Text style={s.novoBtnTxt}>+ Novo</Text>
            </TouchableOpacity>
          </View>

          {servicos.length === 0 && !loading ? (
            <View style={s.empty}>
              <Text style={s.emptyE}>🛎️</Text>
              <Text style={s.emptyT}>Nenhum serviço cadastrado ainda</Text>
              <TouchableOpacity style={s.novoBtn2} onPress={()=>{setServicoEdit(null);setModalVisible(true);}}>
                <Text style={s.novoBtnTxt}>Cadastrar primeiro serviço</Text>
              </TouchableOpacity>
            </View>
          ) : servicos.map(sv => (
            <View key={sv.id} style={s.svcCard}>
              <View style={{flex:1,marginRight:12}}>
                <Text style={s.svcNome}>{sv.nome}</Text>
                {sv.descricao?<Text style={s.svcDesc}>{sv.descricao}</Text>:null}
                <Text style={s.svcMeta}>⏱ {sv.duracao_min}min · {sv.categoria}</Text>
              </View>
              <View style={{alignItems:'flex-end',gap:8}}>
                <Text style={s.svcPreco}>R$ {sv.preco.toFixed(2)}</Text>
                <View style={s.svcActions}>
                  <TouchableOpacity onPress={()=>{setServicoEdit(sv);setModalVisible(true);}}>
                    <Text style={s.editTxt}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>excluirServico(sv)}>
                    <Text style={s.delTxt}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ServicoModal
        visible={modalVisible}
        servico={servicoEdit}
        onClose={()=>setModalVisible(false)}
        onSalvo={()=>{setModalVisible(false);carregar();}}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  scroll:{paddingBottom:100},
  hero:{backgroundColor:Colors.primary,paddingTop:60,paddingBottom:30,paddingHorizontal:24,borderBottomLeftRadius:28,borderBottomRightRadius:28},
  heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20},
  heroOla:{fontSize:22,fontWeight:'800',color:'#fff',letterSpacing:-0.3},
  heroRole:{fontSize:13,color:'rgba(255,255,255,0.75)',marginTop:4},
  logoutBtn:{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.2)',justifyContent:'center',alignItems:'center'},
  logoutTxt:{fontSize:18,color:'#fff'},
  statsRow:{flexDirection:'row',gap:12},
  statCard:{flex:1,backgroundColor:'rgba(255,255,255,0.15)',borderRadius:16,padding:16,alignItems:'center'},
  statVal:{fontSize:20,fontWeight:'800',color:'#fff',marginBottom:4},
  statLbl:{fontSize:11,color:'rgba(255,255,255,0.8)',textAlign:'center'},
  pendBadge:{marginTop:16,backgroundColor:'rgba(255,255,255,0.2)',borderRadius:12,padding:10,alignItems:'center'},
  pendTxt:{color:'#fff',fontSize:13,fontWeight:'600'},
  section:{paddingHorizontal:24,paddingTop:28},
  sectionTitle:{fontSize:20,fontWeight:'800',color:Colors.text,marginBottom:16,letterSpacing:-0.3},
  diasRow:{gap:10,marginBottom:20,paddingBottom:4},
  dayBtn:{width:66,paddingVertical:14,borderRadius:16,alignItems:'center',borderWidth:1.5,borderColor:Colors.border,backgroundColor:Colors.white,marginRight:10},
  dayBtnAtivo:{borderColor:Colors.primary},
  dayShort:{fontSize:11,fontWeight:'600',color:Colors.textSecondary,marginBottom:6},
  dayNum:{fontSize:20,fontWeight:'800',color:Colors.text},
  dayTxtAtivo:{color:Colors.primary},
  dot:{width:6,height:6,borderRadius:3,backgroundColor:Colors.textSecondary,marginTop:4},
  dotAtivo:{backgroundColor:Colors.primary},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},
  bookTitle:{fontSize:17,fontWeight:'700',color:Colors.text},
  verTodos:{fontSize:13,color:Colors.primary,fontWeight:'600'},
  center:{alignItems:'center',paddingVertical:30},
  empty:{alignItems:'center',paddingVertical:30,gap:8},
  emptyE:{fontSize:36},
  emptyT:{fontSize:14,color:Colors.textSecondary,textAlign:'center'},
  bookCard:{backgroundColor:Colors.white,borderRadius:16,padding:16,marginBottom:12,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2},
  bookTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  bookLeft:{flexDirection:'row',alignItems:'center',gap:12,flex:1},
  avatar:{width:44,height:44,borderRadius:22,backgroundColor:Colors.primaryLight,justifyContent:'center',alignItems:'center'},
  clientNome:{fontSize:15,fontWeight:'700',color:Colors.text},
  clientSvc:{fontSize:12,color:Colors.textSecondary,marginTop:2},
  statusBadge:{paddingHorizontal:8,paddingVertical:4,borderRadius:20},
  statusTxt:{fontSize:11,fontWeight:'600'},
  bookMeta:{flexDirection:'row',gap:16,marginBottom:4},
  metaTxt:{fontSize:12,color:Colors.textSecondary},
  actionRow:{flexDirection:'row',gap:8,marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:Colors.border},
  confirmBtn:{flex:1,backgroundColor:Colors.primary,borderRadius:10,paddingVertical:10,alignItems:'center'},
  confirmTxt:{fontSize:13,fontWeight:'600',color:'#fff'},
  refuseBtn:{flex:1,borderWidth:1.5,borderColor:Colors.danger,borderRadius:10,paddingVertical:10,alignItems:'center'},
  refuseTxt:{fontSize:13,fontWeight:'600',color:Colors.danger},
  concludeBtn:{flex:1,backgroundColor:'#6366F1',borderRadius:10,paddingVertical:10,alignItems:'center'},
  concludeTxt:{fontSize:13,fontWeight:'600',color:'#fff'},
  novoBtn:{backgroundColor:Colors.primary,paddingHorizontal:16,paddingVertical:8,borderRadius:20},
  novoBtn2:{backgroundColor:Colors.primary,paddingHorizontal:20,paddingVertical:10,borderRadius:12,marginTop:8},
  novoBtnTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  svcCard:{flexDirection:'row',backgroundColor:Colors.white,borderRadius:14,padding:14,marginBottom:10,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:2},
  svcNome:{fontSize:15,fontWeight:'700',color:Colors.text,marginBottom:2},
  svcDesc:{fontSize:12,color:Colors.textSecondary,marginBottom:4},
  svcMeta:{fontSize:11,color:Colors.textSecondary,textTransform:'capitalize'},
  svcPreco:{fontSize:16,fontWeight:'800',color:Colors.primary},
  svcActions:{flexDirection:'row',gap:12},
  editTxt:{fontSize:20},
  delTxt:{fontSize:20},
});

// ─── Estilos do Modal ─────────────────────────────────────────
const ms = StyleSheet.create({
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:Colors.border,paddingTop:56,backgroundColor:Colors.white},
  titulo:{fontSize:17,fontWeight:'700',color:Colors.text},
  cancelar:{fontSize:15,color:Colors.textSecondary},
  salvar:{fontSize:15,color:Colors.primary,fontWeight:'700'},
  body:{padding:24,gap:6},
  erro:{backgroundColor:'#FEE2E2',color:'#EF4444',padding:10,borderRadius:10,fontSize:13,marginBottom:8},
  label:{fontSize:14,fontWeight:'600',color:Colors.text,marginTop:12},
  input:{backgroundColor:Colors.gray100,borderRadius:12,paddingHorizontal:14,paddingVertical:12,fontSize:15,color:Colors.text,marginTop:6},
  catRow:{flexDirection:'row',gap:8,marginTop:8,flexWrap:'wrap'},
  catBtn:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,borderWidth:1.5,borderColor:Colors.border,backgroundColor:Colors.white},
  catAtivo:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  catTxt:{fontSize:13,color:Colors.textSecondary,fontWeight:'500',textTransform:'capitalize'},
  catTxtAtivo:{color:'#fff',fontWeight:'700'},
});
