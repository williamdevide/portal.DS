# 📋 Procedimento Operacional Padrão (SOP): Versionamento Semântico e Deploy Contínuo (Portal-DS)

> **Módulo:** Governança e Ciclo de Vida do Portal Educacional SENAI Ourinhos  
> **Camada:** Diretiva Estratégica (Camada 1)

---

## 🎯 1. Finalidade

Estabelecer a regra determinística e inegociável de versionamento contínuo para o Portal-DS. A cada solicitação de novo módulo, novo recurso ou correção de bug/layout, o sistema de versionamento deve ser atualizado e sincronizado imediatamente com o GitHub e a Vercel.

---

## 🏷️ 2. Formato e Regras de Versionamento Semântico

O Portal-DS segue a estrutura estrita:
$$\text{v}[\text{Módulo}].[\text{Recurso}].[\text{Correção}]$$
Exemplo: `v1.1.1`

### Regras de Incremento:
1. **Módulo ($X$) - Major:**
   * Incrementado quando um **novo módulo ou disciplina** for acrescentado ao portal (ex: novo curso, nova grande área).
   * Zera os dígitos de recurso e correção ($v2.0.0$).
2. **Recurso ($Y$) - Minor:**
   * Incrementado quando um **novo recurso ou funcionalidade** for adicionado a um módulo existente (ex: exportação PDF/CSV, novos filtros, integração com novas APIs).
   * Zera o dígito de correção ($v1.2.0$).
3. **Correção ($Z$) - Patch:**
   * Incrementado quando for realizada uma **correção de bug, ajuste visual ou refinamento de layout/estilo** (ex: ajuste de colunas da tabela que estouravam a largura da div).

---

## 📍 3. Onde a Versão Deve Ser Atualizada no Código

1. **Arquivo Canônico de Versão:** `frontend/src/version.js` (`export const PORTAL_VERSION = 'vX.Y.Z';`)
2. **Cabeçalho Principal:** `frontend/src/components/Header.jsx` (exibe `Portal do Professor ({PORTAL_VERSION})`)
3. **Rodapé do Portal:** `frontend/src/components/Footer.jsx` (exibe a tag com a versão ativa)
4. **Manifestos npm:** `package.json` (raiz) e `frontend/package.json`

---

## 🚀 4. Protocolo Obrigatório de Atualização e Deploy

A cada ciclo de modificação concluído:
1. **Validação Local:** Executar `npm run lint` e `npm run build` garantindo zero erros.
2. **Registro de Rastreabilidade:** Registrar integralmente o prompt do usuário em `documentation/promptHistory.md`.
3. **Commit Semântico no Git:**
   * Formato: `feat/fix: [descrição clara] (vX.Y.Z)`
4. **Push para o GitHub:**
   * `git push origin main`
5. **Deploy Automático na Vercel:**
   * O repositório GitHub `williamdevide/portal.DS` possui integração contínua (CI/CD) com a Vercel.
   * O push para a branch `main` dispara automaticamente o build e deploy para produção em `portal-ds.vercel.app`.
