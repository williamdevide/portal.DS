import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Script Determinístico da Camada 3: Execução de Versionamento Semântico
 * Uso: node execution/bump_version.js [major|minor|patch|set] [versao_manual]
 */
function bump() {
  const type = process.argv[2] || 'patch';
  const customVersion = process.argv[3];

  const versionJsPath = path.join(rootDir, 'frontend', 'src', 'version.js');
  const rootPackagePath = path.join(rootDir, 'package.json');
  const frontendPackagePath = path.join(rootDir, 'frontend', 'package.json');

  let currentVersion = '1.1.1';
  if (fs.existsSync(versionJsPath)) {
    const content = fs.readFileSync(versionJsPath, 'utf-8');
    const match = content.match(/PORTAL_VERSION\s*=\s*['"]v?([^'"]+)['"]/);
    if (match) currentVersion = match[1];
  }

  let [major, minor, patch] = currentVersion.split('.').map(n => parseInt(n, 10) || 0);

  let newVersion = '';
  if (type === 'set' && customVersion) {
    newVersion = customVersion.replace(/^v/, '');
  } else if (type === 'major') {
    newVersion = `${major + 1}.0.0`;
  } else if (type === 'minor') {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  console.log(`Atualizando versao: v${currentVersion} -> v${newVersion}`);

  // 1. Atualiza version.js
  const newVersionJsContent = `/**
 * Versão do Portal Educacional SENAI Ourinhos (Portal-DS)
 * Formato Semântico Oficial: v[Módulo].[Recurso].[Correção]
 */
export const PORTAL_VERSION = 'v${newVersion}';
export default PORTAL_VERSION;
`;
  fs.writeFileSync(versionJsPath, newVersionJsContent, 'utf-8');

  // 2. Atualiza package.json raiz
  if (fs.existsSync(rootPackagePath)) {
    const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
    pkg.version = newVersion;
    fs.writeFileSync(rootPackagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  }

  // 3. Atualiza frontend/package.json
  if (fs.existsSync(frontendPackagePath)) {
    const fPkg = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf-8'));
    fPkg.version = newVersion;
    fs.writeFileSync(frontendPackagePath, JSON.stringify(fPkg, null, 2) + '\n', 'utf-8');
  }

  console.log(`Versão v${newVersion} gravada com sucesso em todos os manifestos.`);
}

bump();

