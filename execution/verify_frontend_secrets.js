import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testando ausência de palavras secretas e senhas no frontend...');

const backendCfg = JSON.parse(fs.readFileSync(path.join(__dirname, '../backend/data/agendamento_config.json'), 'utf8'));
const frontendCfg = JSON.parse(fs.readFileSync(path.join(__dirname, '../frontend/src/data/projeto_de_software_iii/agendamento_config.json'), 'utf8'));

let secretFound = 0;

// 1. Verifica se frontendCfg possui qualquer palavra_secreta
for (const turma of frontendCfg.turmas) {
  for (const grupo of turma.grupos) {
    if (grupo.palavra_secreta !== undefined) {
      console.error(`❌ ERRO: grupo ${grupo.nome} na turma ${turma.id} ainda contém palavra_secreta!`);
      secretFound++;
    }
  }
}

// 2. Extrai todas as palavras secretas do backend
const backendSecrets = [];
for (const turma of backendCfg.turmas) {
  for (const grupo of turma.grupos) {
    if (grupo.palavra_secreta) {
      backendSecrets.push({
        turma: turma.id,
        grupo: grupo.nome,
        palavra: grupo.palavra_secreta
      });
    }
  }
}

console.log(`- Total de palavras secretas no backend: ${backendSecrets.length}`);

// 3. Verifica em todos os arquivos de código do agendamento
const filesToCheck = [
  path.join(__dirname, '../frontend/src/services/agendamentoService.js'),
  path.join(__dirname, '../frontend/src/components/agendamento/AdminPinModal.jsx'),
  path.join(__dirname, '../frontend/src/components/agendamento/AgendamentoForm.jsx'),
  path.join(__dirname, '../frontend/src/components/agendamento/QuadroAgendamentos.jsx'),
  path.join(__dirname, '../frontend/src/components/agendamento/BloqueioAgendamento.jsx'),
  path.join(__dirname, '../frontend/src/pages/Disciplina.jsx'),
  path.join(__dirname, '../frontend/src/pages/Home.jsx')
];

let leaks = 0;

for (const filePath of filesToCheck) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('senai@2026')) {
    console.error(`❌ ERRO: Senha "senai@2026" encontrada em ${filePath}`);
    leaks++;
  }
}

if (secretFound === 0 && leaks === 0) {
  console.log('✅ SUCESSO: Configuração do frontend e componentes 100% livres de senhas ou palavras secretas em texto puro!');
  process.exit(0);
} else {
  console.error('💥 FALHA: Segredos detectados.');
  process.exit(1);
}
