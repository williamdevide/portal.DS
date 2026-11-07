# 🌐 Portal Educacional - Técnico em Desenvolvimento de Sistemas
> **SENAI Ourinhos** | *Professor William Devidé Komel*

---

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-Expert_AI-blueviolet?style=for-the-badge)](https://deepmind.google/)

---

## 🇧🇷 Sobre o Projeto

Este é o **Portal Educacional** desenvolvido para os alunos do curso técnico de **Desenvolvimento de Sistemas** do **SENAI Ourinhos**. A plataforma centraliza cronogramas, materiais didáticos interativos, critérios MSEP e a plataforma de autoagendamento de bancas de TCC para o Professor William Devidé Komel.

### 🌟 Destaques Tecnológicos & IA
Este projeto foi idealizado e codificado de forma autônoma e guiada utilizando o **Google Antigravity**, a IA especialista em engenharia de software da Google DeepMind.
* **Agentes Utilizados:** Agente Orquestrador, Especialista Full Stack & Instrutor Senior (Perfis SENAI).
* **Skills Utilizadas:** `@app-builder`, `@brainstorming`, `@frontend-design`, `@clean-code`, `@database-design`.
* **Plataforma de TCC Integrada (PSOF3):** Autoagendamento de bancas de TCC com validação atômica de horários, persistência permanente em nuvem em tempo real com **Google Cloud Firestore**, fallback offline inteligente e governança docente protegida por **Autenticação Google Oficial (Firebase Auth)** com regras de segurança blindadas (`firestore.rules`).

---

## 🇺🇸 About the Project

This is the **Educational Portal** developed for students of the **Systems Development** technical course at **SENAI Ourinhos**. The platform centralizes academic schedules, interactive didactic materials, MSEP assessment matrices, and an automated TCC Defense Scheduling Platform for Professor William Devidé Komel.

### 🌟 Tech Stack & AI Highlights
This project was conceptualized and coded autonomously using **Google Antigravity**, the software engineering specialist AI from Google DeepMind.
* **Agents Used:** Orchestrator Agent, Full Stack Specialist & Senior Instructor (SENAI Profiles).
* **Skills Used:** `@app-builder`, `@brainstorming`, `@frontend-design`, `@clean-code`, `@database-design`.
* **Integrated TCC Scheduling (PSOF3):** Self-scheduling defense sessions with atomic slot validation, real-time cloud persistence via **Google Cloud Firestore (Production)**, smart offline fallback, and exclusive instructor governance protected by **Official Google Authentication (Firebase Auth)** backed by high-security Firestore Security Rules (`firestore.rules`).

---

## 🏗️ Estrutura do Projeto / Project Structure

```text
/
├── /frontend          # Interface do usuário (React 19 + Vite 8 + Tailwind CSS v4 + Firebase SDK)
├── /backend           # Arquitetura de servidor e dados canônicos
│   └── /data          # Configuração canônica de turmas e horários (agendamento_config.json)
├── /directives        # Procedimentos Operacionais Padrão (SOPs)
├── /execution         # Scripts de validação determinística e versionamento
├── /documentation     # Planos de desenvolvimento e histórico de prompts
├── firestore.rules    # Regras de segurança em nuvem de produção (Google Cloud Firestore)
└── README.md          # Documentação central bilíngue
```

---

## 🚀 Como Executar / How to Run

### Pré-requisitos / Prerequisites
* Node.js (versão 20 ou superior)
* NPM

### Passos / Steps

1. **Instalação das dependências:**
   ```bash
   cd frontend && npm install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev:frontend
   ```

3. **Executar Auditoria de Segurança do Firebase:**
   ```bash
   node execution/verify_full_security.js
   ```

4. **Gerar build de produção do Frontend:**
   ```bash
   npm run build:frontend
   ```

---

*Desenvolvido com excelência técnica para o SENAI Ourinhos - SP.*
