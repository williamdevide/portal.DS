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
// Simula fetch que retorna 404 (como no GitHub Pages ou sem backend)
globalThis.fetch = async () => {
  return {
    ok: false,
    status: 404,
    json: async () => ({})
  };
};

async function testOfflineFallback() {
  console.log('🧪 Testando persistência offline e fallback do agendamentoService...');

  const configPath = path.resolve(__dirname, '../frontend/src/data/projeto_de_software_iii/agendamento_config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Import dinâmico com simulação
  const { salvarAgendamento, listarAgendamentos, normalizarTexto } = await import('../frontend/src/services/agendamentoService.js');

  const turmaA = config.turmas[0]; // I2DEV-A
  const grupo1 = turmaA.grupos[0]; // Grupo 01
  const dia1 = turmaA.dias_disponiveis[0].data;
  const hora1 = turmaA.dias_disponiveis[0].horarios[0];

  console.log(`📌 1. Testando agendamento offline com palavra correta para ${grupo1.nome}...`);
  const resultado = await salvarAgendamento({
    turma_id: turmaA.id,
    turma_nome: turmaA.nome,
    grupo_nome: grupo1.nome,
    data: dia1,
    horario: hora1,
    observacoes: 'Teste offline',
    palavra_chave: 'ALGORITMO'
  });

  if (!resultado.agendamento || !resultado.agendamento.id) {
    throw new Error('Falha: agendamento offline não retornou agendamento com ID.');
  }
  console.log(`✅ Agendamento offline salvo com sucesso! ID #${resultado.agendamento.id}`);

  console.log('📌 2. Testando listagem offline...');
  const agendados = await listarAgendamentos();
  if (agendados.length !== 1 || agendados[0].grupo_nome !== grupo1.nome) {
    throw new Error('Falha: listarAgendamentos não retornou o agendamento salvo.');
  }
  console.log(`✅ Listagem offline retornou ${agendados.length} agendamento com sucesso.`);

  console.log('📌 3. Testando bloqueio de agendamento duplicado para o mesmo grupo...');
  let duplicadoBloqueado = false;
  try {
    await salvarAgendamento({
      turma_id: turmaA.id,
      turma_nome: turmaA.nome,
      grupo_nome: grupo1.nome,
      data: turmaA.dias_disponiveis[0].data,
      horario: turmaA.dias_disponiveis[0].horarios[1],
      observacoes: 'Tentativa duplicada',
      palavra_chave: 'algoritmo'
    });
  } catch (err) {
    duplicadoBloqueado = true;
    console.log(`✅ Bloqueio de duplicidade offline validado: "${err.message}"`);
  }

  if (!duplicadoBloqueado) {
    throw new Error('Falha: permitiu agendamento duplicado offline.');
  }

  console.log('📌 4. Testando bloqueio com palavra-chave incorreta...');
  let incorretoBloqueado = false;
  try {
    await salvarAgendamento({
      turma_id: turmaA.id,
      turma_nome: turmaA.nome,
      grupo_nome: turmaA.grupos[1].nome,
      data: dia1,
      horario: turmaA.dias_disponiveis[0].horarios[1],
      palavra_chave: 'senha_errada'
    });
  } catch (err) {
    incorretoBloqueado = true;
    console.log(`✅ Bloqueio de palavra incorreta validado: "${err.message}"`);
  }

  if (!incorretoBloqueado) {
    throw new Error('Falha: permitiu palavra incorreta.');
  }

  console.log('\n🎉 TESTE DE FALLBACK OFFLINE E GITHUB PAGES APROVADO COM 100% DE SUCESSO!');
}

testOfflineFallback().catch(err => {
  console.error('❌ Falha:', err);
  process.exit(1);
});

