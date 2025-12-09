import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

async function main() {
  const pkg = require('../../package.json');

  const commandAdd = `git add .`;
  const commandCommit = `git commit -am "chore(release): release v${pkg.version}"`;
  try {
    await execSync(commandAdd, { stdio: 'inherit' });
    await execSync(commandCommit, { stdio: 'inherit' });
  } catch (ex) {
    globalThis.console.error(ex);
  }
}

main();
