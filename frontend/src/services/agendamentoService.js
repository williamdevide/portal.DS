import fallbackConfig from '../data/projeto_de_software_iii/agendamento_config.json' with { type: 'json' };

const API_BASE = '/api';
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
 * Algoritmo SHA-256 criptográfico para execução em qualquer ambiente
 */
export function calcularSha256(str) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  let ascii = str;
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [];
  let k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  hash = hash.slice(0, 8);
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength) | 0;
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
          w[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (let i2 = 3; i2 >= 0; i2--) {
      const c = (hash[i] >> (i2 * 8)) & 255;
      result += ((c < 16) ? '0' : '') + c.toString(16);
    }
  }
  return result;
}

/**
 * Tabela de Hashes SHA-256 unidirecionais das palavras-chave para fallback estritamente offline.
 * Proteção contra inspeção do código-fonte: nenhuma palavra secreta existe em texto legível no bundle.
 */
export const PALAVRAS_HASHES_OFFLINE = {
  "turma-i2dev-a_1": "3a484bce6945fadc173fff02976d5675137d638c72b90bed2fda97c76929ca54",
  "turma-i2dev-a_2": "3faa4af66d66fa5833008042d5d7c058064d1315d3ccca4b9aea7170a76962f4",
  "turma-i2dev-a_3": "57318eeb8c71333357e178e33d9c91649f54a48155daa729847295ad5770d20c",
  "turma-i2dev-a_4": "74e724c91d2a99dc01e3294a592d4810d807b3e25d8cd6ba8afba7cee89352c6",
  "turma-i2dev-a_5": "67524139a20cf891b53bc20867a4c5e0b4faa83f1d546f2f429d04243489e33d",
  "turma-i2dev-a_6": "9e399f339d78095ba4f467342c378a34a64195f8cde084b345a646d8d4449615",
  "turma-i2dev-a_7": "f2b96336215c7f252bb37c6d06d5ca0fb3b81107a50f9f36d6e3b49f40f544c5",
  "turma-i2dev-a_8": "26dcc255a65ddb63117b93faa0bc3efcd8c4b1301eb07a176eef2de2760e13f8",
  "turma-i2dev-a_9": "fdc832a842843a328eb800fc5a497bc882452892615ac1583abd5fd2f2f2c623",
  "turma-i2dev-a_10": "c58bf55b8da4e4dbc1898fd6d94fa38e3ffe94fb29c208182fa320e256502553",
  "turma-i2dev-a_11": "a2e363fb1596b372d664fa81bf5fbbeb1aaab6e358df85c7973cc5ffbbe82248",
  "turma-i2dev-a_12": "57490cd204cca5b0ab807a264cc0dfc2d9ee201b12868bea06d00596fb262409",
  "turma-i2dev-a_13": "c00fe5041979952b1092850cc14ef09021c592306ef03f5b19963094b637d6e2",
  "turma-i2dev-b_1": "f7317a522edafe8cb77b5f008a6508bbedc040d5bd34b7cc32d36d10cf342c10",
  "turma-i2dev-b_2": "a5ebcbe2893f39a4ef267a463e0f73aa54d1e0af203f3c3c243a3fa5723e007e",
  "turma-i2dev-b_3": "9cc50439b3aee8afb5b8a6bb206fd44c82abcff4eede668df401f17d982b3f39",
  "turma-i2dev-b_4": "0c9a4577a1c63a51c8d3f37e14dce6c0737026e1445701c80a563c8014385cc0",
  "turma-i2dev-b_5": "7dabae115e443f46df9300370cc5c6935fd2ea14aa81485bd91fd1a469080d6d",
  "turma-i2dev-b_6": "70502ff6bb85356055ea52ff0a657afd09a52324a33734ccfb7bdedf05634925",
  "turma-i2dev-b_7": "c796d37c6d491e8f0c6e9b83eed34c15c0f377f9f0f3cbb3216fbbf776da6325",
  "turma-i2dev-b_8": "93401e39d3641332017a4a2b964149256f3ad86ea0f5f394461d7cc0a5367361",
  "turma-i2dev-b_9": "b80166f550862fb36297be861eab9f39330b77570b307ba447fd50d935ed51cf",
  "turma-i2dev-b_10": "ddea6da3af0b7fce795deb5c42adf6c28d0381c2eb22cba0e0cea68ef59806e4",
  "turma-i2dev-b_11": "ebfff66dd582993325ef78d77cf3d0e70d6b9e98df18f83cd63885ff105accaa",
  "turma-i2dev-b_12": "9505cacb7c710ed17125fcc6cb3669e8ddca6c8cd8af6a31f6b3cd64604c3098"
};

/**
 * Hash SHA-256 unidirecional do PIN docente para fallback offline.
 * Zero senhas em texto puro no código do frontend.
 */
export const PIN_DOCENTE_HASH_OFFLINE = '59bda9d4350f6978f9f8b1df8b7d0c48ac0178954437f2f10057f81e8628ef88';

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
 * Consulta o status atual de liberação dos agendamentos (Permitido ou Bloqueado)
 */
