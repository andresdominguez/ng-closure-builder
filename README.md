# ng-closure-builder

AST builder to manipulate AngularJS files based in Google closure.

It is designed to manipulate angular modules and ES6 classes written with
Google's closure compiler.

## Installation

```shell
npm install ng-closure-builder
```

## Usage

This library exposes a Transformer class that receives the contents of a
JavaScript file. You can chain multiple calls and when you are done call
toString() to get the transformed file.

# ES6 classes

```js
const Transformer = require('../lib/transformer');

const fileContents = fs.readFileSync('path', 'utf-8');
const transformed = new Transformer(fileContents)
    .injectConstructor('someService', 'foo.bar.SomeService', 'SomeService')
    .toString();

console.log(transformed);
```

## Functions

### addGoogRequire(identifier, namespace)

Adds a goog.require at the top of the file.

```js
const <identifier> goog.require('<namespace>');
```

### injectConstructor(injectableName, namespace, injectableType)

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

# Angular modules

### addModule(moduleName)

Adds an angular module as a dependency to the current module. Use it with
addGoogRequire() to import the module dependency.

```js
const transformed = new Transformer(fileContents)
    .addGoogRequire('AndresModule', 'foo.bar.AndresModule')
    .addModule('AndresModule')
    .toString();
```

Before:

```js
goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);
```

After:

```js
goog.module('foo.bar.FooBarModule');

const AndresModule = goog.require('foo.bar.AndresModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', [AndresModule.name]);
```

### addService(serviceName, className, namespace)

Adds a service to the module along with the goog.require for the service class.

```js
const transformed = new Transformer(initialModule)
    .addService('someService', 'SomeService', 'foo.bar.SomeService')
    .toString();
```

Before:

```js
goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);
```

After:

```js
goog.module('foo.bar.FooBarModule');

const SomeService = goog.require('foo.bar.SomeService');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.service('someService', SomeService);
```
