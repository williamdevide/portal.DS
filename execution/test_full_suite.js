import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testEndpoints() {
  console.log('🧪 Testando inicialização, liberação docente e endpoints da API...');

  process.env.PORT = '3099';
  await import('../backend/src/server.js');

  await new Promise(r => setTimeout(r, 600));

  const BASE_URL = 'http://localhost:3099/api';

  // 1. Testa /api/config
  const resConfig = await fetch(`${BASE_URL}/config`);
  if (!resConfig.ok) throw new Error(`/api/config retornou status ${resConfig.status}`);
  const config = await resConfig.json();

  console.log(`✅ /api/config respondeu com ${config.turmas.length} turmas.`);
  
  let totalGrupos = 0;
  let vazamento = false;
  for (const turma of config.turmas) {
    totalGrupos += turma.grupos.length;
    for (const g of turma.grupos) {
      if (g.palavra_secreta) vazamento = true;
      if (!g.nome || !g.projeto || !g.tema || !Array.isArray(g.integrantes)) {
        throw new Error(`Grupo incompleto: ${JSON.stringify(g)}`);
      }
    }
  }

  if (vazamento) throw new Error('Palavra secreta vazou no /api/config!');
  console.log(`✅ Total de grupos validados: ${totalGrupos} grupos com nome, projeto, tema e integrantes.`);

  // 2. Testa /api/status-agendamento
  const resStatus = await fetch(`${BASE_URL}/status-agendamento`);
  if (!resStatus.ok) throw new Error(`/api/status-agendamento falhou: ${resStatus.status}`);
  const statusData = await resStatus.json();
  console.log(`✅ /api/status-agendamento respondeu: liberado = ${statusData.liberado}`);

  const grupo1TurmaA = config.turmas[0].grupos[0];
  const diaTurmaA = config.turmas[0].dias_disponiveis[0].data;
  const horaTurmaA = config.turmas[0].dias_disponiveis[0].horarios[0];

  // Garante que está bloqueado inicialmente para testar a trava de segurança
  await fetch(`${BASE_URL}/admin/toggle-agendamento`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-pin': 'senai@2026' },
    body: JSON.stringify({ liberado: false })
  });

  // 3. Testa tentativa de agendamento enquanto bloqueado
  const resBloqueado = await fetch(`${BASE_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      turma_id: config.turmas[0].id,
      turma_nome: config.turmas[0].nome,
      grupo_nome: grupo1TurmaA.nome,
      data: diaTurmaA,
      horario: horaTurmaA,
      palavra_chave: 'algoritmo'
    })
  });

  if (resBloqueado.status !== 403) {
    throw new Error(`Esperado status 403 para agendamento bloqueado, recebido ${resBloqueado.status}`);
  }
  const erroBloqueio = await resBloqueado.json();
  console.log(`✅ Bloqueio de agendamento validado com sucesso: "${erroBloqueio.erro}"`);

  // 4. Professor ativa "Agendamento permitido" via PIN
  const resToggleOn = await fetch(`${BASE_URL}/admin/toggle-agendamento`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-pin': 'senai@2026' },
    body: JSON.stringify({ liberado: true })
  });
  if (!resToggleOn.ok) throw new Error('Falha ao liberar agendamentos no backend');
  console.log('✅ Modo Professor ativou a liberação de agendamentos com sucesso.');

  // 5. Testa agendamento com palavra-chave incorreta (agora liberado para teste)
  const resErr = await fetch(`${BASE_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      turma_id: config.turmas[0].id,
      turma_nome: config.turmas[0].nome,
      grupo_nome: grupo1TurmaA.nome,
      data: diaTurmaA,
      horario: horaTurmaA,
      palavra_chave: 'palavra_errada'
    })
  });
  if (resErr.status !== 403) throw new Error(`Esperado status 403 para senha errada, recebido ${resErr.status}`);
  console.log('✅ Validação de palavra-chave: palavra errada rejeitada com HTTP 403.');

  // 6. Testa agendamento com palavra-chave correta ("ALGORITMO" com maiúscula)
  const resOk = await fetch(`${BASE_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      turma_id: config.turmas[0].id,
      turma_nome: config.turmas[0].nome,
      grupo_nome: grupo1TurmaA.nome,
      data: diaTurmaA,
      horario: horaTurmaA,
      observacoes: `Projeto: ${grupo1TurmaA.projeto}`,
      palavra_chave: 'ALGORITMO'
    })
  });
  if (resOk.status !== 201) {
    const errBody = await resOk.json();
    throw new Error(`Esperado status 201 para senha correta, recebido ${resOk.status}: ${JSON.stringify(errBody)}`);
  }
  const createdData = await resOk.json();
  const createdId = createdData.agendamento.id;
  console.log(`✅ Agendamento com palavra correta concluído com sucesso! ID #${createdId}`);

  // 7. Limpeza e restauração do bloqueio seguro
  const resDel = await fetch(`${BASE_URL}/agendamentos/${createdId}`, {
    method: 'DELETE',
    headers: { 'x-admin-pin': 'senai@2026' }
  });
  if (resDel.status !== 200) throw new Error(`Falha ao excluir agendamento de teste: ${resDel.status}`);
  console.log('✅ Agendamento de teste excluído pelo professor com sucesso.');

  // 8. Testa /api/admin/palavras-secretas
  const resPalavras = await fetch(`${BASE_URL}/admin/palavras-secretas`, {
    headers: { 'x-admin-pin': 'senai@2026' }
  });
  if (!resPalavras.ok) throw new Error(`/api/admin/palavras-secretas falhou: ${resPalavras.status}`);
  const dadosPalavras = await resPalavras.json();
  console.log(`✅ Modo professor retornou ${dadosPalavras.turmas.length} turmas com palavras secretas.`);

  console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  process.exit(0);
}

testEndpoints().catch(err => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});
