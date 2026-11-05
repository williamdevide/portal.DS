import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../frontend/src/services/firebase.js';
import { doc, setDoc } from '../frontend/node_modules/firebase/firestore/dist/esm/index.esm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeRestore() {
  const backupFile = path.resolve(__dirname, '../backend/data/backup_firestore_tcc.json');
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Arquivo de backup não encontrado em: ${backupFile}`);
  }

  const raw = fs.readFileSync(backupFile, 'utf-8');
  const payload = JSON.parse(raw);

  console.log(`🔄 Restaurando do backup realizado em: ${payload.data_backup}`);

  if (payload.config_tcc) {
    await setDoc(doc(db, 'config', 'tcc'), payload.config_tcc, { merge: true });
    console.log('✅ Configuração config/tcc restaurada.');
  }

  if (Array.isArray(payload.agendamentos)) {
    for (const ag of payload.agendamentos) {
      const docId = ag.id;
      const data = { ...ag };
      delete data.id;
      await setDoc(doc(db, 'agendamentos', docId), data, { merge: true });
      console.log(`  -> Agendamento restaurado: ${docId}`);
    }
  }

  console.log(`🎉 Restauração de ${payload.agendamentos.length} agendamentos finalizada com sucesso!`);
  process.exit(0);
}

executeRestore().catch(err => {
  console.error('❌ Erro durante a restauração:', err);
  process.exit(1);
});
