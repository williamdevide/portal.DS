import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, ShieldCheck, Lock, Trash2, Edit3, 
  RefreshCw, PlusCircle, AlertCircle, CheckCircle2, Search, 
  MapPin, X, AlertTriangle, Layers, KeyRound, Copy
} from 'lucide-react';
import { 
  obterConfiguracao, 
  listarAgendamentos, 
  excluirAgendamento, 
  atualizarAgendamento,
  obterPalavrasSecretas
} from '../../services/agendamentoService';
import AdminPinModal from './AdminPinModal';

export default function QuadroAgendamentos({ onNavigateToNovo }) {
  const [config, setConfig] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Filtros
  const [filtroTurma, setFiltroTurma] = useState('todas');
  const [filtroData, setFiltroData] = useState('todas');
  const [termoBusca, setTermoBusca] = useState('');

  // Modo Professor e Segurança
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState(() => {
    return sessionStorage.getItem('admin_pin_session') || '';
  });

  // Modal de Edição de Agendamento
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Confirmação de exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal de Palavras-Chave Secretas (Professor)
  const [isPalavrasModalOpen, setIsPalavrasModalOpen] = useState(false);
  const [palavrasSecretas, setPalavrasSecretas] = useState([]);
  const [loadingPalavras, setLoadingPalavras] = useState(false);
  const [palavrasError, setPalavrasError] = useState('');
  const [copiadoIdx, setCopiadoIdx] = useState(null);

  const abrirModalPalavras = async () => {
    if (!adminPin) return;
    setIsPalavrasModalOpen(true);
    setLoadingPalavras(true);
    setPalavrasError('');
    try {
      const dados = await obterPalavrasSecretas(adminPin);
      setPalavrasSecretas(dados?.turmas || []);
    } catch (err) {
      setPalavrasError(err.message || 'Falha ao consultar palavras-chave.');
    } finally {
      setLoadingPalavras(false);
    }
  };

  const copiarPalavra = (palavra, idx) => {
    navigator.clipboard.writeText(palavra);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  // Carrega dados da API SQLite
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      const [confData, agendData] = await Promise.all([
        obterConfiguracao(),
        listarAgendamentos()
      ]);
      setConfig(confData);
      setAgendamentos(agendData);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      setError('Falha ao comunicar com o banco SQLite. Verifique se o servidor está ativo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Login de Sucesso no Modal do Professor
  const handleAdminSuccess = (pin) => {
    setAdminPin(pin);
    sessionStorage.setItem('admin_pin_session', pin);
    setFeedback({
      tipo: 'sucesso',
      texto: 'Modo Professor desbloqueado com sucesso! Ações de edição e cancelamento liberadas.'
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Encerrar sessão do professor
  const handleLogoutAdmin = () => {
    setAdminPin('');
    sessionStorage.removeItem('admin_pin_session');
    setFeedback({
      tipo: 'info',
      texto: 'Modo Professor encerrado. A interface voltou para modo somente leitura.'
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Confirmação e Execução de Exclusão
  const confirmarExclusao = async () => {
    if (!itemParaExcluir || !adminPin) return;

    setDeleteLoading(true);
    try {
      await excluirAgendamento(itemParaExcluir.id, adminPin);
      setFeedback({
        tipo: 'sucesso',
        texto: `Agendamento do grupo "${itemParaExcluir.grupo_nome}" foi excluído. O horário está vago novamente!`
      });
      setItemParaExcluir(null);
      await carregarDados();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setError(err.message || 'Falha ao excluir agendamento.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Abertura do Modal de Edição
  const abrirEdicao = (item) => {
    setEditItem(item);
    setEditData(item.data);
    setEditHorario(item.horario);
    setEditObservacoes(item.observacoes || '');
  };

  // Salvar Edição
  const salvarEdicao = async (e) => {
    e.preventDefault();
    if (!editItem || !adminPin) return;

    setEditLoading(true);
    try {
      await atualizarAgendamento(
        editItem.id,
        {
          data: editData,
          horario: editHorario,
          observacoes: editObservacoes
        },
        adminPin
      );

      setFeedback({
        tipo: 'sucesso',
        texto: `Agendamento do grupo "${editItem.grupo_nome}" atualizado com sucesso no SQLite!`
      });
      setEditItem(null);
      await carregarDados();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar dados do agendamento.');
    } finally {
      setEditLoading(false);
    }
  };

  // Filtragem dos agendamentos
  const agendamentosFiltrados = agendamentos.filter(item => {
    const matchTurma = filtroTurma === 'todas' || item.turma_id === filtroTurma;
    const matchData = filtroData === 'todas' || item.data === filtroData;

    const turmaInfo = config?.turmas?.find(t => t.id === item.turma_id);
    const grupoInfo = turmaInfo?.grupos?.find(g => {
      const nome = typeof g === 'string' ? g : g.nome;
      return nome?.toLowerCase() === item.grupo_nome?.toLowerCase();
    });
    const projetoNome = typeof grupoInfo === 'object' ? grupoInfo.projeto || '' : '';
    const tema = typeof grupoInfo === 'object' ? grupoInfo.tema || '' : '';
    const integrantesStr = typeof grupoInfo === 'object' && Array.isArray(grupoInfo.integrantes) ? grupoInfo.integrantes.join(' ') : '';

    const matchBusca = termoBusca === '' || 
      item.grupo_nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.turma_nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      projetoNome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      tema.toLowerCase().includes(termoBusca.toLowerCase()) ||
      integrantesStr.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (item.observacoes && item.observacoes.toLowerCase().includes(termoBusca.toLowerCase()));

    return matchTurma && matchData && matchBusca;
  });

  // Estatísticas gerais
  const totalTurmas = config?.turmas?.length || 0;
  const totalAgendados = agendamentos.length;
  let totalGruposEsperados = 0;
  config?.turmas?.forEach(t => {
    totalGruposEsperados += t.grupos.length;
  });

  // Lista de datas únicas para o filtro
  const datasDisponiveis = Array.from(new Set(
    config?.turmas?.flatMap(t => t.dias_disponiveis.map(d => d.data)) || []
  )).sort();

  // Turma do item selecionado para edição (para buscar horários disponíveis)
  const turmaDoEditItem = config?.turmas?.find(t => t.id === editItem?.turma_id);
  const diaObjDoEditItem = turmaDoEditItem?.dias_disponiveis?.find(d => d.data === editData);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Banner de Cabeçalho do Quadro */}
      <div className="rounded-3xl p-6 sm:p-8 bg-custom-card border border-custom-border shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold bg-custom-accent/15 text-custom-accent border border-custom-accent/20">
            <Layers className="h-3.5 w-3.5" />
            Persistência SQLite
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-custom-text font-sans tracking-tight">
            Quadro Geral de Apresentações
          </h2>
          <p className="text-xs sm:text-sm text-custom-muted font-sans max-w-2xl leading-relaxed">
            Acompanhe em tempo real as bancas de TCC agendadas pelos alunos para a disciplina de Projeto de Software III.
          </p>
        </div>

        {/* Botões do Topo (Novo Agendamento e Modo Professor) */}
        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToNovo && (
            <button
              onClick={onNavigateToNovo}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-custom-accent hover:opacity-90 active:scale-95 transition-all rounded-xl shadow-md shadow-custom-accent/20"
            >
              <PlusCircle className="h-4 w-4" />
              Agendar Nova Banca
            </button>
          )}

          {adminPin ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Modo Professor Ativo
                </span>
                <button
                  onClick={handleLogoutAdmin}
                  className="text-[11px] font-semibold text-custom-muted hover:text-rose-400 underline ml-2 transition-colors"
                  title="Sair do modo de edição"
                >
                  Bloquear
                </button>
              </div>

              <button
                onClick={abrirModalPalavras}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-custom-accent rounded-xl border border-custom-accent/30 bg-custom-accent/10 hover:bg-custom-accent/20 transition-colors shadow-sm"
                title="Consultar palavras-chave secretas dos grupos"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Palavras-Chave dos Grupos
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-custom-muted hover:text-custom-text rounded-xl border border-custom-border hover:bg-white/5 transition-colors"
              title="Acesso exclusivo do professor com PIN"
            >
              <Lock className="h-4 w-4 text-custom-accent" />
              Modo Professor
            </button>
          )}

          <button
            onClick={carregarDados}
            disabled={loading}
            className="p-2.5 text-custom-muted hover:text-custom-text rounded-xl border border-custom-border hover:bg-white/5 transition-colors"
            title="Atualizar dados do banco SQLite"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-custom-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cards de Métricas e KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-custom-card border border-custom-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-custom-muted">
            Bancas Confirmadas
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-custom-text font-mono">
              {totalAgendados}
            </span>
            <span className="text-xs text-custom-muted font-mono">
              / {totalGruposEsperados} grupos
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-black/20 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-custom-accent transition-all duration-500"
              style={{ width: `${totalGruposEsperados ? (totalAgendados / totalGruposEsperados) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-custom-card border border-custom-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-custom-muted">
            Grupos Pendentes
          </span>
          <div className="mt-2 text-3xl font-extrabold text-amber-500 font-mono">
            {Math.max(0, totalGruposEsperados - totalAgendados)}
          </div>
          <p className="mt-2 text-[11px] text-custom-muted">
            Aguardando escolha de data
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-custom-card border border-custom-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-custom-muted">
            Turmas Ativas
          </span>
          <div className="mt-2 text-3xl font-extrabold text-custom-text font-mono">
            {totalTurmas}
          </div>
          <p className="mt-2 text-[11px] text-custom-muted">
            Cadastradas no JSON
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-custom-card border border-custom-border shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-custom-muted">
            Banco de Dados
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-lg font-bold text-emerald-400 font-mono">
              SQLite Conectado
            </span>
          </div>
          <p className="mt-2 text-[11px] text-custom-muted font-mono truncate">
            backend/database/agendamentos.db
          </p>
        </div>
      </div>

      {/* Feedback de Notificação */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-fade-in ${
          feedback.tipo === 'sucesso' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-custom-accent/10 border-custom-accent/30 text-custom-accent'
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.texto}</span>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-semibold flex items-center gap-3 animate-shake">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-2xl bg-custom-card border border-custom-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-custom-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por grupo ou projeto..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text placeholder-custom-muted/60 focus:outline-none focus:border-custom-accent transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro de Turma */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-custom-muted">Turma:</span>
            <select
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent"
            >
              <option value="todas">Todas as Turmas</option>
              {config?.turmas?.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Data */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-custom-muted">Data:</span>
            <select
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent font-mono"
            >
              <option value="todas">Todas as Datas</option>
              {datasDisponiveis.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos / Tabela Visual */}
      {loading ? (
        <div className="py-16 text-center text-custom-muted flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-2 border-custom-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Atualizando quadro de bancas...</p>
        </div>
      ) : agendamentosFiltrados.length === 0 ? (
        <div className="py-16 text-center bg-custom-card border border-custom-border rounded-2xl p-8">
          <Calendar className="h-12 w-12 text-custom-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-custom-text font-sans">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-xs text-custom-muted mt-1 max-w-md mx-auto">
            {termoBusca || filtroTurma !== 'todas' || filtroData !== 'todas'
              ? 'Tente ajustar os filtros de busca ou turma selecionada.'
              : 'Os alunos ainda não iniciaram a escolha dos horários para esta disciplina.'}
          </p>
          {onNavigateToNovo && (
            <button
              onClick={onNavigateToNovo}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-custom-accent rounded-xl hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Realizar Primeiro Agendamento
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agendamentosFiltrados.map((item) => {
            const turmaInfo = config?.turmas?.find(t => t.id === item.turma_id);
            const grupoInfo = turmaInfo?.grupos?.find(g => {
              const nome = typeof g === 'string' ? g : g.nome;
              return nome?.toLowerCase() === item.grupo_nome?.toLowerCase();
            });
            const projetoNome = typeof grupoInfo === 'object' ? grupoInfo.projeto : '';
            const tema = typeof grupoInfo === 'object' ? grupoInfo.tema : '';
            const integrantes = typeof grupoInfo === 'object' && Array.isArray(grupoInfo.integrantes) ? grupoInfo.integrantes : [];

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-custom-card border border-custom-border hover:border-[#E30613]/50 shadow-sm transition-all duration-200 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Topo do Card: Data e Horário */}
                  <div className="flex items-center justify-between gap-2 border-b border-custom-border pb-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E30613]/15 text-[#E30613] dark:text-[#ff3b47] border border-[#E30613]/25 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {item.horario}
                    </span>
                    <span className="text-xs font-bold font-mono text-custom-text flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-custom-muted" />
                      {item.data}
                    </span>
                  </div>

                  {/* Nome do Grupo e Projeto */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black font-mono bg-[#E30613]/10 text-[#E30613] dark:text-[#ff3b47] border border-[#E30613]/20">
                        {item.grupo_nome}
                      </span>
                      {projetoNome && (
                        <h4 className="text-sm font-extrabold text-custom-text font-sans leading-snug">
                          {projetoNome}
                        </h4>
                      )}
                    </div>

                    {/* Integrantes */}
                    {integrantes.length > 0 && (
                      <div className="pt-1.5 flex items-center gap-1.5 text-xs text-custom-text font-sans">
                        <Users className="h-3.5 w-3.5 text-[#E30613] dark:text-[#ff3b47] shrink-0" />
                        <span className="truncate">
                          <strong className="text-custom-text">Integrantes:</strong> {integrantes.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Tema */}
                    {tema && (
                      <p className="text-[11px] text-custom-muted line-clamp-2 leading-relaxed pt-1">
                        <strong className="text-custom-text font-medium">Tema:</strong> {tema}
                      </p>
                    )}
                  </div>

                  {/* Turma e Sala */}
                  <div className="mt-3 pt-2.5 border-t border-custom-border/60 space-y-1 text-xs text-custom-muted font-sans">
                    <p className="truncate font-semibold text-[#E30613] dark:text-[#ff3b47]">
                      {item.turma_nome}
                    </p>
                    {turmaInfo?.sala_ou_local && (
                      <p className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{turmaInfo.sala_ou_local}</span>
                      </p>
                    )}
                  </div>

                  {/* Observações / Título TCC */}
                  {item.observacoes && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-custom-bg border border-custom-border text-[11px] text-custom-muted italic font-sans leading-relaxed">
                      "{item.observacoes}"
                    </div>
                  )}
                </div>

                {/* Rodapé do Card: Data de Registro e Ações do Professor */}
                <div className="mt-4 pt-3 border-t border-custom-border flex items-center justify-between text-[10px] text-custom-muted">
                  <span className="font-mono">
                    ID #{item.id} • {item.criado_em?.split('T')[0] || 'Confirmado'}
                  </span>

                  {/* Botões do Modo Professor (só aparecem se adminPin estiver ativo) */}
                  {adminPin ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => abrirEdicao(item)}
                        className="p-1.5 text-[#E30613] dark:text-[#ff3b47] hover:bg-[#E30613]/15 rounded-lg transition-colors"
                        title="Editar agendamento (Professor)"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setItemParaExcluir(item)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/15 rounded-lg transition-colors"
                        title="Excluir agendamento (Professor)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Confirmado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Autenticação com PIN do Professor */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      {/* Modal de Confirmação de Exclusão (Professor) */}
      {itemParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-custom-card border border-custom-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-custom-text font-sans">
                  Excluir Agendamento de TCC?
                </h3>
                <p className="text-xs text-custom-muted">
                  Ação exclusiva do Professor (William Devidé)
                </p>
              </div>
            </div>

            <p className="text-xs text-custom-muted font-sans leading-relaxed">
              Você está prestes a cancelar a banca do <strong className="text-custom-text">{itemParaExcluir.grupo_nome}</strong> agendada para <strong>{itemParaExcluir.data} às {itemParaExcluir.horario}</strong>. Essa ação liberará o horário imediatamente para outros grupos no banco SQLite.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemParaExcluir(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-xs font-semibold text-custom-muted hover:text-custom-text transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {deleteLoading ? 'Removendo...' : 'Sim, Excluir Banca'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Agendamento (Professor) */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-custom-card border border-custom-border rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-custom-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-custom-accent" />
                <h3 className="text-base font-bold text-custom-text font-sans">
                  Editar Agendamento (Modo Professor)
                </h3>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="p-1 text-custom-muted hover:text-custom-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-custom-bg border border-custom-border text-xs">
              <span className="text-custom-muted">Grupo:</span>{' '}
              <strong className="text-custom-text">{editItem.grupo_nome}</strong>
              <br />
              <span className="text-custom-muted">Turma:</span>{' '}
              <span className="text-custom-accent font-medium">{editItem.turma_nome}</span>
            </div>

            <form onSubmit={salvarEdicao} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-custom-muted mb-1.5">
                  Data da Apresentação
                </label>
                <select
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent font-mono"
                >
                  {turmaDoEditItem?.dias_disponiveis?.map(d => (
                    <option key={d.data} value={d.data}>
                      {d.data} - {d.dia_semana}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-custom-muted mb-1.5">
                  Horário da Banca
                </label>
                <select
                  value={editHorario}
                  onChange={(e) => setEditHorario(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent font-mono"
                >
                  {diaObjDoEditItem?.horarios?.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-custom-muted mb-1.5">
                  Título do TCC / Observações
                </label>
                <textarea
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-custom-border">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  disabled={editLoading}
                  className="px-4 py-2 text-xs font-semibold text-custom-muted hover:text-custom-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-custom-accent rounded-xl hover:opacity-90 transition-all shadow-md shadow-custom-accent/20"
                >
                  {editLoading ? 'Salvando...' : 'Salvar Alterações no SQLite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Consulta das Palavras-Chave Secretas dos Grupos (Professor) */}
      {isPalavrasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-custom-card border border-custom-border rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-custom-border pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-custom-accent/15 text-custom-accent">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-custom-text font-sans">
                    Palavras-Chave Secretas dos Grupos
                  </h3>
                  <p className="text-xs text-custom-muted">
                    Entregue confidencialmente cada palavra-chave ao seu respectivo grupo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPalavrasModalOpen(false)}
                className="p-1 text-custom-muted hover:text-custom-text rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingPalavras ? (
              <div className="py-12 text-center text-custom-muted flex flex-col items-center justify-center">
                <RefreshCw className="h-6 w-6 text-custom-accent animate-spin mb-2" />
                <p className="text-xs">Buscando palavras-chave no servidor...</p>
              </div>
            ) : palavrasError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {palavrasError}
              </div>
            ) : (
              <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                {palavrasSecretas.map((turma) => (
                  <div key={turma.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-custom-border pb-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-custom-accent font-sans">
                        {turma.nome}
                      </h4>
                      <span className="text-[11px] text-custom-muted font-mono">
                        {turma.grupos.length} grupos cadastrados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {turma.grupos.map((g) => {
                        const uniqueKey = `${turma.id}-${g.nome}`;
                        const isCopiado = copiadoIdx === uniqueKey;

                        return (
                          <div
                            key={g.nome}
                            className="p-3 rounded-xl bg-custom-bg border border-custom-border flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-custom-text">
                                  {g.nome}
                                </span>
                                {g.projeto && (
                                  <span className="font-bold text-[#E30613] dark:text-[#ff3b47] truncate">
                                    • {g.projeto}
                                  </span>
                                )}
                              </div>
                              {g.integrantes && g.integrantes.length > 0 && (
                                <p className="text-[10px] text-custom-muted truncate">
                                  {g.integrantes.join(', ')}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 rounded-lg bg-[#E30613]/15 text-[#E30613] dark:text-[#ff3b47] font-mono font-bold text-xs border border-[#E30613]/25">
                                {g.palavra_secreta}
                              </span>
                              <button
                                onClick={() => copiarPalavra(g.palavra_secreta, uniqueKey)}
                                className="p-1 text-custom-muted hover:text-custom-text rounded hover:bg-white/5 transition-colors"
                                title="Copiar palavra-chave"
                              >
                                {isCopiado ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-custom-border shrink-0">
              <span className="text-[11px] text-custom-muted">
                ⚠️ As palavras-chave são protegidas e nunca são expostas aos alunos antes do agendamento.
              </span>
              <button
                type="button"
                onClick={() => setIsPalavrasModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-custom-muted hover:text-custom-text transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
