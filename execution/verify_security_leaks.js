import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Verificando vazamento de credenciais e palavras-chave no frontend...');

const listaPath = path.join(__dirname, '../documentation/lista.md');
const lista = fs.readFileSync(listaPath, 'utf8');

const words = lista.split('\n')
  .map(l => l.split('|')[4])
  .filter(Boolean)
  .map(w => w.replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase())
  .filter(w => w.length > 2 && w !== 'palavrachave');

console.log(`- Total de palavras-chave analisadas: ${words.length}`);

let leaks = 0;
for (const word of words) {
  try {
    const stdout = execSync(`git grep -i -w "${word}" frontend/src`, { encoding: 'utf8' });
    if (stdout.trim()) {
      console.error(`❌ VAZAMENTO DETECTADO: Palavra "${word}" encontrada em frontend/src:`);
      console.error(stdout.trim());
      leaks++;
    }
  } catch (e) {
    // Código 1 do git grep = nenhuma ocorrência encontrada
  }
}

// Verifica senha do professor
try {
  const stdout = execSync(`git grep -i "senai@2026" frontend/src`, { encoding: 'utf8' });
  if (stdout.trim()) {
    console.error('❌ VAZAMENTO DETECTADO: Senha do professor encontrada em texto puro:');
    console.error(stdout.trim());
    leaks++;
  }
} catch (e) {
  // Seguro!
}

if (leaks === 0) {
  console.log('✅ SUCESSO: Zero vazamentos! Nenhuma senha ou palavra-chave secreta existe em texto puro no código-fonte do frontend.');
  process.exit(0);
} else {
  console.error(`💥 FALHA DE SEGURANÇA: ${leaks} credenciais vazadas no código do cliente.`);
  process.exit(1);
}
