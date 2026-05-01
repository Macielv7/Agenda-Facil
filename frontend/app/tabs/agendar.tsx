import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { servicosService, agendamentosService, Servico } from '../../services/apiService';

// ─── Helpers ─────────────────────────────────────────────────
function gerarSlots(duracaoMin: number): string[] {
  const slots: string[] = [];
  for (let h = 8; h < 19; h++) {
    for (let m = 0; m < 60; m += duracaoMin) {
      if (h === 18 && m > 0) break;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return slots;
}

function getDias() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const shorts = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    return {
      label: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${shorts[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`,
      date: d,
    };
  });
}

function toISO(date: Date, hora: string): string {
  const [h, m] = hora.split(':');
  const d = new Date(date);
  d.setHours(parseInt(h), parseInt(m), 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ─── Tela de Agendamento ─────────────────────────────────────
export default function AgendarScreen() {
  const params = useLocalSearchParams<{ empreendedor_id?: string; empreendedor_nome?: string }>();
  const empreendedorId = parseInt(params.empreendedor_id || '0');
  const empreendedorNome = params.empreendedor_nome || 'Profissional';

  const [passo, setPasso] = useState<1|2|3>(1);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loadingServicos, setLoadingServicos] = useState(true);

  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [diaIdx, setDiaIdx] = useState(0);
  const [horario, setHorario] = useState('');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);

  const DIAS = getDias();
  const slots = servicoSelecionado ? gerarSlots(servicoSelecionado.duracao_min) : [];

  const carregarServicos = useCallback(async () => {
    setLoadingServicos(true);
    try {
      const svcs = await servicosService.listar({ empreendedor_id: empreendedorId });
      setServicos(svcs);
    } catch (e: any) { Alert.alert('Erro', e.message); }
    finally { setLoadingServicos(false); }
  }, [empreendedorId]);

  useEffect(() => { carregarServicos(); }, [carregarServicos]);

  const confirmarAgendamento = async () => {
    if (!servicoSelecionado || !horario) return;
    setEnviando(true);
    try {
      const dataHora = toISO(DIAS[diaIdx].date, horario);
      await agendamentosService.criar({
        empreendedor_id: empreendedorId,
        servico_id: servicoSelecionado.id,
        data_hora: dataHora,
        observacao: observacao.trim() || undefined,
      });
      Alert.alert('✅ Agendamento realizado!', `${servicoSelecionado.nome} com ${empreendedorNome} em ${DIAS[diaIdx].label} às ${horario}`, [
        { text: 'OK', onPress: () => router.replace('/tabs/agendamentos') },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível criar o agendamento.');
    } finally { setEnviando(false); }
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => passo === 1 ? router.back() : setPasso(p => (p-1) as any)}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Agendar serviço</Text>
          <Text style={s.subtitle}>{empreendedorNome}</Text>
        </View>
      </View>

      {/* Steps indicator */}
      <View style={s.steps}>
        {['Serviço','Data/Hora','Confirmar'].map((l, i) => (
          <View key={i} style={s.stepItem}>
            <View style={[s.stepCircle, passo > i+1 && s.stepDone, passo === i+1 && s.stepAtivo]}>
              <Text style={[s.stepNum, (passo >= i+1) && s.stepNumAtivo]}>{i+1}</Text>
            </View>
            <Text style={[s.stepLabel, passo === i+1 && s.stepLabelAtivo]}>{l}</Text>
            {i < 2 && <View style={[s.stepLine, passo > i+1 && s.stepLineDone]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── Passo 1: Serviços ── */}
        {passo === 1 && (
          <>
            <Text style={s.sectionTitle}>Escolha o serviço</Text>
            {loadingServicos ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
            ) : servicos.length === 0 ? (
              <View style={s.empty}><Text style={s.emptyE}>🛎️</Text><Text style={s.emptyT}>Este profissional não possui serviços ativos</Text></View>
            ) : servicos.map(sv => (
              <TouchableOpacity
                key={sv.id}
                style={[s.card, servicoSelecionado?.id === sv.id && s.cardAtivo]}
                onPress={() => setServicoSelecionado(sv)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.cardNome}>{sv.nome}</Text>
                  {sv.descricao ? <Text style={s.cardDesc}>{sv.descricao}</Text> : null}
                  <Text style={s.cardMeta}>⏱ {sv.duracao_min} min · {sv.categoria}</Text>
                </View>
                <Text style={s.cardPreco}>R$ {sv.preco.toFixed(2)}</Text>
                {servicoSelecionado?.id === sv.id && <Text style={s.check}>✅</Text>}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── Passo 2: Data e Hora ── */}
        {passo === 2 && (
          <>
            <Text style={s.sectionTitle}>Escolha a data</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.diasRow}>
              {DIAS.map((d, i) => (
                <TouchableOpacity key={i} style={[s.diaBtn, diaIdx===i && s.diaBtnAtivo]} onPress={() => { setDiaIdx(i); setHorario(''); }}>
                  <Text style={[s.diaTxt, diaIdx===i && s.diaTxtAtivo]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[s.sectionTitle, { marginTop: 24 }]}>Escolha o horário</Text>
            <View style={s.slotsGrid}>
              {slots.map(sl => (
                <TouchableOpacity key={sl} style={[s.slot, horario===sl && s.slotAtivo]} onPress={() => setHorario(sl)}>
                  <Text style={[s.slotTxt, horario===sl && s.slotTxtAtivo]}>{sl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── Passo 3: Confirmação ── */}
        {passo === 3 && servicoSelecionado && (
          <>
            <Text style={s.sectionTitle}>Confirme o agendamento</Text>
            <View style={s.resumo}>
              <Row label="Profissional" value={empreendedorNome} />
              <Row label="Serviço" value={servicoSelecionado.nome} />
              <Row label="Duração" value={`${servicoSelecionado.duracao_min} min`} />
              <Row label="Data" value={DIAS[diaIdx].label} />
              <Row label="Horário" value={horario} />
              <View style={s.valorRow}>
                <Text style={s.valorLabel}>Total</Text>
                <Text style={s.valor}>R$ {servicoSelecionado.preco.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={s.sectionTitle}>Observação (opcional)</Text>
            <TextInput
              style={s.obsInput}
              value={observacao}
              onChangeText={setObservacao}
              placeholder="Alguma informação adicional..."
              placeholderTextColor={Colors.gray400}
              multiline
            />
          </>
        )}
      </ScrollView>

      {/* Botão de avançar */}
      <View style={s.footer}>
        {passo < 3 ? (
          <TouchableOpacity
            style={[s.nextBtn, (!servicoSelecionado && passo===1 || !horario && passo===2) && s.nextBtnDisabled]}
            disabled={(!servicoSelecionado && passo===1) || (!horario && passo===2)}
            onPress={() => setPasso(p => (p+1) as any)}
          >
            <Text style={s.nextTxt}>Continuar →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.nextBtn, enviando && s.nextBtnDisabled]} disabled={enviando} onPress={confirmarAgendamento}>
            {enviando ? <ActivityIndicator color="#fff" /> : <Text style={s.nextTxt}>✅ Confirmar Agendamento</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.resumoRow}>
      <Text style={s.resumoLabel}>{label}</Text>
      <Text style={s.resumoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  header:{flexDirection:'row',alignItems:'center',gap:16,paddingHorizontal:24,paddingTop:60,paddingBottom:16,backgroundColor:Colors.white},
  back:{fontSize:22,color:Colors.textSecondary},
  title:{fontSize:20,fontWeight:'800',color:Colors.text,letterSpacing:-0.5},
  subtitle:{fontSize:13,color:Colors.textSecondary,marginTop:2},
  steps:{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingVertical:16,backgroundColor:Colors.white,paddingHorizontal:24,borderBottomWidth:1,borderBottomColor:Colors.border},
  stepItem:{flexDirection:'row',alignItems:'center'},
  stepCircle:{width:28,height:28,borderRadius:14,borderWidth:2,borderColor:Colors.border,justifyContent:'center',alignItems:'center',backgroundColor:Colors.white},
  stepAtivo:{borderColor:Colors.primary,backgroundColor:Colors.primary},
  stepDone:{borderColor:Colors.primary,backgroundColor:Colors.primary},
  stepNum:{fontSize:13,fontWeight:'700',color:Colors.textSecondary},
  stepNumAtivo:{color:'#fff'},
  stepLabel:{fontSize:11,color:Colors.textSecondary,marginHorizontal:6},
  stepLabelAtivo:{color:Colors.primary,fontWeight:'700'},
  stepLine:{width:30,height:2,backgroundColor:Colors.border},
  stepLineDone:{backgroundColor:Colors.primary},
  body:{padding:24,paddingBottom:120},
  sectionTitle:{fontSize:18,fontWeight:'800',color:Colors.text,marginBottom:14,letterSpacing:-0.3},
  empty:{alignItems:'center',paddingVertical:40,gap:8},
  emptyE:{fontSize:40},
  emptyT:{fontSize:14,color:Colors.textSecondary,textAlign:'center'},
  card:{backgroundColor:Colors.white,borderRadius:16,padding:16,marginBottom:10,flexDirection:'row',alignItems:'center',borderWidth:2,borderColor:'transparent',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2},
  cardAtivo:{borderColor:Colors.primary},
  cardNome:{fontSize:15,fontWeight:'700',color:Colors.text,marginBottom:2},
  cardDesc:{fontSize:12,color:Colors.textSecondary,marginBottom:4},
  cardMeta:{fontSize:11,color:Colors.textSecondary,textTransform:'capitalize'},
  cardPreco:{fontSize:16,fontWeight:'800',color:Colors.primary,marginHorizontal:12},
  check:{fontSize:18},
  diasRow:{gap:8,paddingBottom:4},
  diaBtn:{paddingHorizontal:16,paddingVertical:10,borderRadius:20,borderWidth:1.5,borderColor:Colors.border,backgroundColor:Colors.white,marginRight:8},
  diaBtnAtivo:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  diaTxt:{fontSize:13,fontWeight:'500',color:Colors.textSecondary},
  diaTxtAtivo:{color:'#fff',fontWeight:'700'},
  slotsGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  slot:{paddingHorizontal:16,paddingVertical:10,borderRadius:12,borderWidth:1.5,borderColor:Colors.border,backgroundColor:Colors.white},
  slotAtivo:{backgroundColor:Colors.primary,borderColor:Colors.primary},
  slotTxt:{fontSize:14,fontWeight:'600',color:Colors.textSecondary},
  slotTxtAtivo:{color:'#fff'},
  resumo:{backgroundColor:Colors.white,borderRadius:16,padding:16,gap:2,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,marginBottom:20},
  resumoRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderBottomColor:Colors.border},
  resumoLabel:{fontSize:14,color:Colors.textSecondary},
  resumoValue:{fontSize:14,fontWeight:'600',color:Colors.text},
  valorRow:{flexDirection:'row',justifyContent:'space-between',paddingTop:12},
  valorLabel:{fontSize:16,fontWeight:'700',color:Colors.text},
  valor:{fontSize:22,fontWeight:'800',color:Colors.primary},
  obsInput:{backgroundColor:Colors.white,borderRadius:14,padding:14,fontSize:14,color:Colors.text,minHeight:100,textAlignVertical:'top',borderWidth:1,borderColor:Colors.border},
  footer:{position:'absolute',bottom:0,left:0,right:0,padding:24,paddingBottom:36,backgroundColor:Colors.white,borderTopWidth:1,borderTopColor:Colors.border},
  nextBtn:{backgroundColor:Colors.primary,paddingVertical:17,borderRadius:16,alignItems:'center',shadowColor:Colors.primary,shadowOffset:{width:0,height:6},shadowOpacity:0.3,shadowRadius:12,elevation:8},
  nextBtnDisabled:{opacity:0.5},
  nextTxt:{color:'#fff',fontSize:17,fontWeight:'700'},
});
