# 📋 Procedimento Operacional Padrão (SOP): Plataforma de Agendamento TCC (PSOF3)

> **Módulo:** Projeto de Software III (PSOF3) - Apresentação do TCC  
> **Camada:** Diretiva Estratégica (Camada 1)

---

## 🎯 1. Finalidade

Este documento estabelece as diretrizes e procedimentos para operação, customização e manutenção da plataforma de agendamento das bancas de TCC integradas ao Portal Educacional do SENAI Ourinhos.

---

## ⚙️ 2. Como Configurar Novas Turmas e Horários

O arquivo canônico de dados das turmas e horários reside em:
`backend/data/agendamento_config.json` (com espelho em `frontend/src/data/projeto_de_software_iii/agendamento_config.json`).

### Estrutura do JSON com Palavra-Chave Secreta:
```json
{
  "disciplina": "Projeto de Software III (PSOF3)",
  "duracao_apresentacao_minutos": 35,
  "turmas": [
    {
      "id": "turma-i2dev-a",
      "nome": "Técnico em Desenvolvimento de Sistemas - I2DEV-A (Terça-feira)",
      "sala_ou_local": "Laboratório de Informática 03",
      "grupos": [
        {
          "nome": "Grupo 01",
          "palavra_secreta": "algoritmo"
        },
        {
          "nome": "Grupo 02",
          "palavra_secreta": "variavel"
        }
      ],
      "dias_disponiveis": [
        {
          "data": "2026-11-24",
          "dia_semana": "Terça-feira",
          "horarios": ["07:30", "08:15", "09:00", "10:00", "10:45"]
        }
      ]
    }
  ]
}
```

- **Segurança da Palavra Secreta:** O endpoint público `/api/config` higieniza os grupos, retornando apenas os nomes dos grupos aos alunos e omitindo as palavras-chave para evitar descoberta via DevTools/Network do navegador.
- **Validação de Agendamento:** O aluno deve fornecer obrigatoriamente a palavra-chave confidencial entregue pelo professor. O servidor valida no `POST /api/agendamentos` de forma insensível a maiúsculas e espaços.
- **Consulta das Palavras pelo Professor:** Disponível no endpoint protegido `/api/admin/palavras-secretas` e no botão "Palavras-Chave dos Grupos" no Modo Professor do Quadro de Agendamentos.

---

## 🔐 3. Modo Professor e Gestão de Permissões

- **PIN Padrão:** `senai@2026`
- **Configuração de Novo PIN:** Definir a variável de ambiente `ADMIN_PIN` no arquivo `backend/.env`.
- **Regra de Negócio:**
  - Alunos têm permissão exclusiva para **consultar** e **agendar vagas disponíveis**.
  - Apenas quem possuir o **PIN do Professor** pode **excluir** ou **editar** reservas de bancas.

---

## 🗄️ 4. Banco de Dados SQLite

- **Arquivo Físico:** `backend/database/agendamentos.db`
- **Inicialização Automática:** Caso o arquivo não exista, o módulo `db.js` o cria automaticamente com suas tabelas, índices e constraints de unicidade (`uq_turma_grupo` e `uq_turma_horario`).
- **Reset do Banco (Opcional):** Para reiniciar todos os agendamentos para um novo semestre, basta apagar o arquivo `agendamentos.db`. O sistema criará um novo banco limpo na próxima requisição.

---

## 🚀 5. Como Executar o Sistema Completo

1. **Em Desenvolvimento:**
   - Terminal 1 (Backend): `npm run dev:backend` (inicia em http://localhost:3001)
   - Terminal 2 (Frontend): `npm run dev:frontend` (inicia em http://localhost:5173 com proxy para /api)

2. **Acesso Direto às Telas:**
   - Pela disciplina: `/disciplina/projeto_de_software_iii`
   - Atalho direto Agendamento: `/disciplina/projeto_de_software_iii/agendamento`
   - Atalho direto Quadro de Bancas: `/disciplina/projeto_de_software_iii/agendamentos`
