# Backend - Portal Educacional SENAI

Este diretório mantém a estrutura arquitetural oficial do projeto.

## 💾 Persistência de Dados e Serverless

Seguindo as diretrizes arquiteturais e a modernização de infraestrutura:
* Toda a persistência dinâmica (agendamentos de bancas de TCC, controle de liberação docente e autenticação segura com Google) opera de forma **100% Serverless no Google Cloud Firestore e Firebase Authentication**.
* O banco de dados local SQLite (`agendamentos.db`) foi completamente descontinuado e transposto para o Firebase.
* Não há dependência de servidores locais ativos para a execução em produção na **Vercel**.
