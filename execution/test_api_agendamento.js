/**
 * Script de Teste e Validação Determinística da Camada de Dados e Regras de Negócio
 * Executa testes diretos sobre o módulo do banco SQLite local.
 */
import { 
  criarAgendamento, 
  listarAgendamentos, 
  buscarPorGrupo, 
  buscarPorHorario, 
  atualizarAgendamento, 
  excluirAgendamento 
} from '../backend/src/db.js';

console.log('🧪 Iniciando Testes Unitários e Integrados do Agendamento SQLite...\n');

let falhas = 0;

function assert(condicao, mensagem) {
  if (condicao) {
    console.log(`  ✅ [PASSOU] ${mensagem}`);
  } else {
    console.error(`  ❌ [FALHOU] ${mensagem}`);
    falhas++;
  }
}

try {
  // Teste 1: Limpeza / Busca inicial
  const turmaId = 'turma-teste-ci';
  const turmaNome = 'Turma de Teste Automatizado';
  
  // Limpa agendamentos anteriores do teste se existirem
  const agendsExistentes = listarAgendamentos(turmaId);
  for (const a of agendsExistentes) {
    excluirAgendamento(a.id);
  }

  console.log('1. Testando criação de agendamento válido...');
  const agend1 = criarAgendamento({
    turma_id: turmaId,
    turma_nome: turmaNome,
    grupo_nome: 'Grupo Alfa Test',
    data: '2026-11-30',
    horario: '19:00',
    observacoes: 'Projeto de Teste Automatizado'
  });

  assert(agend1 && agend1.id, 'Agendamento 1 criado com ID válido no SQLite');
  assert(agend1.grupo_nome === 'Grupo Alfa Test', 'Nome do grupo corresponde');

  console.log('\n2. Testando restrição de agendamento duplicado para o mesmo grupo...');
  try {
    criarAgendamento({
      turma_id: turmaId,
      turma_nome: turmaNome,
      grupo_nome: 'Grupo Alfa Test',
      data: '2026-11-30',
      horario: '19:40',
      observacoes: 'Tentativa duplicada'
    });
    assert(false, 'Deveria ter bloqueado agendamento duplicado do mesmo grupo');
  } catch (err) {
    assert(err.message.includes('já possui agendamento'), 'Bloqueou corretamente grupo duplicado');
  }

  console.log('\n3. Testando restrição de conflito de horário na mesma turma...');
  try {
    criarAgendamento({
      turma_id: turmaId,
      turma_nome: turmaNome,
      grupo_nome: 'Grupo Beta Test',
      data: '2026-11-30',
      horario: '19:00', // Mesmo horário do Grupo Alfa
      observacoes: 'Tentativa de roubo de slot'
    });
    assert(false, 'Deveria ter bloqueado reserva no mesmo horário');
  } catch (err) {
    assert(err.message.includes('já foi reservado'), 'Bloqueou corretamente horário já ocupado');
  }

  console.log('\n4. Testando edição de agendamento...');
  const atualizado = atualizarAgendamento(agend1.id, {
    data: '2026-11-30',
    horario: '20:20',
    observacoes: 'Observação editada pelo professor'
  });
  assert(atualizado.horario === '20:20', 'Horário alterado com sucesso para 20:20');
  assert(atualizado.observacoes === 'Observação editada pelo professor', 'Observações atualizadas');

  console.log('\n5. Testando exclusão e liberação de horário...');
  excluirAgendamento(agend1.id);
  const buscaPosExclusao = buscarPorGrupo(turmaId, 'Grupo Alfa Test');
  assert(!buscaPosExclusao, 'Agendamento removido do banco com sucesso');

  // Agora o horário 20:20 deve estar livre novamente
  const agend2 = criarAgendamento({
    turma_id: turmaId,
    turma_nome: turmaNome,
    grupo_nome: 'Grupo Beta Test',
    data: '2026-11-30',
    horario: '20:20',
    observacoes: 'Agora com slot liberado'
  });
  assert(agend2 && agend2.id, 'Novo grupo conseguiu agendar o horário liberado com sucesso');

  // Limpeza final do teste
  excluirAgendamento(agend2.id);

  console.log('\n==========================================');
  if (falhas === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
    process.exit(0);
  } else {
    console.error(`💥 HOUVE ${falhas} FALHA(S) NOS TESTES.`);
    process.exit(1);
  }
} catch (error) {
  console.error('Erro catastrófico nos testes:', error);
  process.exit(1);
}
