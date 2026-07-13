# Backend - Portal Educacional

Este diretório está reservado para futuras extensões de lógica de servidor, funções serverless ou APIs.

## 💾 Persistência de Dados
Seguindo as diretrizes arquiteturais, caso o portal necessite de persistência dinâmica (como logins de alunos, postagem de dúvidas ou notas), utilizaremos o **Firebase** (Firestore e Firebase Auth) por meio da integração do cliente diretamente no frontend ou encapsulado aqui por meio do Firebase Admin SDK.

Por enquanto, toda a renderização do portal é estática, alimentada pelo arquivo estruturado `portalData.json` no frontend.
