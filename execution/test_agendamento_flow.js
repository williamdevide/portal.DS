import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🧪 Iniciando teste completo do fluxo de agendamento (Online & Offline)...');

  // Carrega configuração
  const configPath = path.resolve(__dirname, '../frontend/src/data/projeto_de_software_iii/agendamento_config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Importa módulo db
  const { criarAgendamento, buscarPorGrupo, excluirAgendamento, listarAgendamentos } = await import('../backend/src/db.js');

  const turma = config.turmas[0]; // I2DEV-A
  const grupo1 = turma.grupos[0]; // Grupo 01
  const dia = turma.dias_disponiveis[0].data;
  const hora = turma.dias_disponiveis[0].horarios[0];

  console.log(`📌 Testando criação do agendamento para ${grupo1.nome} em ${dia} às ${hora}...`);
  const novo = criarAgendamento({
    turma_id: turma.id,
    turma_nome: turma.nome,
    grupo_nome: grupo1.nome,
    data: dia,
    horario: hora,
    observacoes: 'Teste automatizado'
  });

  if (!novo || !novo.id) throw new Error('Falha ao criar agendamento no banco.');
  console.log(`✅ Agendamento criado com ID #${novo.id}`);

  // Teste de duplicidade: O mesmo grupo não pode mais ser agendado!
  console.log('📌 Testando bloqueio de agendamento duplicado para o mesmo grupo...');
  let bloqueouDuplicado = false;
  try {
    criarAgendamento({
      turma_id: turma.id,
      turma_nome: turma.nome,
      grupo_nome: grupo1.nome,
      data: turma.dias_disponiveis[0].data,
      horario: turma.dias_disponiveis[0].horarios[1],
      observacoes: 'Tentativa duplicada'
    });
  } catch (err) {
    bloqueouDuplicado = true;
    console.log(`✅ Bloqueio de grupo confirmado: "${err.message}"`);
  }

  if (!bloqueouDuplicado) {
    throw new Error('Falha: banco permitiu agendar o mesmo grupo duas vezes!');
  }

  // Verifica listagem
  const todos = listarAgendamentos(turma.id);
  const encontrado = todos.find(a => a.grupo_nome === grupo1.nome);
  if (!encontrado) throw new Error('Agendamento não encontrado na listagem.');
  console.log(`✅ Grupo listado com sucesso como agendado: ${encontrado.grupo_nome} às ${encontrado.horario}`);

  // Limpeza
  excluirAgendamento(novo.id);
  console.log(`✅ Agendamento #${novo.id} excluído com sucesso após teste.`);

  const aposLimpeza = listarAgendamentos(turma.id);
  if (aposLimpeza.length !== 0) throw new Error('Banco não ficou limpo após teste.');
  console.log('✅ Banco de dados limpo e validado.');

  console.log('\n🎉 TESTE DE FLUXO E REGRAS DE AGENDAMENTO APROVADO COM 100% DE SUCESSO!');
}

runTests().catch(err => {
  console.error('❌ Falha:', err);
  process.exit(1);
});

