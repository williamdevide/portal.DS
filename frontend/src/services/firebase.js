import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração oficial do projeto Firebase "antigravityportalds"
const firebaseConfig = {
  apiKey: "AIzaSyBsqDWyuzUc--WcEGSBW5rpqpeAVudpeyU",
  authDomain: "antigravityportalds.firebaseapp.com",
  projectId: "antigravityportalds",
  storageBucket: "antigravityportalds.firebasestorage.app",
  messagingSenderId: "921384865147",
  appId: "1:921384865147:web:5495ccb43900ce4df5c1de"
};

// Inicializa a aplicação Firebase
export const app = initializeApp(firebaseConfig);

// Instância do Cloud Firestore com sincronização em tempo real
export const db = getFirestore(app);

export default db;
