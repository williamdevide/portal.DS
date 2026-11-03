# 🌐 Portal Educacional - Técnico em Desenvolvimento de Sistemas
> **SENAI Ourinhos** | *Professor William Devidé Komel*

---

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-Expert_AI-blueviolet?style=for-the-badge)](https://deepmind.google/)

---

## 🇧🇷 Sobre o Projeto

Este é o **Portal Educacional** desenvolvido para os alunos do curso técnico de **Desenvolvimento de Sistemas** do **SENAI Ourinhos**. A plataforma centraliza cronogramas, materiais didáticos, critérios MSEP e a plataforma de agendamento de bancas de TCC para o Professor William Devidé Komel.

### 🌟 Destaques Tecnológicos & IA
Este projeto foi idealizado e codificado de forma autônoma e guiada utilizando o **Google Antigravity**, a IA especialista em engenharia de software da Google DeepMind.
* **Agentes Utilizados:** Agente Orquestrador, Especialista Full Stack & Instrutor Senior (Perfis SENAI).
* **Skills Utilizadas:** `@app-builder`, `@brainstorming`, `@frontend-design`, `@clean-code`.
* **Plataforma de TCC Integrada (PSOF3):** Autoagendamento de bancas de TCC com validação atômica de slots, persistência em nuvem em tempo real com **Google Cloud Firestore**, fallback em banco local **SQLite** (`agendamentos.db`) e governança exclusiva do professor via PIN administrativo.

---

## 🇺🇸 About the Project

This is the **Educational Portal** developed for students of the **Systems Development** technical course at **SENAI Ourinhos**. The platform centralizes schedules, didactic materials, MSEP assessment matrices, and a TCC Defense Scheduling Platform for Professor William Devidé Komel.

### 🌟 Tech Stack & AI Highlights
This project was conceptualized and coded autonomously using **Google Antigravity**, the software engineering specialist AI from Google DeepMind.
* **Agents Used:** Orchestrator Agent, Full Stack Specialist & Senior Instructor (SENAI Profiles).
* **Skills Used:** `@app-builder`, `@brainstorming`, `@frontend-design`, `@clean-code`.
* **Integrated TCC Scheduling (PSOF3):** Self-scheduling defense sessions with atomic slot validation, real-time cloud persistence via **Google Cloud Firestore**, local **SQLite** database fallback (`agendamentos.db`), and exclusive instructor governance protected by an administrative PIN.

---

## 🏗️ Estrutura do Projeto / Project Structure

```text
/
├── /backend           # API REST em Express + SQLite (Persistência de Agendamentos)
│   ├── /data          # Configuração canônica de turmas e horários (agendamento_config.json)
│   ├── /database      # Arquivo SQLite persistente (agendamentos.db)
│   └── /src           # Servidor Express, rotas e módulo db.js
├── /frontend          # Interface do usuário (React 19 + Vite 8 + Tailwind CSS v4)
├── /directives        # Procedimentos Operacionais Padrão (SOPs)
├── /execution         # Scripts de validação determinística
├── /documentation     # Planos de desenvolvimento e histórico de prompts
└── README.md          # Documentação central bilíngue
```

---

## 🚀 Como Executar / How to Run

### Pré-requisitos / Prerequisites
* Node.js (versão 20 ou superior - com suporte nativo a SQLite)
* NPM

### Passos / Steps

1. **Instalação das dependências:**
   ```bash
   # Instalar dependências do backend e frontend
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Executar em modo de desenvolvimento (Fullstack):**
   ```bash
   # Terminal 1: Iniciar o backend Express + SQLite (Porta 3001)
   npm run dev:backend

   # Terminal 2: Iniciar o frontend Vite (Porta 5173 com proxy /api)
   npm run dev:frontend
   ```

3. **Executar Testes Automatizados de Banco de Dados:**
   ```bash
   node execution/test_api_agendamento.js
   ```

4. **Gerar build de produção do Frontend:**
   ```bash
   npm run build:frontend
   ```

---

*Desenvolvido em parceria com a IA do Google Antigravity - SENAI Ourinhos Edition* 🎓
