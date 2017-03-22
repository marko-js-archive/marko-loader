var markoCompiler = require('marko/compiler');
// for way 1
// var fs = 'fs'

// for way 2
var VirtualStats  = require('./virtual-stats');

function patchPath(path) { //for windows platform
  return path.replace(/\\/g, '\\\\');
}

module.exports = function(source) {
  this.cacheable();
  if (this.options.target === 'web') {
    var compiled = markoCompiler.compileForBrowser(source, this.resourcePath, {
      writeToDisk: false
    });

    var dependencies = compiled.dependencies.map((dependency, i) => {
      if (dependency.code) {
        //way 1: write file to dist, then require
        //fs.writeFileSync(dependency.virtualPath, dependency.code, 'utf8')

        //way 2: add virtual file to compiler, then require
        var now = new Date().toString();
        var options = {
          dev: 8675309,
          nlink: 1,
          uid: 501,
          gid: 20,
          rdev: 0,
          blksize: 4096,
          ino: 44700000,
          mode: 33188,
          size: dependency.code.length,
          atime: now,
          mtime: now,
          ctime: now,
          birthtime: now,
        };
        this._compiler.inputFileSystem._statStorage.data[dependency.virtualPath] = [null, new VirtualStats(options)];
        this._compiler.inputFileSystem._readFileStorage.data[dependency.virtualPath] = [null, dependency.code];
        //add reuqire() in compiled file
        var modulePath = patchPath(dependency.virtualPath);
        return `require('${modulePath}');`;
      } else if (dependency.type !== 'require') {
        // external file, just require it
        var modulePath = patchPath(dependency.path)
        return `require('${modulePath}');`;
      } else { //ignore self
        return '';
      }
    });
    return dependencies.concat(compiled.code).join('\n');
  } else { //node and others
    return markoCompiler.compile(source, this.resourcePath, {
      writeToDisk: false
    });
  }
};
