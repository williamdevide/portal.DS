import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, ShieldCheck, Lock, Trash2, Edit3, 
  RefreshCw, PlusCircle, AlertCircle, CheckCircle2, Search, 
  MapPin, X, AlertTriangle, Layers, KeyRound, Copy, Users,
  Table, LayoutGrid, Download, FileText, FileSpreadsheet, ChevronDown
} from 'lucide-react';
import { 
  obterConfiguracao, 
  listarAgendamentos, 
  inscreverAgendamentos,
  excluirAgendamento, 
  atualizarAgendamento,
  obterPalavrasSecretas,
  obterStatusAgendamento,
  alternarStatusAgendamento
} from '../../services/agendamentoService';
import { 
  exportarAgendamentosParaPDF, 
  exportarAgendamentosParaCSV 
} from '../../services/exportAgendamentosService';
import AdminPinModal from './AdminPinModal';
import { 
  observarEstadoAuth, 
  logoutProfessor, 
  obterProfessorAtual 
} from '../../services/authService';

/**
 * Componente que renderiza o conteúdo completo do card de agendamento de uma banca
 */
function CardAgendamento({ item, config, adminPin, isProfessor, abrirEdicao, setItemParaExcluir, isHighlighted = false }) {
  const isDocente = Boolean(isProfessor || adminPin);
  const turmaInfo = config?.turmas?.find(t => t.id === item.turma_id);
  const grupoInfo = turmaInfo?.grupos?.find(g => {
    const nome = typeof g === 'string' ? g : g.nome;
    return nome?.toLowerCase() === item.grupo_nome?.toLowerCase();
  });
  const projetoNome = typeof grupoInfo === 'object' ? grupoInfo.projeto : '';
  const tema = typeof grupoInfo === 'object' ? grupoInfo.tema : '';
  const integrantes = typeof grupoInfo === 'object' && Array.isArray(grupoInfo.integrantes) ? grupoInfo.integrantes : [];

  return (
    <div className={`p-3 sm:p-3.5 rounded-xl bg-custom-card border transition-all duration-200 flex flex-col justify-between h-full relative group shadow-sm min-w-0 overflow-hidden ${
      isHighlighted 
        ? 'border-[#E30613] ring-2 ring-[#E30613]/50 shadow-md shadow-[#E30613]/10' 
        : 'border-custom-border hover:border-[#E30613]/50'
    }`}>
      <div className="space-y-2 min-w-0">
        {/* Topo do Card: Horário e Data */}
        <div className="flex items-center justify-between gap-1 border-b border-custom-border pb-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-[#E30613]/15 text-[#E30613] dark:text-[#ff3b47] border border-[#E30613]/25 font-mono shrink-0">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-none">{item.horario}</span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold font-mono text-custom-muted flex items-center gap-1 shrink-0">
            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-custom-muted" />
            {item.data.slice(5).replace('-', '/')}
          </span>
        </div>

        {/* Nome do Grupo e Projeto */}
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black font-mono bg-[#E30613]/10 text-[#E30613] dark:text-[#ff3b47] border border-[#E30613]/20 shrink-0">
              {item.grupo_nome}
            </span>
            {projetoNome && (
              <h4 className="text-xs font-extrabold text-custom-text font-sans leading-snug break-words line-clamp-2 min-w-0">
                {projetoNome}
              </h4>
            )}
          </div>

          {/* Integrantes */}
          {integrantes.length > 0 && (
            <div className="pt-0.5 flex items-start gap-1.5 text-[10px] sm:text-[11px] text-custom-text font-sans min-w-0">
              <Users className="h-3.5 w-3.5 text-[#E30613] dark:text-[#ff3b47] shrink-0 mt-0.5" />
              <span className="line-clamp-2 break-words leading-tight min-w-0">
                <strong className="text-custom-text font-medium">Integrantes:</strong> {integrantes.join(', ')}
              </span>
            </div>
          )}

          {/* Tema */}
          {tema && (
            <p className="text-[10px] text-custom-muted line-clamp-2 break-words leading-relaxed pt-0.5 min-w-0">
              <strong className="text-custom-text font-medium">Tema:</strong> {tema}
            </p>
          )}
        </div>

        {/* Turma e Sala */}
        <div className="pt-1.5 border-t border-custom-border/60 space-y-0.5 text-[10px] sm:text-[11px] text-custom-muted font-sans min-w-0">
          <p className="truncate font-semibold text-[#E30613] dark:text-[#ff3b47]">
            {item.turma_nome}
          </p>
          {turmaInfo?.sala_ou_local && (
            <p className="flex items-center gap-1 text-[9px] sm:text-[10px] truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{turmaInfo.sala_ou_local}</span>
            </p>
          )}
        </div>

        {/* Observações / Título TCC */}
        {item.observacoes && (
          <div className="p-1.5 sm:p-2 rounded-lg bg-custom-bg border border-custom-border text-[9px] sm:text-[10px] text-custom-muted italic font-sans leading-relaxed line-clamp-2 break-words min-w-0">
            "{item.observacoes}"
          </div>
        )}
      </div>

      {/* Rodapé do Card: Data de Registro e Ações do Professor */}
      <div className="mt-2.5 pt-2 border-t border-custom-border flex items-center justify-between text-[10px] text-custom-muted min-w-0">
        <span className="font-mono text-[9px] text-custom-muted/80 truncate">
          ID #{item.id}
        </span>

        {/* Botões do Modo Professor (só aparecem se isDocente estiver ativo) */}
        {isDocente ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => abrirEdicao(item)}
              className="p-1 text-[#E30613] dark:text-[#ff3b47] hover:bg-[#E30613]/15 rounded-md transition-colors cursor-pointer"
              title="Editar agendamento (Professor)"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={() => setItemParaExcluir(item)}
              className="p-1 text-rose-500 hover:bg-rose-500/15 rounded-md transition-colors cursor-pointer"
              title="Excluir agendamento (Professor)"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Confirmado
          </span>
        )}
      </div>
    </div>
  );
}

