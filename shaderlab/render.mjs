// Render each scene shader to PNG with CanvasKit so they can be judged before shipping.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const CanvasKitInit = require('canvaskit-wasm/bin/full/canvaskit.js');

const src = (f) => fs.readFileSync(path.resolve('../app/src/shaders', f), 'utf8');
const common = src('common.ts').match(/`([\s\S]*?)`/)[1];
const scenesTs = src('scenes.ts');
const scenes = {};
for (const m of scenesTs.matchAll(/const (\w+) = `([\s\S]*?)`;/g)) scenes[m[1]] = common + m[2];

const [w, h, time] = [Number(process.argv[2] ?? 390), Number(process.argv[3] ?? 520), Number(process.argv[4] ?? 12)];
const CK = await CanvasKitInit({ locateFile: (f) => require.resolve('canvaskit-wasm/bin/full/' + f) });
fs.mkdirSync('out', { recursive: true });
for (const [name, sksl] of Object.entries(scenes)) {
  let errors = '';
  const effect = CK.RuntimeEffect.Make(sksl, (e) => (errors += e));
  if (!effect) { console.log(`✗ ${name}: ${errors}`); continue; }
  const surface = CK.MakeSurface(w, h);
  const canvas = surface.getCanvas();
  const shader = effect.makeShader([w, h, time]);
  const paint = new CK.Paint();
  paint.setShader(shader);
  canvas.drawRect(CK.LTRBRect(0, 0, w, h), paint);
  const img = surface.makeImageSnapshot();
  fs.writeFileSync(`out/${name}.png`, img.encodeToBytes());
  console.log(`✓ ${name}`);
}
