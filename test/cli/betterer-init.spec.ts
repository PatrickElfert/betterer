import { init } from '@betterer/cli';

import { fixture } from '../fixture';

const ARGV = ['node', './bin/betterer'];

describe('betterer cli', () => {
  it('should initialise betterer in a repo', async () => {
    const { paths, readFile, reset, resolve } = initFixture();

    const configPath = `${paths.config}.ts`;
    const fixturePath = paths.fixture;
    const packageJSONPath = resolve('./package.json');

    await reset();

    await init(fixturePath, ARGV);

    const packageJSON = JSON.parse(await readFile(packageJSONPath));

    expect(packageJSON.scripts.betterer).toEqual('betterer');
    expect(packageJSON.devDependencies['@betterer/cli']).toBeDefined();

    const config = await readFile(configPath);

    expect(config).toEqual('export default {\n  // Add tests here ☀️\n};');

    await reset();
  });

  it('should work multiple times', async () => {
    const { paths, reset } = initFixture();

    const fixturePath = paths.fixture;

    await reset();

    let throws = false;
    try {
      await init(fixturePath, ARGV);
      await init(fixturePath, ARGV);
      await reset();
    } catch {
      throws = true;
    }

    expect(throws).toBe(false);
  });
});

function initFixture(): ReturnType<typeof fixture> {
  const init = fixture('test-betterer-init');
  const { deleteFile, paths, readFile, writeFile, reset, resolve } = init;
  const packageJSONPath = resolve('./package.json');
  async function initReset(): Promise<void> {
    await reset();
    try {
      await deleteFile(`${paths.config}.ts`);
    } catch {
      // Moving on...
    }
    try {
      const packageJSON = JSON.parse(await readFile(packageJSONPath));
      delete packageJSON.scripts;
      delete packageJSON.devDependencies;
      const json = JSON.stringify(packageJSON, null, 2);
      await writeFile(packageJSONPath, json);
    } catch {
      // Moving on...
    }
  }
  return { ...init, reset: initReset };
}