import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Terminal, ArrowRight, BookMarked, 
  ChevronLeft, ChevronRight, Layers, Trophy, Play, Pause, RotateCcw, 
  CheckCircle2, XCircle, Shield, Award, Download, ChevronDown, ChevronUp, Lock, Menu
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import PDFViewer from '../components/PDFViewer';

// Helper simples para renderizar negrito de Markdown básico (**texto**) em elementos JSX
const renderMarkdown = (text) => {
  if (!text) return '';
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 !== 0) {
      return <strong key={index} className="font-bold text-custom-text">{part}</strong>;
    }
    return part;
  });
};

// Mapeador de imagens para fundos semi-transparentes de cada slide dos blocos A e B
const getSlideBgImage = (blocoTipo, index) => {
  if (blocoTipo === 'A') {
    const images = [
      '/images/dado_vs_informacao.png',
      '/images/excel_vs_sql.png',
      '/images/arquitetura_sgbd.png',
      '/images/sgbd_relacionais.png',
      '/images/sql_vs_nosql.png',
      '/images/carreiras_dados.png'
    ];
    return images[index] || '';
  } else if (blocoTipo === 'B') {
    const images = [
      '/images/matriz_holografica.png',
      '/images/datacenter.png',
      '/images/escala_autonomia.png',
      '/images/radar_soft_skills.png',
      '/images/setup_local.png'
    ];
    return images[index] || '';
  }
};
// Componente auxiliar para reproduzir áudio e exibir resumo sobre o podcast com toggle
function AudioPlayerWithTranscription({ audioFile, titulo }) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Texto de resumo simulado explicativo baseado no nome do arquivo
  const getTranscriptionText = (fileName) => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes("semana01")) {
      return `🎙️ **Resumo sobre o Podcast - Semana 01: Primeiros Passos com MySQL e SGBDs**
      
      **[William Devidé]:** Fala, Dev! Seja muito bem-vindo ao podcast oficial da nossa primeira semana na Unidade Curricular de Banco de Dados. Hoje nós iniciamos a nossa jornada discutindo por que bancos de dados são o verdadeiro coração de qualquer aplicação moderna. 
      Nós falamos sobre a diferença crucial entre uma planilha glorificada do Excel e um Sistema Gerenciador de Banco de Dados (SGBD) robusto. Vimos que, enquanto uma planilha engasga com concorrência e volume, o SGBD gerencia milhares de acessos simultâneos por segundo, garantindo a consistência das transações.
      Também conversamos sobre o mercado de trabalho, o papel do DBA e o que as empresas de tecnologia estão buscando atualmente. Lembre-se: dados são o novo petróleo. E para a nossa atividade prática, vocês deverão mapear vagas e salários de mercado. Estudem o material e preparem-se para as próximas etapas. Nos vemos no console SQL!`;
    }
    
    if (lowerName.includes("semana02")) {
      return `🎙️ **Resumo sobre o Podcast - Semana 02: Bancos Relacionais e a Porta 3306**
      
      **[William Devidé]:** Fala, Dev! No podcast de hoje, discutimos a 'Guerra Fria' dos modelos de banco de dados: Relacional (SQL) versus Não-Relacional (NoSQL). De um lado, o rigor inquebrável das tabelas e a segurança transacional ACID; de outro, a velocidade insana e a flexibilidade documental dos bancos NoSQL para Big Data.
      No laboratório prático, a nossa missão foi baixar a infraestrutura com o XAMPP e iniciar o servidor do MySQL na porta padrão de rede: a 3306. 
      Muitos desenvolvedores enfrentam o primeiro desafio aqui: conflitos de porta de rede que deixam o painel vermelho. A dica de ouro é ler o log de erros e ajustar o arquivo .ini. Autonomia e troubleshooting são as suas melhores armas hoje! Bora colocar o servidor de pé!`;
    }
    
    if (lowerName.includes("semana03")) {
      return `🎙️ **Resumo sobre o Podcast - Semana 03: A Planta-Baixa do Banco de Dados**
      
      **[William Devidé]:** Fala, Dev! Bem-vindo ao podcast da semana 3. Hoje o assunto é projeto e modelagem. Ninguém sobe um prédio sem planta, e no banco de dados não é diferente. 
      Conversamos sobre a importância de definir os Tipos de Dados corretos (VARCHAR, INT, DECIMAL, DATE) no nosso Dicionário de Dados para economizar memória e otimizar a performance. 
      Em seguida, levamos essa lógica para a ferramenta draw.db para construir o nosso primeiro Modelo Entidade-Relacionamento (MER/DER) visual. Definir a Chave Primária (PK) como o identificador único de cada registro é o primeiro passo para uma modelagem de sucesso. Mãos à obra!`;
    }

    if (lowerName.includes("semana04")) {
      return `🎙️ **Resumo sobre o Podcast - Semana 04: Normalização de Dados contra o Efeito Dominó**
      
      **[William Devidé]:** Fala, Dev! Podcast da semana 4 no ar, e hoje o assunto é cirúrgico: a Normalização de Banco de Dados. Discutimos como evitar redundâncias e anomalias de atualização que causam o 'Efeito Dominó do Caos' em grandes sistemas.
      Aprendemos a quebrar tabelas gigantes em entidades menores e mais específicas (Paciente, Consulta, Médico) e a restabelecer as conexões lógicas usando Chaves Primárias (PK) e Chaves Estrangeiras (FK).
      Lembre-se da regra de ouro da integridade referencial: na relação de 1 para N, o lado N (Muitos) sempre recebe a Chave Estrangeira (FK) para fechar o relacionamento. Vamos organizar esse caos!`;
    }

    if (lowerName.includes("semana05")) {
      return `🎙️ **Resumo sobre o Podcast - Semana 05: Do Diagrama ao Código Real com DDL**
      
      **[William Devidé]:** Fala, Dev! Podcast da semana 5. É o grande momento de traduzir nossas caixinhas visuais do draw.db em comandos SQL DDL físicos no servidor. 
      Exploramos a Linguagem de Definição de Dados (DDL) com seus pilares de criação e destruição estrutural: CREATE para erguer bancos e tabelas, ALTER para modificar colunas e DROP para demolir estruturas irreversivelmente.
      Também discutimos as constraints essenciais como PRIMARY KEY, NOT NULL e AUTO_INCREMENT para blindar a integridade física do nosso banco de dados. Parabéns pelo kickoff do Projeto 1! Vamos ver os scripts rodando em milissegundos no console SQL!`;
    }

    // Fallback genérico para as próximas semanas
    return `🎙️ **Resumo sobre o Podcast - Resumo de Aula**
    
    **[William Devidé]:** Olá, Dev! Este é o podcast de resumo da aula ativa. 
    Neste áudio, revisamos os principais conceitos abordados nos slides teóricos e as tarefas do nosso laboratório prático.
    Para apoiar seus estudos e garantir o desenvolvimento da sua autonomia, este podcast discute as principais dificuldades da semana e como superá-las. 
    Caso tenha dúvidas, revise a documentação técnica, execute os testes no seu servidor local e aproveite o resumo do podcast para fixar os termos técnicos discutidos. Bons estudos e nos vemos na próxima missão de desenvolvimento de sistemas!`;
  };

  const textoTranscricao = getTranscriptionText(titulo);

  return (
    <div className="rounded-3xl border border-custom-border bg-custom-card p-6 sm:p-8 shadow-lg space-y-6">
      <h3 className="text-lg font-bold text-custom-text font-sans flex items-center gap-2">
        <Award className="h-5 w-5 text-custom-accent" />
        Podcast de Resumo da Aula
      </h3>
      
      <div className="space-y-4">
        {/* Player de áudio nativo estilizado */}
        <div className="bg-custom-bg/60 p-4 border border-custom-border rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <span className="text-xs font-mono text-custom-muted block mb-2 truncate">
              🎧 {titulo.replace("BCD-", "")}.m4a
            </span>
            <audio src={audioFile} controls className="w-full focus:outline-none" />
          </div>
        </div>

        {/* Botão de Resumo do Podcast */}
        <div className="space-y-3">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold rounded-xl border border-custom-accent/25 bg-custom-accent/5 hover:bg-custom-accent/15 text-custom-accent transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <span>📄</span>
            <span>{showTranscript ? "Ocultar Resumo do Podcast" : "Ver Resumo sobre o Podcast"}</span>
          </button>

          {/* Área de Resumo Retrátil */}
          {showTranscript && (
            <div className="rounded-2xl border border-custom-border bg-custom-bg/60 p-5 space-y-3 text-xs sm:text-sm text-custom-muted leading-relaxed font-sans text-justify max-h-[300px] overflow-y-auto animate-fade-in whitespace-pre-line">
              {renderMarkdown(textoTranscricao)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Aula() {
  const { disciplinaSlug, semanaId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [aula, setAula] = useState(null);
  const [totalSemanas, setTotalSemanas] = useState(20);
  const [disciplina, setDisciplina] = useState(null);
  const [cronograma, setCronograma] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const numeroSemana = parseInt(semanaId, 10);

  // Estado para controle de acessibilidade de fontes (escala)
  const [fontScale, setFontScale] = useState(1.0);

  // Estados do Cronômetro do Laboratório (85 minutos)
  const [timerSeconds, setTimerSeconds] = useState(5100);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Estados do Quiz Interativo
  const [quizIniciado, setQuizIniciado] = useState(false);
  const [perguntaAtualIndex, setPerguntaAtualIndex] = useState(0);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizConcluido, setQuizConcluido] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Estados de Nome/Turma e Respostas do Aluno para o PDF
  const [nomeAluno, setNomeAluno] = useState('');
  const [turma, setTurma] = useState('');
  const [respostasUsuario, setRespostasUsuario] = useState({});

  // Estado para capturar o IP real de conexão pública do aluno
  const [ipPublico, setIpPublico] = useState('LOCAL');

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setIpPublico(data.ip);
        }
      })
      .catch(() => {
        setIpPublico('LOCAL');
      });
  }, []);

  // Função de identificação híbrida de hardware para Vercel / Localhost
  const obterIdentificadorMaquina = () => {
    const hostname = window.location.hostname;
    const isLocalAccess = 
      hostname === "localhost" || 
      hostname === "127.0.0.1" || 
      hostname.startsWith("192.168.") || 
      hostname.startsWith("10.") || 
      hostname.startsWith("172.") || 
      hostname.endsWith(".local") || 
      hostname === "[::1]";

    const computerVite = import.meta.env.VITE_COMPUTER_NAME;
    
    if (isLocalAccess && computerVite && computerVite !== "localhost") {
      return computerVite.toUpperCase();
    }
    
    let deviceName = localStorage.getItem("MSEP_DEVICE_NAME");
    if (!deviceName) {
      const userAgent = navigator.userAgent;
      let osName = "DEV";
      if (userAgent.includes("Windows")) osName = "WIN";
      else if (userAgent.includes("Mac")) osName = "MAC";
      else if (userAgent.includes("Linux")) osName = "LNX";
      
      const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
      deviceName = `LAB-${osName}-${hash}`;
      localStorage.setItem("MSEP_DEVICE_NAME", deviceName);
    }
    return deviceName;
  };

  // Estado para controlar o infográfico de carreiras expansível no Bloco A
  const [carreiraAtiva, setCarreiraAtiva] = useState(null);

  const agruparSemanasPorSA = () => {
    const grupos = {};
    cronograma.forEach(semana => {
      const sa = semana.situacao_aprendizagem || 'Geral';
      if (!grupos[sa]) {
        grupos[sa] = [];
      }
      grupos[sa].push(semana);
    });
    return grupos;
  };
  // Estados de apoio para os recursos visuais interativos dos slides
  const [dadosConectados, setDadosConectados] = useState(false);
  const [etapaFluxo, setEtapaFluxo] = useState('app');
  const [dbAtivo, setDbAtivo] = useState(null);
  const [saAtiva, setSaAtiva] = useState('SA1');
  const [portaTestada, setPortaTestada] = useState(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Efeito do Cronômetro
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const toggleTimer = () => setTimerRunning(prev => !prev);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(5100);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Funções do Quiz Interativo
  const handleSelecionarOpcao = (opcao) => {
    if (respondido) return;
    setOpcaoSelecionada(opcao);
    setRespondido(true);
    
    // Salva a resposta selecionada pelo aluno
    setRespostasUsuario(prev => ({
      ...prev,
      [perguntaAtualIndex]: opcao
    }));
    
    const pergunta = aula.quiz_final.perguntas[perguntaAtualIndex];
    if (opcao === pergunta.resposta_correta) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleProximaPergunta = () => {
    setOpcaoSelecionada(null);
    setRespondido(false);
    if (perguntaAtualIndex < aula.quiz_final.perguntas.length - 1) {
      setPerguntaAtualIndex(prev => prev + 1);
    } else {
      setQuizConcluido(true);
      setShowExportModal(true);
    }
  };

  const reiniciarQuiz = () => {
    setPerguntaAtualIndex(0);
    setOpcaoSelecionada(null);
    setRespondido(false);
    setQuizScore(0);
    setQuizConcluido(false);
    setQuizIniciado(true);
    setRespostasUsuario({});
    setShowExportModal(false);
  };

  // Geração do PDF no padrão SENAI com layout moderno e auditoria
  const handleGerarPDF = () => {
    if (!nomeAluno.trim() || !turma.trim()) return;
    
    const doc = new jsPDF();
    const perguntas = aula.quiz_final.perguntas;
    
    // 1. Extração de Metadados e Sigla
    const sigla = (disciplina?.nome?.match(/\(([^)]+)\)/)?.[1] || "BCD").toUpperCase();
    const semanaStr = `Semana ${aula.semana_numero}`;
    
    const dataConclusao = new Date();
    const dataFormatada = dataConclusao.toLocaleDateString('pt-BR');
    const horaFormatada = dataConclusao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dataParaNome = dataFormatada.replace(/\//g, '-');
    
    // Obtenção automática do identificador de máquina híbrido
    const identificador = obterIdentificadorMaquina();
    const infoMaquina = ipPublico && ipPublico !== "LOCAL" ? `${identificador} (IP: ${ipPublico})` : identificador;
    
    // Rank Pedagógico
    let rank = "Estagiário de BD";
    if (quizScore >= 12) rank = "Arquiteto de Dados Supremo";
    else if (quizScore >= 9) rank = "DBA Sênior";
    else if (quizScore >= 6) rank = "Backend Júnior";
    
    // Função auxiliar para desenhar o cabeçalho padrão de cada página
    const desenharCabecalhoPagina = (documento, numeroPagina) => {
      // Faixa Superior Vermelha - Identidade Oficial SENAI
      documento.setFillColor(227, 6, 19); 
      documento.rect(0, 0, 210, 10, "F");
      
      documento.setFont("helvetica", "bold");
      documento.setFontSize(7.5);
      documento.setTextColor(255, 255, 255);
      documento.text("SENAI - SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL", 15, 6.5);
      
      if (numeroPagina > 1) {
        documento.setFontSize(7);
        documento.text(`Página ${numeroPagina}`, 188, 6.5);
      }
    };

    // Inicialização da Página 1
    doc.setFillColor(248, 250, 252); // Fundo cinza claro
    doc.rect(0, 0, 210, 297, "F");
    desenharCabecalhoPagina(doc, 1);
    
    // Cabeçalho e Título
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("COMPROVANTE OFICIAL DE DESEMPENHO", 15, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Disciplina: ${disciplina?.nome || "Banco de Dados (BCD)"}`, 15, 25);

    // Linha divisória fina superior
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, 28, 195, 28);

    // Grid de Informações e Auditoria (Duas colunas amplas no topo para evitar estouros)
    let infoY = 34;
    doc.setFontSize(8.5);
    
    // Coluna Esquerda: Aluno e Turma (Valores alinhados em X=38)
    doc.setFont("helvetica", "normal");
    doc.text("ALUNO(A):", 15, infoY);
    doc.setFont("helvetica", "bold");
    doc.text(nomeAluno.toUpperCase(), 38, infoY);
    
    doc.setFont("helvetica", "normal");
    doc.text("TURMA:", 15, infoY + 5.5);
    doc.setFont("helvetica", "bold");
    doc.text(turma.toUpperCase(), 38, infoY + 5.5);
    
    // Coluna Direita: Conclusão, Máquina, Resultado e Rank (Valores alinhados em X=133)
    doc.setFont("helvetica", "normal");
    doc.text("CONCLUSÃO:", 98, infoY);
    doc.setFont("helvetica", "bold");
    doc.text(`${dataFormatada} às ${horaFormatada}`, 133, infoY);
    
    doc.setFont("helvetica", "normal");
    doc.text("MÁQUINA:", 98, infoY + 5.5);
    doc.setFont("helvetica", "bold");
    doc.text(infoMaquina.toUpperCase(), 133, infoY + 5.5);
    
    doc.setFont("helvetica", "normal");
    doc.text("RESULTADO:", 98, infoY + 11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(227, 6, 19); // Vermelho destaque
    doc.text(`${quizScore} / ${perguntas.length} ACERTOS (${((quizScore / perguntas.length) * 100).toFixed(0)}%)`, 133, infoY + 11);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("RANK:", 98, infoY + 16.5);
    doc.setFont("helvetica", "bold");
    doc.text(rank.toUpperCase(), 133, infoY + 16.5);

    // Linha da Missão (abaixo das colunas, alinhada em X=38 de largura total)
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("MISSÃO:", 15, infoY + 22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`${semanaStr.toUpperCase()} - ${aula.titulo.toUpperCase()}`, 38, infoY + 22);

    // Linha divisória fina inferior
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(15, 60, 195, 60);

    let yPos = 66;
    let pagCount = 1;

    // Lista de Questões com suporte a quebra de página e cards coloridos
    perguntas.forEach((p, idx) => {
      const respAluno = respostasUsuario[idx] || "Não respondida";
      
      // Estima a altura exata da pergunta e suas alternativas definindo a fonte correta antes
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      const questaoLinhas = doc.splitTextToSize(`${idx + 1}. ${p.pergunta}`, 180);
      const questaoHeight = (questaoLinhas.length * 3.5) + 1.5;
      
      let alternativasHeight = 0;
      p.opcoes.forEach(opcao => {
        const isSelected = opcao === respAluno;
        const isCorrect = opcao === p.resposta_correta;
        
        doc.setFontSize(6.8);
        if (isSelected || isCorrect) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        
        const textoOpcao = doc.splitTextToSize(opcao, 172);
        const alturaCaixa = (textoOpcao.length * 2.8) + 1.8;
        alternativasHeight += alturaCaixa + 0.6;
      });
      
      const totalQuestaoHeight = questaoHeight + alternativasHeight + 2; // Margem extra

      // Quebra de página segura e dinâmica
      if (yPos + totalQuestaoHeight > 275) {
        doc.addPage();
        pagCount += 1;
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 297, "F");
        desenharCabecalhoPagina(doc, pagCount);
        yPos = 26;
      }

      // Imprime o Título da Pergunta (linha por linha com line height exato de 3.5mm)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      doc.setTextColor(30, 41, 59);
      
      questaoLinhas.forEach(linha => {
        doc.text(linha, 15, yPos);
        yPos += 3.5;
      });
      yPos += 1.5;

      // Imprime as Alternativas formatadas como cards
      p.opcoes.forEach(opcao => {
        const isSelected = opcao === respAluno;
        const isCorrect = opcao === p.resposta_correta;
        
        doc.setFontSize(6.8);
        if (isSelected || isCorrect) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        
        const textoOpcao = doc.splitTextToSize(opcao, 172);
        const alturaCaixa = (textoOpcao.length * 2.8) + 1.8;
        
        if (isSelected && isCorrect) {
          doc.setFillColor(240, 253, 250); // Verde claro bg
          doc.setDrawColor(167, 243, 208); // Verde border
          doc.setTextColor(22, 101, 52); // Verde texto
          doc.rect(15, yPos - 2.0, 180, alturaCaixa, "FD");
        } else if (isSelected && !isCorrect) {
          doc.setFillColor(254, 242, 242); // Vermelho claro bg
          doc.setDrawColor(254, 202, 202); // Vermelho border
          doc.setTextColor(153, 27, 27); // Vermelho texto
          doc.rect(15, yPos - 2.0, 180, alturaCaixa, "FD");
        } else if (isCorrect) {
          doc.setFillColor(240, 253, 250); // Verde claro bg (gabarito)
          doc.setDrawColor(167, 243, 208); // Verde border
          doc.setTextColor(22, 101, 52); // Verde texto
          doc.rect(15, yPos - 2.0, 180, alturaCaixa, "FD");
        } else {
          doc.setFillColor(250, 250, 250); // Cinza muito claro bg
          doc.setDrawColor(241, 245, 249); // Cinza claro border
          doc.setTextColor(100, 116, 139); // Cinza texto
          doc.rect(15, yPos - 2.0, 180, alturaCaixa, "FD");
        }
        
        // Desenha o texto da alternativa linha por linha (line height exato de 2.8mm)
        let lineY = yPos + 0.6;
        textoOpcao.forEach(linha => {
          doc.text(linha, 18, lineY);
          lineY += 2.8;
        });
        
        yPos += alturaCaixa + 0.6;
      });

      yPos += 2.5; // Espaçamento entre perguntas
    });

    // Bloco de Assinaturas dinamicamente verificado
    if (yPos + 22 > 275) {
      doc.addPage();
      pagCount += 1;
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, "F");
      desenharCabecalhoPagina(doc, pagCount);
      yPos = 30;
    }

    yPos += 12;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(35, yPos, 90, yPos);
    doc.line(120, yPos, 175, yPos);
    
    yPos += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Assinatura do Aluno", 48, yPos);
    doc.text("Assinatura do Instrutor / Professor", 127, yPos);

    // Salvar o arquivo no padrão: sigla - semana - aluno - data
    const nomeArquivo = `${sigla} - ${semanaStr} - ${nomeAluno.trim()} - ${dataParaNome}.pdf`;
    doc.save(nomeArquivo);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    const loadData = async () => {
      try {
        const numSemanaStr = numeroSemana.toString().padStart(2, '0');
        const discData = await import(`../data/${disciplinaSlug}/disciplina.json`);
        const aulaData = await import(`../data/${disciplinaSlug}/semana${numSemanaStr}.json`);

        if (active) {
          setDisciplina(discData.default || discData);
          setCronograma(discData.default?.cronograma || discData.cronograma || []);
          setTotalSemanas(discData.default?.cronograma?.length || discData.cronograma?.length || 20);
          setAula(aulaData.default || aulaData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro ao carregar aula", err);
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
  }, [disciplinaSlug, semanaId, numeroSemana]);

  // Efeito redundante de segurança: garante que o scroll do body esteja liberado ao montar a página de aula
  useEffect(() => {
    document.body.style.overflow = '';
  }, [semanaId]);

  // Renderização das telas de Loading e Erro
  if (loading) {
    return (
      <div className="min-h-screen bg-custom-bg flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-custom-accent"></div>
          <BookOpen className="h-6 w-6 text-custom-accent absolute animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-custom-muted font-sans animate-pulse">
          Carregando conteúdo da semana...
        </p>
      </div>
    );
  }

  const temAnterior = numeroSemana > 1;
  const temProxima = numeroSemana < totalSemanas;
  const temDadosCompletos = aula && !!aula.bloco_A;

  const renderRecursoVisualDataDriven = (recursoVisual) => {
    if (!recursoVisual) return null;
    
    const texto = recursoVisual.toString();
    
    // 1. Caso: Tabela
    if (texto.includes('PLACEHOLDER_TABELA:')) {
      const titulo = texto.replace('[PLACEHOLDER_TABELA:', '').replace(']', '').trim();
      return (
        <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
          
          <div>
            <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono text-center">ANÁLISE ESTRUTURADA</span>
            <h4 className="text-sm font-extrabold text-custom-text text-center mb-6 font-mono border-b border-custom-border/40 pb-3">{titulo}</h4>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-custom-border text-custom-text">
                    <th className="text-left pb-2.5 font-bold font-mono">PARÂMETRO</th>
                    <th className="text-left pb-2.5 font-bold font-mono text-custom-accent">ESPECIFICAÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-border/40 text-custom-muted">
                  <tr className="hover:bg-custom-bg/30">
                    <td className="py-3 font-bold text-custom-text">Estrutura Operacional</td>
                    <td className="py-3 font-mono">Normalizada e validada via SGBD</td>
                  </tr>
                  <tr className="hover:bg-custom-bg/30">
                    <td className="py-3 font-bold text-custom-text">Concorrência Ativa</td>
                    <td className="py-3 font-mono text-emerald-500 font-semibold">Suporte multithreading avançado</td>
                  </tr>
                  <tr className="hover:bg-custom-bg/30">
                    <td className="py-3 font-bold text-custom-text">Segurança de Persistência</td>
                    <td className="py-3 font-mono text-purple-400">Garantia transacional ACID / Isolamento</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="text-[10px] text-custom-muted leading-relaxed font-mono mt-4 pt-3 border-t border-custom-border/40 text-center flex items-center justify-center gap-1.5">
            <span>💡</span>
            <span>Estrutura técnica renderizada a partir das diretrizes curriculares do SENAI.</span>
          </div>
        </div>
      );
    }
    
    // 2. Caso: Diagrama / Fluxograma / Gráfico
    if (texto.includes('PLACEHOLDER_DIAGRAMA:') || texto.includes('PLACEHOLDER_GRAFICO:')) {
      const tipo = texto.includes('PLACEHOLDER_DIAGRAMA:') ? 'DIAGRAMA DE ARQUITETURA' : 'MÉTRICAS COMPARATIVAS';
      const titulo = texto.replace('[PLACEHOLDER_DIAGRAMA:', '').replace('[PLACEHOLDER_GRAFICO:', '').replace(']', '').trim();
      return (
        <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
          
          <div>
            <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono text-center">{tipo}</span>
            <h4 className="text-sm font-extrabold text-custom-text text-center mb-6 font-mono border-b border-custom-border/40 pb-3">{titulo}</h4>
            
            {/* Visualização de Fluxo Conectado */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-custom-bg border border-custom-border rounded-xl px-4 py-2.5 font-mono text-xs text-custom-text shadow-sm flex items-center gap-1.5 hover:border-custom-accent/30 transition-colors">
                  <Terminal className="h-4 w-4 text-custom-accent" />
                  <span>Aplicação Client</span>
                </div>
                <div className="text-custom-accent font-bold animate-pulse">➔</div>
                <div className="bg-custom-accent/5 border border-custom-accent/25 rounded-xl px-4 py-2.5 font-mono text-xs text-custom-accent shadow-sm flex items-center gap-1.5 hover:bg-custom-accent/10 transition-colors">
                  <Layers className="h-4 w-4" />
                  <span>SGBD Server</span>
                </div>
              </div>
              
              <div className="text-custom-accent font-bold animate-pulse rotate-90 py-0.5">➔</div>
              
              <div className="bg-custom-card border border-custom-border rounded-xl px-5 py-3 font-mono text-xs text-custom-muted shadow-sm flex items-center gap-1.5 hover:text-custom-text transition-colors">
                <Award className="h-4 w-4 text-emerald-500" />
                <span>Persistência Blindada</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-custom-muted leading-relaxed font-mono mt-4 pt-3 border-t border-custom-border/40 text-center flex items-center justify-center gap-1.5">
            <span>⚙️</span>
            <span>Fluxo interativo mapeado conforme os objetivos da Unidade Curricular BCD.</span>
          </div>
        </div>
      );
    }
    
    // 3. Caso: Imagem ou fallback geral
    const titulo = texto.replace('[PLACEHOLDER_IMG:', '').replace(']', '').trim();
    return (
      <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.02]" />
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div>
          <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono text-center">RECURSO CONCEITUAL</span>
          <h4 className="text-sm font-extrabold text-custom-text text-center mb-6 font-mono border-b border-custom-border/40 pb-3">{titulo}</h4>
          
          {/* Card Holográfico Central de Destaque */}
          <div className="border border-custom-border bg-custom-bg/40 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-center select-none shadow-inner min-h-[160px] hover:border-custom-accent/25 transition-colors duration-300">
            <div className="h-12 w-12 rounded-xl bg-custom-accent/10 border border-custom-accent/20 text-custom-accent flex items-center justify-center shadow-inner animate-pulse">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-xs text-custom-muted leading-relaxed font-sans max-w-xs">
              Mapeamento visual planejado e homologado pelo SENAI para ilustrar as competências da semana.
            </p>
          </div>
        </div>
        
        <div className="text-[10px] text-custom-muted leading-relaxed font-mono mt-4 pt-3 border-t border-custom-border/40 text-center flex items-center justify-center gap-1.5">
          <span>📚</span>
          <span>Material de apoio oficial do Curso Técnico em Desenvolvimento de Sistemas.</span>
        </div>
      </div>
    );
  };

  // Roteador de recursos visuais interativos que substitui os placeholders textuais do JSON
  const renderRecursoVisual = (recursoVisual, blocoTipo, activeSlide) => {
    if (numeroSemana !== 1) {
      return renderRecursoVisualDataDriven(recursoVisual);
    }
    if (blocoTipo === 'A') {
      switch (activeSlide) {
        case 0: // Dado vs Informação
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full relative overflow-hidden">
              {/* Imagem de Fundo Premium Realista */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/dado_vs_informacao.png" className="w-full h-full object-cover" alt="Dados e Informação" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest font-mono text-center block mb-2">SIMULADOR DE FLUXO DE DADOS</span>
              
              <div className="w-full flex justify-around items-center py-2.5 relative">
                {!dadosConectados ? (
                  <div className="space-y-2 animate-pulse flex flex-col items-center w-full">
                    <div className="flex gap-2.5">
                      <div className="text-sm font-mono bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-lg">"42" (Dado Bruto)</div>
                      <div className="text-sm font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-1.5 rounded-lg">"PIX" (Dado Bruto)</div>
                      <div className="text-sm font-mono bg-sky-500/10 border border-sky-500/20 text-sky-500 px-4 py-1.5 rounded-lg">"12:17" (Dado Bruto)</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full font-mono text-xs sm:text-sm text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-left space-y-2 animate-fade-in">
                    <div className="text-custom-accent font-bold">// DADOS ORDENADOS E CONECTADOS:</div>
                    <p className="leading-relaxed">
                      📅 <span className="text-custom-text font-semibold">Data/Hora:</span> 12:17<br />
                      💸 <span className="text-custom-text font-semibold">Operação:</span> PIX Recebido<br />
                      💵 <span className="text-custom-text font-semibold">Valor:</span> R$ 42,00<br />
                      💡 <span className="text-custom-text font-semibold">Informação:</span> Transação financeira aprovada com sucesso!
                    </p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setDadosConectados(!dadosConectados)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-custom-accent hover:bg-custom-accent/90 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md cursor-pointer mt-2"
              >
                {dadosConectados ? 'Resetar Fluxo' : 'Conectar e Mapear Dados'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        case 1: // Planilha vs BD
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full overflow-hidden">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/excel_vs_sql.png" className="w-full h-full object-cover" alt="Excel vs SQL" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono text-center">EXCEL VS BANCO DE DADOS</span>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-custom-border text-custom-text">
                      <th className="text-left pb-2 font-bold font-mono">RECURSO</th>
                      <th className="text-left pb-2 font-bold font-mono">EXCEL</th>
                      <th className="text-left pb-2 font-bold font-mono">SGBD SQL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-custom-border/40 text-custom-muted">
                    <tr className="hover:bg-custom-bg/30">
                      <td className="py-2.5 font-bold text-custom-text font-sans">Concorrência</td>
                      <td className="py-2.5 text-red-500/80 font-mono">1 usuário por vez</td>
                      <td className="py-2.5 text-emerald-500 font-semibold font-mono">50.000+ simultâneos</td>
                    </tr>
                    <tr className="hover:bg-custom-bg/30">
                      <td className="py-2.5 font-bold text-custom-text font-sans">Volume Máx.</td>
                      <td className="py-2.5 text-red-500/80 font-mono">1 Milhão de linhas</td>
                      <td className="py-2.5 text-emerald-500 font-semibold font-mono">Terabytes / Ilimitado</td>
                    </tr>
                    <tr className="hover:bg-custom-bg/30">
                      <td className="py-2.5 font-bold text-custom-text font-sans">Segurança</td>
                      <td className="py-2.5 text-red-500/80 font-mono">Senha de arquivo</td>
                      <td className="py-2.5 text-emerald-500 font-semibold font-mono">Permissões (DCL)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] sm:text-xs text-custom-muted bg-custom-bg border border-custom-border p-3 rounded-lg mt-4 leading-relaxed font-mono w-full">
                💡 <span className="font-bold text-custom-text">VEREDITO:</span> Planilhas são ferramentas de análise pessoal; SGBDs são infraestruturas críticas multiusuário.
              </div>
            </div>
          );
        case 2: // Fluxograma SGBD
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full relative overflow-hidden">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/arquitetura_sgbd.png" className="w-full h-full object-cover" alt="Arquitetura SGBD" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono text-center relative z-10">ARQUITETURA DE ACESSO DO SGBD</span>
              
              <div className="space-y-2 flex flex-col items-center w-full">
                <button 
                  onClick={() => setEtapaFluxo('app')}
                  className={`w-full max-w-[280px] text-center p-2.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${etapaFluxo === 'app' ? 'bg-sky-500/10 border-sky-500/40 text-sky-500 shadow-md shadow-sky-500/5 scale-102 font-bold' : 'bg-custom-bg border-custom-border text-custom-muted'}`}
                >
                  1. Aplicação / Cliente
                </button>
                <div className="text-xs text-custom-muted font-mono leading-none">↓ Query SQL</div>
                
                <button 
                  onClick={() => setEtapaFluxo('sgbd')}
                  className={`w-full max-w-[280px] text-center p-2.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${etapaFluxo === 'sgbd' ? 'bg-purple-500/10 border-purple-500/40 text-purple-500 shadow-md shadow-purple-500/5 scale-102 font-bold' : 'bg-custom-bg border-custom-border text-custom-muted'}`}
                >
                  2. Motor SGBD (MySQL)
                </button>
                <div className="text-xs text-custom-muted font-mono leading-none">↓ Otimização</div>
                
                <button 
                  onClick={() => setEtapaFluxo('disco')}
                  className={`w-full max-w-[280px] text-center p-2.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${etapaFluxo === 'disco' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-md shadow-emerald-500/5 scale-102 font-bold' : 'bg-custom-bg border-custom-border text-custom-muted'}`}
                >
                  3. Disco / Armazenamento
                </button>
              </div>

              <div className="mt-4 p-3 bg-custom-bg border border-custom-border rounded-lg text-[11px] sm:text-xs text-custom-muted leading-normal font-mono min-h-[60px] w-full">
                {etapaFluxo === 'app' && "📱 APLICAÇÃO: O código backend solicita dados enviando comandos SQL padronizados ao servidor de banco de dados."}
                {etapaFluxo === 'sgbd' && "⚙️ SGBD: O motor de banco compila e valida as instruções SQL, gerencia concorrências e aloca em cache."}
                {etapaFluxo === 'disco' && "💾 DISCO: O SGBD grava no disco de armazenamento físico (.ibd/.frm) de forma transacional e segura."}
              </div>
            </div>
          );
        case 3: // Logotipos Neon
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans text-center w-full overflow-hidden">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/sgbd_relacionais.png" className="w-full h-full object-cover" alt="SGBDs Relacionais" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono">SGBDS RELACIONAIS: LÍDERES DE MERCADO</span>
              
              <div className="grid grid-cols-2 gap-3 py-1 w-full">
                <button 
                  onClick={() => setDbAtivo('mysql')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${dbAtivo === 'mysql' ? 'border-sky-500 bg-sky-500/10 text-sky-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-sky-500/30'}`}
                >
                  <svg className="h-8 w-8 mb-2 text-[#00758f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" />
                    <path d="M2 12C2 7 6 6 12 6C18 6 22 8 22 12C22 16 18 18 12 18C6 18 2 16 2 12Z" />
                    <path d="M12 6V18" />
                    <path d="M16 10C17.5 9 19.5 9.5 20.5 11C20 12.5 18 13.5 16 13" fill="currentColor" opacity="0.2" />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold font-mono">MySQL</span>
                  <span className="text-[10px] mt-0.5 opacity-80">Open-Source</span>
                </button>

                <button 
                  onClick={() => setDbAtivo('postgres')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${dbAtivo === 'postgres' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-indigo-500/30'}`}
                >
                  <svg className="h-8 w-8 mb-2 text-[#336791]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                    <path d="M8 8H12C14 8 16 9 16 11.5C16 14 14 15 12 15H8V8Z" />
                    <path d="M8 12H11" />
                    <path d="M8 15V18" />
                    <path d="M16 11.5C17.5 11.5 19 12.5 19 14.5C19 16.5 17.5 17.5 16 17.5" />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold font-mono">PostgreSQL</span>
                  <span className="text-[10px] mt-0.5 opacity-80">Extensível</span>
                </button>

                <button 
                  onClick={() => setDbAtivo('oracle')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${dbAtivo === 'oracle' ? 'border-red-500 bg-red-500/10 text-red-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-red-500/30'}`}
                >
                  <svg className="h-8 w-8 mb-2 text-[#f80000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="12" rx="10" ry="6" stroke="currentColor" strokeWidth="2" />
                    <ellipse cx="12" cy="12" rx="6" ry="3.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold font-mono">Oracle DB</span>
                  <span className="text-[10px] mt-0.5 opacity-80">Corporativo</span>
                </button>

                <button 
                  onClick={() => setDbAtivo('sqlserver')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${dbAtivo === 'sqlserver' ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-amber-500/30'}`}
                >
                  <svg className="h-8 w-8 mb-2 text-[#e41b23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="7" ry="2.5" />
                    <path d="M5 5V12C5 13.38 8.13 14.5 12 14.5C15.87 14.5 19 13.38 19 12V5" />
                    <path d="M5 12V19C5 20.38 8.13 21.5 12 21.5C15.87 21.5 19 20.38 19 19V12" />
                    <path d="M5 8.5C5 9.88 8.13 11 12 11C15.87 11 19 9.88 19 8.5" />
                    <path d="M5 15.5C5 16.88 8.13 18 12 18C15.87 18 19 16.88 19 15.5" />
                    <path d="M12 2.5V21.5" strokeDasharray="2 2" />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold font-mono">SQL Server</span>
                  <span className="text-[10px] mt-0.5 opacity-80">Microsoft</span>
                </button>
              </div>

              <div className="mt-3 p-3 bg-custom-bg border border-custom-border rounded-lg text-[11px] sm:text-xs text-custom-muted leading-relaxed font-mono min-h-[60px] flex items-center justify-center w-full">
                {!dbAtivo ? "💡 Clique em uma das marcas acima para detalhar seu perfil comercial." : ""}
                {dbAtivo === 'mysql' && "🐬 MYSQL: É o SGBD relacional mais popular do planeta. Rápido, leve e oficial do nosso semestre."}
                {dbAtivo === 'postgres' && "🐘 POSTGRESQL: Extremamente robusto e aderente aos padrões SQL. Muito adotado em startups."}
                {dbAtivo === 'oracle' && "🔴 ORACLE: Líder incontestável no mercado corporativo financeiro. Suporta cargas gigantescas."}
                {dbAtivo === 'sqlserver' && "💻 SQL SERVER: O motor relacional robusto da Microsoft, perfeitamente integrado ao .NET."}
              </div>
            </div>
          );
        case 4: // Tabela Relacional vs Documento NoSQL
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full overflow-hidden">
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-4 font-mono text-center">TABELA SQL VS DOCUMENTO JSON</span>
              
              <div className="grid grid-cols-2 gap-4 items-stretch h-full w-full mb-4">
                {/* Esquerda: SQL */}
                <div className="border border-custom-border bg-custom-bg/40 p-3 rounded-lg flex flex-col justify-between space-y-2">
                  <span className="block text-[10px] font-bold text-sky-500 font-mono">TABELA RELACIONAL (SQL)</span>
                  <div className="text-[9px] sm:text-xs font-mono overflow-x-auto text-custom-muted w-full">
                    <table className="w-full border border-custom-border">
                      <thead>
                        <tr className="bg-custom-bg border-b border-custom-border text-custom-text">
                          <th className="p-1 text-left">id</th>
                          <th className="p-1 text-left">nome</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-custom-border/40">
                          <td className="p-1">1</td>
                          <td className="p-1">William</td>
                        </tr>
                        <tr>
                          <td className="p-1">2</td>
                          <td className="p-1">Dev</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <span className="block text-[9px] text-custom-muted leading-none">Colunas fixas e estruturadas.</span>
                </div>

                {/* Direita: JSON */}
                <div className="border border-custom-border bg-custom-bg/40 p-3 rounded-lg flex flex-col justify-between space-y-2">
                  <span className="block text-[10px] font-bold text-emerald-500 font-mono">DOCUMENTO JSON (NOSQL)</span>
                  <div className="text-[9px] sm:text-xs font-mono text-emerald-500 leading-normal bg-custom-bg/60 p-2 border border-custom-border/50 rounded overflow-x-auto w-full">
                    {`{\n  "_id": 1,\n  "nome": "William",\n  "skills": ["SQL"],\n  "ativo": true\n}`}
                  </div>
                  <span className="block text-[9px] text-custom-muted leading-none">Flexibilidade schema-less.</span>
                </div>
              </div>

              {/* Imagem Premium no Rodapé */}
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-custom-border shadow-lg">
                <img src="/images/sql_vs_nosql.png" className="w-full h-full object-cover" alt="SQL vs NoSQL" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
            </div>
          );
        case 5: // Infografico Carreiras
          return (
            <div className="space-y-4 w-full">
              {/* Banner Realista Premium */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-custom-border shadow-md">
                <img src="/images/carreiras_dados.png" className="w-full h-full object-cover" alt="Carreiras de Dados" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card via-transparent to-transparent" />
              </div>

              <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 space-y-4 shadow-xl font-sans w-full">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-custom-accent font-mono flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  ECOSSISTEMA PROFISSIONAL: QUEM PILOTA OS SGBDS?
                </h4>
                <p className="text-xs text-custom-muted leading-relaxed">
                  No mercado de dados, a responsabilidade é gigante e os salários são altos. Clique abaixo para ver o foco de cada especialidade:
                </p>

                <div className="space-y-3">
                  {/* Carreira 1: DBA */}
                  <div className="border border-custom-border rounded-xl overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => setCarreiraAtiva(carreiraAtiva === 'dba' ? null : 'dba')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-custom-bg/40 hover:bg-custom-bg text-left text-xs sm:text-sm font-bold text-custom-text cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-sky-500/10 text-sky-500 text-xs font-bold font-mono">DBA</span>
                        Administrador de Banco de Dados (DBA)
                      </span>
                      {carreiraAtiva === 'dba' ? <ChevronUp className="h-4.5 w-4.5 text-custom-muted" /> : <ChevronDown className="h-4.5 w-4.5 text-custom-muted" />}
                    </button>
                    {carreiraAtiva === 'dba' && (
                      <div className="px-4 py-3 bg-custom-card/30 border-t border-custom-border text-xs text-custom-muted leading-relaxed animate-fade-in space-y-1.5">
                        <p className="font-semibold text-custom-text">Foco: Infraestrutura e Estabilidade (Média: R$ 8k - R$ 16k)</p>
                        <p>O DBA garante que o banco esteja ativo, seguro, performático e com backups atualizados periodicamente.</p>
                      </div>
                    )}
                  </div>

                  {/* Carreira 2: Arquiteto de Dados */}
                  <div className="border border-custom-border rounded-xl overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => setCarreiraAtiva(carreiraAtiva === 'arquiteto' ? null : 'arquiteto')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-custom-bg/40 hover:bg-custom-bg text-left text-xs sm:text-sm font-bold text-custom-text cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/10 text-purple-500 text-xs font-bold font-mono">ARQ</span>
                        Arquiteto de Dados
                      </span>
                      {carreiraAtiva === 'arquiteto' ? <ChevronUp className="h-4.5 w-4.5 text-custom-muted" /> : <ChevronDown className="h-4.5 w-4.5 text-custom-muted" />}
                    </button>
                    {carreiraAtiva === 'arquiteto' && (
                      <div className="px-4 py-3 bg-custom-card/30 border-t border-custom-border text-xs text-custom-muted leading-relaxed animate-fade-in space-y-1.5">
                        <p className="font-semibold text-custom-text">Foco: Modelagem lógica e integridade (Média: R$ 10k - R$ 18k)</p>
                        <p>Ele projeta as regras de negócios, chaves primárias e relacionamentos que servem de base para o sistema.</p>
                      </div>
                    )}
                  </div>

                  {/* Carreira 3: Engenheiro de Dados */}
                  <div className="border border-custom-border rounded-xl overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => setCarreiraAtiva(carreiraAtiva === 'engenheiro' ? null : 'engenheiro')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-custom-bg/40 hover:bg-custom-bg text-left text-xs sm:text-sm font-bold text-custom-text cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold font-mono">ENG</span>
                        Engenheiro de Dados
                      </span>
                      {carreiraAtiva === 'engenheiro' ? <ChevronUp className="h-4.5 w-4.5 text-custom-muted" /> : <ChevronDown className="h-4.5 w-4.5 text-custom-muted" />}
                    </button>
                    {carreiraAtiva === 'engenheiro' && (
                      <div className="px-4 py-3 bg-custom-card/30 border-t border-custom-border text-xs text-custom-muted leading-relaxed animate-fade-in space-y-1.5">
                        <p className="font-semibold text-custom-text">Foco: Pipelines de Dados e ETL (Média: R$ 9k - R$ 17k)</p>
                        <p>Ele constrói e monitora fluxos de dados de grande volume, conectando transações operacionais com lagos de dados.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    } else if (blocoTipo === 'B') {
      switch (activeSlide) {
        case 0: // Mock Cockpit
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans text-center relative overflow-hidden w-full">
              {/* Imagem de Fundo holográfica no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/matriz_holografica.png" className="w-full h-full object-cover" alt="Holograma de Dados" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono">COCKPIT PEDAGÓGICO DE OPERAÇÕES</span>
              
              <div className="border border-custom-border bg-custom-bg/60 p-4 rounded-xl flex flex-col gap-2.5 relative text-xs font-mono text-left w-full">
                <div className="bg-custom-card p-2 border border-custom-border rounded flex items-center justify-between">
                  <span>📂 Semana 01 - Primeiros Passos</span>
                  <span className="text-custom-accent font-bold">● Ativo</span>
                </div>
                <div className="bg-custom-card p-2 border border-custom-border rounded flex items-center justify-between">
                  <span>⏱️ Tempo de Atividade</span>
                  <span className="text-emerald-500 font-bold">01:25:00</span>
                </div>
                <div className="bg-custom-card p-2 border border-custom-border rounded flex items-center justify-between">
                  <span>🎯 Pontuação Quiz</span>
                  <span className="text-purple-500 font-bold">14 / 15</span>
                </div>
              </div>

              <p className="text-xs text-custom-muted leading-relaxed mt-4 font-mono">
                💡 <span className="font-bold text-custom-text">INTERATIVIDADE:</span> Esta plataforma monitora suas capacities técnicas em tempo real para homologação curricular.
              </p>
            </div>
          );
        case 1: // Linha do Tempo SAs
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans w-full overflow-hidden">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/datacenter.png" className="w-full h-full object-cover" alt="Datacenter do Curso" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono text-center">CRONOGRAMA DE SITUAÇÕES DE APRENDIZAGEM</span>
              
              <div className="space-y-2.5 font-mono text-xs w-full">
                <button 
                  onClick={() => setSaAtiva('SA1')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${saAtiva === 'SA1' ? 'border-sky-500 bg-sky-500/10 text-sky-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-sky-500/30'}`}
                >
                  SA1 (Semanas 01 a 06): Modelagem e Estrutura
                </button>

                <button 
                  onClick={() => setSaAtiva('SA2')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${saAtiva === 'SA2' ? 'border-purple-500 bg-purple-500/10 text-purple-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-purple-500/30'}`}
                >
                  SA2 (Semanas 07 a 12): Consultas & JOINs
                </button>

                <button 
                  onClick={() => setSaAtiva('SA3')}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${saAtiva === 'SA3' ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' : 'border-custom-border bg-custom-bg text-custom-muted hover:border-amber-500/30'}`}
                >
                  SA3 (Semanas 13 a 20): Programação & Transações
                </button>
              </div>

              <div className="mt-4 p-3 bg-custom-bg border border-custom-border rounded-lg text-xs text-custom-muted leading-relaxed font-mono min-h-[60px] w-full">
                {saAtiva === 'SA1' && "📐 SA1: O foco é desenhar diagramas conceituais no draw.db, normalizar tabelas e criar a estrutura via DDL."}
                {saAtiva === 'SA2' && "🔍 SA2: O foco é extrair inteligência de dados, cruzar tabelas com JOINs e resolver o Escape Room Forense."}
                {saAtiva === 'SA3' && "🛡️ SA3: Automação completa (Stored Procedures, Triggers, Views) e segurança DCL contra ataques simulados."}
              </div>
            </div>
          );
        case 2: // Escala Autonomia MSEP
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 space-y-4 shadow-xl font-sans w-full relative overflow-hidden">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner">
                <img src="/images/escala_autonomia.png" className="w-full h-full object-cover" alt="Escala de Autonomia" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 font-mono flex items-center gap-2 relative z-10">
                <Shield className="h-4 w-4" />
                MSEP: GRAUS DE AUTONOMIA DO ALUNO
              </h4>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                  <span className="block text-xs sm:text-sm font-bold text-sky-500 dark:text-sky-400 font-mono">AUT</span>
                  <span className="block text-xs text-custom-text mt-1.5 font-semibold">Autônomo</span>
                  <span className="block text-[9px] text-custom-muted mt-0.5 font-mono">Pesquisa e resolve só</span>
                </div>
                
                <div className="border border-purple-500/20 bg-purple-500/5 dark:bg-purple-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                  <span className="block text-xs sm:text-sm font-bold text-purple-500 dark:text-purple-400 font-mono">PA</span>
                  <span className="block text-xs text-custom-text mt-1.5 font-semibold">Assistido Parcial</span>
                  <span className="block text-[9px] text-custom-muted mt-0.5 font-mono">Dicas do instrutor</span>
                </div>
                
                <div className="border border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                  <span className="block text-xs sm:text-sm font-bold text-yellow-500 dark:text-yellow-400 font-mono">AP</span>
                  <span className="block text-xs text-custom-text mt-1.5 font-semibold">Auxílio Permanente</span>
                  <span className="block text-[9px] text-custom-muted mt-0.5 font-mono">Acompanhado</span>
                </div>
                
                <div className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                  <span className="block text-xs sm:text-sm font-bold text-red-500 dark:text-red-400 font-mono">NE</span>
                  <span className="block text-xs text-custom-text mt-1.5 font-semibold">Não Executa</span>
                  <span className="block text-[9px] text-custom-muted mt-0.5 font-mono">Sem entregas</span>
                </div>
              </div>
            </div>
          );
        case 3: // Radar Competencias
          return (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col justify-between min-h-[380px] shadow-xl font-sans text-center w-full overflow-hidden">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner mb-4">
                <img src="/images/radar_soft_skills.png" className="w-full h-full object-cover" alt="Radar Soft Skills" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block mb-3 font-mono">RADAR DE CAPACIDADES SOCIOEMOCIONAIS</span>
              
              <div className="space-y-3 font-mono text-xs text-left w-full">
                <div className="border border-custom-border p-2 bg-custom-bg rounded-lg">
                  <span className="block font-bold text-custom-text">🧠 Pensamento Analítico:</span>
                  <span className="text-custom-muted text-[10px]">Desenvolvido no debug de erros e comandos SQL.</span>
                </div>
                <div className="border border-custom-border p-2 bg-custom-bg rounded-lg">
                  <span className="block font-bold text-custom-text">🛡️ Resiliência Técnica:</span>
                  <span className="text-custom-muted text-[10px]">Enfrentar problemas de conexão e pane em servidores.</span>
                </div>
                <div className="border border-custom-border p-2 bg-custom-bg rounded-lg">
                  <span className="block font-bold text-custom-text">⏱️ Autogestão e Prazos:</span>
                  <span className="text-custom-muted text-[10px]">Garantir a entrega pontual dos projetos solicitados.</span>
                </div>
              </div>

              <div className="text-xs text-custom-muted mt-4 font-mono w-full">
                💡 No SENAI, formamos desenvolvedores completos para o mercado de dados corporativos.
              </div>
            </div>
          );
        case 4: // Setup Local
          return (
            <div className="space-y-4 w-full">
              {/* Imagem Realista no Topo */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-custom-border shadow-inner">
                <img src="/images/setup_local.png" className="w-full h-full object-cover" alt="Setup Local" />
                <div className="absolute inset-0 bg-gradient-to-t from-custom-card/90 via-transparent to-transparent" />
              </div>

              {/* Cronômetro do Laboratório */}
              <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col items-center justify-center space-y-3 shadow-xl font-sans w-full">
                <span className="text-xs font-bold text-custom-accent uppercase tracking-widest font-mono">CRONÔMETRO DE LABORATÓRIO</span>
                
                <div className="font-mono text-3xl sm:text-4xl font-black text-custom-text bg-custom-bg/60 border border-custom-border px-5 py-2.5 rounded-xl tracking-widest select-none shadow-inner animate-pulse">
                  {formatTime(timerSeconds)}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={toggleTimer}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      timerRunning
                        ? 'bg-amber-600/15 border-amber-600/30 text-amber-500 hover:bg-amber-600/25'
                        : 'bg-emerald-600/15 border-emerald-600/30 text-emerald-500 hover:bg-emerald-600/25'
                    }`}
                  >
                    {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {timerRunning ? 'Pausar' : 'Iniciar'}
                  </button>
                  
                  <button 
                    onClick={resetTimer}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-custom-bg border border-custom-border text-custom-muted hover:bg-custom-card hover:text-custom-text transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Checklist Setup */}
              <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-4 space-y-3 shadow-xl font-sans w-full">
                <span className="text-xs font-bold text-custom-accent uppercase tracking-widest block font-mono text-center">CHECKLIST SETUP PORTA DE REDE</span>
                
                <div className="flex justify-between items-center bg-custom-bg p-3 border border-custom-border rounded-lg text-xs font-mono w-full">
                  <span className="text-custom-text">Porta MySQL (3306):</span>
                  <button 
                    onClick={() => setPortaTestada(portaTestada === 'ok' ? null : 'ok')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${portaTestada === 'ok' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-custom-card border border-custom-border text-custom-muted hover:text-custom-text'}`}
                  >
                    {portaTestada === 'ok' ? '✓ PORTA ATIVA' : 'TESTAR PORTA'}
                  </button>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  // Helper para renderizar a Atividade Prática de forma padronizada
  const renderAtividadePratica = (atividade) => {
    if (!atividade) return null;
    return (
      <div className="rounded-3xl border border-custom-border bg-custom-card p-8 md:p-10 shadow-lg relative overflow-hidden bg-gradient-to-br from-custom-card to-custom-card/85 transition-all duration-300 hover:shadow-xl hover:scale-[1.002]">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-custom-accent/4 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-custom-accent/10 border border-custom-accent/20 text-custom-accent shadow-inner mb-4">
            <Award className="h-6 w-6 animate-pulse" />
          </div>

          <h3 className="text-[1.25em] sm:text-[1.5em] font-extrabold text-custom-text font-sans leading-tight mb-4 tracking-tight">
            {atividade.nome}
          </h3>

          <div className="space-y-4 font-sans text-[0.875em] sm:text-[1em] text-custom-muted leading-relaxed w-full">
            {atividade.instrucoes.split('\n').map((line, i) => (
              <p key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-custom-accent/10 border border-custom-accent/25 text-custom-accent text-xs font-bold font-mono">
                  {i + 1}
                </span>
                <span className="flex-1 text-justify sm:text-left">{line.replace(/^\d+\.?\s*/, '')}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizador principal da Trilha de Slides Verticais (Estilo Landing Page Premium)
  const renderSlidesVertical = (bloco, blocoTipo) => {
    const slides = bloco.slides || [];
    if (slides.length === 0) return null;

    return (
      <div className="space-y-12 sm:space-y-16 w-full">
        {/* Título Monumental do Bloco */}
        <div className="border-l-4 border-custom-accent pl-6 py-2 max-w-4xl">
          <span className="text-[0.75em] font-bold text-custom-accent uppercase tracking-widest block font-mono mb-1">
            Módulo {blocoTipo} • {blocoTipo === 'A' ? 'Teoria & Conceitos de Elite' : 'Cockpit Operacional & Regras'}
          </span>
          <h2 className="text-[1.875em] sm:text-[2.25em] lg:text-[3em] font-black text-custom-text font-sans leading-tight">
            {bloco.titulo}
          </h2>
        </div>

        {/* Lista de Slides na Vertical em Ziguezague */}
        <div className="space-y-12 sm:space-y-16">
          {slides.map((slide, index) => {
            const ehImpar = index % 2 !== 0;
            const bgImage = getSlideBgImage(blocoTipo, index);
            return (
              <div 
                key={index}
                className="grid gap-12 lg:grid-cols-12 items-center relative py-6 sm:py-8 border-b border-custom-border/10 last:border-0"
              >
                {/* Imagem de Fundo Semi-Transparente */}
                {bgImage && (
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl opacity-5 dark:opacity-7 transition-opacity duration-300">
                    <img 
                      src={bgImage} 
                      alt="" 
                      className="w-full h-full object-cover filter blur-[1px] scale-102" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-custom-bg/95 via-custom-bg/70 to-custom-bg/95" />
                  </div>
                )}

                {/* Glow de fundo neon no slide para dar profundidade premium */}
                <div className={`absolute -top-12 ${ehImpar ? '-left-20' : '-right-20'} h-[350px] w-[350px] rounded-full bg-custom-accent/3 blur-[100px] pointer-events-none`} />

                {/* Conteúdo de Texto */}
                <div className={`space-y-6 lg:col-span-6 ${ehImpar ? 'lg:order-2' : ''} animate-fade-in`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-custom-accent/10 border border-custom-accent/20 text-custom-accent text-xs font-black font-mono shadow-inner">
                      {slide.slide_numero}
                    </span>
                    <span className="text-[10px] font-bold text-custom-accent uppercase tracking-widest font-mono">
                      PASSO {slide.slide_numero} DE {slides.length}
                    </span>
                  </div>

                  <h3 className="text-[1.875em] sm:text-[2.25em] lg:text-[3em] font-black text-custom-text font-sans leading-tight tracking-tight">
                    {slide.titulo_slide}
                  </h3>

                  <p className="text-[1em] sm:text-[1.125em] lg:text-[1.25em] leading-relaxed text-custom-muted text-justify font-sans whitespace-pre-line">
                    {renderMarkdown(slide.conteudo_slide)}
                  </p>

                </div>

                {/* Recurso Visual Interativo com moldura não retangular premium */}
                <div className={`lg:col-span-6 ${ehImpar ? 'lg:order-1' : ''} flex flex-col justify-center`}>
                  <div className={`relative transition-all duration-500 hover:scale-[1.01] ${
                    ehImpar 
                      ? 'rounded-[3rem] rounded-tl-none border-t-4 border-l-4 border-custom-accent/30 shadow-[0_0_50px_-20px_var(--accent-color)]' 
                      : 'rounded-[2.5rem] rounded-br-[6rem] border-b-4 border-r-4 border-purple-500/30 shadow-[0_0_50px_-20px_rgba(168,85,247,0.15)]'
                  } bg-custom-card/50 backdrop-blur-md border border-custom-border p-6 shadow-2xl overflow-hidden`}>
                    
                    {/* Elementos decorativos de grade/grid para cara de Landing Page Tech */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#000_1px,transparent_1px)]" />
                    
                    {renderRecursoVisual(slide.recurso_visual, blocoTipo, index)}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Atividade Prática do Bloco */}
        {bloco.atividade_pratica && (
          <div className="mt-16 pt-12 border-t border-custom-border/20 max-w-4xl mx-auto">
            {renderAtividadePratica(bloco.atividade_pratica)}
          </div>
        )}
      </div>
    );
  };

  // 1. Layout: Texto com Infográfico Expansível (Carreiras de Banco de Dados)
  const renderInfograficoExpansivel = (bloco) => {
    return (
      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Esquerda: Texto do Bloco + Atividade */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-l-4 border-custom-accent pl-4 py-1">
            <span className="text-[0.625em] font-bold text-custom-accent uppercase tracking-widest block font-mono">Teoria Aplicada</span>
            <h2 className="text-[1.5em] font-black text-custom-text font-sans">
              {bloco.titulo}
            </h2>
          </div>
          
          <p className="text-[0.875em] leading-relaxed text-custom-muted text-justify whitespace-pre-line font-sans">
            {renderMarkdown(bloco.conteudo)}
          </p>

          {renderAtividadePratica(bloco.atividade_pratica)}
        </div>

        {/* Direita: Infográfico Expansível de Carreiras */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 space-y-4 shadow-xl">
            <h4 className="text-[0.75em] font-bold uppercase tracking-wider text-custom-accent font-mono flex items-center gap-2">
              <Layers className="h-4 w-4" />
              ECOSSISTEMA PROFISSIONAL: QUEM PILOTA OS SGBDS?
            </h4>
            <p className="text-[0.6875em] text-custom-muted leading-relaxed font-sans">
              No mercado de dados, a responsabilidade é gigante e os salários são altos. Clique nas especialidades abaixo para detalhar suas funções críticas:
            </p>

            <div className="space-y-3 font-sans">
              {/* Carreira 1: DBA */}
              <div className="border border-custom-border rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setCarreiraAtiva(carreiraAtiva === 'dba' ? null : 'dba')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-custom-bg/40 hover:bg-custom-bg text-left text-[0.75em] font-bold text-custom-text cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 text-[0.625em] font-bold font-mono">DBA</span>
                    Administrador de Banco de Dados (DBA)
                  </span>
                  {carreiraAtiva === 'dba' ? <ChevronUp className="h-4 w-4 text-custom-muted" /> : <ChevronDown className="h-4 w-4 text-custom-muted" />}
                </button>
                {carreiraAtiva === 'dba' && (
                  <div className="px-4 py-3 bg-custom-card/30 border-t border-custom-border text-[0.6875em] text-custom-muted leading-relaxed animate-fade-in space-y-1.5">
                    <p className="font-semibold text-custom-text">Foco principal: Infraestrutura e Estabilidade</p>
                    <p>O DBA é o guardião do banco. Suas tarefas envolvem instalação do SGBD (como o MySQL no XAMPP), configuração de backups automáticos, garantia de alta disponibilidade, controle de permissões e afinação fina (Query Tuning) para que o sistema responda em milissegundos.</p>
                  </div>
                )}
              </div>

              {/* Carreira 2: Arquiteto de Dados */}
              <div className="border border-custom-border rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setCarreiraAtiva(carreiraAtiva === 'arquiteto' ? null : 'arquiteto')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-custom-bg/40 hover:bg-custom-bg text-left text-[0.75em] font-bold text-custom-text cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 text-[0.625em] font-bold font-mono">ARQ</span>
                    Arquiteto de Dados
                  </span>
                  {carreiraAtiva === 'arquiteto' ? <ChevronUp className="h-4 w-4 text-custom-muted" /> : <ChevronDown className="h-4 w-4 text-custom-muted" />}
                </button>
                {carreiraAtiva === 'arquiteto' && (
                  <div className="px-4 py-3 bg-custom-card/30 border-t border-custom-border text-[0.6875em] text-custom-muted leading-relaxed animate-fade-in space-y-1.5">
                    <p className="font-semibold text-custom-text">Foco principal: Estrutura, Modelagem e Padrões</p>
                    <p>Ele desenha como as tabelas vão conversar. Modela esquemas conceituais, lógicos e físicos usando ferramentas visuais (como o draw.db). Garante as regras de normalização de dados para evitar duplicidade de registros e inconsistência de atualizações.</p>
                  </div>
                )}
              </div>

              {/* Carreira 3: Engenheiro de Dados */}
              <div className="border border-custom-border rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setCarreiraAtiva(carreiraAtiva === 'engenheiro' ? null : 'engenheiro')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-custom-bg/40 hover:bg-custom-bg text-left text-[0.75em] font-bold text-custom-text cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-[0.625em] font-bold font-mono">ENG</span>
                    Engenheiro de Dados
                  </span>
                  {carreiraAtiva === 'engenheiro' ? <ChevronUp className="h-4 w-4 text-custom-muted" /> : <ChevronDown className="h-4 w-4 text-custom-muted" />}
                </button>
                {carreiraAtiva === 'engenheiro' && (
                  <div className="px-4 py-3 bg-custom-card/30 border-t border-custom-border text-[0.6875em] text-custom-muted leading-relaxed animate-fade-in space-y-1.5">
                    <p className="font-semibold text-custom-text">Foco principal: Pipelines, Integration e Fluxo</p>
                    <p>O Engenheiro de Dados constrói as pontes de informação. Ele cria rotinas de ETL (Extração, Transformação e Carga) para levar dados de sistemas transacionais (SQL) para lagos de dados (Data Lakes) ou bancos NoSQL rápidos, viabilizando análises em tempo real.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. Layout: Dashboard Interativo (Cronômetro + MSEP Autonomia Tracker)
  const renderDashboardInterativo = (bloco) => {
    return (
      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Esquerda: MSEP Autonomia Tracker e Cronômetro */}
        <div className="lg:col-span-5 space-y-6">
          {/* MSEP Autonomia Tracker */}
          <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 space-y-5 shadow-xl">
            <h4 className="text-[0.75em] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 font-mono flex items-center gap-2">
              <Shield className="h-4 w-4" />
              MSEP: GRAUS DE AUTONOMIA DO ALUNO
            </h4>
            
            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                <span className="block text-[0.75em] font-bold text-sky-500 dark:text-sky-400 font-mono">AUT</span>
                <span className="block text-[0.625em] text-custom-text mt-1 font-semibold">Autônomo</span>
                <span className="block text-[0.5em] text-custom-muted mt-0.5">Pesquisa e resolve só</span>
              </div>
              
              <div className="border border-purple-500/20 bg-purple-500/5 dark:bg-purple-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                <span className="block text-[0.75em] font-bold text-purple-500 dark:text-purple-400 font-mono">PA</span>
                <span className="block text-[0.625em] text-custom-text mt-1 font-semibold">Assistido Parcial</span>
                <span className="block text-[0.5em] text-custom-muted mt-0.5">Dicas pontuais squad</span>
              </div>
              
              <div className="border border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                <span className="block text-[0.75em] font-bold text-yellow-500 dark:text-yellow-400 font-mono">AP</span>
                <span className="block text-[0.625em] text-custom-text mt-1 font-semibold">Auxílio Permanente</span>
                <span className="block text-[0.5em] text-custom-muted mt-0.5">Acompanhamento</span>
              </div>
              
              <div className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-xl p-3 text-center shadow-sm hover:scale-[1.01] transition-transform">
                <span className="block text-[0.75em] font-bold text-red-500 dark:text-red-400 font-mono">NE</span>
                <span className="block text-[0.625em] text-custom-text mt-1 font-semibold">Não Executa</span>
                <span className="block text-[0.5em] text-custom-muted mt-0.5">Falta de entrega</span>
              </div>
            </div>
          </div>

          {/* Cronômetro do Laboratório */}
          <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 flex flex-col items-center justify-center space-y-4 shadow-xl">
            <span className="text-[0.625em] font-bold text-custom-accent uppercase tracking-widest font-mono">CRONÔMETRO DO LAB</span>
            
            <div className="font-mono text-[2.25em] sm:text-[3em] font-black text-custom-text bg-custom-bg/60 border border-custom-border px-6 py-3 rounded-2xl tracking-widest select-none shadow-inner animate-pulse">
              {formatTime(timerSeconds)}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={toggleTimer}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-[0.75em] font-bold rounded-xl border transition-all cursor-pointer ${
                  timerRunning
                    ? 'bg-amber-600/15 border-amber-600/30 text-amber-500 hover:bg-amber-600/25'
                    : 'bg-emerald-600/15 border-emerald-600/30 text-emerald-500 hover:bg-emerald-600/25 shadow-lg shadow-emerald-500/5'
                }`}
              >
                {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {timerRunning ? 'Pausar' : 'Iniciar'}
              </button>
              
              <button 
                onClick={resetTimer}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[0.75em] font-bold rounded-xl bg-custom-bg border border-custom-border text-custom-muted hover:bg-custom-card hover:text-custom-text transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Direita: Conteúdo do Bloco + Atividade */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <span className="text-[0.625em] font-bold text-purple-400 uppercase tracking-widest block font-mono">Missão Pedagógica</span>
            <h2 className="text-[1.5em] font-black text-custom-text font-sans">
              {bloco.titulo}
            </h2>
          </div>
          
          <p className="text-[0.875em] leading-relaxed text-custom-muted text-justify font-sans whitespace-pre-line">
            {renderMarkdown(bloco.conteudo)}
          </p>

          {renderAtividadePratica(bloco.atividade_pratica)}
        </div>
      </div>
    );
  };

  // 3. Layout: Texto com Gráfico Lado a Lado (Comparativo Relacional vs NoSQL)
  const renderGraficoLadoALado = (bloco) => {
    return (
      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Esquerda: Texto + Atividade */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-l-4 border-custom-accent pl-4 py-1">
            <span className="text-[0.625em] font-bold text-custom-accent uppercase tracking-widest block font-mono">Conceitos Essenciais</span>
            <h2 className="text-[1.5em] font-black text-custom-text font-sans">
              {bloco.titulo}
            </h2>
          </div>
          
          <p className="text-[0.875em] leading-relaxed text-custom-muted text-justify font-sans whitespace-pre-line">
            {renderMarkdown(bloco.conteudo)}
          </p>

          {renderAtividadePratica(bloco.atividade_pratica)}
        </div>

        {/* Direita: Imagem e Gráfico Comparativo */}
        <div className="lg:col-span-5 space-y-6">
          {bloco.elementos_visuais?.icones && (
            <div className="rounded-2xl border border-custom-border bg-custom-card/40 p-4 overflow-hidden shadow-lg">
              <img 
                src={bloco.elementos_visuais.icones} 
                alt="Comparativo de Modelos" 
                className="w-full h-auto rounded-xl object-cover hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          )}

          {bloco.elementos_visuais?.grafico && (
            <div className="rounded-2xl border border-custom-border bg-custom-card/60 p-6 space-y-4 shadow-xl">
              <h4 className="text-[0.75em] font-bold uppercase tracking-wider text-custom-accent font-mono flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {bloco.elementos_visuais.grafico.titulo}
              </h4>
              
              <div className="space-y-3 font-sans text-[0.75em]">
                <div className="space-y-1">
                  <div className="flex justify-between text-[0.6875em] font-bold">
                    <span className="text-sky-500">Rigor & Normalização (Relacional)</span>
                    <span className="text-sky-500">95%</span>
                  </div>
                  <div className="h-2 w-full bg-custom-bg border border-custom-border rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[0.6875em] font-bold">
                    <span className="text-emerald-500">Flexibilidade & Schema-less (NoSQL)</span>
                    <span className="text-emerald-500">98%</span>
                  </div>
                  <div className="h-2 w-full bg-custom-bg border border-custom-border rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. Layout: Texto Simples / Fallback Genérico para replicação de novas aulas
  const renderLayoutSimples = (bloco) => {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-custom-accent pl-4 py-1">
          <h2 className="text-[1.5em] font-black text-custom-text font-sans">
            {bloco.titulo}
          </h2>
        </div>
        
        <p className="text-[0.875em] leading-relaxed text-custom-muted text-justify font-sans whitespace-pre-line">
          {renderMarkdown(bloco.conteudo)}
        </p>

        {renderAtividadePratica(bloco.atividade_pratica)}
      </div>
    );
  };

  // Roteador dinâmico de layouts de blocos
  const renderBlocoModular = (bloco, blocoTipo) => {
    if (!bloco) return null;
    if (bloco.slides && bloco.slides.length > 0) {
      return renderSlidesVertical(bloco, blocoTipo);
    }
    switch (bloco.layout_slide) {
      case "texto_com_infografico_expansivel":
        return renderInfograficoExpansivel(bloco);
      case "dashboard_interativo":
        return renderDashboardInterativo(bloco);
      case "texto_com_grafico_lado_a_lado":
        return renderGraficoLadoALado(bloco);
      default:
        return renderLayoutSimples(bloco);
    }
  };

  return (
    <div className="min-h-screen bg-custom-bg text-custom-text transition-colors duration-300 relative overflow-hidden select-none flex">
      
      {/* 1. Sidebar - Árvore de Semanas */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 md:w-72 bg-custom-card border-r border-custom-border transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 ${sidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:border-r-0 lg:overflow-hidden'}`}
      >
        <div className="p-4 border-b border-custom-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-custom-accent" />
            <div>
              <h2 className="text-xs font-black text-custom-text font-sans uppercase">Trilha de Aulas</h2>
              <p className="text-[10px] text-custom-muted font-mono truncate max-w-[150px]">{disciplina?.nome || "Carregando..."}</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg border border-custom-border bg-custom-bg text-custom-muted hover:text-custom-text cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(agruparSemanasPorSA()).map(([sa, semanas]) => {
            let saColor = 'text-custom-accent bg-custom-accent/15 border-custom-accent/25';
            if (sa.includes('SA2')) saColor = 'text-purple-500 bg-purple-500/15 border-purple-500/25';
            else if (sa.includes('SA3')) saColor = 'text-amber-500 bg-amber-500/15 border-amber-500/25';
            else if (sa.includes('Entrevista') || sa.includes('Recuperação')) saColor = 'text-emerald-500 bg-emerald-500/15 border-emerald-500/25';

            return (
              <div key={sa} className="space-y-2">
                <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[9px] font-extrabold font-mono border ${saColor} uppercase tracking-wider`}>
                  {sa}
                </span>
                <div className="space-y-1">
                  {semanas.map((sem) => {
                    const isAtivo = parseInt(sem.semana_numero, 10) === numeroSemana;
                    const temConteudo = parseInt(sem.semana_numero, 10) === 1 || !!sem.bloco_A;

                    return (
                      <button
                        key={sem.semana_numero}
                        onClick={() => {
                          navigate(`/disciplina/${disciplinaSlug}/semana/${parseInt(sem.semana_numero, 10)}`);
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-300 font-sans cursor-pointer group ${
                          isAtivo 
                            ? 'bg-custom-accent/15 text-custom-accent border border-custom-accent/25 font-bold' 
                            : 'text-custom-muted hover:text-custom-text hover:bg-custom-bg/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-mono text-[10px] ${isAtivo ? 'text-custom-accent' : 'text-custom-muted/50'}`}>
                            #{sem.semana_numero}
                          </span>
                          <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">{sem.titulo}</span>
                        </div>
                        {!temConteudo && <Lock className="h-3 w-3 text-custom-muted/40 flex-shrink-0" />}
                        {isAtivo && <span className="h-1.5 w-1.5 rounded-full bg-custom-accent animate-ping flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Sombreamento do Mobile quando sidebar aberta */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* 2. Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-y-auto">
        
        {/* Botão de Toggle da Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-custom-card border border-custom-border text-custom-text shadow-xl hover:text-custom-accent transition-all duration-300 cursor-pointer"
          title="Alternar painel de aulas"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Condicionais para renderização baseadas no estado da aula */}
        {(error || !aula) ? (
          <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-custom-card border border-custom-border rounded-2xl p-8 text-center shadow-lg transition-colors duration-300">
              <BookMarked className="h-16 w-16 text-custom-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-custom-text font-sans">
                Aula Não Encontrada
              </h2>
              <p className="mt-2 text-sm text-custom-muted leading-relaxed font-sans">
                A semana {semanaId} ainda não foi cadastrada no cronograma ou a rota é inválida.
              </p>
              <div className="mt-6">
                <Link 
                  to={`/disciplina/${disciplinaSlug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-custom-accent px-5 py-2.5 text-sm font-semibold transition-colors shadow-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Cronograma
                </Link>
              </div>
            </div>
          </div>
        ) : !temDadosCompletos ? (
          <div className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-custom-accent/10 blur-[80px] pointer-events-none" />
            
            <div className="max-w-md w-full bg-custom-card border border-custom-border rounded-3xl p-8 text-center shadow-2xl relative z-10 transition-all duration-500 hover:scale-[1.01]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-custom-accent/10 border-2 border-custom-accent/20 text-custom-accent mx-auto mb-6 shadow-custom-accent animate-pulse">
                <Lock className="h-10 w-10" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-custom-accent/15 px-3.5 py-1 text-xs font-bold text-custom-accent mb-4 border border-custom-accent/10 font-mono">
                Semana {aula.semana_numero}
              </span>
              
              <h2 className="text-3xl font-black text-custom-text font-sans tracking-tight">
                Aula não liberada
              </h2>
              
              <p className="mt-4 text-xs text-custom-muted leading-relaxed font-sans text-justify bg-custom-bg/40 border border-custom-border/50 rounded-xl p-4">
                <span className="font-extrabold text-custom-text block mb-1">Módulo: {aula.titulo}</span>
                O conteúdo teórico, os laboratórios de banco de dados e as dinâmicas de mentoria desta semana estão sendo preparados e serão liberados em breve pelo Professor William.
              </p>

              <div className="mt-8">
                <Link 
                  to={`/disciplina/${disciplinaSlug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-custom-accent px-5 py-3.5 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Cronograma
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative w-full">
      
      {/* Efeito de Partículas Cibernéticas de Fundo (CSS puro adaptado para temas) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-25 z-0">
        <div className="absolute w-2 h-2 bg-custom-accent/30 rounded-full top-[10%] left-[20%] animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute w-1.5 h-1.5 bg-purple-500/25 rounded-full top-[40%] left-[80%] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-2 h-2 bg-emerald-500/30 rounded-full top-[70%] left-[15%] animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute w-1.5 h-1.5 bg-custom-accent/40 rounded-full top-[85%] left-[65%] animate-pulse" />
      </div>

      {/* Barra de Navegação Superior / Voltar */}
      <div className="bg-custom-card/60 border-b border-custom-border transition-colors duration-300 relative z-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link 
            to={`/disciplina/${disciplinaSlug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-custom-muted hover:text-custom-accent transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Disciplina
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Controles de Acessibilidade de Fonte */}
            <div className="flex items-center gap-1 bg-custom-bg border border-custom-border rounded-xl p-1 shadow-sm select-none">
              <button 
                onClick={() => setFontScale(prev => Math.max(0.8, prev - 0.1))}
                className="px-2 py-1 text-[11px] font-bold text-custom-muted hover:text-custom-text hover:bg-custom-card rounded transition-all cursor-pointer"
                title="Diminuir Fonte (A-)"
              >
                A-
              </button>
              <button 
                onClick={() => setFontScale(1.0)}
                className="px-2 py-1 text-[11px] font-bold text-custom-muted hover:text-custom-text hover:bg-custom-card rounded transition-all cursor-pointer border-x border-custom-border/40"
                title="Tamanho Padrão"
              >
                Reset
              </button>
              <button 
                onClick={() => setFontScale(prev => Math.min(1.5, prev + 0.1))}
                className="px-2 py-1 text-[11px] font-bold text-custom-muted hover:text-custom-text hover:bg-custom-card rounded transition-all cursor-pointer"
                title="Aumentar Fonte (A+)"
              >
                A+
              </button>
            </div>

            <div className="text-xs font-mono font-bold text-custom-accent bg-custom-accent/10 border border-custom-accent/20 px-3.5 py-1 rounded-lg">
              MISSÃO ATIVA: {aula.situacao_aprendizagem}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Imersivo Cinemático */}
      <section className="relative overflow-hidden py-24 sm:py-32 flex items-center min-h-[480px] border-b border-custom-border transition-colors duration-300">
        
        {/* Imagem de Fundo Dinâmica com Ken Burns */}
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0">
          <img 
            src={(aula.contexto_aluno?.elementos_visuais?.imagem_fundo && !aula.contexto_aluno.elementos_visuais.imagem_fundo.includes("PLACEHOLDER")) ? aula.contexto_aluno.elementos_visuais.imagem_fundo : "/images/matriz_holografica.png"} 
            alt="Datacenter da Missão" 
            className="w-full h-full object-cover opacity-15 dark:opacity-20 scale-100 animate-ken-burns"
          />
        </div>

        {/* Máscara de Gradiente para legibilidade perfeita do texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-custom-bg via-custom-bg/95 to-transparent z-10 transition-colors duration-300" />
        
        <div 
          style={{ fontSize: `${fontScale * 1.50}rem` }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full"
        >
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Texto Principal */}
            <div className="lg:col-span-8 animate-fade-in space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-custom-accent/15 px-3.5 py-1 text-xs font-bold text-custom-accent border border-custom-accent/25 font-mono">
                <Terminal className="h-3.5 w-3.5" />
                Semana {aula.semana_numero} de {totalSemanas}
              </span>
              
              <h1 className="text-[2.25em] sm:text-[3em] lg:text-[3.75em] font-black tracking-tight font-sans text-custom-text leading-none bg-clip-text text-transparent bg-gradient-to-r from-custom-text via-custom-text to-custom-accent/80">
                {aula.titulo}
              </h1>
              
              <p className="mt-8 text-[1em] sm:text-[1.125em] text-custom-muted leading-relaxed font-sans max-w-4xl text-justify">
                {renderMarkdown(aula.contexto_aluno?.texto || aula.contexto)}
              </p>
              
              {(aula.foco || aula.pratica) && (
                <div className="grid gap-6 sm:grid-cols-2 mt-8 max-w-4xl">
                  {aula.foco && (
                    <div className="rounded-3xl border border-custom-border bg-custom-card/40 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:border-custom-accent/30">
                      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-custom-accent/5 blur-2xl pointer-events-none" />
                      <div className="space-y-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-custom-accent/10 text-custom-accent border border-custom-accent/20">
                          🎯 Foco da Missão
                        </span>
                        <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans">
                          {aula.foco}
                        </p>
                      </div>
                    </div>
                  )}
                  {aula.pratica && (
                    <div className="rounded-3xl border border-custom-border bg-custom-card/40 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
                      <div className="space-y-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          🛠️ Prática de Laboratório
                        </span>
                        <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans">
                          {aula.pratica}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Painel do Módulo de Vidro (Glassmorphism no Primeiro Plano) */}
            <div className="lg:col-span-4 flex justify-center w-full">
              <div className="w-full max-w-[340px] rounded-3xl overflow-hidden bg-custom-card/50 border border-custom-border p-6 shadow-2xl relative backdrop-blur-md transition-colors duration-300">
                <span className="text-[10px] font-bold text-custom-accent uppercase tracking-wider block mb-3 font-mono">Status Operacional</span>
                
                <div className="space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-custom-border/40 pb-2">
                    <span className="text-custom-muted">Instrutor Responsável:</span>
                    <span className="font-bold text-custom-text">William Devidé</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-custom-border/40 pb-2">
                    <span className="text-custom-muted">Ambiente de Laboratório:</span>
                    <span className="font-bold text-emerald-500">MySQL & XAMPP</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-custom-muted">Nível Pedagógico:</span>
                    <span className="font-bold text-purple-500">SENAI MSEP</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Conteúdo Principal da Trilha */}
      <main 
        style={{ fontSize: `${fontScale * 1.32}rem` }}
        className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 relative z-10 space-y-36"
      >
        
        {/* Bloco A Modular */}
        <section className="transition-colors duration-300">
          {renderBlocoModular(aula.bloco_A, 'A')}
        </section>

        {/* Bloco B Modular */}
        <section className="pt-16 border-t border-custom-border transition-colors duration-300">
          {renderBlocoModular(aula.bloco_B, 'B')}
        </section>

        {/* Recursos Multimídia da Aula */}
        {aula.recursos_multimidia && (
          <section className="pt-16 border-t border-custom-border transition-colors duration-300 space-y-8">
            <div className="border-l-4 border-custom-accent pl-6 py-2 max-w-4xl">
              <span className="text-[0.75em] font-bold text-custom-accent uppercase tracking-widest block font-mono mb-1">
                Recursos Digitais • Apoio e Aprofundamento
              </span>
              <h2 className="text-[1.875em] sm:text-[2.25em] font-black text-custom-text font-sans leading-tight">
                Material Multimídia e Arquivos da Aula
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              
              {/* Coluna Esquerda: Player de Áudio e Leitor de PDF */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* 1. PDF (Apresentação / Material Didático) */}
                {aula.recursos_multimidia.apresentacao_pptx && (
                  <PDFViewer 
                    file={`/arquivos/${disciplinaSlug}/${aula.recursos_multimidia.apresentacao_pptx}`}
                    downloadUrl={`/arquivos/${disciplinaSlug}/${aula.recursos_multimidia.apresentacao_pptx}`}
                  />
                )}

                {/* 2. Áudio (Resumo Podcast) */}
                {aula.recursos_multimidia.resumo_audio && (
                  <AudioPlayerWithTranscription 
                    audioFile={`/arquivos/${disciplinaSlug}/${aula.recursos_multimidia.resumo_audio}`}
                    titulo={aula.recursos_multimidia.resumo_audio.replace(/\.[^/.]+$/, "")}
                  />
                )}
              </div>

              {/* Coluna Direita: Vídeos e Imagens */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* 3. Vídeos Correlacionados */}
                {aula.recursos_multimidia.videos_correlacionados && aula.recursos_multimidia.videos_correlacionados.length > 0 && (
                  <div className="rounded-3xl border border-custom-border bg-custom-card p-6 shadow-lg space-y-6">
                    <h3 className="text-[1.125em] font-bold text-custom-text font-sans flex items-center gap-2">
                      <Play className="h-5 w-5 text-custom-accent" />
                      Vídeos Recomendados
                    </h3>
                    
                    <div className="space-y-6">
                      {aula.recursos_multimidia.videos_correlacionados.map((video, idx) => (
                        <div key={idx} className="space-y-2">
                          <span className="text-[0.75em] font-mono text-custom-muted block truncate" title={video}>
                            🎥 {video.replace("BCD-", "")}
                          </span>
                          <div className="rounded-2xl overflow-hidden border border-custom-border bg-black shadow-md aspect-video">
                            <video 
                              src={`/arquivos/${disciplinaSlug}/${video}`}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Imagens Correlacionadas */}
                {aula.recursos_multimidia.imagens_correlacionadas && aula.recursos_multimidia.imagens_correlacionadas.length > 0 && (
                  <div className="rounded-3xl border border-custom-border bg-custom-card p-6 shadow-lg space-y-6">
                    <h3 className="text-[1.125em] font-bold text-custom-text font-sans flex items-center gap-2">
                      <Layers className="h-5 w-5 text-custom-accent" />
                      Infográficos e Imagens de Apoio
                    </h3>
                    
                    <div className="space-y-6">
                      {aula.recursos_multimidia.imagens_correlacionadas.map((imagem, idx) => (
                        <div key={idx} className="space-y-2">
                          <span className="text-[0.75em] font-mono text-custom-muted block truncate" title={imagem}>
                            🖼️ {imagem.replace("BCD-", "")}
                          </span>
                          <div className="rounded-2xl overflow-hidden border border-custom-border bg-custom-bg/60 shadow-md">
                            <img 
                              src={`/arquivos/${disciplinaSlug}/${imagem}`}
                              alt={imagem}
                              onClick={() => setActiveLightboxImage(`/arquivos/${disciplinaSlug}/${imagem}`)}
                              className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300 cursor-zoom-in"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Desafio Final: Quiz Interativo */}
        {aula.quiz_final && (
          <section className="border-t border-custom-border pt-12 max-w-4xl mx-auto transition-colors duration-300">
            <div className="rounded-3xl border border-custom-border bg-custom-card p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300 bg-gradient-to-br from-custom-card to-custom-card/85">
              <div className="absolute top-0 right-0 h-[220px] w-[220px] rounded-full bg-custom-accent/5 blur-[90px] pointer-events-none" />
              
              {/* Tela Inicial do Quiz */}
              {!quizIniciado && !quizConcluido && (
                <div className="text-center space-y-8 py-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-custom-accent/10 border border-custom-accent/20 text-custom-accent shadow-inner">
                    <Trophy className="h-10 w-10 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-custom-text font-sans leading-tight">
                      Arena de Validação: Desafio Técnico
                    </h2>
                    <p className="text-base sm:text-lg text-custom-muted font-sans max-w-2xl mx-auto leading-relaxed text-justify sm:text-center">
                      {aula.quiz_final.descricao}
                    </p>
                  </div>
                  <button 
                    onClick={() => setQuizIniciado(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-custom-accent dark:bg-slate-800 dark:hover:bg-custom-accent px-8 py-4 text-sm sm:text-base font-bold shadow-md shadow-custom-accent/10 transition-all hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none cursor-pointer"
                  >
                    Iniciar Teste de Sobrevivência
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Quiz em Andamento */}
              {quizIniciado && !quizConcluido && (
                <div className="space-y-8">
                  {/* Progresso do Quiz */}
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-custom-muted font-mono">
                    <span>PERGUNTA {perguntaAtualIndex + 1} DE {aula.quiz_final.perguntas.length}</span>
                    <span className="text-custom-accent">ACERTOS: {quizScore}</span>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="h-2 w-full bg-custom-bg border border-custom-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-custom-accent transition-all duration-300"
                      style={{ width: `${((perguntaAtualIndex + 1) / aula.quiz_final.perguntas.length) * 100}%` }}
                    />
                  </div>

                  {/* A Pergunta */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-custom-text font-sans leading-snug tracking-tight">
                    {aula.quiz_final.perguntas[perguntaAtualIndex].pergunta}
                  </h3>

                  {/* Opções de Resposta */}
                  <div className="grid gap-4 font-sans">
                    {aula.quiz_final.perguntas[perguntaAtualIndex].opcoes.map((opcao, i) => {
                      const correta = aula.quiz_final.perguntas[perguntaAtualIndex].resposta_correta;
                      let btnStyle = 'border-custom-border bg-custom-bg/40 hover:bg-custom-bg hover:border-custom-accent/30 text-custom-muted';
                      let iconElement = null;

                      if (respondido) {
                        if (opcao === correta) {
                          btnStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                          iconElement = <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
                        } else if (opcao === opcaoSelecionada) {
                          btnStyle = 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
                          iconElement = <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
                        } else {
                          btnStyle = 'border-custom-border/20 bg-custom-bg/10 text-custom-muted opacity-40';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={respondido}
                          onClick={() => handleSelecionarOpcao(opcao)}
                          className={`w-full flex items-center justify-between text-left text-sm sm:text-base px-6 py-5 border rounded-2xl transition-all font-semibold select-none ${btnStyle} ${!respondido && 'cursor-pointer hover:border-custom-accent/40 active:scale-[0.99] hover:shadow-md hover:scale-[1.005]'}`}
                        >
                          <span className="pr-3 leading-relaxed">{opcao}</span>
                          {iconElement}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback e Botão Próximo */}
                  {respondido && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-custom-border">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {opcaoSelecionada === aula.quiz_final.perguntas[perguntaAtualIndex].resposta_correta ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold"><CheckCircle2 className="h-5 w-5" /> Resposta Correta!</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold"><XCircle className="h-5 w-5" /> Resposta Incorreta!</span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleProximaPergunta}
                        className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-custom-accent bg-custom-accent-hover px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md focus:outline-none cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        {perguntaAtualIndex < aula.quiz_final.perguntas.length - 1 ? 'Próxima Pergunta' : 'Finalizar Arena'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tela de Resultados e Exportação de PDF */}
              {quizConcluido && (
                <div className="text-center space-y-8 py-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-custom-accent/15 border border-custom-accent/25 text-custom-accent shadow-inner">
                    <Trophy className="h-10 w-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-custom-text font-sans">
                      Missão Cumprida!
                    </h2>
                    <p className="text-sm sm:text-base text-custom-muted font-bold font-mono tracking-widest uppercase">
                      VOCÊ FINALIZOU A ARENA DE VALIDAÇÃO
                    </p>
                  </div>

                  {/* Painel do Score */}
                  <div className="max-w-md mx-auto border border-custom-border bg-custom-card p-6 sm:p-8 rounded-2xl space-y-3 font-sans shadow-md">
                    <span className="text-xs font-bold text-custom-muted uppercase tracking-widest block font-mono">PONTUAÇÃO FINAL</span>
                    <span className="text-4xl sm:text-5xl font-black text-custom-accent">{quizScore} <span className="text-custom-muted text-lg font-bold">/ {aula.quiz_final.perguntas.length}</span></span>
                    
                    {/* Rank System */}
                    <div className="pt-4 mt-4 border-t border-custom-border">
                      {quizScore >= 12 ? (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">👑 ARQUITETO SUPREMO</span>
                          <p className="text-xs sm:text-sm text-custom-muted leading-relaxed">Você dominou completamente os SGBDs e está pronto para gerenciar o backend principal!</p>
                        </div>
                      ) : quizScore >= 9 ? (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">🛡️ DBA SÊNIOR</span>
                          <p className="text-xs sm:text-sm text-custom-muted leading-relaxed">Excelente raciocínio analítico. Você normalizou o caos com sucesso!</p>
                        </div>
                      ) : quizScore >= 6 ? (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 font-mono">💻 BACKEND JÚNIOR</span>
                          <p className="text-xs sm:text-sm text-custom-muted leading-relaxed">Bom começo, mas cuidado com as redundâncias de dados na infraestrutura!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 font-mono">⚠️ ESTAGIÁRIO DE BD</span>
                          <p className="text-xs sm:text-sm text-custom-muted leading-relaxed">O banco sofreu rollback! Volte ao cronograma, revise os conceitos e tente novamente.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações de Encerramento: Exportar e Reiniciar */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 max-w-md mx-auto">
                    <button 
                      onClick={() => setShowExportModal(true)}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-custom-accent hover:bg-custom-accent/90 px-6 py-4 text-sm font-bold text-white transition-all shadow-md cursor-pointer active:scale-[0.99]"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Comprovante PDF
                    </button>

                    <button 
                      onClick={reiniciarQuiz}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-custom-bg border border-custom-border hover:bg-custom-card px-6 py-4 text-sm font-bold text-custom-text transition-all focus:outline-none cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Paginação / Navegação de Semanas */}
        <div className="flex items-center justify-between border-t border-custom-border pt-8">
          {temAnterior ? (
            <button
              onClick={() => navigate(`/disciplina/${disciplinaSlug}/semana/${numeroSemana - 1}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-custom-border bg-custom-card hover:bg-custom-bg px-4 py-2.5 text-sm font-bold text-custom-muted hover:text-custom-text transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
              Semana Anterior
            </button>
          ) : (
            <div />
          )}

          {temProxima ? (
            <button
              onClick={() => navigate(`/disciplina/${disciplinaSlug}/semana/${numeroSemana + 1}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-custom-accent bg-custom-accent-hover px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
            >
              Próxima Semana
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          ) : (
            <div />
          )}
        </div>

      </main>

      {/* Modal de Exportação do Comprovante PDF */}
      {showExportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl border border-custom-border bg-custom-card p-6 sm:p-8 space-y-6 shadow-2xl relative transition-all duration-300 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-custom-bg border border-custom-border text-custom-muted hover:text-custom-text cursor-pointer transition-colors duration-300"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-custom-muted uppercase tracking-widest block font-mono">Arena Concluída</span>
              <h3 className="text-2xl font-black text-custom-text font-sans">
                Exportar Comprovante PDF
              </h3>
              <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans max-w-sm mx-auto">
                Gere o comprovante oficial com seu gabarito e pontuação para entrega das atividades pedagógicas.
              </p>
            </div>

            <div className="space-y-4 font-sans text-left">
              <div>
                <label className="block text-xs font-bold text-custom-muted mb-1.5 uppercase tracking-wider font-mono">Nome Completo do Aluno</label>
                <input 
                  type="text" 
                  placeholder="Digite seu nome completo"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  className="w-full bg-custom-bg border border-custom-border rounded-xl px-4 py-3 text-sm text-custom-text focus:outline-none focus:border-custom-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-custom-muted mb-1.5 uppercase tracking-wider font-mono">Turma</label>
                <input 
                  type="text" 
                  placeholder="Ex: I1DEV-A"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  className="w-full bg-custom-bg border border-custom-border rounded-xl px-4 py-3 text-sm text-custom-text focus:outline-none focus:border-custom-accent transition-colors"
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                handleGerarPDF();
                setShowExportModal(false);
              }}
              disabled={!nomeAluno.trim() || !turma.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-custom-accent hover:bg-custom-accent/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 text-sm font-bold text-white transition-all shadow-md cursor-pointer active:scale-[0.99]"
            >
              <Download className="h-5 w-5" />
              Gerar e Baixar Relatório (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Modal Lightbox / Zoom da Imagem de Apoio */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 cursor-pointer p-4 animate-fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-custom-accent font-sans text-xl font-bold bg-black/20 hover:bg-black/40 h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer">
            ✕
          </button>
          <img 
            src={activeLightboxImage} 
            alt="Visualização Ampliada" 
            className="max-w-[95%] max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
          </div>
        )}
      </div>
    </div>
  );
}
