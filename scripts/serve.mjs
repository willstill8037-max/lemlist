// Live preview: node scripts/serve.mjs [--port 8080]
// then open http://127.0.0.1:8080/  (space = play, arrows = step, scene menu = jump)
import { startServer } from './lib/server.mjs';

const i = process.argv.indexOf('--port');
const port = i > 0 ? +process.argv[i + 1] : 8080;
const { port: p } = await startServer({ port, quiet: false });
console.log(`preview: http://127.0.0.1:${p}/   (render mode: http://127.0.0.1:${p}/src/index.html?render=1&f=0)`);
