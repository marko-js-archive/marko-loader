marko-loader
============

A [marko](http://markojs.com/) template loader for [webpack](https://github.com/webpack/webpack).

# Installation

Install required packages:

```bash
npm install marko --save
npm install marko-loader --save
```

And then register the marko loader in your webpack configuration file:

_webpack.config.js:_

```javascript
const options = {
	// ...
	module: {
		loaders:[
			{ test: /\.marko$/, loader: 'marko-loader' }
		]
	}
};

module.exports = options;
```

# Usage

With this loader installed, you can then require `./template.marko` files as shown below:

_./template.marko:_

```xml
<div>
    <h1>Hello ${data.name}!</h1>
</div>
```

_./index.js:_

```javascript
var template = require('./template.marko')
var html = template.renderToString({ name: 'Frank' });
```

# Additional resources

- Sample app: [github.com/marko-js-samples/marko-webpack]()

# License

MIT