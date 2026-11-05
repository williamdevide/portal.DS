import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../frontend/src/services/firebase.js';
import { collection, getDocs, doc, getDoc } from '../frontend/node_modules/firebase/firestore/dist/esm/index.esm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeBackup() {
  console.log('📦 Iniciando backup de segurança do Cloud Firestore (Produção)...');

  // 1. Backup da coleção config (status de liberação de TCC)
  const configSnap = await getDoc(doc(db, 'config', 'tcc'));
  const configData = configSnap.exists() ? configSnap.data() : null;

  // 2. Backup da coleção agendamentos (todas as bancas confirmadas)
  const agendamentosSnap = await getDocs(collection(db, 'agendamentos'));
  const agendamentos = [];
  agendamentosSnap.forEach(d => {
    agendamentos.push({
      id: d.id,
      ...d.data()
    });
  });

  const backupPayload = {
    data_backup: new Date().toISOString(),
    total_agendamentos: agendamentos.length,
    config_tcc: configData,
    agendamentos: agendamentos
  };

  const backupDir = path.resolve(__dirname, '../backend/data');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const outputPath = path.join(backupDir, 'backup_firestore_tcc.json');
  fs.writeFileSync(outputPath, JSON.stringify(backupPayload, null, 2), 'utf-8');

  console.log(`✅ Backup concluído com sucesso total!`);
  console.log(`📁 Arquivo salvo em: ${outputPath}`);
  console.log(`📊 Total de agendamentos protegidos: ${agendamentos.length}`);
  process.exit(0);
}

executeBackup().catch(err => {
  console.error('❌ Erro durante o backup:', err);
  process.exit(1);
});
