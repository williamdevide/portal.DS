import fallbackConfig from '../data/projeto_de_software_iii/agendamento_config.json' with { type: 'json' };

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'portal_agendamentos_local';

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
 * Retorna os agendamentos armazenados localmente no navegador (Fallback)
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
 * Salva a lista de agendamentos no localStorage (Fallback)
 */
function salvarAgendamentosLocais(lista) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lista));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage:', e);
  }
}

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
    console.warn('Backend SQLite indisponível, utilizando configuração local de fallback:', err);
    return fallbackConfig;
  }
}

/**
 * Lista todos os agendamentos salvos no banco SQLite ou no cache local
 */
export async function listarAgendamentos(turmaId = '') {
  const query = turmaId ? `&turma_id=${encodeURIComponent(turmaId)}` : '';
  try {
    const res = await fetch(`${API_BASE}/agendamentos?_t=${Date.now()}${query}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const dados = await res.json();
      // Atualiza o backup no localStorage
      salvarAgendamentosLocais(dados);
      return dados;
    }
  } catch (err) {
    console.warn('Backend offline ao listar agendamentos. Usando persistência local:', err);
  }

  // Fallback caso a API esteja offline
  const locais = obterAgendamentosLocais();
  if (turmaId) {
    return locais.filter(a => a.turma_id === turmaId);
  }
  return locais;
}

/**
 * Salva um novo agendamento (Alunos) com validação de palavra-chave e tolerância a acentos
 */
export async function salvarAgendamento(dados) {
  try {
    const res = await fetch(`${API_BASE}/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const resposta = await res.json().catch(() => ({}));

    if (res.ok) {
      // Sincroniza localmente
      const locais = obterAgendamentosLocais();
      const novo = resposta.agendamento || { ...dados, id: Date.now(), criado_em: new Date().toISOString() };
      salvarAgendamentosLocais([...locais.filter(a => a.id !== novo.id), novo]);
      return resposta;
    }

    // Se o backend respondeu com erro de validação específico (400, 403, 409 com JSON de erro)
    if ((res.status === 403 || res.status === 400 || res.status === 409) && resposta && resposta.erro) {
      throw new Error(resposta.erro);
    }
  } catch (err) {
    // Se foi erro de validação lançado intencionalmente, propaga diretamente
    if (
      err.message && 
      !err.message.includes('Failed to fetch') && 
      !err.message.includes('NetworkError') && 
      !err.message.includes('Erro HTTP') &&
      !err.message.includes('404')
    ) {
      throw err;
    }
    console.warn('Backend indisponível ao salvar. Executando validação e persistência local:', err);
  }

  // --- Modo Fallback Offline (Executa quando o servidor backend está desligado) ---
  const turma = fallbackConfig.turmas?.find(t => t.id === dados.turma_id);
  const grupo = turma?.grupos?.find(g => {
    const nome = typeof g === 'string' ? g : g.nome;
    return normalizarTexto(nome) === normalizarTexto(dados.grupo_nome);
  });

  if (!grupo) {
    throw new Error(`Grupo "${dados.grupo_nome}" não encontrado.`);
  }

  // Validação local da palavra-chave secreta com normalização de acentos
  const palavraEsperada = typeof grupo === 'string' ? null : grupo.palavra_secreta;
  if (palavraEsperada) {
    const digitada = normalizarTexto(dados.palavra_chave);
    const esperada = normalizarTexto(palavraEsperada);

    if (!digitada) {
      throw new Error('A palavra-chave secreta do grupo é obrigatória para concluir o agendamento.');
    }

    if (digitada !== esperada) {
      throw new Error(`Palavra-chave incorreta para o "${dados.grupo_nome}". Verifique a palavra secreta fornecida pelo Professor William e tente novamente.`);
    }
  }

  const locais = obterAgendamentosLocais();

  // Verifica duplicidade de grupo
  const existenteGrupo = locais.find(a => a.turma_id === dados.turma_id && normalizarTexto(a.grupo_nome) === normalizarTexto(dados.grupo_nome));
  if (existenteGrupo) {
    throw new Error(`O grupo "${dados.grupo_nome}" já possui agendamento confirmado para ${existenteGrupo.data} às ${existenteGrupo.horario}.`);
  }

  // Verifica conflito de horário
  const existenteHorario = locais.find(a => a.turma_id === dados.turma_id && a.data === dados.data && a.horario === dados.horario);
  if (existenteHorario) {
    throw new Error(`O horário ${dados.horario} do dia ${dados.data} já foi reservado pelo "${existenteHorario.grupo_nome}".`);
  }

  const novoAgendamento = {
    id: Date.now(),
    turma_id: dados.turma_id,
    turma_nome: dados.turma_nome,
    grupo_nome: dados.grupo_nome,
    data: dados.data,
    horario: dados.horario,
    observacoes: dados.observacoes || '',
    criado_em: new Date().toISOString()
  };

  salvarAgendamentosLocais([...locais, novoAgendamento]);

  return {
    mensagem: 'Agendamento confirmado com sucesso!',
    agendamento: novoAgendamento
  };
}

/**
 * Valida o PIN do Professor no backend ou via fallback local
 */
export async function autenticarProfessor(pin) {
  try {
    const res = await fetch(`${API_BASE}/admin/verificar-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pin })
    });

    const resposta = await res.json().catch(() => ({}));

    if (res.ok) {
      return resposta;
    }

    if (res.status === 401) {
      throw new Error(resposta.erro || 'PIN incorreto. Verifique a senha do professor e tente novamente.');
    }
  } catch (err) {
    if (err.message.includes('PIN incorreto')) throw err;
  }

  // Fallback offline para PIN do professor
  if (pin && pin.toString().trim() === 'senai@2026') {
    return { valido: true, mensagem: 'Modo Professor autenticado com sucesso!' };
  }

  throw new Error('PIN incorreto. Acesso restrito ao professor.');
}

/**
 * Atualiza um agendamento existente (Modo Professor com PIN)
 */
export async function atualizarAgendamento(id, dados, pin) {
  try {
    const res = await fetch(`${API_BASE}/agendamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': pin
      },
      body: JSON.stringify(dados)
    });

    const resposta = await res.json().catch(() => ({}));

    if (res.ok) {
      return resposta;
    }

    if (res.status === 400 || res.status === 401) {
      throw new Error(resposta.erro || 'Falha ao atualizar agendamento.');
    }
  } catch (err) {
    if (err.message.includes('Falha') || err.message.includes('ocupado') || err.message.includes('autorizado')) {
      throw err;
    }
  }

  // Fallback offline
  const locais = obterAgendamentosLocais();
  const index = locais.findIndex(a => a.id === Number(id) || a.id === id);
  if (index === -1) throw new Error('Agendamento não encontrado.');

  locais[index] = { ...locais[index], ...dados };
  salvarAgendamentosLocais(locais);

  return { mensagem: 'Agendamento atualizado com sucesso!', agendamento: locais[index] };
}

