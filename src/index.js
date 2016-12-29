var markoCompiler = require('marko/compiler');

module.exports = function(source) {
    this.cacheable(false);

    if (markoCompiler.compileForBrowser) {
        return markoCompiler.compileForBrowser(source, this.resourcePath, {
    		writeToDisk: false
    	});
    } else {
        return markoCompiler.compile(source, this.resourcePath, {
    		writeToDisk: false
    	});
    }

};