export async function obterStatusAgendamento() {
  try {
    const res = await fetch(`${API_BASE}/status-agendamento?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      const liberado = Boolean(data.liberado ?? data.agendamento_liberado);
      try {
        localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, liberado ? 'true' : 'false');
      } catch {}
      return { liberado, agendamento_liberado: liberado };
    }
  } catch (err) {
    console.warn('API de status indisponível. Utilizando status local em cache:', err);
  }

  // Fallback offline (padrão inicial bloqueado para segurança)
  const salvo = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY);
  const liberado = salvo === 'true';
  return { liberado, agendamento_liberado: liberado };
}

/**
 * Alterna a liberação do agendamento (Exclusivo Modo Professor autenticado com PIN)
 */
export async function alternarStatusAgendamento(novoStatus, pin) {
  try {
    const res = await fetch(`${API_BASE}/admin/toggle-agendamento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': pin
      },
      body: JSON.stringify({ liberado: Boolean(novoStatus) })
    });

    const resposta = await res.json().catch(() => ({}));

    if (res.ok) {
      try {
        localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, novoStatus ? 'true' : 'false');
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('portal_status_agendamento_changed', { detail: { liberado: Boolean(novoStatus) } }));
      }
      return resposta;
    }

    if (res.status === 401) {
      throw new Error(resposta.erro || 'Não autorizado. PIN do professor incorreto.');
    }
  } catch (err) {
    if (err.message.includes('Não autorizado') || err.message.includes('PIN')) throw err;
  }

  // Fallback offline se o backend estiver desconectado
  const pinHash = calcularSha256(normalizarTexto(pin));
  if (pinHash !== PIN_DOCENTE_HASH_OFFLINE) {
    throw new Error('PIN incorreto. Ação restrita ao professor.');
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, novoStatus ? 'true' : 'false');
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portal_status_agendamento_changed', { detail: { liberado: Boolean(novoStatus) } }));
  }

  return { sucesso: true, liberado: Boolean(novoStatus) };
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
    const dados = await res.json();
    if (typeof dados.agendamento_liberado === 'boolean') {
      try {
        localStorage.setItem(LOCAL_STORAGE_STATUS_KEY, dados.agendamento_liberado ? 'true' : 'false');
      } catch {}
    }
    return dados;
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
      const locais = obterAgendamentosLocais();
      const novo = resposta.agendamento || { ...dados, id: Date.now(), criado_em: new Date().toISOString() };
      salvarAgendamentosLocais([...locais.filter(a => a.id !== novo.id), novo]);
      return resposta;
    }

    // Se o backend respondeu com bloqueio de agendamento (403) ou erro de validação (400, 409)
    if ((res.status === 403 || res.status === 400 || res.status === 409) && resposta && resposta.erro) {
      throw new Error(resposta.erro);
    }
  } catch (err) {
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

  // --- Modo Fallback Offline (Executa apenas se o servidor backend estiver inalcançável) ---

  // 1. Verificação de liberação offline
  const statusLocal = localStorage.getItem(LOCAL_STORAGE_STATUS_KEY) === 'true';
  if (!statusLocal) {
    throw new Error('Os agendamentos de bancas de TCC estão temporariamente bloqueados pelo professor. Aguarde a liberação para selecionar um horário.');
  }

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

  // 2. Validação criptográfica offline via SHA-256 (Zero senhas em texto puro)
  const grupoNum = typeof grupo === 'string' ? null : grupo.numero;
  const keyLookup = `${turma.id}_${grupoNum}`;
  const hashEsperado = PALAVRAS_HASHES_OFFLINE[keyLookup];

  if (hashEsperado) {
    const digitada = normalizarTexto(dados.palavra_chave);
    if (!digitada) {
      throw new Error('A palavra-chave secreta do grupo é obrigatória para concluir o agendamento.');
    }

    const hashDigitado = calcularSha256(digitada);
    if (hashDigitado !== hashEsperado) {
      throw new Error(`Palavra-chave incorreta para o "${dados.grupo_nome}". Verifique a palavra secreta fornecida pelo Professor William e tente novamente.`);
    }
  }

  const locais = obterAgendamentosLocais();

  // 3. Verifica duplicidade de grupo
  const existenteGrupo = locais.find(a => a.turma_id === dados.turma_id && normalizarTexto(a.grupo_nome) === normalizarTexto(dados.grupo_nome));
  if (existenteGrupo) {
    throw new Error(`O grupo "${dados.grupo_nome}" já possui agendamento confirmado para ${existenteGrupo.data} às ${existenteGrupo.horario}.`);
  }

  // 4. Verifica conflito de horário
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
 * Valida o PIN do Professor no backend ou via hash SHA-256 unidirecional no fallback
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

  // Fallback offline seguro para PIN do professor comparando apenas Hash SHA-256
  const hashRecebido = calcularSha256(normalizarTexto(pin));
  if (hashRecebido === PIN_DOCENTE_HASH_OFFLINE) {
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
 * Consulta a lista de palavras-chave secretas dos grupos (Exclusivo Modo Professor autenticado)
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
    console.warn('API de palavras secretas offline:', err);
  }

  // Se o backend estiver offline, as palavras em texto puro não ficam expostas no cliente
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
        palavra_secreta: '(Disponível quando o servidor backend estiver ativo)'
      }))
    }))
  };
}
