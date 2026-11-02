import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock do localStorage para ambiente Node.js
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();
// Simula fetch que retorna 404 (como no GitHub Pages ou sem backend ativo)
globalThis.fetch = async () => {
  return {
    ok: false,
    status: 404,
    json: async () => ({})
  };
};

async function testOfflineFallback() {
  console.log('🧪 Testando persistência offline e fallback criptográfico do agendamentoService...');

  const configPath = path.resolve(__dirname, '../frontend/src/data/projeto_de_software_iii/agendamento_config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const { 
    salvarAgendamento, 
    listarAgendamentos, 
    alternarStatusAgendamento, 
    obterStatusAgendamento,
    autenticarProfessor 
  } = await import('../frontend/src/services/agendamentoService.js');

  const turmaA = config.turmas[0]; // I2DEV-A
  const grupo1 = turmaA.grupos[0]; // Grupo 01
  const dia1 = turmaA.dias_disponiveis[0].data;
  const hora1 = turmaA.dias_disponiveis[0].horarios[0];

  // 1. Testa bloqueio inicial offline
  console.log('📌 1. Testando rejeição quando agendamentos estão bloqueados offline...');
  let bloqueadoRejeitado = false;
  try {
    await salvarAgendamento({
      turma_id: turmaA.id,
      turma_nome: turmaA.nome,
      grupo_nome: grupo1.nome,
      data: dia1,
      horario: hora1,
      observacoes: 'Teste offline bloqueado',
      palavra_chave: 'ALGORITMO'
    });
  } catch (err) {
    if (err.message.includes('bloqueados')) {
      bloqueadoRejeitado = true;
      console.log(`✅ Bloqueio offline interceptou tentativa: "${err.message}"`);
    } else {
      throw err;
    }
  }
  if (!bloqueadoRejeitado) throw new Error('Falha: agendamento deveria ter sido rejeitado enquanto bloqueado!');

  // 2. Professor libera offline com PIN (validado via SHA-256)
  console.log('📌 2. Testando liberação do professor via hash SHA-256 do PIN...');
  const resAuth = await autenticarProfessor('senai@2026');
  if (!resAuth.valido) throw new Error('Falha ao autenticar professor offline com PIN.');
  console.log('✅ Autenticação do professor com PIN validada com sucesso via hash SHA-256.');

  await alternarStatusAgendamento(true, 'senai@2026');
  const status = await obterStatusAgendamento();
  if (!status.liberado) throw new Error('Falha: agendamento deveria constar como liberado.');
  console.log('✅ Status de liberação offline ativado com sucesso.');

  // 3. Rejeita com palavra-chave incorreta offline
  console.log('📌 3. Testando validação de palavra-chave incorreta offline via SHA-256...');
  let palavraErradaRejeitada = false;
  try {
    await salvarAgendamento({
      turma_id: turmaA.id,
      turma_nome: turmaA.nome,
      grupo_nome: grupo1.nome,
      data: dia1,
      horario: hora1,
      observacoes: 'Teste offline',
      palavra_chave: 'SENHA_ERRADA'
    });
  } catch (err) {
    if (err.message.includes('Palavra-chave incorreta')) {
      palavraErradaRejeitada = true;
      console.log(`✅ Palavra incorreta rejeitada offline com precisão: "${err.message}"`);
    }
  }
  if (!palavraErradaRejeitada) throw new Error('Falha: palavra errada deveria ter sido rejeitada offline!');

  // 4. Salva com palavra-chave correta offline
  console.log(`📌 4. Testando agendamento offline com palavra correta para ${grupo1.nome}...`);
  const resultado = await salvarAgendamento({
    turma_id: turmaA.id,
    turma_nome: turmaA.nome,
    grupo_nome: grupo1.nome,
    data: dia1,
    horario: hora1,
    observacoes: 'Teste offline liberado',
    palavra_chave: 'ALGORITMO'
  });

  if (!resultado.agendamento || !resultado.agendamento.id) {
    throw new Error('Falha: agendamento offline não retornou agendamento com ID.');
  }
  console.log(`✅ Agendamento offline salvo com sucesso! ID #${resultado.agendamento.id}`);

  // 5. Testando listagem offline
  console.log('📌 5. Testando listagem offline no localStorage...');
  const agendados = await listarAgendamentos();
  if (agendados.length !== 1 || agendados[0].grupo_nome !== grupo1.nome) {
    throw new Error('Falha: listarAgendamentos não retornou o agendamento salvo.');
  }
  console.log(`✅ Listagem offline retornou ${agendados.length} agendamento com sucesso.`);

  console.log('🎉 TODOS OS TESTES OFFLINE PASSARAM COM SUCESSO!');
  process.exit(0);
}

testOfflineFallback().catch(err => {
  console.error('❌ Falha nos testes offline:', err);
  process.exit(1);
});
