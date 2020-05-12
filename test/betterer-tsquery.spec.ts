import { betterer } from '@betterer/betterer';

import { fixture } from './fixture';

describe('betterer', () => {
  it('should report the existence of TSQuery matches', async () => {
    const { logs, paths, readFile, reset, resolve, writeFile } = fixture('test-betterer-tsquery');

    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const indexPath = resolve('./src/index.ts');

    await reset();

    await writeFile(indexPath, `console.log('foo');`);

    const newTestRun = await betterer({ configPaths, resultsPath });

    expect(newTestRun.new).toEqual(['tsquery no raw console.log']);

    const sameTestRun = await betterer({ configPaths, resultsPath });

    expect(sameTestRun.same).toEqual(['tsquery no raw console.log']);

    await writeFile(indexPath, `console.log('foo');\nconsole.log('foo');`);

    const worseTestRun = await betterer({ configPaths, resultsPath });

    expect(worseTestRun.worse).toEqual(['tsquery no raw console.log']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    await writeFile(indexPath, ``);

    const betterTestRun = await betterer({ configPaths, resultsPath });

    expect(betterTestRun.better).toEqual(['tsquery no raw console.log']);

    const completedTestRun = await betterer({ configPaths, resultsPath });

    expect(completedTestRun.completed).toEqual(['tsquery no raw console.log']);

    expect(logs).toMatchSnapshot();

    await reset();
  });

  it('should throw if there is no configFilePath', async () => {
    const { paths, logs, reset } = fixture('test-betterer-tsquery-no-config-file-path');

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await reset();

    await expect(async () => await betterer({ configPaths, resultsPath })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await reset();
  });

  it('should throw if there is no query', async () => {
    const { paths, logs, reset } = fixture('test-betterer-tsquery-no-query');

    const configPaths = [paths.config];
    const resultsPath = paths.results;

    await reset();

    await expect(async () => await betterer({ configPaths, resultsPath })).rejects.toThrow();

    expect(logs).toMatchSnapshot();

    await reset();
  });
});