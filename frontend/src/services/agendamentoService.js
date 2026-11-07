import fallbackConfig from '../data/projeto_de_software_iii/agendamento_config.json' with { type: 'json' };
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase.js';
import { 
  isProfessorAutenticado, 
  obterProfessorAtual, 
  PROFESSOR_EMAIL 
} from './authService.js';

const LOCAL_STORAGE_KEY = 'portal_agendamentos_local';
const LOCAL_STORAGE_STATUS_KEY = 'portal_agendamento_liberado';

/**
 * Função utilitária para normalizar strings (remove acentos, espaços extras e ignora maiúsculas)
 */
export function normalizarTexto(str) {
  return (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Retorna os agendamentos armazenados localmente no navegador (Fallback Offline)
 */
function obterAgendamentosLocais() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Salva a lista de agendamentos no localStorage (Fallback Offline)
 */
function salvarAgendamentosLocais(lista) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lista));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage:', e);
  }
}

/**
 * Listener em tempo real do Cloud Firestore para sincronizar o status de liberação
 * em todos os navegadores abertos sem necessidade de recarregar a página.
 */
export function inscreverStatusAgendamento(callback) {
  try {
    const docRef = doc(db, 'config', 'tcc');
    return onSnapshot(docRef, (docSnap) => {
      let liberado = false;
      if (docSnap.exists()) {
        const data = docSnap.data();
        liberado = Boolean(data.liberado ?? data.agendamento_liberado);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, liberado ? 'true' : 'false');
      } catch {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('portal_status_agendamento_changed', { detail: { liberado } }));
      }

      if (typeof callback === 'function') {
        callback({ liberado, agendamento_liberado: liberado });
      }
    }, (error) => {
      console.warn('Aviso: Firestore listener de status desconectado:', error);
    });
  } catch (err) {
    console.warn('Falha ao registrar listener Firestore:', err);
    return () => {};
  }
}

// Inicia listener de status automaticamente em ambiente de navegador
if (typeof window !== 'undefined') {
  try {
    inscreverStatusAgendamento();
  } catch {}
}

/**
 * Consulta o status atual de liberação dos agendamentos (Permitido ou Bloqueado)
 * Fonte primária: Cloud Firestore (Tempo Real) -> Fallback: localStorage
 */
export async function obterStatusAgendamento() {
  // 1. Consulta o Cloud Firestore (centralizado para todos os alunos e dispositivos)
  try {
    const docRef = doc(db, 'config', 'tcc');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const liberado = Boolean(data.liberado ?? data.agendamento_liberado);
      try {
        localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, liberado ? 'true' : 'false');
      } catch {}
      return { liberado, agendamento_liberado: liberado };
    }
  } catch (err) {
    console.warn('Firestore indisponível ao consultar status:', err);
  }

  // 2. Fallback offline local
  const salvo = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY);
  const liberado = salvo === 'true';
  return { liberado, agendamento_liberado: liberado };
}

/**
 * Alterna a liberação do agendamento (Exclusivo Professor autenticado com Google)
 * Salva no Cloud Firestore e sincroniza em tempo real para todos os alunos.
 */
export async function alternarStatusAgendamento(novoStatus) {
  if (!isProfessorAutenticado()) {
    throw new Error('Não autorizado: Apenas o professor autenticado com Conta Google pode alterar a liberação de agendamentos.');
  }

  const statusBool = Boolean(novoStatus);

  // 1. Grava no Cloud Firestore (Sincronização em Nuvem para TODOS os alunos e navegadores)
  try {
    const docRef = doc(db, 'config', 'tcc');
    await setDoc(docRef, {
      liberado: statusBool,
      agendamento_liberado: statusBool,
      atualizado_em: new Date().toISOString(),
      modificado_por: PROFESSOR_EMAIL
    }, { merge: true });
  } catch (err) {
    console.warn('Falha ao gravar status no Firestore:', err);
    throw new Error('Falha ao gravar no Cloud Firestore: ' + (err.message || ''));
  }

  // 2. Atualiza cache local e notifica a interface
  try {
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, statusBool ? 'true' : 'false');
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portal_status_agendamento_changed', { detail: { liberado: statusBool } }));
  }

  return {
    sucesso: true,
    liberado: statusBool,
    agendamento_liberado: statusBool,
    mensagem: statusBool
      ? 'Agendamentos liberados com sucesso em tempo real para todos os alunos!'
      : 'Agendamentos bloqueados com sucesso para todos os alunos!'
  };
}

