var loaderUtils = require('loader-utils');
var decode = require('./interface').decode;

module.exports = function() {
    return decode(loaderUtils.getOptions(this));
};
