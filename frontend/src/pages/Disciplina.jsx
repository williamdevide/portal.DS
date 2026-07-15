import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, ShieldCheck, ChevronDown, ChevronUp, Clock, FileText, Award, Layers, Terminal, X, RefreshCw, ArrowRight } from 'lucide-react';
import CriterioCard from '../components/CriterioCard';

const obterSaBadgeClass = (situacao) => {
  if (!situacao) return '';
  if (situacao.includes('SA2')) {
    return 'bg-purple-500/10 text-purple-600 border border-purple-500/25 dark:bg-purple-400/10 dark:text-purple-400 dark:border-purple-400/25';
  } else if (situacao.includes('SA3')) {
    return 'bg-amber-500/10 text-amber-600 border border-amber-500/25 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/25';
  } else if (situacao.includes('Entrevista') || situacao.includes('Recuperação')) {
    return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/25';
  }
  // SA1 ou padrão (Vermelho/Accent)
  return 'bg-custom-accent/10 text-custom-accent border border-custom-accent/25';
};

export default function Disciplina() {
  const { disciplinaSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [disciplina, setDisciplina] = useState(null);
  const [criteriosMsep, setCriteriosMsep] = useState(null);
  const [escalaAutonomia, setEscalaAutonomia] = useState([]);

  const [activeTab, setActiveTab] = useState('cronograma'); // 'cronograma' ou 'msep'
  const [criterioView, setCriterioView] = useState('cards'); // 'cards' ou 'tabela'
  
  // Controle de estado para a aula ampliada no centro da tela
  const [focusedAula, setFocusedAula] = useState(null);
  const [isFocusedFlipped, setIsFocusedFlipped] = useState(false);
  const [animateFocalCard, setAnimateFocalCard] = useState(false);
  
  // Guarda as coordenadas físicas originais do card clicado na grade para a animação FLIP
  const [focalStartRect, setFocalStartRect] = useState(null);
  const [loadingAula, setLoadingAula] = useState(false);

  // Efeito para travar o scroll do body e gerenciar a abertura fluida
  useEffect(() => {
    if (focusedAula && focalStartRect) {
      document.body.style.overflow = 'hidden';
      
      // Delay de frame para disparar a expansão do card a partir do seu local original
      const animFrame = requestAnimationFrame(() => {
        setAnimateFocalCard(true);
      });

      // Delay para girar (flip) o card após ele se expandir no centro da tela (intervalo de 1 segundo)
      const flipTimer = setTimeout(() => {
        setIsFocusedFlipped(true);
      }, 1000);

      return () => {
        cancelAnimationFrame(animFrame);
        clearTimeout(flipTimer);
      };
    }
  }, [focusedAula, focalStartRect]);

  // Função para fechar o card de forma suave, realizando o caminho inverso (encolhendo de volta para a grade)
  const fecharFoco = () => {
    if (isFocusedFlipped) {
      // Primeiro desvira o card (leva 1200ms de transição)
      setIsFocusedFlipped(false);
      
      setTimeout(() => {
        // Depois encolhe o card de volta para a grade (leva 1000ms de transição)
        setAnimateFocalCard(false);
        
        setTimeout(() => {
          setFocusedAula(null);
          setFocalStartRect(null);
          document.body.style.overflow = '';
        }, 1000);
      }, 1200);
    } else {
      // Se já estava de frente, apenas encolhe imediatamente (1000ms)
      setAnimateFocalCard(false);
      
      setTimeout(() => {
        setFocusedAula(null);
        setFocalStartRect(null);
        document.body.style.overflow = '';
      }, 1000);
    }
  };

  // Garante a restauração do scroll caso o componente seja desmontado abruptamente (como na troca de rota)
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Carrega os dados da disciplina dinamicamente
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    const loadData = async () => {
      try {
        const discData = await import(`../data/${disciplinaSlug}/disciplina.json`);
        const critData = await import(`../data/${disciplinaSlug}/criterios.json`);
        const escData = await import(`../data/${disciplinaSlug}/escala.json`);

        if (active) {
          setDisciplina(discData.default || discData);
          setCriteriosMsep(critData.default || critData);
          setEscalaAutonomia(escData.default?.escala_autonomia || escData.escala_autonomia || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da disciplina", err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [disciplinaSlug]);

  const abrirFoco = async (aula, rect) => {
    if (loadingAula) return;
    setLoadingAula(true);
    const numSemanaStr = aula.semana_numero.toString().padStart(2, '0');
    try {
      const aulaDetalhes = await import(`../data/${disciplinaSlug}/semana${numSemanaStr}.json`);
      setFocalStartRect(rect);
      setFocusedAula({
        ...aula,
        ...(aulaDetalhes.default || aulaDetalhes)
      });
    } catch (err) {
      console.error("Erro ao carregar detalhes da aula", err);
    } finally {
      setLoadingAula(false);
    }
  };

  // Controle de estado para sanfonas MSEP
  const [msepOpen, setMsepOpen] = useState({
    tecnicas: true,
    socioemocionais: false,
    autonomia: false
  });

  const toggleMsepSection = (section) => {
    setMsepOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Renderização das telas de Loading e Erro
  if (loading) {
    return (
      <div className="min-h-screen bg-custom-bg flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-custom-accent"></div>
          <BookOpen className="h-6 w-6 text-custom-accent absolute animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-custom-muted font-sans animate-pulse">
          Carregando trilha pedagógica...
        </p>
      </div>
    );
  }

  if (error || !disciplina) {
    return (
      <div className="min-h-screen bg-custom-bg flex items-center justify-center px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-custom-card border border-custom-border rounded-2xl p-8 text-center shadow-lg">
          <Layers className="h-16 w-16 text-custom-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-custom-text font-sans">
            Disciplina não encontrada
          </h2>
          <p className="mt-2 text-sm text-custom-muted leading-relaxed font-sans">
            A disciplina requisitada não está cadastrada ou a pasta de dados foi alterada.
          </p>
          <div className="mt-6">
            <Link 
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-custom-accent px-5 py-2.5 text-sm font-semibold transition-colors shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Compatibilidade com JSX existente
  const criterios_msep = {
    descricao: criteriosMsep.descricao,
    escala_autonomia: escalaAutonomia,
    matriz_criterios: criteriosMsep.matriz_criterios
  };
  const aulas_semanas = disciplina.cronograma;

  // Filtragem dos critérios reais a partir do JSON
  const criteriosTecnicos = criterios_msep.matriz_criterios.filter(c => c.id.startsWith('CT'));
  const criteriosSocio = criterios_msep.matriz_criterios.filter(c => c.id.startsWith('CS'));

  // Ordem exata das 5 colunas finais conforme solicitado pelo usuário
  const colunasSAs = ["SA1", "SA2", "SA3", "Entrevista", "Recuperação"];

  // Função utilitária para extrair a SA e o array de semanas das strings no JSON
  const extrairSemanasEsa = (appAulaStr) => {
    let sa = "";
    if (appAulaStr.includes("SA1")) sa = "SA1";
    else if (appAulaStr.includes("SA2")) sa = "SA2";
    else if (appAulaStr.includes("SA3")) sa = "SA3";
    else if (appAulaStr.includes("Entrevista")) sa = "Entrevista";
    else if (appAulaStr.includes("Recuperação")) sa = "Recuperação";
    
    const regexSem = /Sem\.\s*([^)]+)/;
    const match = appAulaStr.match(regexSem);
    
    let semanas = [];
    if (match && match[1]) {
      semanas = match[1].split(',').map(s => parseInt(s.trim(), 10));
    }
    
    return { sa, semanas };
  };

  // Mapeamento de semana para SA para agilizar a busca na tabela
  const mapaSemanaSA = {};
  aulas_semanas.forEach(aula => {
    const numSemanaStr = aula.semana_numero.toString().padStart(2, '0');
    mapaSemanaSA[`Semana ${numSemanaStr}`] = aula.situacao_aprendizagem;
    mapaSemanaSA[`Semana ${parseInt(aula.semana_numero, 10)}`] = aula.situacao_aprendizagem;
  });

  // Estilo dinâmico para transição fluida do tamanho original ao tamanho aberto (FLIP)
  const obterEstiloCardFocal = () => {
    if (!focalStartRect) return {};
    
    if (animateFocalCard) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: window.innerWidth < 640 ? '95%' : '660px',
        height: '420px',
        transform: `translate(-50%, -50%) ${isFocusedFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`,
        transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100
      };
    } else {
      return {
        position: 'fixed',
        top: focalStartRect.top,
        left: focalStartRect.left,
        width: focalStartRect.width,
        height: focalStartRect.height,
        transform: 'translate(0, 0) rotateY(0deg)',
        transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100
      };
    }
  };

  // Imagem de banco de dados e servidores para plano de fundo cinemático
  const disciplinaImageUrl = "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-custom-bg text-custom-text transition-colors duration-300 relative">
      
      {/* Barra de Navegação Superior / Voltar */}
      <div className="bg-custom-card border-b border-custom-border transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-custom-muted hover:text-custom-accent transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Home
          </Link>
        </div>
      </div>

      {/* Abertura da Disciplina / Hero Imersivo com Ken Burns */}
      <section className="bg-custom-card border-b border-custom-border py-16 transition-colors duration-300 relative overflow-hidden flex items-center min-h-[360px]">
        
        {/* Imagem de Fundo Dinâmica com Ken Burns */}
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
          <img 
            src={disciplinaImageUrl} 
            alt="Banco de Dados e Infraestrutura" 
            className="w-full h-full object-cover opacity-20 dark:opacity-15 scale-100 animate-ken-burns"
          />
        </div>

        {/* Máscara de Gradiente para legibilidade perfeita do texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-custom-card via-custom-card/90 to-transparent z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Texto Principal */}
            <div className="lg:col-span-7 max-w-3xl animate-fade-in">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-custom-accent/15 px-3.5 py-1 text-xs font-bold text-custom-accent mb-4 border border-custom-accent/10">
                <BookOpen className="h-3.5 w-3.5" />
                Módulo Ativo - {disciplina.semestre}
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans">
                {disciplina.nome}
              </h1>
              
              <p className="mt-4 text-base sm:text-lg font-medium text-custom-muted leading-relaxed font-sans">
                {disciplina.abertura}
              </p>
              
              {disciplina.conclusao && (
                <div className="mt-5 border-l-4 border-custom-accent pl-4 py-1 italic text-sm text-custom-muted font-sans leading-relaxed">
                  "{disciplina.conclusao}"
                </div>
              )}
            </div>

            {/* Painel de Estatísticas Acadêmicas em Vidro (Glassmorphism no Primeiro Plano) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-[400px] rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 shadow-2xl relative hover:scale-[1.02] transition-all duration-500">
                <h3 className="text-sm font-bold uppercase tracking-wider text-custom-accent mb-4 font-sans flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5" />
                  Estrutura Acadêmica MSEP
                </h3>
                
                <div className="space-y-4 font-sans text-xs">
                  {/* Carga Horária */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-custom-muted font-semibold">Carga Horária Total:</span>
                    <span className="font-bold text-custom-text">{disciplina.carga_horaria}</span>
                  </div>
                  
                  {/* Metodologia */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-custom-muted font-semibold">Matriz Pedagógica:</span>
                    <span className="font-bold text-emerald-400">SENAI MSEP</span>
                  </div>

                  {/* Projetos/Atividades */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-custom-muted font-semibold">Atividades Práticas:</span>
                    <span className="font-bold text-custom-text">{disciplina.atividades_praticas.length} Projetos</span>
                  </div>

                  {/* Escala de Avaliação */}
                  <div className="flex items-center justify-between">
                    <span className="text-custom-muted font-semibold">Níveis de Autonomia:</span>
                    <span className="font-bold text-purple-400">NE • AP • PA • AUT</span>
                  </div>

                  {/* Indicador Visual de Progresso do Curso (Barra Estilizada) */}
                  <div className="mt-6 pt-2">
                    <div className="flex justify-between text-[10px] font-bold mb-1 text-custom-muted">
                      <span>PROGRESSO DAS SEMANAS</span>
                      <span>20 SEMANAS ATIVAS</span>
                    </div>
                    <div className="h-2 w-full bg-black/35 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-custom-accent w-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Menu / Abas Internas de Navegação Rápida */}
      <section className="sticky top-16 z-40 bg-custom-bg/95 backdrop-blur-md border-b border-custom-border py-4 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-custom-border">
            <button
              onClick={() => setActiveTab('cronograma')}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
                activeTab === 'cronograma'
                  ? 'border-custom-accent text-custom-accent'
                  : 'border-transparent text-custom-muted hover:text-custom-text'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              Linha do Tempo das Aulas
            </button>
            <button
              onClick={() => setActiveTab('msep')}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
                activeTab === 'msep'
                  ? 'border-custom-accent text-custom-accent'
                  : 'border-transparent text-custom-muted hover:text-custom-text'
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              Critérios de Avaliação (MSEP)
            </button>
          </div>
        </div>
      </section>

      {/* Conteúdo das Abas */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Aba 1: Linha do Tempo do Semestre (Cards com Foco e Ampliação Modal) */}
        {activeTab === 'cronograma' && (
          <div className="animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight font-sans">
                  Cronograma de Aula (20 Semanas)
                </h2>
                <p className="mt-1 text-sm text-custom-muted font-sans">
                  Selecione qualquer aula para abrir e virar o card focado com efeito FLIP de ampliação a partir da grade.
                </p>
              </div>

              {/* Atividades Práticas Gamificadas */}
              <div className="flex flex-wrap gap-2.5">
                {disciplina.atividades_praticas.map((atv, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-custom-border bg-custom-card px-3 py-1.5 text-xs font-semibold text-custom-muted shadow-sm"
                  >
                    <Award className="h-3.5 w-3.5 text-custom-accent animate-pulse" />
                    {atv.split(':')[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid de Aulas Standard */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {aulas_semanas.map((aula) => {
                const saBadgeClass = obterSaBadgeClass(aula.situacao_aprendizagem);

                // Cálculo da duração dinâmica
                let duracaoStr = aula.duracao || "A Informar";

                return (
                  <div 
                    key={aula.semana_numero}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      abrirFoco(aula, {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                      });
                    }}
                    className="w-full h-[200px] cursor-pointer rounded-2xl border border-custom-border bg-custom-card p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-custom-accent/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black tracking-tight text-custom-accent/15 font-sans">
                        #{aula.semana_numero}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${saBadgeClass}`}>
                        {aula.situacao_aprendizagem}
                      </span>
                    </div>

                    <div className="my-auto">
                      <h3 className="text-lg font-extrabold text-custom-text font-sans line-clamp-2">
                        {aula.titulo}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-custom-border/40 text-custom-muted">
                      <span className="text-xs font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {duracaoStr}
                      </span>
                      <span className="text-xs font-bold text-custom-accent">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MODAL DE FOCO CINEMÁTICO COM FLIP CARD 3D AMPLIADO (Animação FLIP a partir da grade) */}
            {focusedAula && (
              <div 
                className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 transition-opacity duration-500 ${
                  animateFocalCard ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={fecharFoco}
              >
                
                {/* Botão de Fechar no topo direito fora do card */}
                {animateFocalCard && (
                  <button 
                    onClick={fecharFoco}
                    className="absolute top-6 right-6 md:top-8 md:right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white cursor-pointer transition-all duration-300 z-50 animate-fade-in"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}

                {/* Card do Modal com estilo físico interpolado (Cresce de forma contínua do local do clique!) */}
                <div 
                  style={obterEstiloCardFocal()}
                  className="perspective-1000 transform-style-3d cursor-default shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full h-full transform-style-3d">
                    
                    {/* FRENTE DO CARD (AMPLIADO) */}
                    <div 
                      onClick={() => setIsFocusedFlipped(true)}
                      className="backface-hidden absolute inset-0 w-full h-full rounded-3xl border border-custom-border bg-custom-card p-8 flex flex-col justify-between shadow-2xl cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-6xl font-black tracking-tight text-custom-accent/20 font-sans">
                          Semana {focusedAula.semana_numero}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-3.5 py-1.5 text-xs font-bold font-sans ${obterSaBadgeClass(focusedAula.situacao_aprendizagem)}`}>
                          {focusedAula.situacao_aprendizagem}
                        </span>
                      </div>

                      <div className="my-auto">
                        <h3 className="text-2xl font-black text-custom-text font-sans leading-tight">
                          {focusedAula.titulo}
                        </h3>
                        {animateFocalCard && (
                          <p className="text-xs text-custom-muted mt-4 font-sans leading-relaxed line-clamp-4 animate-fade-in">
                            {focusedAula.contexto}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-custom-border/40 text-custom-muted">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {focusedAula.duracao || "A Informar"}
                        </span>
                        <span className="text-xs font-bold flex items-center gap-1.5 text-custom-accent">
                          <RefreshCw className="h-3.5 w-3.5" />
                          Girar Card
                        </span>
                      </div>
                    </div>

                    {/* VERSO DO CARD (AMPLIADO) */}
                    <div 
                      className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-3xl border border-custom-border bg-custom-card p-8 flex flex-col justify-between shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-custom-border/40 pb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-custom-accent font-sans">
                          Semana {focusedAula.semana_numero} • Laboratório & Mentoria
                        </span>
                        <span className="text-[10px] text-custom-muted font-bold font-mono">
                          {focusedAula.situacao_aprendizagem}
                        </span>
                      </div>

                      <div className="my-auto overflow-y-auto max-h-[220px] pr-2">
                        <p className="text-xs text-custom-muted leading-relaxed font-sans text-justify mb-3">
                          {focusedAula.contexto}
                        </p>
                        {focusedAula.foco && (
                          <p className="text-xs text-custom-muted leading-relaxed font-sans text-justify mb-2">
                            <strong className="text-custom-accent">🎯 Foco: </strong>{focusedAula.foco}
                          </p>
                        )}
                        {focusedAula.pratica && (
                          <p className="text-xs text-custom-muted leading-relaxed font-sans text-justify mb-3">
                            <strong className="text-emerald-500 dark:text-emerald-400">🛠️ Prática: </strong>{focusedAula.pratica}
                          </p>
                        )}
                        {focusedAula.bloco_A?.titulo && (
                          <div className="bg-custom-bg border border-custom-border rounded-xl p-3.5">
                            <span className="block text-[10px] font-bold text-custom-accent mb-1.5">ESTRUTURA DA AULA:</span>
                            <span className="block text-[11px] font-bold text-custom-text">{focusedAula.bloco_A.titulo} ({focusedAula.bloco_A.tempo})</span>
                            <span className="block text-[11px] font-bold text-custom-text mt-1.5">{focusedAula.bloco_B.titulo} ({focusedAula.bloco_B.tempo})</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-custom-border/40 flex items-center justify-between">
                        <button 
                          onClick={() => setIsFocusedFlipped(false)}
                          className="text-xs font-bold text-custom-muted flex items-center gap-1.5 hover:text-custom-text transition-colors duration-300"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Voltar Frente
                        </button>
                        
                        <Link 
                          to={`/disciplina/${disciplinaSlug}/semana/${parseInt(focusedAula.semana_numero, 10)}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-custom-accent px-5 py-3 text-xs font-bold shadow-md transition-all hover:translate-x-0.5"
                        >
                          Acessar Aula Completa
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba 2: Seção de Critérios (MSEP) - Accordion com Flip Cards 3D ou Tabela Completa */}
        {activeTab === 'msep' && (
          <div className="w-full animate-fade-in">
            <div className="mb-8 text-center max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight font-sans sm:text-3xl">
                Matriz de Avaliação MSEP
              </h2>
              <p className="mt-2 text-sm text-custom-muted font-sans max-w-2xl mx-auto">
                {criterios_msep.descricao} Selecione abaixo o tipo de visualização desejado para rastrear as competências acadêmicas.
              </p>
            </div>

            {/* Alternador de Visualização Moderno */}
            <div className="mb-10 flex justify-center gap-3">
              <button
                onClick={() => setCriterioView('cards')}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold border transition-all duration-300 cursor-pointer ${
                  criterioView === 'cards'
                    ? 'bg-custom-accent text-white border-custom-accent shadow-sm'
                    : 'bg-custom-card border-custom-border text-custom-muted hover:text-custom-text'
                }`}
              >
                <Layers className="h-4.5 w-4.5" />
                Visualização em Cards
              </button>
              
              <button
                onClick={() => setCriterioView('tabela')}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold border transition-all duration-300 cursor-pointer ${
                  criterioView === 'tabela'
                    ? 'bg-custom-accent text-white border-custom-accent shadow-sm'
                    : 'bg-custom-card border-custom-border text-custom-muted hover:text-custom-text'
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                Matriz de Rastreabilidade (SAs)
              </button>
            </div>

            {criterioView === 'cards' ? (
              /* A: Visualização em Cards (Accordion) */
              <div className="max-w-5xl mx-auto space-y-4">
                
                {/* 1. Capacidades Técnicas */}
                <div className="rounded-2xl border border-custom-border bg-custom-card overflow-hidden shadow-sm transition-colors duration-300">
                  <button
                    onClick={() => toggleMsepSection('tecnicas')}
                    className="w-full flex items-center justify-between p-5 text-left font-bold focus:outline-none hover:bg-custom-bg/50 transition-all duration-300"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-custom-accent/15 text-custom-accent font-black">
                        {criteriosTecnicos.length}
                      </span>
                      Capacidades Técnicas (Conhecimentos & Habilidades)
                    </span>
                    {msepOpen.tecnicas ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  
                  {msepOpen.tecnicas && (
                    <div className="p-5 border-t border-custom-border bg-custom-bg/30 space-y-4">
                      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                        {criteriosTecnicos.map((cap, index) => (
                          <CriterioCard key={index} criterio={cap} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Capacidades Socioemocionais */}
                <div className="rounded-2xl border border-custom-border bg-custom-card overflow-hidden shadow-sm transition-colors duration-300">
                  <button
                    onClick={() => toggleMsepSection('socioemocionais')}
                    className="w-full flex items-center justify-between p-5 text-left font-bold focus:outline-none hover:bg-custom-bg/50 transition-all duration-300"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 font-black">
                        {criteriosSocio.length}
                      </span>
                      Capacidades Socioemocionais (Atitudes & Values)
                    </span>
                    {msepOpen.socioemocionais ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  
                  {msepOpen.socioemocionais && (
                    <div className="p-5 border-t border-custom-border bg-custom-bg/30 space-y-4">
                      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                        {criteriosSocio.map((cap, index) => (
                          <CriterioCard key={index} criterio={cap} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Escala de Autonomia MSEP */}
                <div className="rounded-2xl border border-custom-border bg-custom-card overflow-hidden shadow-sm transition-colors duration-300">
                  <button
                    onClick={() => toggleMsepSection('autonomia')}
                    className="w-full flex items-center justify-between p-5 text-left font-bold focus:outline-none hover:bg-custom-bg/50 transition-all duration-300"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 font-black">
                        {criterios_msep.escala_autonomia.length}
                      </span>
                      Escala de Autonomia MSEP
                    </span>
                    {msepOpen.autonomia ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  
                  {msepOpen.autonomia && (
                    <div className="p-5 border-t border-custom-border bg-custom-bg/30">
                      <div className="space-y-4">
                        {criterios_msep.escala_autonomia.map((nivel, idx) => (
                          <div key={idx} className="flex gap-4 items-start bg-custom-card border border-custom-border rounded-xl p-4 shadow-sm">
                            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xs font-bold font-mono">
                              {nivel.nivel}
                            </div>
                            <div>
                              <h4 className="font-bold text-custom-text text-sm">
                                {nivel.nome}
                              </h4>
                              <p className="mt-1 text-xs text-custom-muted leading-relaxed font-sans">
                                {nivel.descricao}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* B: Visualização em Tabela Completa (Matriz SAs e Semanas de Aplicação - Sem Rolagem Horizontal) */
              <div className="w-full overflow-hidden rounded-2xl border border-custom-border bg-custom-card shadow-lg animate-fade-in">
                <table className="w-full text-left font-sans text-xs table-fixed">
                  <thead className="bg-custom-bg/40 font-bold border-b border-custom-border">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 font-bold text-custom-text text-sm w-[32%]">Critério de Avaliação & Capacidade</th>
                      <th scope="col" className="px-4 py-3.5 font-bold text-custom-text text-sm w-[30%]">Conhecimento Associado</th>
                      <th scope="col" className="px-4 py-3.5 font-bold text-custom-text text-sm w-[8%] text-center">Tipo</th>
                      {colunasSAs.map(sa => {
                        // Colunas de SAs ganham 5% de largura, Entrevista e Recuperação ganham 7.5% de largura
                        const wClass = (sa === 'Entrevista' || sa === 'Recuperação') ? 'w-[7.5%]' : 'w-[5%]';
                        return (
                          <th 
                            key={sa} 
                            scope="col" 
                            className={`px-1 py-3.5 font-bold text-custom-text text-xs text-center ${wClass} tracking-tight whitespace-normal break-words`}
                          >
                            {sa}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom-border bg-custom-card">
                    {criterios_msep.matriz_criterios.map((criterio) => (
                      <tr key={criterio.id} className="hover:bg-custom-bg/25 transition-colors duration-200">
                        
                        {/* Info Critério e Capacidade */}
                        <td className="px-4 py-3">
                          <div className="flex gap-2 items-start">
                            <span className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[9px] font-bold font-mono flex-shrink-0 ${
                              criterio.id.startsWith('CT')
                                ? 'bg-custom-accent/10 text-custom-accent border border-custom-accent/15'
                                : 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50'
                            }`}>
                              {criterio.id}
                            </span>
                            <div className="min-w-0">
                              <span className="block font-extrabold text-custom-text leading-snug break-words">{criterio.criterio_avaliacao}</span>
                              <span className="block text-[9px] text-custom-muted mt-1 leading-normal font-sans break-words">
                                <span className="font-bold text-custom-accent">Capacidade:</span> {criterio.capacidade}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Conhecimento Associado */}
                        <td className="px-4 py-3">
                          <p className="text-[10px] text-custom-muted leading-relaxed font-sans break-words">
                            {criterio.conhecimento}
                          </p>
                        </td>
                        
                        {/* Tipo */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            criterio.tipo === 'Crítico'
                              ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                              : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
                          }`}>
                            {criterio.tipo}
                          </span>
                        </td>

                        {/* SAs e Semanas Mapeadas via Parser de String - Semanas em Coluna Vertical (Empilhadas) */}
                        {colunasSAs.map(sa => {
                          let semanasMapeadas = [];
                          
                          criterio.aplicacao_aulas.forEach(appAulaStr => {
                            const parsed = extrairSemanasEsa(appAulaStr);
                            if (parsed.sa === sa) {
                              semanasMapeadas = [...semanasMapeadas, ...parsed.semanas];
                            }
                          });

                          const semanasUnicas = [...new Set(semanasMapeadas)].sort((a, b) => a - b);
                          const wClass = (sa === 'Entrevista' || sa === 'Recuperação') ? 'w-[7.5%]' : 'w-[5%]';

                          return (
                            <td key={sa} className={`px-1 py-3 text-center ${wClass}`}>
                              {semanasUnicas.length === 0 ? (
                                <span className="text-custom-muted/40 font-mono">—</span>
                              ) : (
                                /* Alinhamento Vertical / Um embaixo do outro quando múltiplo */
                                <div className="flex flex-col items-center justify-center gap-1 py-0.5">
                                  {semanasUnicas.map((semNum, idx) => {
                                    const semNome = `Sem. ${semNum.toString().padStart(2, '0')}`;
                                    return (
                                      <Link
                                        key={idx}
                                        to={`/disciplina/${disciplinaSlug}/semana/${semNum}`}
                                        className="w-13 h-5.5 inline-flex items-center justify-center flex-shrink-0 rounded bg-custom-accent/10 text-[9px] font-bold text-custom-accent border border-custom-accent/15 hover:bg-custom-accent hover:text-white transition-all cursor-pointer font-mono"
                                        title={`Ver aula da Semana ${semNum}`}
                                      >
                                        {semNome}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
