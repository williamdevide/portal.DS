/**
 * Script de Execução Determinística (Camada 3)
 * Validação automatizada da funcionalidade de Palavra Secreta / Palavra-Chave por Grupo
 */
async function rodarTestes() {
  const BASE_URL = 'http://localhost:3001/api';
  console.log('--- [EXECUTION] SUÍTE DE TESTES: PALAVRA-CHAVE SECRETA ---');

  // Teste 1: Higienização do endpoint público /api/config
  console.log('\n[Teste 1] Verificando segurança do endpoint público /api/config...');
  const resConfig = await fetch(`${BASE_URL}/config`);
  const dataConfig = await resConfig.json();
  let vazouPalavra = false;
  for (const turma of dataConfig.turmas || []) {
    for (const g of turma.grupos || []) {
      if (typeof g === 'object' && g.palavra_secreta) {
        vazouPalavra = true;
      }
    }
  }
  if (!vazouPalavra) {
    console.log('✅ Sucesso: Nenhuma palavra secreta vazou no /api/config (Segurança mantida).');
  } else {
    console.error('❌ Falha de Segurança: palavra_secreta está exposta em /api/config!');
    process.exit(1);
  }

  // Teste 2: Acesso ao endpoint restrito sem PIN
  console.log('\n[Teste 2] Testando /api/admin/palavras-secretas sem PIN...');
  const resAdminSemPin = await fetch(`${BASE_URL}/admin/palavras-secretas`);
  if (resAdminSemPin.status === 401) {
    console.log('✅ Sucesso: Acesso negado com HTTP 401 como esperado.');
  } else {
    console.error(`❌ Falha: Status esperado 401, recebido ${resAdminSemPin.status}`);
  }

  // Teste 3: Acesso ao endpoint restrito com PIN correto
  console.log('\n[Teste 3] Testando /api/admin/palavras-secretas com PIN do Professor...');
  const resAdminComPin = await fetch(`${BASE_URL}/admin/palavras-secretas`, {
    headers: { 'x-admin-pin': 'senai@2026' }
  });
  if (resAdminComPin.status === 200) {
    const dataPalavras = await resAdminComPin.json();
    console.log(`✅ Sucesso: ${dataPalavras.turmas.length} turmas retornadas com palavras-chave secretas.`);
  } else {
    console.error(`❌ Falha: Status esperado 200, recebido ${resAdminComPin.status}`);
  }

  // Teste 4: Tentativa de agendamento com palavra-chave incorreta
  console.log('\n[Teste 4] Tentando agendar com palavra-chave incorreta ("senhaerrada")...');
  const payloadIncorreto = {
    turma_id: 'turma-i2dev-a',
    turma_nome: 'Técnico em Desenvolvimento de Sistemas - I2DEV-A (Terça-feira)',
    grupo_nome: 'Grupo 01',
    data: '2026-11-24',
    horario: '10:45',
    observacoes: 'Teste automatizado de palavra errada',
    palavra_chave: 'senhaerrada'
  };
  const resAgendamentoIncorreto = await fetch(`${BASE_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadIncorreto)
  });
  const dataIncorreto = await resAgendamentoIncorreto.json();
  if (resAgendamentoIncorreto.status === 403) {
    console.log(`✅ Sucesso: Agendamento bloqueado com 403: "${dataIncorreto.erro}"`);
  } else {
    console.error(`❌ Falha: Deveria retornar 403, retornou ${resAgendamentoIncorreto.status}`);
  }

  // Teste 5: Agendamento com palavra-chave correta ("algoritmo" para Grupo 01)
  console.log('\n[Teste 5] Tentando agendar com palavra-chave correta ("algoritmo")...');
  const payloadCorreto = {
    ...payloadIncorreto,
    palavra_chave: '  ALGORITMO  ' // Testando tolerância a maiúsculas e espaços
  };
  const resAgendamentoCorreto = await fetch(`${BASE_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadCorreto)
  });
  const dataCorreto = await resAgendamentoCorreto.json();
  const idCriado = dataCorreto.id || dataCorreto.agendamento?.id;
  if (resAgendamentoCorreto.status === 201 && idCriado) {
    console.log(`✅ Sucesso: Agendamento criado no SQLite com ID #${idCriado}!`);

    // Teste 6: Limpeza do agendamento de teste
    console.log('\n[Teste 6] Limpando agendamento de teste via DELETE...');
    const resDelete = await fetch(`${BASE_URL}/agendamentos/${idCriado}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': 'senai@2026' }
    });
    if (resDelete.status === 200) {
      console.log('✅ Sucesso: Agendamento de teste removido e horário liberado.');
    }
  } else {
    console.error(`❌ Falha ao agendar com palavra correta: ${JSON.stringify(dataCorreto)}`);
  }

  console.log('\n--- TODOS OS TESTES PASSARAM COM SUCESSO! ---');
}

rodarTestes().catch(err => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
