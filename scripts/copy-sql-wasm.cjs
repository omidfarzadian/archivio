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

// pdf.js needs its standard fonts and CMaps served as static assets so that
// PDFs using the standard-14 fonts or CJK encodings render (otherwise page
// rendering can stall). Stage them into public/ for both web and native.
try {
  const pdfDist = path.dirname(require.resolve('pdfjs-dist/package.json'));
  const targets = [
    ['standard_fonts', path.join(__dirname, '../public/pdf/standard_fonts')],
    ['cmaps', path.join(__dirname, '../public/pdf/cmaps')],
  ];
  for (const [name, dest] of targets) {
    const src = path.join(pdfDist, name);
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });
  }
  console.log('Copied pdf.js standard_fonts and cmaps to public/pdf');
} catch (err) {
  console.warn('Could not copy pdf.js assets:', err.message);
}
