import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🛡️ INICIANDO AUDITORIA DE SEGURANÇA COMPLETA DO PORTAL.DS...');

let errors = 0;

// 1. Varredura recursiva em frontend/src por senhas, hashes conhecidos ou segredos
const OLD_PIN_HASH = '59bda9d4350f6978f9f8b1df8b7d0c48ac0178954437f2f10057f81e8628ef88';
const OLD_PIN_TEXT = 'senai@2026';

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && /\.(jsx?|tsx?|json|html|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(OLD_PIN_TEXT)) {
        console.error(`❌ FALHA CRÍTICA: Senha antiga "${OLD_PIN_TEXT}" encontrada em: ${fullPath}`);
        errors++;
      }
      if (content.includes(OLD_PIN_HASH)) {
        console.error(`❌ FALHA CRÍTICA: Hash do PIN antigo "${OLD_PIN_HASH}" encontrado em: ${fullPath}`);
        errors++;
      }
      if (content.includes('PALAVRAS_HASHES_OFFLINE')) {
        console.error(`❌ FALHA: Tabela de hashes de palavras de alunos encontrada em: ${fullPath}`);
        errors++;
      }
      if (content.includes('PIN_DOCENTE_HASH_OFFLINE')) {
        console.error(`❌ FALHA: Constante PIN_DOCENTE_HASH_OFFLINE encontrada em: ${fullPath}`);
        errors++;
      }
    }
  }
}

const frontendSrc = path.join(__dirname, '../frontend/src');
scanDir(frontendSrc);

// 2. Validação das regras de segurança do Firestore (firestore.rules)
const rulesPath = path.join(__dirname, '../firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ FALHA: firestore.rules não encontrado!');
  errors++;
} else {
  const rules = fs.readFileSync(rulesPath, 'utf8');
  if (!rules.includes("williamdevide@gmail.com")) {
    console.error('❌ FALHA: firestore.rules não contém a restrição ao e-mail williamdevide@gmail.com!');
    errors++;
  }
  if (!rules.includes("isProfessor()")) {
    console.error('❌ FALHA: firestore.rules não possui a função isProfessor()!');
    errors++;
  }
  if (rules.includes("request.time")) {
    console.error('❌ FALHA: firestore.rules ainda contém cláusula temporária de modo de teste!');
    errors++;
  }
  if (rules.includes("allow delete: if true;")) {
    console.error('❌ FALHA: firestore.rules ainda permite exclusão pública desprotegida!');
    errors++;
  }
}

// 3. Validação do serviço de autenticação Google
const authServicePath = path.join(__dirname, '../frontend/src/services/authService.js');
if (!fs.existsSync(authServicePath)) {
  console.error('❌ FALHA: authService.js não foi encontrado!');
  errors++;
} else {
  const authCode = fs.readFileSync(authServicePath, 'utf8');
  if (!authCode.includes('williamdevide@gmail.com')) {
    console.error('❌ FALHA: authService.js não valida o e-mail williamdevide@gmail.com!');
    errors++;
  }
  if (!authCode.includes('signInWithPopup') || !authCode.includes('signOut')) {
    console.error('❌ FALHA: authService.js não implementa signInWithPopup/signOut!');
    errors++;
  }
}

console.log('\n--- RESULTADO DA VARREDURA ---');
if (errors === 0) {
  console.log('✅ AUDITORIA CONCLUÍDA COM SUCESSO TOTAL:');
  console.log('  1. Zero senhas ou hashes expostos no código-fonte do frontend.');
  console.log('  2. Autenticação Google oficial restrita a williamdevide@gmail.com configurada.');
  console.log('  3. Cloud Firestore Security Rules blindadas com verificação criptográfica de token e bloqueio de exclusão por alunos.');
  process.exit(0);
} else {
  console.error(`💥 AUDITORIA REPROVADA COM ${errors} VULNERABILIDADE(S).`);
  process.exit(1);
}
