var markoCompiler = require('marko/compiler');
var loaderUtils = require('loader-utils');

module.exports = function(source) {
    var query = loaderUtils.parseQuery(this.query);

    this.cacheable(false);

    if (query.target !== 'server' && markoCompiler.compileForBrowser) {
        var compiled = markoCompiler.compileForBrowser(source, this.resourcePath, {
    		writeToDisk: false
    	});
        return compiled.code;
    } else {
        return markoCompiler.compile(source, this.resourcePath, {
    		writeToDisk: false,
            requireTemplates: true
    	});
    }

};
