const path = require('path');
const memoryfs = require('memory-fs');

module.exports = (webpack, entry, loaderOptions = {}) => {

  const compiler = webpack({
    context: __dirname,
    entry: entry,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    resolveLoader: {
      alias: {
        'marko-loader': path.resolve(__dirname, '../src/index.js')
      }
    },
    module: {
      rules: [{
        test: /\.marko$/,
        use: {
          loader: 'marko-loader',
          options: loaderOptions,
        }
      },
      {
        test: /\.(css)$/,
        use: [
          "custom-style-loader",
        ],
      }]
    }
  });

  compiler.outputFileSystem = new memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve(stats);
    });
  });
}
