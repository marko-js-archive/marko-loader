var markoCompiler = require('marko/compiler');
var loaderUtils = require('loader-utils');
var path = require('path');
var RuleSet = require('./RuleSet');

var defaultLoaders = {
    '.css':'style-loader!css-loader!'
}

module.exports = function(source) {
    var query = loaderUtils.parseQuery(this.query);
    var options = this.options;
    var module = options && options.module || {};
    var ruleSet = new RuleSet((module.rules || []).concat(module.loaders || []))

    this.cacheable(false);

    if (query.target !== 'server' && markoCompiler.compileForBrowser) {
        var compiled = markoCompiler.compileForBrowser(source, this.resourcePath, {
    		writeToDisk: false
    	});

        var dependencies = compiled.dependencies.map((dependency, i) => {
            if (!dependency.code) {
                // external file, just require it
                return `require('${dependency.path.replace(/\\/g, "\\\\")}');`
            } else {
                // inline content, we'll create a
                var virtualPath = dependency.virtualPath;
                var ext = path.parse(virtualPath).ext;

                var loaders = ruleSet.exec({resource: virtualPath});
                var loader = loaders.length ? `${loaders.map(l => l.value.loader).join('!')}!` : defaultLoaders[ext];
                var codeLoader = require.resolve('./code-loader');
                var codeQuery = JSON.stringify({ code: dependency.code });
                var loaderString = loaderUtils.stringifyRequest(this, `!!${loader}${codeLoader}?${codeQuery}!${this.resourcePath}`);
                return `require(${loaderString})`;
            }
        })

        return dependencies.concat(compiled.code).join('\n');
    } else {
        return markoCompiler.compile(source, this.resourcePath, {
    		writeToDisk: false,
            requireTemplates: true
    	});
    }
};
