import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PIN = process.env.ADMIN_PIN || 'senai@2026';

// Função utilitária para normalizar strings (remove acentos, espaços extras e ignora maiúsculas)
function normalizarTexto(str) {
  return (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

app.use(cors());
app.use(express.json());

// Carrega o arquivo de configuração de agendamento de TCC (verifica backend e frontend dinamicamente)
function lerConfiguracao() {
  const caminhoFront = path.resolve(__dirname, '../../frontend/src/data/projeto_de_software_iii/agendamento_config.json');
  const caminhoBack = path.resolve(__dirname, '../data/agendamento_config.json');

  let arquivoParaLer = caminhoBack;
  if (fs.existsSync(caminhoFront)) {
    try {
      const statsFront = fs.statSync(caminhoFront);
      const statsBack = fs.existsSync(caminhoBack) ? fs.statSync(caminhoBack) : null;
      if (!statsBack || statsFront.mtimeMs >= statsBack.mtimeMs) {
        arquivoParaLer = caminhoFront;
      }
    } catch (e) {
      console.warn('Erro ao verificar mtime do frontend, usando backend:', e);
    }
  }

  try {
    const rawData = fs.readFileSync(arquivoParaLer, 'utf-8');
    const parsed = JSON.parse(rawData);

    // Garante IDs únicos para cada turma (evita colisões se o professor cadastrar turmas com mesmo id)
    if (parsed.turmas && Array.isArray(parsed.turmas)) {
      const idsVistos = new Set();
      parsed.turmas = parsed.turmas.map((turma, idx) => {
        let idUnico = turma.id || `turma-${idx + 1}`;
        if (idsVistos.has(idUnico)) {
          const sufixoDia = turma.dias_disponiveis?.[0]?.dia_semana 
            ? `-${turma.dias_disponiveis[0].dia_semana.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            : `-${idx + 1}`;
          idUnico = `${idUnico}${sufixoDia}`;
        }
        idsVistos.add(idUnico);
        return {
          ...turma,
          id: idUnico
        };
      });
    }

    return parsed;
  } catch (error) {
    console.error('Erro ao ler agendamento_config.json:', error);
    return { turmas: [] };
  }
}

// Middleware de verificação do PIN administrativo do professor
function requireAdminPin(req, res, next) {
  const pinFornecido = req.headers['x-admin-pin'] || req.body?.pin || req.query?.pin;
  if (!pinFornecido || pinFornecido.toString().trim() !== ADMIN_PIN.toString().trim()) {
    return res.status(401).json({
      erro: 'Acesso não autorizado. O PIN do professor é obrigatório para realizar esta ação.'
    });
  }
  next();
}

// Endpoint de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint para retornar o JSON de configuração das turmas e horários (nomes públicos)
app.get('/api/config', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const config = lerConfiguracao();

  // Oculta as palavras secretas para os alunos, enviando apenas os dados públicos dos grupos
  const configPublica = {
    ...config,
    turmas: config.turmas?.map(turma => ({
      ...turma,
      grupos: turma.grupos?.map(g => {
        if (typeof g === 'string') return { nome: g };
        const { palavra_secreta, ...dadosPublicos } = g;
        return dadosPublicos;
      })
    }))
  };

  res.json(configPublica);
});

// Endpoint exclusivo do professor para consultar todas as palavras secretas dos grupos
app.get('/api/admin/palavras-secretas', requireAdminPin, (req, res) => {
  const config = lerConfiguracao();
  const resumoPalavras = config.turmas?.map(turma => ({
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
  }));

  res.json({ turmas: resumoPalavras });
});

// Endpoint para listar agendamentos do banco SQLite
app.get('/api/agendamentos', (req, res) => {
  try {
    const { turma_id } = req.query;
    const agendamentos = listarAgendamentos(turma_id || null);
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Falha ao buscar agendamentos do banco de dados.' });
  }
});

// Endpoint para criar um novo agendamento (Alunos com validação de Palavra-Chave)
app.post('/api/agendamentos', (req, res) => {
  try {
    const { turma_id, turma_nome, grupo_nome, data, horario, observacoes, palavra_chave } = req.body;

    if (!turma_id || !turma_nome || !grupo_nome || !data || !horario) {
      return res.status(400).json({
        erro: 'Campos obrigatórios ausentes: turma, grupo, data e horário devem ser informados.'
      });
    }

    // Validação da Palavra-Chave Secreta do Grupo
    const config = lerConfiguracao();
    const turma = config.turmas?.find(t => t.id === turma_id);
    if (!turma) {
      return res.status(404).json({ erro: 'Turma selecionada não encontrada na configuração.' });
    }

    const grupoConfig = turma.grupos?.find(g => {
      const nome = typeof g === 'string' ? g : g.nome;
      return normalizarTexto(nome) === normalizarTexto(grupo_nome);
    });

    if (!grupoConfig) {
      return res.status(404).json({ erro: `Grupo "${grupo_nome}" não encontrado na turma.` });
    }

    const palavraEsperada = typeof grupoConfig === 'string' ? null : grupoConfig.palavra_secreta;
    if (palavraEsperada) {
      const palavraDigitada = (palavra_chave || '').toString().trim();
      if (!palavraDigitada) {
        return res.status(400).json({
          erro: 'A palavra-chave secreta do grupo é obrigatória para concluir o agendamento.'
        });
      }

      if (normalizarTexto(palavraDigitada) !== normalizarTexto(palavraEsperada)) {
        return res.status(403).json({
          erro: `Palavra-chave incorreta para o "${grupo_nome}". Verifique a palavra secreta fornecida pelo Professor William e tente novamente.`
        });
      }
    }

    const novo = criarAgendamento({
      turma_id,
      turma_nome,
      grupo_nome,
      data,
      horario,
      observacoes: observacoes || ''
    });

    res.status(201).json({
      mensagem: 'Agendamento confirmado com sucesso!',
      agendamento: novo
    });
  } catch (error) {
    console.warn('Conflito ou erro no agendamento:', error.message);
    res.status(409).json({ erro: error.message });
  }
});

// Endpoint para validar o PIN administrativo do professor
app.post('/api/admin/verificar-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.toString().trim() !== ADMIN_PIN.toString().trim()) {
    return res.status(401).json({
      valido: false,
      erro: 'PIN incorreto. Verifique a senha do professor e tente novamente.'
    });
  }

  res.json({
    valido: true,
    mensagem: 'Modo Professor autenticado com sucesso!'
  });
});

// Endpoint para atualizar agendamento (Exclusivo Professor com PIN)
app.put('/api/agendamentos/:id', requireAdminPin, (req, res) => {
  try {
    const { id } = req.params;
    const { data, horario, observacoes, grupo_nome } = req.body;

    const atualizado = atualizarAgendamento(id, {
      data,
      horario,
      observacoes,
      grupo_nome
    });

    res.json({
      mensagem: 'Agendamento atualizado com sucesso!',
      agendamento: atualizado
    });
  } catch (error) {
    console.warn('Erro ao atualizar agendamento:', error.message);
    res.status(400).json({ erro: error.message });
  }
});

// Endpoint para excluir agendamento (Exclusivo Professor com PIN)
app.delete('/api/agendamentos/:id', requireAdminPin, (req, res) => {
  try {
    const { id } = req.params;
    const removido = excluirAgendamento(id);
    res.json({
      mensagem: 'Agendamento excluído com sucesso. A vaga está liberada novamente!',
      agendamento: removido
    });
  } catch (error) {
    console.warn('Erro ao excluir agendamento:', error.message);
    res.status(400).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend Portal.DS rodando em http://localhost:${PORT}`);
  console.log(`💾 Banco SQLite inicializado em /backend/database/agendamentos.db`);
});
