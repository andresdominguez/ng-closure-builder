# ng-closure-builder

AST builder to manipulate AngularJS files based in Google closure.

## Usage

```shell
npm install ng-closure-builder
```

```js
const Transformer = require('../lib/transformer');

const transformed = new Transformer(readFile('file-before.js'))
    .injectConstructor('someService', 'foo.bar.SomeService', 'SomeService')
    .toString();

console.log(transformed);
```

## Functions

addGoogRequire(identifier, namespace)

Adds a goog.require at the top of the file.

```js
const <identifier> goog.require('<namespace>');
```

