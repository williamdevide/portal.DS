import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvData = `Turma,Grupo,Integrante 1,Integrante 2,Integrante 3,Nome Projeto,Tema,Documento,Projeto,Pedidos,Link Saga SENAI,Link GitHub,Link Deploy,Rel. Kick-off,Rel. Semana 03,Rel. Semana 04,Rel. Semana 05,Rel. Semana 06,Rel. Semana 07,Rel. Semana 08,Rel. Semana 09,Rel. Semana 10,Rel. Semana 11,Rel. Semana 12,Rel. Semana 13,Rel. Semana 14
I2DEV-A,1,Arthur,José,Rafael,Agenda+,Desafio no processo de marcação de consultas: Como tornar o processo mais eficiente e acessível,0.7,0.9,"Desafio 1: Notificação por email do agendamento, por whatsapp confirmação e chat-bot
Desafio 2: Algo inovador em acessibilidade",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11929,https://github.com/Berninini22/Agenda- ,https://berninini22.github.io/Agenda-/auth.html?mode=register&switch=1 ,OK,OK,OK,OK,OK,,,,,,,,
I2DEV-A,2,Caroline,Elienai,,Acesso Livre,A falha no Mercado de Eventos e Ingressos Online,0.5,0.7,"Desafio 1: Tamanho de fontes e Leitura de tela.
Desafio 2: Modo claro/escuro e paleta de cores",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11710,,,OK,OK,OK,OK,OK,,,,,,,,
I2DEV-A,3,Cassiano,Gabriel,,Fitlink,Serviços para Personal Trainer,0.5,0.7,"Desafio 1: Calcular automaticamente intervalo de 30min entre academias
Desafio 2: Página de Faturamento exibindo para o personal contratos, valores originais e valores com desconto da % do app",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11691,https://github.com/gabrielcastrosanches/FitLink,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,4,Amanda,Giovana,Matheus L,EPI Control,Controle de EPI,0.5,0.8,"Desafio 1: Página de Treinamentos para funcionário (mascote)
Desafio 2: Sessão com vídeos de treinamento",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11692,https://github.com/matheusluqueto-sudo/TCC,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,5,Antonio,Isabelle,Nicolle,Reposicionamento da Marca LabWare,Projeto Integrador 2025/02 1.34_04: Estratégia de Reposicionamento de Marca para Atração de Jovens Talentos no Segmento de Soluções para Gestão Laboratorial,0.5,0.9,"Desafio 1: Sistema administrativo de vagas com CRUD para gerenciamento.
Desafio 2: Melhora de UI/UX.",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11993,https://github.com/Antonio-augustos2/TCC-labware,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,6,Hector,João Pedro,Miguel,Nexus,Projeto Integrador 2025/02 1.34_02: Integração de Plataformas de Aprendizado e Desenvolvimento para o Segmento de TI,0.5,,"Desafio 01: Curso completo Cibersegurança
Desafio 02: ",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11991,https://github.com/Joaopgg-br/nexus,,OK,OK,OK,OK,OK,,,,,,,,
I2DEV-A,7,Gustavo,João Victor,Joaquim,Stock Sense,Onde Está? Um Gargalo na Logística Interna,0.5,0.75,"Desafio 1: Cálculo e visualização de % de disponibilidade por prateleira e galpão
Desafio 2: Cadastro de Galpão / Prateleira",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12190,https://github.com/GustavoKaned/stock-sense,,OK,OK,OK,OK,OK,,,,,,,,
I2DEV-A,8,Maria E,Mariana,Verginia,PetAlert,Plataforma para Centralização e Gestão de Denúncias e Doações para Causas Animais,0.5,0.5,"Desafio 1: Chat com IA
Desafio 2: Funionar back-end e front-end",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11674,,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,9,Eduardo,Matheus N,,SafeFlow,Controle de EPI,0.5,0.85,"Desafio 01:
Desafio 02:",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11692,https://github.com/matheusricordi-sys/epi,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,10,Bianca,Nathalia,Vitória,Comuni+,Déficit de Acessibilidade Comunicacional no Setor Industrial,0.5,0.7,"Desafio 01: Página administrativa para visualizar quem já utilizou
Desafio 02: Indicadores de páginas visualizadas",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12027,https://github.com/vitoriaasales/tcc.git ,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,11,Pedro,,,BRIO,"BRIO: Plataforma Gamificada para Foco, Disciplina e Constância",0.5,0.75,"Desafio 01: Plano de Marketing
Desafio 02:",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12049,https://github.com/pedrohferreira79-web/Brio-App,,OK,OK,OK,OK,OK,OK,,,,,,,
I2DEV-A,12,Laura,Rayane,,BRIO,"BRIO: Plataforma Gamificada para Foco, Disciplina e Constância",0.5,0.5,"Desafio 01:
Desafio 02:",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12049,https://github.com/lauraamoraes/TCC,,OK,OK,OK,OK,OK,,,,,,,,
I2DEV-A,13,Otávio,,,TechSupport,TI Eficaz: Inovação na Gestão de Chamados Internos para a OMPI,0.5,0.8,"Desafio 01: 
Desafio 02:",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11269,https://github.com/otaviocsantos7-oss/Organiza-o-de-chamados-t-cnicos-na-web,,OK,OK,OK,,,,,,,,,,
I2DEV-B,1,Cassiane,Heloisa,,ARVA,Impactos Operacionais por Falta de Automação no Campo,0.5,0.75,"Desafio 01: 2 vasos (umido e seco) para sensorização
Desafio 02: Transmissão de dados via ESP32",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12028,,,OK,OK,OK,OK,OK,,OK,,,,,,
I2DEV-B,2,Danielle,Maria G,Samuel,AprimorAI,Transformando a preparação e condução de aulas com inteligência artificial,0.6,0.4,"Desafio 01: Autenticação de contas Google
Desafio 02: Integração com IA por disciplina limitando escopo",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11931,https://github.com/mariaglima28-dev/AprimorAI,,OK,OK,OK,OK,OK,OK,OK,,,,,,
I2DEV-B,3,Arthur,Davi K,Vinicius,Guardião Animal ,Plataforma para Centralização e Gestão de Denúncias e Doações para Causas Animais,0.6,0.6,"Desafio 01: Exibir ONGs com dados de localização
Desafio 02: Exibir mapa de calor baseado com IA nas denuncias de maus tratos por bairro",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11674,https://github.com/dkalmeidatheking/projetoguardiaoanimal.git ,,OK,OK,OK,,OK,,,,,,,,
I2DEV-B,4,Davi M,Davi P,Mauricio,Apoio Pet,Apoio Pet,0,0.4,"Desafio 01: Maps para encontrar a ONG
Desafio 02: Encontrar animal ideal a partir de analise de IA do perfil da pessoa",https://plataforma.gpinovacao.senai.br/plataforma/demandasda-industria/interna/11690,https://github.com/DaviMiguel22/-TCC,,OK,OK,OK,OK,OK,,OK,,,,,,
I2DEV-B,5,Felipe,Nikolas,Miguel,CyberSecurity,Boas práticas de segurança na era da informação,0.5,0.9,"Desafio 01: Abertura e recuperação de senha com biometria
Desafio 02: Plano de marketing",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11534,https://nikolasmelo.github.io/securityproject/,,OK,OK,OK,OK,OK,OK,OK,,,,,,
I2DEV-B,6,Isadora,Vitória C,Vitória N,BRIO,"BRIO: Plataforma Gamificada para Foco, Disciplina e Constância",0.6,0.85,"Desafio 01:  IA para analisar empenho do aluno
Desafio 02: Avatar animado durante tela de IA",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12049,https://github.com/vitoriagrego/brio ,,OK,OK,OK,OK,OK,OK,OK,,,,,,
I2DEV-B,7,Kamyla,Mikaella,,Central Pet,Plataforma para Centralização e Gestão de Denúncias e Doações para Causas Animais,0.5,0.85,"Desafio 01: Autorização de postagens
Desafio 02: Fluxo de pagamento para doação",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11674,https://github.com/mikaellamolina/Central-Pet,,OK,OK,OK,OK,OK,OK,OK,,,,,,
I2DEV-B,8,Leonardo,João Sergio,Ramon,OrganizAI,Consumo Impulsivo e Endividamento: o Desafio do Controle Financeiro na Era Digital ,0.6,0.9,"Desafio 01:
Desafio 02:",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11856,https://github.com/equipe-psof3/projeto-integrador,https://projeto-psof3-staging.vercel.app/,OK,OK,OK,OK,OK,OK,OK,,,,,,
I2DEV-B,9,Luiza,Maria L,Sophia,ECOA,Consumo Impulsivo e Endividamento: o Desafio do Controle Financeiro na Era Digital,0.6,0.8,"Desafio 01: Gravar registro por voz
Desafio 02: Analise comportamental da despesa por IA",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11856,https://github.com/pquenalua/ecoa.git,,OK,OK,OK,OK,OK,OK,OK,,,,,,
I2DEV-B,10,Murilo B,Murilo D,Vitor,MVM (Movement),Gestão Inteligente Do Ciclo de Vida dos Produtos,0.5,0.75,"Desafio 01: Melhoria visual e página de entrada
Desafio 02: Plano de marketing",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12186,https://github.com/Murilo-D-Garcia/MVM,,OK,OK,OK,OK,OK,,OK,,,,,,
I2DEV-B,11,Nicole,,,RESTCONTROL,Operação Enxuta na Cozinha: o dia em que o fluxo ‘cozinhou’ os custos,0.75,0.85,"Desafio 01: Kanban e planilha de tarefas
Desafio 02: Modelagem da cozinha",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/12191,https://github.com/nicolebenkard-boop/TCC_RESTAURANTE,,OK,OK,OK,OK,OK,,,,,,,,
I2DEV-B,12,Henry,Otávio,Vagner,Fila Zero,Sesi alimentação,0.5,0.85,"Desafio 01: Mudar cores e logotipo
Desafio 02: Painel administrativo e horário personalizável para entrega",https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11697,https://github.com/otaviofiel/cantinasenai ,,OK,OK,OK,,OK,,OK,,,,,,`;

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

