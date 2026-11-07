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

## 🔐 3. Modo Professor e Gestão de Permissões (Autenticação Google)

- **Provedor Oficial:** Firebase Authentication com Google Sign-In (OAuth 2.0).
- **Conta Docente Autorizada:** `williamdevide@gmail.com`.
- **Blindagem de Segurança:**
  - Zero senhas ou hashes no código-fonte ou no bundle do frontend.
  - Qualquer outra conta Google que tentar se conectar é desconectada imediatamente com recusa de autorização.
- **Regras de Negócio e RBAC:**
  - **Alunos:** Têm permissão de leitura pública do cronograma e agendamento de slots disponíveis.
  - **Professor (`williamdevide@gmail.com`):** Exclusividade total para **bloquear/liberar agendamentos**, **editar bancas**, **excluir reservas**, **exportar relatórios em PDF/CSV** e **visualizar palavras-chave**.

---

## 🗄️ 4. Banco de Dados e Sincronização em Tempo Real (Firebase Firestore + SQLite)

- **Cloud Firestore (Nuvem em Tempo Real - Produção Vercel):**
  - **Projeto:** `antigravityportalds`
  - **Coleção de Configuração:** `config/tcc` (armazena `{ liberado: true/false, atualizado_em, modificado_por }`).
  - **Coleção de Agendamentos:** `agendamentos/{turmaId___grupoNome}` com constraints de unicidade atômica e prevenção de duplicidade.
  - **Sincronização em Tempo Real:** Utiliza listeners `onSnapshot` no frontend para sincronizar instantaneamente o status (liberado/bloqueado) e a lista de reservas entre todos os navegadores abertos (professores, alunos e dispositivos móveis) sem necessidade de recarregar a página.
- **SQLite (Persistência Local / Fallback):**
  - **Arquivo Físico:** `backend/database/agendamentos.db`
  - Utilizado quando o desenvolvedor executa o backend Node.js localmente, mantendo integridade com SQLite e fallback automático para contingências offline.

---

## 🛡️ 5. Regras de Segurança Permanentes (Produção) e Proteção RBAC no Firestore

O Cloud Firestore opera sob regras de segurança estritas descritas no arquivo `firestore.rules`:
- **Validação de Token Criptográfico (`isProfessor()`):** Apenas requisições com token JWT do Firebase Auth emitido para `williamdevide@gmail.com` podem alterar a configuração do TCC ou excluir agendamentos.
- **Leitura Pública:** Leitura liberada para `config/tcc` e `agendamentos/{id}` para permitir que alunos e bancas acompanhem os horários em tempo real.
- **Criação de Agendamentos:** Validação granular de campos obrigatórios (`turma_id`, `turma_nome`, `grupo_nome`, `data`, `horario`) e limites de caracteres para evitar injeção ou corrupção de dados.
- **Bloqueio Padrão (Default Deny):** Todas as outras coleções têm acesso negado (`allow read, write: if false;`).

### Como Publicar as Regras Atualizadas no Firebase Console:
1. Acesse o [Console do Firebase - Regras](https://console.firebase.google.com/project/antigravityportalds/firestore/rules).
2. Substitua o conteúdo pelo código do arquivo local `firestore.rules`.
3. Clique em **Publicar (Publish)**.
4. No menu lateral, acesse **Authentication** > aba **Sign-in method** > certifique-se de que o provedor **Google** está ativado.

---

## 💾 6. Rotinas de Backup e Restauração Determinísticas

Para garantir 100% de segurança contra perda acidental de agendamentos, o projeto dispõe de scripts automatizados na Camada 3 (`/execution`):

- **Executar Backup do Firestore:**
  ```bash
  node execution/backup_firestore.js
  ```
  *Gera o arquivo `backend/data/backup_firestore_tcc.json` contendo o snapshot completo de todos os agendamentos e o status do TCC.*

- **Executar Restauração no Firestore:**
  ```bash
  node execution/restore_firestore.js
  ```
  *Restaura atomicamente todos os registros salvos no arquivo de backup de volta para o Cloud Firestore.*

---

## 🚀 7. Como Executar o Sistema Completo

1. **Em Produção (Vercel):**
   - O frontend se comunica diretamente com o **Firebase Firestore** em tempo real, garantindo que qualquer alteração de status feita pelo professor seja propagada instantaneamente para todos os alunos em qualquer dispositivo ou navegador.

2. **Em Desenvolvimento Local:**
   - Terminal 1 (Backend - Opcional): `npm run dev:backend` (inicia em http://localhost:3001)
   - Terminal 2 (Frontend): `npm run dev:frontend` (inicia em http://localhost:5173)

3. **Acesso Direto às Telas:**
   - Pela disciplina: `/disciplina/projeto_de_software_iii`
   - Atalho direto Agendamento: `/disciplina/projeto_de_software_iii/agendamento`
   - Atalho direto Quadro de Bancas: `/disciplina/projeto_de_software_iii/agendamentos`