export default function QuadroAgendamentos({ onNavigateToNovo }) {
  const [config, setConfig] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [viewMode, setViewMode] = useState('tabela'); // 'tabela' (padrão) ou 'cards'

  // Filtros
  const [filtroTurma, setFiltroTurma] = useState('todas');
  const [filtroData, setFiltroData] = useState('todas');
  const [termoBusca, setTermoBusca] = useState('');

  // Modo Professor e Segurança (Firebase Auth Google)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [professorUser, setProfessorUser] = useState(() => obterProfessorAtual());
  const isProfessor = Boolean(professorUser);
  const [agendamentoLiberado, setAgendamentoLiberado] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

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

  // Menu de Exportação de Agendamentos (Modo Professor)
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);

  const abrirModalPalavras = async () => {
    if (!isProfessor) {
      setIsPinModalOpen(true);
      return;
    }
    setIsPalavrasModalOpen(true);
    setLoadingPalavras(true);
    setPalavrasError('');
    try {
      const dados = await obterPalavrasSecretas();
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

  // Carrega configuração e agendamentos em nuvem (Firebase)
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
      setError('Falha ao carregar agendamentos em nuvem. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();

    const unsubAgendamentos = inscreverAgendamentos(null, (lista) => {
      if (Array.isArray(lista) && lista.length > 0) {
        setAgendamentos(lista);
      }
    });

    const unsubAuth = observarEstadoAuth((user) => {
      setProfessorUser(user);
    });

    let ativo = true;
    obterStatusAgendamento().then(res => {
      if (ativo && res) setAgendamentoLiberado(Boolean(res.liberado));
    }).catch(() => {});

    const statusHandler = (e) => {
      if (e?.detail && typeof e.detail.liberado === 'boolean') {
        setAgendamentoLiberado(e.detail.liberado);
      }
    };
    window.addEventListener('portal_status_agendamento_changed', statusHandler);

    try {
      const fb = sessionStorage.getItem('feedback_agendamento');
      if (fb) {
        setFeedback(JSON.parse(fb));
        sessionStorage.removeItem('feedback_agendamento');
        setTimeout(() => setFeedback(null), 7000);
      }
    } catch (e) {
      console.warn('Erro ao ler feedback_agendamento:', e);
    }

    return () => {
      ativo = false;
      if (typeof unsubAgendamentos === 'function') unsubAgendamentos();
      if (typeof unsubAuth === 'function') unsubAuth();
      window.removeEventListener('portal_status_agendamento_changed', statusHandler);
    };
  }, []);

  // Fecha o dropdown de exportação ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Exportação para PDF (A4 Paisagem formatado profissionalmente)
  const handleExportarPDF = () => {
    try {
      if (!agendamentosFiltrados || agendamentosFiltrados.length === 0) {
        setError('Nenhum agendamento realizado encontrado para exportar com os filtros atuais.');
        setTimeout(() => setError(''), 5000);
        return;
      }
      setIsExporting(true);
      const turmaObj = config?.turmas?.find(t => t.id === filtroTurma);
      const filtroTurmaNome = turmaObj ? turmaObj.nome : 'Todas as Turmas';
      const res = exportarAgendamentosParaPDF({
        agendamentos: agendamentosFiltrados,
        config,
        filtroTurmaNome,
        filtroDataStr: filtroData !== 'todas' ? filtroData : ''
      });
      setFeedback({
        tipo: 'sucesso',
        texto: `Documento PDF gerado com sucesso! ${res.total} ${res.total === 1 ? 'banca exportada' : 'bancas exportadas'} em ${res.totalPaginas} ${res.totalPaginas === 1 ? 'página' : 'páginas'}.`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      setError(err.message || 'Falha ao gerar relatório PDF.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Exportação para CSV (Padrão Excel pt-BR)
  const handleExportarCSV = () => {
    try {
      if (!agendamentosFiltrados || agendamentosFiltrados.length === 0) {
        setError('Nenhum agendamento realizado encontrado para exportar com os filtros atuais.');
        setTimeout(() => setError(''), 5000);
        return;
      }
      setIsExporting(true);
      const turmaObj = config?.turmas?.find(t => t.id === filtroTurma);
      const filtroTurmaNome = turmaObj ? turmaObj.nome : 'Todas as Turmas';
      const res = exportarAgendamentosParaCSV({
        agendamentos: agendamentosFiltrados,
        config,
        filtroTurmaNome
      });
      setFeedback({
        tipo: 'sucesso',
        texto: `Planilha CSV exportada com sucesso! ${res.total} ${res.total === 1 ? 'agendamento incluído' : 'agendamentos incluídos'}.`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      setError(err.message || 'Falha ao gerar planilha CSV.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Alterna o status de liberação dos agendamentos (Modo Professor com Google)
  const handleToggleLiberacao = async () => {
    if (!isProfessor) {
      setIsPinModalOpen(true);
      return;
    }
    setToggleLoading(true);
    try {
      const novoStatus = !agendamentoLiberado;
      await alternarStatusAgendamento(novoStatus);
      setAgendamentoLiberado(novoStatus);
      setFeedback({
        tipo: 'sucesso',
        texto: novoStatus 
          ? 'Agendamento permitido com sucesso! Os alunos agora podem escolher os horários das bancas.'
          : 'Agendamentos bloqueados com sucesso! O acesso dos alunos ao formulário está suspenso.'
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao alterar liberação de agendamentos.');
    } finally {
      setToggleLoading(false);
    }
  };

  // Login de Sucesso no Modal do Professor (Google)
  const handleAdminSuccess = (user) => {
    setProfessorUser(user);
    setFeedback({
      tipo: 'sucesso',
      texto: `Bem-vindo, Professor ${user.displayName || 'William'}! Acesso autenticado com Google liberado.`
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Encerrar sessão do professor
  const handleLogoutAdmin = async () => {
    await logoutProfessor();
    setProfessorUser(null);
    setFeedback({
      tipo: 'info',
      texto: 'Modo Professor desconectado. A interface voltou para modo somente leitura.'
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Confirmação e Execução de Exclusão
  const confirmarExclusao = async () => {
    if (!itemParaExcluir || !isProfessor) return;

    setDeleteLoading(true);
    try {
      await excluirAgendamento(itemParaExcluir.id);
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
    if (!editItem || !isProfessor) return;

    setEditLoading(true);
    try {
      await atualizarAgendamento(
        editItem.id,
        {
          data: editData,
          horario: editHorario,
          observacoes: editObservacoes
        }
      );

      setFeedback({
        tipo: 'sucesso',
        texto: `Agendamento do grupo "${editItem.grupo_nome}" atualizado com sucesso!`
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
      <div className="rounded-3xl p-6 sm:p-8 bg-custom-card border border-custom-border shadow-lg relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold bg-custom-accent/15 text-custom-accent border border-custom-accent/20">
            <Layers className="h-3.5 w-3.5" />
            Nuvem em Tempo Real (Firebase)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-custom-text font-sans tracking-tight">
            Quadro Geral de Apresentações
          </h2>
          <p className="text-xs sm:text-sm text-custom-muted font-sans max-w-2xl leading-relaxed">
            Acompanhe em tempo real as bancas de TCC agendadas pelos alunos para a disciplina de Projeto de Software III.
          </p>
        </div>

        {/* Botões do Topo (Novo Agendamento e Modo Professor) */}
        <div className="flex flex-wrap items-center gap-4">
          {onNavigateToNovo && (
            <div className="flex flex-col items-center">
              <button
                onClick={onNavigateToNovo}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-custom-accent hover:opacity-90 active:scale-95 transition-all rounded-xl shadow-md shadow-custom-accent/20 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Agendar Nova Banca
              </button>
              <div className="mt-1 text-[11px] font-semibold flex items-center gap-1.5 py-0.5">
                {agendamentoLiberado ? (
                  <span className="text-emerald-500 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Agendamentos liberados
                  </span>
                ) : (
                  <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1 font-mono">
                    <Lock className="h-3 w-3 shrink-0" />
                    Agendamentos bloqueados
                  </span>
                )}
              </div>
            </div>
          )}

          {isProfessor ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                {professorUser?.photoURL ? (
                  <img 
                    src={professorUser.photoURL} 
                    alt="Foto Docente" 
                    className="h-5 w-5 rounded-full object-cover border border-emerald-500/40"
                  />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                )}
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  Prof. William
                </span>
                <button
                  onClick={handleLogoutAdmin}
                  className="text-[11px] font-semibold text-custom-muted hover:text-rose-400 underline ml-2 transition-colors cursor-pointer"
                  title="Desconectar conta Google do professor"
                >
                  Sair
                </button>
              </div>

              {/* Botão de Liberação Docente conforme diretriz do usuário */}
              <button
                onClick={handleToggleLiberacao}
                disabled={toggleLoading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-sm cursor-pointer ${
                  agendamentoLiberado
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                }`}
                title="Configuração de liberação de agendamento para os alunos"
              >
                {toggleLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : agendamentoLiberado ? (
                  <Lock className="h-3.5 w-3.5 text-rose-500" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span>
                  {agendamentoLiberado ? 'Bloquear agendamentos' : 'Permitir Agendamento'}
                </span>
              </button>

              <button
                onClick={abrirModalPalavras}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-custom-accent rounded-xl border border-custom-accent/30 bg-custom-accent/10 hover:bg-custom-accent/20 transition-colors shadow-sm cursor-pointer"
                title="Consultar palavras-chave secretas dos grupos"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Palavras-Chave dos Grupos
              </button>

              {/* Botão de Exportação com Menu Suspenso (PDF e CSV) - Modo Professor */}
              <div className="relative z-30" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(prev => !prev)}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-custom-text rounded-xl border border-custom-border bg-custom-bg hover:bg-white/10 active:scale-95 transition-all shadow-sm cursor-pointer"
                  title={`Exportar agendamentos realizados (${agendamentosFiltrados.length} no filtro atual)`}
                >
                  <Download className="h-3.5 w-3.5 text-[#E30613] dark:text-[#ff3b47]" />
                  <span>Exportar</span>
                  <ChevronDown className={`h-3 w-3 text-custom-muted transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-custom-card border border-custom-border shadow-2xl p-1.5 z-50 animate-fade-in backdrop-blur-md">
                    <div className="px-3 py-2 border-b border-custom-border/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-custom-muted block">
                        Exportar Agendamentos
                      </span>
                      <span className="text-[11px] font-semibold text-custom-text">
                        {agendamentosFiltrados.length} {agendamentosFiltrados.length === 1 ? 'banca realizada' : 'bancas realizadas'}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          handleExportarPDF();
                        }}
                        disabled={isExporting}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-custom-text hover:bg-custom-bg rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/25 transition-colors">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-custom-text group-hover:text-[#E30613] dark:group-hover:text-[#ff3b47] transition-colors">
                            Exportar para PDF
                          </div>
                          <div className="text-[10px] text-custom-muted">
                            Formatado A4 Paisagem (Oficial)
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          handleExportarCSV();
                        }}
                        disabled={isExporting}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-custom-text hover:bg-custom-bg rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-custom-text group-hover:text-emerald-500 transition-colors">
                            Exportar para CSV
                          </div>
                          <div className="text-[10px] text-custom-muted">
                            Compatível com Excel (pt-BR)
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-custom-muted hover:text-custom-text rounded-xl border border-custom-border hover:bg-white/5 transition-colors cursor-pointer"
              title="Acesso exclusivo do professor com Conta Google"
            >
              <ShieldCheck className="h-4 w-4 text-custom-accent" />
              Login Professor (Google)
            </button>
          )}
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
              Firestore Ativo
            </span>
          </div>
          <p className="mt-2 text-[11px] text-custom-muted font-mono truncate">
            Google Cloud Firestore (Produção)
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
              className="px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent cursor-pointer"
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
              className="px-3 py-2 text-xs rounded-xl bg-custom-bg border border-custom-border text-custom-text focus:outline-none focus:border-custom-accent font-mono cursor-pointer"
            >
              <option value="todas">Todas as Datas</option>
              {datasDisponiveis.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Alternador de Visualização: Tabela vs Cards */}
          <div className="flex items-center rounded-xl bg-custom-bg border border-custom-border p-1">
            <button
              type="button"
              onClick={() => setViewMode('tabela')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tabela'
                  ? 'bg-custom-card text-[#E30613] dark:text-[#ff3b47] shadow-sm'
                  : 'text-custom-muted hover:text-custom-text'
              }`}
              title="Exibir em Tabela Matricial (Data x Horário)"
            >
              <Table className="h-3.5 w-3.5" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-custom-card text-[#E30613] dark:text-[#ff3b47] shadow-sm'
                  : 'text-custom-muted hover:text-custom-text'
              }`}
              title="Exibir em Grade de Cards"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Exibição dos Agendamentos: Tabela ou Cards */}
      {loading ? (
        <div className="py-16 text-center text-custom-muted flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-2 border-custom-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Atualizando quadro de bancas...</p>
        </div>
      ) : viewMode === 'tabela' ? (
        /* Visualização em TABELA (Cada Data em uma Linha e Coluna para cada Horário) */
        <div className="space-y-8 animate-fade-in">
          {(() => {
            const turmasParaExibir = (config?.turmas || []).filter(t => 
              filtroTurma === 'todas' || t.id === filtroTurma
            );

            if (turmasParaExibir.length === 0) {
              return (
                <div className="py-12 text-center bg-custom-card border border-custom-border rounded-2xl p-6">
                  <Calendar className="h-10 w-10 text-custom-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-custom-text">Nenhuma turma encontrada</p>
                </div>
              );
            }

            return turmasParaExibir.map((turma) => {
              const diasDaTurma = (turma.dias_disponiveis || []).filter(d => 
                filtroData === 'todas' || d.data === filtroData
              );
              const colunasHorarios = Array.from(
                new Set(turma.dias_disponiveis?.flatMap(d => d.horarios) || [])
              );
              const agendadosTurmaTotal = agendamentos.filter(a => a.turma_id === turma.id).length;

              // Proporções dinâmicas para que as colunas ocupem exatamente 100% da largura da div sem estourar
              const totalColunasSlots = colunasHorarios.length || 1;
              const dataColPercent = totalColunasSlots >= 4 ? 16 : 19;
              const slotColPercent = (100 - dataColPercent) / totalColunasSlots;

              return (
                <div key={turma.id} className="space-y-3 min-w-0">
                  {/* Cabeçalho da Turma */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-custom-border pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-custom-text font-sans flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#E30613]" />
                        {turma.nome}
                      </h3>
                      <p className="text-xs text-custom-muted flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MapPin className="h-3 w-3" />
                          {turma.sala_ou_local || 'Metrologia'}
                        </span>
                        <span>•</span>
                        <span>Duração da banca: {config?.duracao_apresentacao_minutos || 35} minutos</span>
                      </p>
                    </div>

                    <div className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-custom-card border border-custom-border text-custom-muted self-start sm:self-auto">
                      <strong className="text-[#E30613] dark:text-[#ff3b47]">{agendadosTurmaTotal}</strong> de <strong>{turma.grupos.length}</strong> grupos agendados
                    </div>
                  </div>

                  {/* Tabela com dimensionamento fluido (100% da largura da div no desktop) */}
                  <div className="overflow-x-auto rounded-2xl border border-custom-border bg-custom-card shadow-sm w-full max-w-full">
                    <table className="w-full text-left border-collapse table-fixed min-w-[720px] lg:min-w-full">
                      <colgroup>
                        <col style={{ width: `${dataColPercent}%`, minWidth: '135px' }} />
                        {colunasHorarios.map(h => (
                          <col key={h} style={{ width: `${slotColPercent}%`, minWidth: '190px' }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr className="border-b border-custom-border bg-custom-bg/60">
                          <th className="p-3 sm:p-4 text-xs font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] font-sans sticky left-0 bg-custom-card z-20 border-r border-custom-border shadow-sm truncate">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                              <span className="truncate">Data</span>
                            </div>
                          </th>
                          {colunasHorarios.map((horario) => (
                            <th 
                              key={horario} 
                              className="p-2.5 sm:p-3.5 text-xs font-bold uppercase tracking-wider text-custom-text font-sans border-r border-custom-border last:border-r-0 truncate"
                            >
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#E30613] dark:text-[#ff3b47] shrink-0" />
                                <span className="font-mono text-xs sm:text-sm tracking-tight truncate">{horario}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-custom-border">
                        {diasDaTurma.length === 0 ? (
                          <tr>
                            <td colSpan={colunasHorarios.length + 1} className="p-8 text-center text-xs text-custom-muted">
                              Nenhuma data encontrada com os filtros selecionados.
                            </td>
                          </tr>
                        ) : (
                          diasDaTurma.map((diaObj) => {
                            const agendadosNesteDia = agendamentos.filter(
                              a => a.turma_id === turma.id && a.data === diaObj.data
                            );

                            return (
                              <tr key={diaObj.data} className="hover:bg-white/[0.015] transition-colors">
                                {/* Linha - Coluna da Data (Fixa à esquerda para navegação horizontal) */}
                                <td className="p-3 sm:p-4 align-top sticky left-0 bg-custom-card z-10 border-r border-custom-border shadow-sm min-w-0">
                                  <div className="space-y-1 sm:space-y-1.5 min-w-0">
                                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#E30613] dark:text-[#ff3b47] block truncate">
                                      {diaObj.dia_semana}
                                    </span>
                                    <div className="text-sm sm:text-base font-extrabold font-mono text-custom-text tracking-tight truncate">
                                      {diaObj.data.split('-').reverse().join('/')}
                                    </div>
                                    <div className="pt-0.5">
                                      <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-semibold truncate max-w-full ${
                                        agendadosNesteDia.length >= diaObj.horarios.length
                                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-custom-bg border border-custom-border text-custom-muted'
                                      }`}>
                                        {agendadosNesteDia.length}/{diaObj.horarios.length} agendados
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Colunas dos Horários com o conteúdo completo dos cards */}
                                {colunasHorarios.map((horario) => {
                                  const permiteHorario = diaObj.horarios.includes(horario);
                                  const agendamentoItem = agendamentos.find(
                                    a => a.turma_id === turma.id && a.data === diaObj.data && a.horario === horario
                                  );
                                  const isMatchBusca = !termoBusca || agendamentosFiltrados.some(f => f.id === agendamentoItem?.id);

                                  return (
                                    <td 
                                      key={horario} 
                                      className="p-2 sm:p-2.5 align-top border-r border-custom-border last:border-r-0 min-w-0 overflow-hidden"
                                    >
                                      {agendamentoItem ? (
                                        <div className={`h-full min-w-0 ${!isMatchBusca && termoBusca ? 'opacity-25' : ''}`}>
                                          <CardAgendamento
                                            item={agendamentoItem}
                                            config={config}
                                            isProfessor={isProfessor}
                                            abrirEdicao={abrirEdicao}
                                            setItemParaExcluir={setItemParaExcluir}
                                            isHighlighted={isMatchBusca && !!termoBusca}
                                          />
                                        </div>
                                      ) : permiteHorario ? (
                                        <div className={`h-full min-h-[140px] sm:min-h-[160px] p-2.5 sm:p-3 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-1.5 min-w-0 overflow-hidden group/slot ${
                                          agendamentoLiberado || isProfessor
                                            ? 'border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                                            : 'border-rose-500/20 bg-rose-500/5'
                                        }`}>
                                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold font-sans max-w-full truncate ${
                                            agendamentoLiberado || isProfessor
                                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                              : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                          }`}>
                                            {agendamentoLiberado || isProfessor ? (
                                              <>
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                                <span className="truncate">Disponível</span>
                                              </>
                                            ) : (
                                              <>
                                                <Lock className="h-2.5 w-2.5 shrink-0" />
                                                <span className="truncate">Bloqueado</span>
                                              </>
                                            )}
                                          </div>
                                          <p className="text-[10px] sm:text-[11px] font-mono text-custom-muted line-clamp-2">
                                            {agendamentoLiberado || isProfessor ? 'Slot vago para banca' : 'Aguardando liberação'}
                                          </p>
                                          {onNavigateToNovo && (
                                            <button
                                              type="button"
                                              onClick={onNavigateToNovo}
                                              className={`mt-0.5 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-white rounded-lg shadow-sm transition-all cursor-pointer opacity-90 group-hover/slot:opacity-100 ${
                                                agendamentoLiberado || isProfessor
                                                  ? 'bg-[#E30613] hover:bg-[#b8050f]'
                                                  : 'bg-slate-700 hover:bg-slate-600'
                                              }`}
                                            >
                                              {agendamentoLiberado || isProfessor ? (
                                                <>
                                                  <PlusCircle className="h-3 w-3 shrink-0" />
                                                  <span>Agendar</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Lock className="h-3 w-3 shrink-0" />
                                                  <span>Ver Status</span>
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="h-full min-h-[140px] sm:min-h-[160px] p-2.5 sm:p-3 rounded-xl border border-dashed border-custom-border/40 bg-custom-bg/20 flex flex-col items-center justify-center text-center text-custom-muted/50 select-none min-w-0">
                                          <span className="text-xs sm:text-sm font-mono font-bold text-custom-muted/40">—</span>
                                          <span className="text-[9px] sm:text-[10px] mt-1 text-custom-muted/60">Sem banca</span>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        /* Visualização alternativa em GRADE DE CARDS */
        agendamentosFiltrados.length === 0 ? (
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
            {agendamentosFiltrados.map((item) => (
              <CardAgendamento
                key={item.id}
                item={item}
                config={config}
                isProfessor={isProfessor}
                abrirEdicao={abrirEdicao}
                setItemParaExcluir={setItemParaExcluir}
                isHighlighted={false}
              />
            ))}
          </div>
        )
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
              Você está prestes a cancelar a banca do <strong className="text-custom-text">{itemParaExcluir.grupo_nome}</strong> agendada para <strong>{itemParaExcluir.data} às {itemParaExcluir.horario}</strong>. Essa ação liberará o horário imediatamente para outros grupos em tempo real.
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
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
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
                {palavrasSecretas.map((turma, tIdx) => (
                  <div key={turma.turma_id || turma.id || tIdx} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-custom-border pb-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-custom-accent font-sans">
                        {turma.turma_nome || turma.nome}
                      </h4>
                      <span className="text-[11px] text-custom-muted font-mono">
                        {turma.grupos?.length || 0} grupos cadastrados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {turma.grupos?.map((g) => {
                        const uniqueKey = `${turma.turma_id || turma.id || tIdx}-${g.nome}`;
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
