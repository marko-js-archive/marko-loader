'use strict';

const Buffer = require('buffer').Buffer;

const KEY = 'CODE';

function encodeAsHexString(string) {
    return Buffer.from(string).toString('hex');
}

function decodeHexString(string) {
    return Buffer.from(string, 'hex').toString();
}

module.exports = {
  encode: function(code) {
    return `${KEY}=${encodeAsHexString(code)}`;
  },

  decode: function(loaderOptions) {
    return decodeHexString(loaderOptions[KEY]);
  }
};

