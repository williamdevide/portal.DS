# 📋 Plano de Desenvolvimento: Plataforma de Agendamento de TCC (PSOF3)

> **SENAI Ourinhos** | *Disciplina: Projeto de Software III (PSOF3)*  
> **Instrutor:** Prof. William Devidé Komel  
> **Arquitetura:** Google Antigravity (React 19 + Vite + Tailwind CSS + Express.js + SQLite)

---

## 🎯 1. Objetivo do Sistema

Criar uma solução integrada ao portal para gerenciar a agenda de defesas e apresentações dos Trabalhos de Conclusão de Curso (TCC) da disciplina **Projeto de Software III (PSOF3)**.

O sistema permite:
1. **Configuração via JSON:** Definição flexível de turmas, grupos participantes, dias e janelas de horários disponíveis.
2. **Autoagendamento pelos Alunos:** Interface interativa onde o grupo escolhe sua turma, grupo, data e horário vago, com travas atômicas contra duplicidade.
3. **Painel de Acompanhamento (Quadro de Agendamentos):** Visualização em tempo real das bancas marcadas e slots disponíveis.
4. **Governança do Professor (Modo Administrador via PIN):** Apenas o professor pode excluir ou editar agendamentos após autenticar seu PIN.
5. **Persistência Confiável:** Banco de dados SQLite local armazenado no próprio repositório (`/backend/database/agendamentos.db`).

---

## 🏗️ 2. Arquitetura de 3 Camadas

### Camada 1: Diretivas e Configuração (`/backend/data/` e `/documentation/`)
- `agendamento_config.json`: Documento canônico com as turmas, grupos e calendário de bancas.
- Regras de negócio estritas: 1 agendamento por grupo; 1 grupo por horário/turma.

### Camada 2: Orquestração e API (`/backend/`)
- Servidor **Node.js + Express**.
- Banco **SQLite** via `better-sqlite3` para operações síncronas e rápidas.
- Validações atômicas e transacionais com constraints `UNIQUE`.
- Proteção de endpoints de mutação (`PUT`, `DELETE`) via cabeçalho `x-admin-pin`.

### Camada 3: Interface do Usuário (`/frontend/`)
- Componentes React modulares com Tailwind CSS v4 e Lucide Icons.
- Design System unificado: Dark/Light Mode, glassmorphism, microinterações e acessibilidade.
- Integração fluida na página de PSOF3 (`/disciplina/projeto_de_software_iii`).

---

## 🗄️ 3. Modelo de Dados (SQLite)

```sql
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turma_id TEXT NOT NULL,
  turma_nome TEXT NOT NULL,
  grupo_nome TEXT NOT NULL,
  data TEXT NOT NULL,          -- Formato: YYYY-MM-DD
  horario TEXT NOT NULL,       -- Formato: HH:MM
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Um grupo só pode agendar 1 horário por turma
  CONSTRAINT uq_turma_grupo UNIQUE (turma_id, grupo_nome),
  -- Um horário não pode ser ocupado mais de uma vez na mesma turma
  CONSTRAINT uq_turma_horario UNIQUE (turma_id, data, horario)
);
```

---

## 🔒 4. Segurança e Governança

- **PIN Padrão do Professor:** `senai@2026` (configurável via variável de ambiente `ADMIN_PIN`).
- O frontend mantém o estado de autenticação do professor em memória ou sessionStorage após a validação no modal.
- Operações críticas (excluir banca, alterar horário) exigem envio do PIN verificado pelo backend.

---

## 🚀 5. Roteiro de Implementação

1. [x] Elicitação e alinhamento via `/grill-me`.
2. [x] Criação do pacote e dependências do backend (`express`, `cors`, `dotenv`, `node:sqlite`).
3. [x] Criação do banco SQLite, migrations e repositório de agendamentos (`db.js`).
4. [x] Criação do arquivo de configuração `agendamento_config.json`.
5. [x] Implementação dos endpoints REST da API (`server.js`).
6. [x] Configuração do Vite Proxy para `/api` em `frontend/vite.config.js`.
7. [x] Desenvolvimento dos componentes no Frontend:
   - `AgendamentoForm.jsx` (Agendamento para os alunos).
   - `QuadroAgendamentos.jsx` (Visualização e status).
   - `AdminPinModal.jsx` (Modal com PIN do professor).
8. [x] Integração das abas e rotas na página `Disciplina.jsx` de PSOF3.
9. [x] Testes end-to-end e validação das regras de negócio (`test_api_agendamento.js`).
10. [x] Atualização do `README.md` e do `promptHistory.md`.