/**
 * Busca a configuração das turmas e horários de apresentação
 */
export async function obterConfiguracao() {
  const statusAtual = await obterStatusAgendamento();
  return {
    ...fallbackConfig,
    agendamento_liberado: statusAtual.liberado
  };
}

/**
 * Inscreve listener em tempo real para atualizações na lista de agendamentos no Cloud Firestore
 */
export function inscreverAgendamentos(turmaId, callback) {
  try {
    const colRef = collection(db, 'agendamentos');
    return onSnapshot(colRef, (snapshot) => {
      const lista = [];
      snapshot.forEach(docSnap => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });
      salvarAgendamentosLocais(lista);
      const filtrada = turmaId ? lista.filter(a => a.turma_id === turmaId) : lista;
      if (typeof callback === 'function') {
        callback(filtrada);
      }
    }, (error) => {
      console.warn('Aviso: Firestore listener de agendamentos desconectado:', error);
      const locais = obterAgendamentosLocais();
      const filtrada = turmaId ? locais.filter(a => a.turma_id === turmaId) : locais;
      if (typeof callback === 'function') {
        callback(filtrada);
      }
    });
  } catch (err) {
    console.warn('Falha ao registrar snapshot Firestore:', err);
    return () => {};
  }
}

/**
 * Lista todos os agendamentos salvos no Cloud Firestore (com fallback para cache local)
 */
export async function listarAgendamentos(turmaId = '') {
  // 1. Busca do Cloud Firestore (Fonte em nuvem compartilhada)
  try {
    const colRef = collection(db, 'agendamentos');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const lista = [];
      snapshot.forEach(docSnap => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });
      salvarAgendamentosLocais(lista);
      if (turmaId) {
        return lista.filter(a => a.turma_id === turmaId);
      }
      return lista;
    }
  } catch (err) {
    console.warn('Firestore indisponível ao listar agendamentos:', err);
  }

  // 2. Fallback cache local offline
  const locais = obterAgendamentosLocais();
  if (turmaId) {
    return locais.filter(a => a.turma_id === turmaId);
  }
  return locais;
}

/**
 * Salva um novo agendamento (Alunos) com validação de palavra-chave e concorrência no Cloud Firestore
 */
export async function salvarAgendamento(dados) {
  // 1. Verificação obrigatória do status de liberação
  const statusAtual = await obterStatusAgendamento();
  if (!statusAtual.liberado) {
    throw new Error('Os agendamentos de bancas de TCC estão bloqueados pelo Professor. Aguarde a liberação em sala de aula.');
  }

  // 2. Validação da turma e grupo
  const turma = fallbackConfig.turmas?.find(t => 
    t.id === dados.turma_id || 
    normalizarTexto(t.id) === normalizarTexto(dados.turma_id) || 
    normalizarTexto(t.nome) === normalizarTexto(dados.turma_nome)
  );
  const grupo = turma?.grupos?.find(g => {
    const nome = typeof g === 'string' ? g : g.nome;
    return normalizarTexto(nome) === normalizarTexto(dados.grupo_nome);
  });

  if (!grupo) {
    throw new Error(`Grupo "${dados.grupo_nome}" não encontrado.`);
  }

  // 3. Validação de preenchimento da palavra-chave do grupo
  const digitada = normalizarTexto(dados.palavra_chave);
  if (!digitada) {
    throw new Error('A palavra-chave do grupo é obrigatória para concluir o agendamento.');
  }

  // 4. Verificação de concorrência e duplicidade no Cloud Firestore
  const agendamentoDocId = `${dados.turma_id}___${normalizarTexto(dados.grupo_nome).replace(/[^a-z0-9]/g, '_')}`;

  try {
    const docRef = doc(db, 'agendamentos', agendamentoDocId);
    const snapExistente = await getDoc(docRef);
    if (snapExistente.exists()) {
      const dataExistente = snapExistente.data();
      throw new Error(`O grupo "${dados.grupo_nome}" já possui agendamento confirmado para ${dataExistente.data} às ${dataExistente.horario}.`);
    }

    // Verifica se horário já foi reservado por outro grupo na mesma turma
    const q = query(
      collection(db, 'agendamentos'),
      where('turma_id', '==', dados.turma_id),
      where('data', '==', dados.data),
      where('horario', '==', dados.horario)
    );
    const conflitoSnap = await getDocs(q);
    if (!conflitoSnap.empty) {
      const conflito = conflitoSnap.docs[0].data();
      throw new Error(`O horário ${dados.horario} do dia ${dados.data} já foi reservado pelo "${conflito.grupo_nome}".`);
    }

    // Criação atômica no Cloud Firestore
    const novoAgendamento = {
      turma_id: dados.turma_id,
      turma_nome: dados.turma_nome,
      grupo_nome: dados.grupo_nome,
      data: dados.data,
      horario: dados.horario,
      observacoes: dados.observacoes || '',
      criado_em: new Date().toISOString()
    };

    await setDoc(docRef, novoAgendamento);

    // Atualiza cache local
    const locais = obterAgendamentosLocais();
    salvarAgendamentosLocais([...locais.filter(a => a.id !== agendamentoDocId), { id: agendamentoDocId, ...novoAgendamento }]);

    return {
      mensagem: 'Agendamento confirmado com sucesso!',
      agendamento: { id: agendamentoDocId, ...novoAgendamento }
    };
  } catch (err) {
    if (err.message.includes('já possui agendamento') || err.message.includes('já foi reservado') || err.message.includes('bloqueados')) {
      throw err;
    }
    console.warn('Erro ao salvar no Firestore:', err);
    throw err;
  }
}

