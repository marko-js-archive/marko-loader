var markoCompiler = require('marko/compiler');

module.exports = function(source) {
    this.cacheable(false);

    if (markoCompiler.compileForBrowser) {
        var compiled = markoCompiler.compileForBrowser(source, this.resourcePath, {
    		writeToDisk: false
    	});
        return compiled.code;
    } else {
        return markoCompiler.compile(source, this.resourcePath, {
    		writeToDisk: false
    	});
    }

};
