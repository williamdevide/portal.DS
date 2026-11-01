import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Users, CheckCircle2, AlertCircle, 
  Sparkles, FileText, MapPin, Eye, EyeOff, KeyRound
} from 'lucide-react';
import { obterConfiguracao, listarAgendamentos, salvarAgendamento } from '../../services/agendamentoService';
import PalavraIncorretaModal from './PalavraIncorretaModal';

export default function AgendamentoForm({ onNavigateToQuadro }) {
  const [config, setConfig] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState(null);
  const [modalErroPalavra, setModalErroPalavra] = useState('');

  // Estados do formulário
  const [selectedTurmaId, setSelectedTurmaId] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedData, setSelectedData] = useState('');
  const [selectedHorario, setSelectedHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [palavraChave, setPalavraChave] = useState('');
  const [showPalavraChave, setShowPalavraChave] = useState(false);

  // Referência para o campo de input da palavra-chave
  const palavraChaveInputRef = useRef(null);

  // Carrega configuração e agendamentos existentes
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      const [confData, agendData] = await Promise.all([
        obterConfiguracao(),
        listarAgendamentos().catch((err) => {
          console.warn('Backend SQLite offline ou não iniciado:', err);
          return [];
        })
      ]);

      setConfig(confData);
      setAgendamentos(agendData);

      // Pré-seleciona a primeira turma se houver
      if (confData?.turmas?.length > 0 && !selectedTurmaId) {
        setSelectedTurmaId(confData.turmas[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de agendamento:', err);
      setError('Não foi possível carregar os horários. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Dados da turma atualmente selecionada
  const turmaAtual = config?.turmas?.find(t => t.id === selectedTurmaId);

  // Reseta seleção de grupo, data e horário ao mudar de turma
  useEffect(() => {
    setSelectedGrupo('');
    setSelectedData('');
    setSelectedHorario('');
    setError('');
    setSucesso(null);
  }, [selectedTurmaId]);

  // Reseta seleção de horário ao mudar de data
  useEffect(() => {
    setSelectedHorario('');
  }, [selectedData]);

  // Lista de agendamentos da turma atual
  const agendamentosTurma = agendamentos.filter(a => a.turma_id === selectedTurmaId);

  // Mapeamento dos grupos que já agendaram
  const gruposAgendadosMap = new Map();
  agendamentosTurma.forEach(a => {
    gruposAgendadosMap.set(a.grupo_nome, a);
  });

  // Mapeamento dos horários ocupados para a data selecionada: horario -> agendamento
  const horariosOcupadosMap = new Map();
  if (selectedData) {
    agendamentosTurma
      .filter(a => a.data === selectedData)
      .forEach(a => {
        horariosOcupadosMap.set(a.horario, a);
      });
  }

  // Tratamento do envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedTurmaId) {
      setError('Por favor, selecione uma turma.');
      return;
    }
    if (!selectedGrupo) {
      setError('Por favor, selecione o grupo de TCC.');
      return;
    }
    if (!selectedData) {
      setError('Por favor, selecione o dia da apresentação.');
      return;
    }
    if (!selectedHorario) {
      setError('Por favor, selecione um horário disponível.');
      return;
    }
    if (!palavraChave.trim()) {
      setError('Por favor, informe a palavra-chave secreta do seu grupo.');
      return;
    }

    // Verificação de segurança local
    if (gruposAgendadosMap.has(selectedGrupo)) {
      setError(`O grupo "${selectedGrupo}" já possui agendamento confirmado.`);
      return;
    }

    if (horariosOcupadosMap.has(selectedHorario)) {
      setError(`O horário ${selectedHorario} acabou de ser reservado por outro grupo.`);
      return;
    }

    // Validação prévia caso a palavra secreta esteja presente nos dados locais
    const grupoConfig = turmaAtual?.grupos?.find(g => {
      const nome = typeof g === 'string' ? g : g.nome;
      return nome?.trim().toLowerCase() === selectedGrupo.trim().toLowerCase();
    });
    if (grupoConfig && typeof grupoConfig === 'object' && grupoConfig.palavra_secreta) {
      if (palavraChave.trim().toLowerCase() !== grupoConfig.palavra_secreta.trim().toLowerCase()) {
        setModalErroPalavra(`A palavra-chave informada para o "${selectedGrupo}" está incorreta. Verifique a palavra secreta entregue pessoalmente pelo Professor William e tente novamente.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        turma_id: turmaAtual.id,
        turma_nome: turmaAtual.nome,
        grupo_nome: selectedGrupo,
        data: selectedData,
        horario: selectedHorario,
        observacoes: observacoes.trim(),
        palavra_chave: palavraChave.trim()
      };

      const res = await salvarAgendamento(payload);
      setSucesso({
        ...payload,
        sala_ou_local: turmaAtual.sala_ou_local,
        id: res.agendamento?.id
      });

      // Recarrega lista para atualizar slots ocupados
      const novosAgend = await listarAgendamentos();
      setAgendamentos(novosAgend);

      // Limpa os campos selecionados
      setSelectedGrupo('');
      setSelectedData('');
      setSelectedHorario('');
      setObservacoes('');
      setPalavraChave('');
    } catch (err) {
      const errMsg = err.message || 'Falha ao processar agendamento. Tente novamente.';
      if (
        errMsg.toLowerCase().includes('palavra') || 
        errMsg.toLowerCase().includes('chave') || 
        errMsg.toLowerCase().includes('secreta') ||
        errMsg.toLowerCase().includes('403')
      ) {
        setModalErroPalavra(errMsg);
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-10 w-10 border-2 border-custom-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-custom-muted animate-pulse">
          Carregando calendário de apresentações...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Banner de Introdução / Apresentação */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-custom-card via-custom-card to-custom-accent/10 border border-custom-border shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold bg-custom-accent/15 text-custom-accent border border-custom-accent/20 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Banca de TCC - Defesa Final
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-custom-text font-sans tracking-tight">
            Agendamento da Apresentação de TCC
          </h2>
          <p className="mt-2 text-sm sm:text-base text-custom-muted font-sans max-w-3xl leading-relaxed">
            Selecione a sua turma, o grupo correspondente, a data e o horário disponível para a apresentação do seu Trabalho de Conclusão de Curso perante a banca examinadora do SENAI.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-custom-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-custom-accent" />
              Duração da Apresentação: <strong>{config?.duracao_apresentacao_minutos || 35} minutos</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-400" />
              {turmaAtual?.sala_ou_local || 'Auditório / Laboratório SENAI'}
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Sucesso após confirmação */}
      {sucesso && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-fade-in space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-custom-text font-sans">
                Agendamento Confirmado com Sucesso no SQLite!
              </h3>
              <p className="text-xs text-custom-muted leading-relaxed font-sans">
                A banca examinadora foi registrada para o <strong className="text-custom-text">{sucesso.grupo_nome}</strong> na turma <strong className="text-custom-text">{sucesso.turma_nome}</strong>.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Data: {sucesso.data}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Horário: {sucesso.horario}
                </span>
                {sucesso.sala_ou_local && (
                  <span className="px-2.5 py-1 rounded-lg bg-custom-card text-custom-muted border border-custom-border">
                    Local: {sucesso.sala_ou_local}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateToQuadro && onNavigateToQuadro()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-md"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver no Quadro Geral de Agendamentos
            </button>
            <button
              onClick={() => setSucesso(null)}
              className="px-4 py-2 text-xs font-semibold text-custom-muted hover:text-custom-text transition-colors"
            >
              Realizar outro agendamento
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de Erro Geral */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-medium font-sans">{error}</span>
        </div>
      )}

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Passo 1: Seleção da Turma */}
        <div className="bg-custom-card border border-custom-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-custom-border pb-3">
            <label className="text-sm font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans flex items-center gap-2">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">1</span>
              Selecione a sua Turma
            </label>
            <span className="text-xs text-custom-muted font-sans">
              {config?.turmas?.length || 0} turma(s) disponíveis
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {config?.turmas?.map(turma => {
              const isSelected = selectedTurmaId === turma.id;
              const agendadosDestaTurma = agendamentos.filter(a => a.turma_id === turma.id).length;
              const totalGrupos = turma.grupos.length;

              return (
                <button
                  key={turma.id}
                  type="button"
                  onClick={() => setSelectedTurmaId(turma.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-[#E30613]/10 border-[#E30613] text-custom-text shadow-md shadow-[#E30613]/15 ring-2 ring-[#E30613]'
                      : 'bg-custom-bg border-custom-border text-custom-muted hover:border-[#E30613]/50 hover:text-custom-text'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-bold text-sm font-sans ${isSelected ? 'text-[#E30613] dark:text-[#ff3b47]' : 'text-custom-text'}`}>
                        {turma.nome}
                      </h4>
                      <p className="text-xs text-custom-muted mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {turma.sala_ou_local}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-[#E30613] dark:text-[#ff3b47] shrink-0" />
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-custom-border flex items-center justify-between text-[11px]">
                    <span className="text-custom-muted">Ocupação de Bancas:</span>
                    <span className="font-bold font-mono text-[#E30613] dark:text-[#ff3b47]">
                      {agendadosDestaTurma} / {totalGrupos} Grupos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {turmaAtual && (
          <>
            {/* Passo 2: Seleção do Grupo de TCC */}
            <div className="bg-custom-card border border-custom-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-custom-border pb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">2</span>
                  Selecione o Grupo de TCC
                </label>
                <span className="text-xs text-custom-muted font-sans">
                  {gruposAgendadosMap.size} de {turmaAtual.grupos.length} já agendados
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {turmaAtual.grupos.map((grupoItem, idx) => {
                  const grupoNome = typeof grupoItem === 'string' ? grupoItem : grupoItem.nome;
                  const grupoProjeto = typeof grupoItem === 'object' ? grupoItem.projeto : '';
                  const grupoTema = typeof grupoItem === 'object' ? grupoItem.tema : '';
                  const grupoIntegrantes = typeof grupoItem === 'object' && Array.isArray(grupoItem.integrantes) ? grupoItem.integrantes : [];

                  const jaAgendado = gruposAgendadosMap.has(grupoNome);
                  const dadosAgendamento = gruposAgendadosMap.get(grupoNome);
                  const isSelected = selectedGrupo === grupoNome;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={jaAgendado}
                      onClick={() => {
                        setSelectedGrupo(grupoNome);
                        if (grupoProjeto && !observacoes) {
                          setObservacoes(`Projeto: ${grupoProjeto}${grupoTema ? ` - ${grupoTema}` : ''}`);
                        }
                      }}
                      className={`text-left p-4 rounded-xl border transition-all text-xs font-sans relative flex flex-col justify-between ${
                        jaAgendado
                          ? 'opacity-60 bg-custom-bg/50 border-custom-border/60 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#E30613]/10 border-[#E30613] text-custom-text shadow-md shadow-[#E30613]/15 ring-2 ring-[#E30613]'
                            : 'bg-custom-bg border-custom-border text-custom-text hover:border-[#E30613]/60 hover:bg-[#E30613]/5'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono ${
                              isSelected
                                ? 'bg-[#E30613] text-white'
                                : 'bg-custom-card border border-custom-border text-[#E30613] dark:text-[#ff3b47]'
                            }`}>
                              {grupoNome}
                            </span>
                            {grupoProjeto && (
                              <span className="font-extrabold text-sm text-custom-text leading-tight">
                                {grupoProjeto}
                              </span>
                            )}
                          </div>

                          {jaAgendado ? (
                            <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
                              {dadosAgendamento?.data ? `${dadosAgendamento.data.slice(5)} às ${dadosAgendamento.horario}` : 'Confirmado'}
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-[#E30613] dark:text-[#ff3b47] shrink-0" />
                          ) : null}
                        </div>

                        {grupoTema && (
                          <p className="text-[11px] text-custom-muted line-clamp-2 leading-relaxed">
                            <strong className="text-custom-text font-medium">Tema:</strong> {grupoTema}
                          </p>
                        )}
                      </div>

                      {grupoIntegrantes.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-custom-border/60 flex items-center gap-1.5 text-[11px] text-custom-muted">
                          <Users className="h-3.5 w-3.5 text-[#E30613] dark:text-[#ff3b47] shrink-0" />
                          <span className="truncate">
                            <strong className="text-custom-text">Integrantes:</strong> {grupoIntegrantes.join(', ')}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedGrupo && (() => {
                const gObj = turmaAtual.grupos.find(g => (typeof g === 'string' ? g : g.nome) === selectedGrupo);
                const gProjeto = typeof gObj === 'object' ? gObj.projeto : '';
                const gTema = typeof gObj === 'object' ? gObj.tema : '';
                const gIntegrantes = typeof gObj === 'object' && Array.isArray(gObj.integrantes) ? gObj.integrantes : [];

                return (
                  <div className="p-4 rounded-xl bg-[#E30613]/10 border border-[#E30613]/30 text-xs text-custom-text font-sans space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#E30613] dark:text-[#ff3b47] shrink-0" />
                      <span>
                        Grupo selecionado: <strong className="text-[#E30613] dark:text-[#ff3b47]">{selectedGrupo}</strong>
                        {gProjeto ? ` — ${gProjeto}` : ''}
                      </span>
                    </div>
                    {gIntegrantes.length > 0 && (
                      <p className="text-custom-muted pl-6">
                        <strong className="text-custom-text">Integrantes:</strong> {gIntegrantes.join(', ')}
                      </p>
                    )}
                    {gTema && (
                      <p className="text-custom-muted pl-6">
                        <strong className="text-custom-text">Tema do TCC:</strong> {gTema}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Passo 3: Seleção do Dia da Apresentação */}
            <div className="bg-custom-card border border-custom-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-custom-border pb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">3</span>
                  Selecione o Dia da Apresentação
                </label>
                <span className="text-xs text-custom-muted font-sans">
                  {turmaAtual.dias_disponiveis?.length || 0} dias disponíveis
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {turmaAtual.dias_disponiveis?.map((diaItem) => {
                  const isSelected = selectedData === diaItem.data;
                  // Calcula quantas vagas estão disponíveis neste dia
                  const ocupadosNesteDia = agendamentosTurma.filter(a => a.data === diaItem.data).length;
                  const totalVagasDia = diaItem.horarios.length;
                  const vagasRestantes = totalVagasDia - ocupadosNesteDia;

                  return (
                    <button
                      key={diaItem.data}
                      type="button"
                      onClick={() => setSelectedData(diaItem.data)}
                      disabled={vagasRestantes <= 0}
                      className={`text-left p-3 sm:p-4 rounded-xl border transition-all relative ${
                        vagasRestantes <= 0
                          ? 'opacity-50 bg-custom-bg border-custom-border cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#E30613]/10 border-[#E30613] text-custom-text shadow-md ring-2 ring-[#E30613]'
                            : 'bg-custom-bg border-custom-border text-custom-muted hover:border-[#E30613]/50 hover:text-custom-text'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] truncate">
                          {diaItem.dia_semana || 'Data da Banca'}
                        </span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E30613] dark:text-[#ff3b47] shrink-0" />}
                      </div>

                      <div className="text-xs sm:text-base font-bold text-custom-text font-mono truncate">
                        {diaItem.data}
                      </div>

                      <div className="mt-2 pt-2 border-t border-custom-border text-[10px] sm:text-[11px] flex items-center justify-between">
                        <span className="hidden sm:inline">Vagas Livres:</span>
                        <span className="sm:hidden">Vagas:</span>
                        <span className={`font-bold font-mono ${vagasRestantes > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {vagasRestantes}/{totalVagasDia}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passo 4: Seleção do Horário (Exatamente 4 Colunas) */}
            {selectedData && (
              <div className="bg-custom-card border border-custom-border rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-custom-border pb-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">4</span>
                    Selecione o Horário Desejado
                  </label>
                  <span className="text-xs text-custom-muted font-sans">
                    Slots de {config?.duracao_apresentacao_minutos || 35} min
                  </span>
                </div>

                {(() => {
                  const diaObj = turmaAtual.dias_disponiveis?.find(d => d.data === selectedData);
                  if (!diaObj || !diaObj.horarios?.length) {
                    return (
                      <p className="text-xs text-custom-muted">Nenhum horário cadastrado para este dia.</p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {diaObj.horarios.map((hora) => {
                        const ocupado = horariosOcupadosMap.has(hora);
                        const dadosOcupado = horariosOcupadosMap.get(hora);
                        const isSelected = selectedHorario === hora;

                        return (
                          <button
                            key={hora}
                            type="button"
                            disabled={ocupado}
                            onClick={() => setSelectedHorario(hora)}
                            className={`p-3 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                              ocupado
                                ? 'bg-custom-bg/40 border-custom-border/50 text-custom-muted/50 cursor-not-allowed opacity-60'
                                : isSelected
                                  ? 'bg-[#E30613] text-white border-[#E30613] font-bold shadow-lg shadow-[#E30613]/30 scale-[1.03] ring-2 ring-[#E30613]'
                                  : 'bg-custom-bg border-custom-border text-custom-text hover:border-[#E30613] hover:bg-[#E30613]/5'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-bold font-mono tracking-tight leading-tight">
                              {hora}
                            </span>
                            
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                              ocupado
                                ? 'text-rose-400'
                                : isSelected
                                  ? 'text-white/95'
                                  : 'text-emerald-500 dark:text-emerald-400'
                            }`}>
                              {ocupado ? (dadosOcupado?.grupo_nome ? `Ocupado` : 'Reservado') : 'Disponível'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Passo 5: Observações Opcionais */}
            <div className="bg-custom-card border border-custom-border rounded-2xl p-6 shadow-sm space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">5</span>
                <FileText className="h-4 w-4" />
                Título do TCC / Observações Adicionais (Opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Título definitivo do projeto, necessidade de conexão de bancada externa, etc..."
                rows={2}
                className="w-full px-4 py-3 text-sm rounded-xl bg-custom-bg border border-custom-border text-custom-text placeholder-custom-muted/60 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-colors font-sans"
              />
            </div>

            {/* Passo 6: Palavra-Chave Secreta do Grupo */}
            <div className="bg-custom-card border border-custom-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-custom-border pb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">6</span>
                  <KeyRound className="h-4 w-4" />
                  Palavra-Chave Secreta do Grupo (Obrigatória)
                </label>
                <span className="text-xs text-rose-400 font-sans font-semibold">
                  * Autenticação do Grupo
                </span>
              </div>

              <p className="text-xs text-custom-muted font-sans leading-relaxed">
                Para confirmar a reserva e garantir a segurança do seu grupo, digite a <strong>palavra secreta</strong> que o <strong>Professor William</strong> entregou pessoalmente para você.
              </p>

              <div className="relative max-w-md">
                <input
                  ref={palavraChaveInputRef}
                  type={showPalavraChave ? 'text' : 'password'}
                  value={palavraChave}
                  onChange={(e) => setPalavraChave(e.target.value)}
                  placeholder="Digite a palavra secreta..."
                  className="w-full px-4 py-3 text-sm rounded-xl bg-custom-bg border border-custom-border text-custom-text placeholder-custom-muted/60 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPalavraChave(!showPalavraChave)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-muted hover:text-custom-text p-1 transition-colors"
                  title={showPalavraChave ? 'Ocultar' : 'Exibir'}
                >
                  {showPalavraChave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-custom-muted font-sans">
                * Uma vez confirmado, o horário será gravado no banco SQLite local do projeto.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onNavigateToQuadro && (
                  <button
                    type="button"
                    onClick={onNavigateToQuadro}
                    className="flex-1 sm:flex-none px-5 py-3 text-sm font-semibold text-custom-muted hover:text-custom-text rounded-xl border border-custom-border hover:bg-white/5 transition-colors"
                  >
                    Ver Agendamentos
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting || !selectedTurmaId || !selectedGrupo || !selectedData || !selectedHorario || !palavraChave.trim()}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#E30613] hover:bg-[#b8050f] active:scale-95 transition-all rounded-xl shadow-xl shadow-[#E30613]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gravando no Banco SQLite...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar Agendamento da Banca
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </form>

      {/* Modal de Alerta de Palavra-Chave Incorreta */}
      <PalavraIncorretaModal
        isOpen={!!modalErroPalavra}
        onClose={() => setModalErroPalavra('')}
        onTentarNovamente={() => {
          setPalavraChave('');
          setTimeout(() => {
            palavraChaveInputRef.current?.focus();
          }, 100);
        }}
        mensagem={modalErroPalavra}
        grupoNome={selectedGrupo}
      />
    </div>
  );
}
