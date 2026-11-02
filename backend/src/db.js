import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garante que o diretório database exista
const dbDir = path.resolve(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'agendamentos.db');
const db = new DatabaseSync(dbPath);

// Inicializa a tabela de agendamentos com constraints de integridade
db.exec(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turma_id TEXT NOT NULL,
    turma_nome TEXT NOT NULL,
    grupo_nome TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    observacoes TEXT DEFAULT '',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_turma_grupo UNIQUE (turma_id, grupo_nome),
    CONSTRAINT uq_turma_horario UNIQUE (turma_id, data, horario)
  );

  CREATE INDEX IF NOT EXISTS idx_agendamentos_turma ON agendamentos (turma_id);
  CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos (data);
`);

/**
 * Retorna todos os agendamentos ou filtrados por turma
 */
export function listarAgendamentos(turmaId = null) {
  if (turmaId) {
    const stmt = db.prepare(`
      SELECT * FROM agendamentos 
      WHERE turma_id = ? 
      ORDER BY data ASC, horario ASC
    `);
    return stmt.all(turmaId);
  }

  const stmt = db.prepare(`
    SELECT * FROM agendamentos 
    ORDER BY turma_id ASC, data ASC, horario ASC
  `);
  return stmt.all();
}

/**
 * Busca agendamento por ID
 */
export function buscarAgendamentoPorId(id) {
  const stmt = db.prepare('SELECT * FROM agendamentos WHERE id = ?');
  return stmt.get(Number(id));
}

/**
 * Verifica se grupo já possui agendamento
 */
export function buscarPorGrupo(turmaId, grupoNome) {
  const stmt = db.prepare('SELECT * FROM agendamentos WHERE turma_id = ? AND LOWER(grupo_nome) = LOWER(?)');
  return stmt.get(turmaId, grupoNome);
}

/**
 * Verifica se horário já está ocupado
 */
export function buscarPorHorario(turmaId, data, horario) {
  const stmt = db.prepare('SELECT * FROM agendamentos WHERE turma_id = ? AND data = ? AND horario = ?');
  return stmt.get(turmaId, data, horario);
}

/**
 * Insere um novo agendamento
 */
export function criarAgendamento({ turma_id, turma_nome, grupo_nome, data, horario, observacoes = '' }) {
  // Verificação prévia de grupo
  const existenteGrupo = buscarPorGrupo(turma_id, grupo_nome);
  if (existenteGrupo) {
    throw new Error(`O grupo "${grupo_nome}" já possui agendamento confirmado para o dia ${existenteGrupo.data} às ${existenteGrupo.horario}.`);
  }

  // Verificação prévia de horário
  const existenteHorario = buscarPorHorario(turma_id, data, horario);
  if (existenteHorario) {
    throw new Error(`O horário ${horario} do dia ${data} já foi reservado pelo grupo "${existenteHorario.grupo_nome}".`);
  }

  const stmt = db.prepare(`
    INSERT INTO agendamentos (turma_id, turma_nome, grupo_nome, data, horario, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(turma_id, turma_nome, grupo_nome, data, horario, observacoes);
  
  // Retorna o item recém criado
  const lastStmt = db.prepare('SELECT * FROM agendamentos WHERE turma_id = ? AND grupo_nome = ?');
  return lastStmt.get(turma_id, grupo_nome);
}

/**
 * Atualiza um agendamento existente (Privativo do Professor)
 */
export function atualizarAgendamento(id, { data, horario, observacoes, grupo_nome }) {
  const atual = buscarAgendamentoPorId(id);
  if (!atual) {
    throw new Error('Agendamento não encontrado.');
  }

  const novaData = data || atual.data;
  const novoHorario = horario || atual.horario;
  const novoGrupo = grupo_nome || atual.grupo_nome;
  const novasObs = observacoes !== undefined ? observacoes : atual.observacoes;

  // Se alterou grupo, verificar se o novo grupo já possui agendamento em outro ID
  if (novoGrupo !== atual.grupo_nome) {
    const outroGrupo = buscarPorGrupo(atual.turma_id, novoGrupo);
    if (outroGrupo && outroGrupo.id !== atual.id) {
      throw new Error(`O grupo "${novoGrupo}" já possui agendamento cadastrado.`);
    }
  }

  // Se alterou data ou horário, verificar se o novo slot está ocupado por outro agendamento
  if (novaData !== atual.data || novoHorario !== atual.horario) {
    const outroSlot = buscarPorHorario(atual.turma_id, novaData, novoHorario);
    if (outroSlot && outroSlot.id !== atual.id) {
      throw new Error(`O horário ${novoHorario} no dia ${novaData} já está ocupado por outro grupo.`);
    }
  }

  const stmt = db.prepare(`
    UPDATE agendamentos 
    SET data = ?, horario = ?, observacoes = ?, grupo_nome = ?
    WHERE id = ?
  `);

  stmt.run(novaData, novoHorario, novasObs, novoGrupo, Number(id));
  return buscarAgendamentoPorId(id);
}

/**
 * Remove um agendamento existente (Privativo do Professor)
 */
export function excluirAgendamento(id) {
  const atual = buscarAgendamentoPorId(id);
  if (!atual) {
    throw new Error('Agendamento não encontrado.');
  }

  const stmt = db.prepare('DELETE FROM agendamentos WHERE id = ?');
  stmt.run(Number(id));
  return atual;
}

export default db;
