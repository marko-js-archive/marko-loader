/**
* @jest-environment node
*/

const webpack = require('webpack');
const compiler = require('./compiler.js');

jest.useFakeTimers();

test(`compile template`, async () => {
  const entryFile = './fixtures/example.marko';
  const stats = await compiler(webpack, entryFile);
  const statsJson = stats.toJson();

  const module = statsJson.modules.filter(m=>m.name.indexOf(entryFile)>-1)[0];
  expect(module).toBeDefined();

  const source = module.source;
  expect(source).toBeDefined();

  // ensure the style is included and the custom-style-loader from the webpack config is used
  expect(source).toContain(`require("!!custom-style-loader!../../src/code-loader.js?CODE=2e6578616d706c65207b0a20202020666f6e742d7765696768743a20626f6c643b0a20207d!./example.marko")`);

  // ensure the template compiles - only test some strings to avoid too tight a coupling to the compled output structure
  [
    'out.e("DIV", null, "0", component, 6)',
    '.t("1+1=")',
    '.t(2)',
    '.n(marko_node0, component)',
    '.t(" Eopc=")',
    '.t(Date.now())',
    '.n(marko_node1, component);'
  ].forEach(line => expect(source).toContain(line));
});

test(`compile template dependencies only`, async () => {
  const entryFile = './fixtures/example.marko';
  const stats = await compiler(webpack, entryFile + '?dependencies');
  const statsJson = stats.toJson();

  expect(statsJson.modules.map(m => m.name)).toEqual([
    "./fixtures/example.marko?dependencies",
    "./fixtures/components/test.marko?dependencies"
  ]);

  const module = statsJson.modules.filter(m=>m.name.indexOf(entryFile)>-1)[0];
  expect(module).toBeDefined();

  const source = module.source;
  expect(source).toBeDefined();

  // ensure the style is included and the custom-style-loader from the webpack config is used
  expect(source).toContain(`require("!!custom-style-loader!../../src/code-loader.js?CODE=2e6578616d706c65207b0a20202020666f6e742d7765696768743a20626f6c643b0a20207d!./example.marko")`);

  // ensure the tag dependency is included
  expect(source).toContain(`require("./components/test.marko?dependencies")`);

  // ensure the actual template code is not included
  [
    'out.e("DIV", null, "0", component, 6)',
    '.t("1+1=")',
    '.t(2)',
    '.n(marko_node0, component)',
    '.t(" Eopc=")',
    '.t(Date.now())',
    '.n(marko_node1, component);'
  ].forEach(line => expect(source).not.toContain(line));
});

test(`compile template hydrate`, async () => {
  const entryFile = './fixtures/example.marko';
  const stats = await compiler(webpack, entryFile + '?hydrate');
  const statsJson = stats.toJson();

  expect(statsJson.modules.map(m => m.name)).toEqual([
    "./fixtures/example.marko?hydrate",
    "./fixtures/example.marko?dependencies",
    "./fixtures/components/test.marko?dependencies"
  ]);

  const module = statsJson.modules.filter(m=>m.name.indexOf(entryFile)>-1)[0];
  expect(module).toBeDefined();

  const source = module.source;
  expect(source).toBeDefined();

  // ensure the tag dependency is included
  expect(source).toContain(`require("./example.marko?dependencies")`);

  // ensure the init code is included
  expect(source).toContain(`window.$initComponents`);

  // ensure the actual template code is not included
  [
    'out.e("DIV", null, "0", component, 6)',
    '.t("1+1=")',
    '.t(2)',
    '.n(marko_node0, component)',
    '.t(" Eopc=")',
    '.t(Date.now())',
    '.n(marko_node1, component);'
  ].forEach(line => expect(source).not.toContain(line));
});

test(`custom compiler`, async () => {
  const entryFile = './fixtures/example.marko';
  const loaderOptions = {
    compiler: require.resolve('./fixtures/custom-marko-compiler')
  };
  const stats = await compiler(webpack, entryFile, loaderOptions);
  const statsJson = stats.toJson();

  const module = statsJson.modules.filter(m=>m.name.indexOf(entryFile)>-1)[0];
  expect(module).toBeDefined();

  const source = module.source;
  expect(source).toBeDefined();

  // ensure the tag dependency is included
  expect(source).toEqual(`CUSTOM_COMPILED`);
});