'use strict';

var markoCompiler;
var loaderUtils = require('loader-utils');
var encode = require('./interface').encode;

var defaultLoaders = {
    'css':'style-loader!css-loader!'
};

var codeLoader = require.resolve('./code-loader');

module.exports = function(source) {
    const queryOptions = loaderUtils.getOptions(this);  // Not the same as this.options
    const target = queryOptions && queryOptions.target;
    const hydrate = queryOptions && queryOptions.hydrate;
    const module = this.options.module;
    const loaders = module && (module.loaders || module.rules) || [];

    loadMarkoCompiler();

    this.cacheable(false);

    if (target !== 'server' && markoCompiler.compileForBrowser) {
        var compiled = markoCompiler.compileForBrowser(source, this.resourcePath, {
            writeToDisk: false
        });

        var dependencies = compiled.dependencies.map((dependency, i) => {
            if (!dependency.code) {
                // external file, just require it
                return `require('${dependency.path.replace(/\\/g, "\\\\")}');`;
            } else {
                // inline content, we'll create a
                var virtualPath = dependency.virtualPath;
                var loader = getLoaderMatch(virtualPath, loaders);
                var codeQuery = encode(dependency.code);
                var loaderString = loaderUtils.stringifyRequest(this, `!!${loader}${codeLoader}?${codeQuery}!${this.resourcePath}`);
                return `require(${loaderString})`;
            }
        });

        if (!hydrate) {
            dependencies = dependencies.concat(compiled.code);
        }

        return dependencies.join('\n');
    } else {
        return markoCompiler.compile(source, this.resourcePath, {
            writeToDisk: false,
            requireTemplates: true
        });
    }
};

function loadMarkoCompiler() {
    if (markoCompiler) return;

    var markoCompilerPath;

    try {
        markoCompilerPath = require.resolve('marko/compiler');
    } catch(e) {
        throw new Error('Cannot resolve `marko`. Marko should be installed as a dependency of your project.')
    }

    markoCompiler = require(markoCompilerPath);
}

function getLoaderMatch(path, loaders) {
    var loaderString;
    var ext;

    loaders.some(loader => {
        if(loader.test.test(path)) {
            loaderString = getLoaderString(loader.use || loader.loader);
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
