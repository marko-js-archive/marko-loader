var markoCompiler = require('marko/compiler');
var loaderUtils = require('loader-utils');

var defaultLoaders = {
    'css':'style-loader!css-loader!'
}

module.exports = function(source) {
    var query = loaderUtils.parseQuery(this.query);
    var options = this.options;
    var module = options && options.module;
    var loaders = module && module.loaders || [];

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
                var loader = getLoaderMatch(virtualPath, loaders);
                var codeLoader = require.resolve('./code-loader');
                var codeQuery = JSON.stringify({ code:dependency.code });
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

function getLoaderMatch(path, loaders) {
    var loaderString;
    var ext;

    loaders.some(loader => {
        if(loader.test.test(path)) {
            loaderString = getLoaderString(loader.loader);
            return true;
        }
    });

    if (!loaderString) {
        ext = path.slice(path.lastIndexOf('.')+1);
        loaderString = getLoaderString(defaultLoaders[ext]);
    }

    return loaderString;
}

function getLoaderString(loader) {
    if (!loader) {
        return '';
    } else if (typeof loader === 'string') {
        return loader.slice(-1) === '!' ? loader : loader + '!';
    } else if (Array.isArray(loader)) {
        return loader.map(getLoaderString).join('');
    } else {
        var options = loader.options;
        var optionsString = options && (typeof options === 'string' ? options : JSON.stringify(options));
        return loader.loader + (optionsString ? '?' + optionsString : '') + '!';
    }
}
