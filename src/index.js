'use strict';

var path = require('path');
var markoCompiler = require('marko/compiler');
var loaderUtils = require('loader-utils');
var encode = require('./interface').encode;

var defaultLoaders = {
    'css':'style-loader!css-loader!'
};

var codeLoader = require.resolve('./code-loader');

module.exports = function(source) {
    const queryOptions = loaderUtils.getOptions(this);  // Not the same as this.options
    const target = normalizeTarget((queryOptions && queryOptions.target) || this.target);
    const dependenciesOnly = queryOptions && queryOptions.dependencies;
    const hydrate = queryOptions && queryOptions.hydrate;

    const module = this.options ? this.options.module : this._compilation.options.module;
    const loaders = module && (module.loaders || module.rules) || [];

    this.cacheable(false);

    if (hydrate) {
        return (`
            require(${JSON.stringify(`!!marko-loader?dependencies!./${path.basename(this.resourcePath)}`)});
            window.$initComponents && window.$initComponents();
        `);
    } else if (target !== 'server' && markoCompiler.compileForBrowser) {
        const { code, meta } = markoCompiler.compileForBrowser(source, this.resourcePath, {
            writeToDisk: false
        });

        let dependencies = [];

        if (dependenciesOnly && meta.component) {
            dependencies = dependencies.concat(`
                require('marko/components').register(
                    ${JSON.stringify(meta.id)},
                    require(${JSON.stringify(meta.component)})
                );
            `);
        } 

        if (meta.deps) {
            dependencies = dependencies.concat(meta.deps.map(dependency => {
                if (!dependency.code) {
                    // external file, just require it
                    return `require(${JSON.stringify(dependency.path)});`;
                } else {
                    // inline content, we'll create a
                    var virtualPath = dependency.virtualPath;
                    var loader = getLoaderMatch(virtualPath, loaders);
                    var codeQuery = encode(dependency.code);
                    var loaderString = loaderUtils.stringifyRequest(this, `!!${loader}${codeLoader}?${codeQuery}!${this.resourcePath}`);
                    return `require(${loaderString})`;
                }
            }));
        }

        if (dependenciesOnly && meta.tags) {
            // we need to also include the dependencies of
            // any tags that are used by this template
            dependencies = dependencies.concat(meta.tags.map(tagPath => {
                const loader = '!!marko-loader?dependencies!';
                return `require(${JSON.stringify(loader+tagPath)});`;
            }));
        }

        if (!dependenciesOnly) {
            dependencies = dependencies.concat(code);
        }

        return dependencies.join('\n');
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

function normalizeTarget (target) {
    switch (target) {
      case 'server':
      case 'node':
      case 'async-node':
      case 'atom':
      case 'electron':
      case 'electron-main':
        return 'server';
      default:
        return 'browser';
    }
}
