const niv = require('npm-install-version');
const compiler = require('./compiler.js');

jest.useFakeTimers();

function testWebpackVersion(version) {

  test(`webpack ${version}`, async () => {

    let npmWepackVersion = `webpack@${version}`
    niv.install(npmWepackVersion);

    const webpack = niv.require(npmWepackVersion);

    const markoFileName = 'example.marko';
    const stats = await compiler(webpack, markoFileName);
    const statsJson = stats.toJson();

    const module = statsJson.modules.filter(m=>m.name.indexOf(markoFileName)>-1)[0];
    expect(module).toBeDefined();

    const source = module.source;
    expect(source).toBeDefined();

    // debugger
    // console.log(source)

    /// ensure the custom-style-loader is extracted from the webpack config
    expect(source).toContain(`require("!!custom-style-loader!../src/code-loader.js?CODE=2e6578616d706c65207b0a20202020666f6e742d7765696768743a20626f6c643b0a20207d!./example.marko")`);

    // ensure the template compules - only test some strings to avoid too tight a coupling to the compled output structure
    [
      'out.e("DIV", null, "0", component, 6)',
      '.t("1+1=")',
      '.t(2)',
      '.n(marko_node0, component)',
      '.t(" Eopc=")',
      '.t(Date.now())',
      '.n(marko_node1, component);'
    ].forEach(line => expect(source).toContain(line))

  });
}
["3.11.0", "4.2.0"].forEach(testWebpackVersion)
