// The Old Library — the hand-in program (Node 22, standard library only).
//
// The game itself is the static folder game/ beside this file: an old
// library hall rendered twice by Three.js, with twelve details quietly
// changed in the second rendering. This program's whole job is the
// hand-in: copy game/ and screenshots/ into the output directory and
// write dossier.json there with the kit's vendored library, so the judge
// reads exactly the files the player would.
//
// Run it locally the way the grader does, with MAKEFUN_OUTPUT_DIR
// standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), shotsDir, { recursive: true });
}

// The caps are the gate's own: at most 4 screenshots of at most 256 KiB,
// at most 993 files and 48 MiB under game/, no game path over 1,000
// bytes, and the dossier's source text held to 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