/**
 * Exclui um agendamento (Modo Professor com PIN)
 */
export async function excluirAgendamento(id, pin) {
  try {
    const res = await fetch(`${API_BASE}/agendamentos/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-pin': pin
      }
    });

    const resposta = await res.json().catch(() => ({}));

    if (res.ok) {
      // Remove do localStorage também
      const locais = obterAgendamentosLocais().filter(a => a.id !== Number(id) && a.id !== id);
      salvarAgendamentosLocais(locais);
      return resposta;
    }

    if (res.status === 400 || res.status === 401) {
      throw new Error(resposta.erro || 'Falha ao excluir agendamento.');
    }
  } catch (err) {
    if (err.message.includes('Falha') || err.message.includes('autorizado')) throw err;
  }

  // Fallback offline
  const locais = obterAgendamentosLocais().filter(a => a.id !== Number(id) && a.id !== id);
  salvarAgendamentosLocais(locais);

  return { mensagem: 'Agendamento excluído com sucesso!' };
}

/**
 * Consulta a lista de palavras-chave secretas dos grupos (Exclusivo Modo Professor)
 */
export async function obterPalavrasSecretas(pin) {
  try {
    const res = await fetch(`${API_BASE}/admin/palavras-secretas`, {
      headers: {
        'x-admin-pin': pin,
        'Cache-Control': 'no-cache'
      }
    });

    const resposta = await res.json().catch(() => ({}));

    if (res.ok) {
      return resposta;
    }
  } catch (err) {
    console.warn('API de palavras secretas offline, usando dados de fallback:', err);
  }

  // Fallback offline
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
        palavra_secreta: typeof g === 'string' ? '(não configurada)' : g.palavra_secreta
      }))
    }))
  };
}