/**
 * Valida a autenticação do Professor via Firebase Auth (Google)
 */
export async function autenticarProfessor() {
  if (isProfessorAutenticado()) {
    return { valido: true, mensagem: 'Autenticação de docente ativa via Google.' };
  }
  throw new Error('Acesso restrito: Requer autenticação oficial com a Conta Google autorizada.');
}

/**
 * Atualiza um agendamento existente (Exclusivo Professor autenticado com Google)
 */
export async function atualizarAgendamento(id, dados) {
  await autenticarProfessor();

  try {
    const docRef = doc(db, 'agendamentos', String(id));
    await updateDoc(docRef, {
      ...dados,
      atualizado_em: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Erro ao atualizar no Firestore:', err);
    throw new Error('Falha ao atualizar no Firestore: ' + (err.message || ''));
  }

  // Atualiza cache local
  const locais = obterAgendamentosLocais();
  const index = locais.findIndex(a => a.id === Number(id) || a.id === id || String(a.id) === String(id));
  if (index !== -1) {
    locais[index] = { ...locais[index], ...dados };
    salvarAgendamentosLocais(locais);
  }

  return { mensagem: 'Agendamento atualizado com sucesso!' };
}

/**
 * Exclui um agendamento (Exclusivo Professor autenticado com Google)
 */
export async function excluirAgendamento(id) {
  await autenticarProfessor();

  try {
    const docRef = doc(db, 'agendamentos', String(id));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Erro ao excluir no Firestore:', err);
    throw new Error('Falha ao excluir no Firestore: ' + (err.message || ''));
  }

  // Exclui do cache local
  const locais = obterAgendamentosLocais().filter(a => a.id !== Number(id) && a.id !== id && String(a.id) !== String(id));
  salvarAgendamentosLocais(locais);

  return { mensagem: 'Agendamento excluído com sucesso!' };
}

/**
 * Consulta a lista de palavras-chave secretas dos grupos (Exclusivo Professor autenticado com Google)
 */
export async function obterPalavrasSecretas() {
  await autenticarProfessor();

  return {
    turmas: fallbackConfig.turmas?.map(turma => ({
      turma_id: turma.id,
      turma_nome: turma.nome,
      grupos: turma.grupos?.map(g => ({
        numero: typeof g === 'string' ? null : g.numero,
        nome: typeof g === 'string' ? g : g.nome,
        projeto: typeof g === 'string' ? '' : g.projeto,
        tema: typeof g === 'string' ? '' : g.tema,
        integrantes: typeof g === 'string' ? [] : g.integrantes,
        palavra_secreta: typeof g === 'string' ? '(não configurada)' : (g.palavra_secreta || '(Consulte a lista impressa)')
      }))
    }))
  };
}
