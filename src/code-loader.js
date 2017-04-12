var loaderUtils = require('loader-utils');

module.exports = function() {
    var query = loaderUtils.parseQuery(this.query);
    return query.code.replace(/\/n/g, '\n');
};
