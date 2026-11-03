import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBsqDWyuzUc--WcEGSBW5rpqpeAVudpeyU",
  authDomain: "antigravityportalds.firebaseapp.com",
  projectId: "antigravityportalds",
  storageBucket: "antigravityportalds.firebasestorage.app",
  messagingSenderId: "921384865147",
  appId: "1:921384865147:web:5495ccb43900ce4df5c1de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log('🔄 Iniciando teste de sincronização do Cloud Firestore...');

  // 1. Teste de leitura de status
  const configRef = doc(db, 'config', 'tcc');
  const snap1 = await getDoc(configRef);
  if (!snap1.exists()) {
    throw new Error('Documento config/tcc não encontrado no Firestore.');
  }
  console.log('✅ 1. Leitura do status atual no Firestore com sucesso:', snap1.data());

  // 2. Teste de escrita do status liberado = true
  await setDoc(configRef, {
    liberado: true,
    agendamento_liberado: true,
    atualizado_em: new Date().toISOString(),
    modificado_por: 'teste_automatizado'
  }, { merge: true });
  console.log('✅ 2. Atualização de status (liberado: true) gravada com sucesso!');

  // 3. Teste de escrita de agendamento de validação
  const testeDocId = 'turma-teste___grupo-teste';
  const agendamentoRef = doc(db, 'agendamentos', testeDocId);
  await setDoc(agendamentoRef, {
    turma_id: 'turma-teste',
    turma_nome: 'Turma de Teste',
    grupo_nome: 'Grupo Teste',
    data: '2026-11-24',
    horario: '07:30',
    observacoes: 'Teste automatizado de concorrência e persistência',
    criado_em: new Date().toISOString()
  });
  console.log('✅ 3. Agendamento de teste gravado no Firestore com sucesso!');

  // 4. Teste de leitura e integridade
  const snapAgendamento = await getDoc(agendamentoRef);
  if (!snapAgendamento.exists()) {
    throw new Error('Falha ao recuperar agendamento de teste criado.');
  }
  console.log('✅ 4. Agendamento recuperado e validado:', snapAgendamento.data().grupo_nome);

  // 5. Limpeza do agendamento de teste
  await deleteDoc(agendamentoRef);
  console.log('✅ 5. Limpeza do agendamento temporário concluída com sucesso!');

  console.log('\n🎉 TODOS OS TESTES DO CLOUD FIRESTORE FORAM CONCLUÍDOS COM SUCESSO!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Falha no teste do Firestore:', err);
  process.exit(1);
});
