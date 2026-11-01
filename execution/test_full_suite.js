import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testEndpoints() {
  console.log('🧪 Testando inicialização e endpoints da API de Agendamento...');

  // Import dinâmico do server (que já inicia o app.listen na porta PORT)
  // Usamos porta temporária para evitar conflito se algo já estiver rodando
  process.env.PORT = '3099';
  await import('../backend/src/server.js');

  // Aguarda 500ms para o express inicializar
  await new Promise(r => setTimeout(r, 500));

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

  // 2. Testa /api/admin/palavras-secretas com PIN
  const resPalavras = await fetch(`${BASE_URL}/admin/palavras-secretas`, {
    headers: { 'x-admin-pin': 'senai@2026' }
  });
  if (!resPalavras.ok) throw new Error(`/api/admin/palavras-secretas retornou status ${resPalavras.status}`);
  const dadosPalavras = await resPalavras.json();
  console.log(`✅ Modo professor retornou ${dadosPalavras.turmas.length} turmas com palavras secretas.`);

  // 3. Testa agendamento com palavra-chave correta e incorreta
  const grupo1TurmaA = config.turmas[0].grupos[0]; // Grupo 01
  const diaTurmaA = config.turmas[0].dias_disponiveis[0].data;
  const horaTurmaA = config.turmas[0].dias_disponiveis[0].horarios[0];

  // Tentativa com palavra incorreta
  const resErr = await fetch(`${BASE_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      turma_id: config.turmas[0].id,
      turma_nome: config.turmas[0].nome,
      grupo_nome: grupo1TurmaA.nome,
      data: diaTurmaA,
      horario: horaTurmaA,
      palavra_chave: 'errada'
    })
  });
  if (resErr.status !== 403) throw new Error(`Esperado status 403 para senha errada, recebido ${resErr.status}`);
  console.log('✅ Agendamento com palavra errada bloqueado corretamente com HTTP 403.');

  // Tentativa com palavra correta ("algoritmo")
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

  // Limpeza
  const resDel = await fetch(`${BASE_URL}/agendamentos/${createdId}`, {
    method: 'DELETE',
    headers: { 'x-admin-pin': 'senai@2026' }
  });
  if (resDel.status !== 200) throw new Error(`Falha ao excluir agendamento de teste: ${resDel.status}`);
  console.log('✅ Agendamento de teste limpo com sucesso.');

  console.log('\n🎉 TODOS OS TESTES DETERMINÍSTICOS PASSARAM COM 100% DE SUCESSO!');
  process.exit(0);
}

testEndpoints().catch(err => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});

