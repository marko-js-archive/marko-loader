var marko = require('marko/compiler');

module.exports = function (source) {
    this.cacheable(false);
    
	return marko.compile(source, this.resourcePath, {
		writeToDisk: false
	});
};
