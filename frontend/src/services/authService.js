import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';

export const PROFESSOR_EMAIL = 'williamdevide@gmail.com';

/**
 * Realiza autenticação via Popup com Conta Google.
 * Garante que apenas o professor williamdevide@gmail.com obtenha acesso.
 */
export async function loginComGoogle() {
  try {
    // Garante persistência da sessão no navegador
    await setPersistence(auth, browserLocalPersistence);
    
    // Força seleção de conta no popup do Google
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (!user || !user.email) {
      await signOut(auth);
      throw new Error('Não foi possível recuperar as informações da conta Google.');
    }

    const emailAutenticado = user.email.trim().toLowerCase();
    if (emailAutenticado !== PROFESSOR_EMAIL.toLowerCase()) {
      // Desconecta imediatamente qualquer usuário não autorizado
      await signOut(auth);
      throw new Error(`Acesso não autorizado: A conta "${user.email}" não tem permissão de docente. Apenas ${PROFESSOR_EMAIL} pode acessar o Modo Professor.`);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Professor William Devidé',
      photoURL: user.photoURL || null
    };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('O login com Google foi cancelado.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('O popup de login do Google foi bloqueado pelo navegador. Por favor, permita popups para este site.');
    }
    throw error;
  }
}

/**
 * Encerra a sessão do professor com o Google
 */
export async function logoutProfessor() {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Erro ao deslogar do Firebase Auth:', error);
  }
}

/**
 * Verifica se o professor está atualmente autenticado
 */
export function isProfessorAutenticado() {
  const user = auth.currentUser;
  return Boolean(user && user.email && user.email.trim().toLowerCase() === PROFESSOR_EMAIL.toLowerCase());
}

/**
 * Retorna os dados do professor logado (ou null)
 */
export function obterProfessorAtual() {
  const user = auth.currentUser;
  if (!user || !user.email || user.email.trim().toLowerCase() !== PROFESSOR_EMAIL.toLowerCase()) {
    return null;
  }
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Professor William Devidé',
    photoURL: user.photoURL || null
  };
}

/**
 * Observer reativo para escutar mudanças no estado de autenticação
 */
export function observarEstadoAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user && user.email) {
      const emailAutenticado = user.email.trim().toLowerCase();
      if (emailAutenticado === PROFESSOR_EMAIL.toLowerCase()) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Professor William Devidé',
          photoURL: user.photoURL || null
        });
        return;
      } else {
        // Usuário diferente de williamdevide@gmail.com -> desconecta imediatamente
        await signOut(auth);
      }
    }
    callback(null);
  });
}
