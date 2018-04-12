const path = require('path');
const memoryfs = require('memory-fs');

module.exports = (webpack, fixture, loaderOptions = {}) => {

  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [{
        test: /\.marko$/,
        use: {
          loader: path.resolve(__dirname, '../src/index.js'),
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
