import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const sourceFile = new URL('./entry.png', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outputFile = join(outputDir, 'entry.png');

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourceFile, outputFile);
console.log(`Copied entry.png (${statSync(outputFile).size} bytes)`);

const sourceBytes = readFileSync(sourceFile);
const copiedBytes = readFileSync(outputFile);

if (!sourceBytes.equals(copiedBytes)) {
  console.error('Copied entry.png differs from the source');
  process.exitCode = 1;
}

const digest = createHash('sha256').update(copiedBytes).digest('hex');
console.log(`SHA-256: ${digest}`);
