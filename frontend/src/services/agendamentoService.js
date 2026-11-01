import fallbackConfig from '../data/projeto_de_software_iii/agendamento_config.json';

const API_BASE = '/api';

/**
 * Busca a configuração das turmas e horários de apresentação
 */
export async function obterConfiguracao() {
  try {
    const res = await fetch(`${API_BASE}/config?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      throw new Error(`Erro na API (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API indisponível, utilizando configuração local de fallback:', err);
    return fallbackConfig;
  }
}

/**
 * Lista todos os agendamentos salvos no banco SQLite
 */
export async function listarAgendamentos(turmaId = '') {
  const query = turmaId ? `&turma_id=${encodeURIComponent(turmaId)}` : '';
  const res = await fetch(`${API_BASE}/agendamentos?_t=${Date.now()}${query}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.erro || 'Falha ao buscar agendamentos no banco SQLite.');
  }
  return await res.json();
}

/**
 * Salva um novo agendamento (Alunos)
 */
export async function salvarAgendamento(dados) {
  const res = await fetch(`${API_BASE}/agendamentos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resposta = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resposta.erro || 'Não foi possível confirmar o agendamento.');
  }

  return resposta;
}

/**
 * Valida o PIN do Professor no backend
 */
export async function autenticarProfessor(pin) {
  const res = await fetch(`${API_BASE}/admin/verificar-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pin })
  });

  const resposta = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resposta.erro || 'PIN inválido.');
  }

  return resposta;
}

/**
 * Atualiza um agendamento existente (Modo Professor com PIN)
 */
export async function atualizarAgendamento(id, dados, pin) {
  const res = await fetch(`${API_BASE}/agendamentos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin
    },
    body: JSON.stringify(dados)
  });

  const resposta = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resposta.erro || 'Falha ao atualizar agendamento.');
  }

  return resposta;
}

/**
 * Exclui um agendamento do banco SQLite (Modo Professor com PIN)
 */
export async function excluirAgendamento(id, pin) {
  const res = await fetch(`${API_BASE}/agendamentos/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-pin': pin
    }
  });

  const resposta = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resposta.erro || 'Falha ao excluir agendamento.');
  }

  return resposta;
}

/**
 * Consulta a lista de palavras-chave secretas dos grupos (Exclusivo Modo Professor)
 */
export async function obterPalavrasSecretas(pin) {
  const res = await fetch(`${API_BASE}/admin/palavras-secretas`, {
    headers: {
      'x-admin-pin': pin,
      'Cache-Control': 'no-cache'
    }
  });

  const resposta = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resposta.erro || 'Falha ao consultar palavras-chave.');
  }

  return resposta;
}

