# ng-closure-builder

AST builder to manipulate AngularJS files based in Google closure.

## Usage

```shell
npm install ng-closure-builder
```

```js
const Transformer = require('../lib/transformer');

const fileContents = fs.readFileSync('path', 'utf-8');
const transformed = new Transformer(fileContents)
    .injectConstructor('someService', 'foo.bar.SomeService', 'SomeService')
    .toString();

console.log(transformed);
```

## Functions

#### addGoogRequire(identifier, namespace)

Adds a goog.require at the top of the file.

```js
const <identifier> goog.require('<namespace>');
```

#### injectConstructor(injectableName, namespace, injectableType)

Adds an injectable to a constructor and a goog.require at the top

```js
const transformed = new Transformer(fileContents)
    .injectConstructor('someService', 'foo.bar.SomeService', 'SomeService')
    .toString();
```

Before:

```js
goog.module('foo.bar.SomeComponent');

class SomeComponent {
  /**
   * @ngInject
   */
  constructor() {
  }
}
```

After:

```js
goog.module('foo.bar.SomeComponent');

const SomeService = goog.require('foo.bar.SomeService');

class SomeComponent {
  /**
   * @param {!SomeService} someService
   * @ngInject
   */
  constructor(someService) {
    /** @private {!SomeService} */
    this.someService_ = someService;
  }
}
```