const parsed = parseCSV(csvData);
const dataRows = parsed.slice(1);

console.log(`Total de linhas parsed: ${dataRows.length}`);

const palavrasSecretasTurmaA = {
  1: 'algoritmo',
  2: 'variavel',
  3: 'funcao',
  4: 'banco',
  5: 'codigo',
  6: 'servidor',
  7: 'conexao',
  8: 'classe',
  9: 'metodo',
  10: 'objeto',
  11: 'consulta',
  12: 'tabela',
  13: 'pacote'
};

const palavrasSecretasTurmaB = {
  1: 'vetor',
  2: 'matriz',
  3: 'arquivo',
  4: 'memoria',
  5: 'processo',
  6: 'sistema',
  7: 'interface',
  8: 'modulo',
  9: 'logica',
  10: 'registro',
  11: 'indice',
  12: 'commit'
};

const gruposPorTurma = {
  'I2DEV-A': [],
  'I2DEV-B': []
};

dataRows.forEach(row => {
  const turma = row[0].trim();
  const numGrupo = parseInt(row[1].trim(), 10);
  const int1 = row[2]?.trim() || '';
  const int2 = row[3]?.trim() || '';
  const int3 = row[4]?.trim() || '';
  const nomeProjeto = row[5]?.trim() || '';
  const tema = row[6]?.trim() || '';

  const integrantes = [int1, int2, int3].filter(name => name.length > 0);
  const numFormatado = numGrupo.toString().padStart(2, '0');
  const nomeGrupo = `Grupo ${numFormatado}`;

  const palavra = turma === 'I2DEV-A' 
    ? (palavrasSecretasTurmaA[numGrupo] || 'tecnologia')
    : (palavrasSecretasTurmaB[numGrupo] || 'desenvolvimento');

  const grupoObj = {
    numero: numGrupo,
    nome: nomeGrupo,
    projeto: nomeProjeto,
    tema: tema,
    integrantes: integrantes,
    palavra_secreta: palavra
  };

  if (gruposPorTurma[turma]) {
    gruposPorTurma[turma].push(grupoObj);
  }
});

console.log(`Grupos I2DEV-A: ${gruposPorTurma['I2DEV-A'].length}`);
console.log(`Grupos I2DEV-B: ${gruposPorTurma['I2DEV-B'].length}`);

const caminhoFront = path.resolve(__dirname, '../frontend/src/data/projeto_de_software_iii/agendamento_config.json');
const caminhoBack = path.resolve(__dirname, '../backend/data/agendamento_config.json');

const configAtual = JSON.parse(fs.readFileSync(caminhoFront, 'utf-8'));

configAtual.turmas = configAtual.turmas.map(turma => {
  if (turma.id === 'turma-i2dev-a') {
    return {
      ...turma,
      grupos: gruposPorTurma['I2DEV-A']
    };
  } else if (turma.id === 'turma-i2dev-b') {
    return {
      ...turma,
      grupos: gruposPorTurma['I2DEV-B']
    };
  }
  return turma;
});

const jsonOutput = JSON.stringify(configAtual, null, 2);

fs.writeFileSync(caminhoFront, jsonOutput, 'utf-8');
fs.writeFileSync(caminhoBack, jsonOutput, 'utf-8');

console.log('✅ Arquivos agendamento_config.json atualizados com sucesso no frontend e no backend!');
