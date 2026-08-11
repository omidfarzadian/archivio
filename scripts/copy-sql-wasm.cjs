const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const out = path.join(__dirname, '../public/assets/sql-wasm.wasm');
const tmp = path.join(__dirname, '../.tmp-sqljs');

try {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.mkdirSync(tmp, { recursive: true });
  execSync('npm pack sql.js@1.10.1', { cwd: tmp, stdio: 'pipe' });
  execSync('tar -xzf sql.js-1.10.1.tgz', { cwd: tmp, stdio: 'pipe' });
  fs.copyFileSync(path.join(tmp, 'package/dist/sql-wasm.wasm'), out);
  fs.copyFileSync(
    path.join(tmp, 'package/dist/sql-wasm.js'),
    path.join(__dirname, '../public/assets/sql-wasm.js'),
  );
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Copied sql-wasm.wasm (1.10.1) for jeep-sqlite');
} catch (err) {
  console.warn('Could not copy sql-wasm.wasm:', err.message);
}
