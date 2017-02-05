const fs = require('fs');
const path = require('path');
const test = require('ava');
const Transformer = require('../lib/transformer');

const initialModule =
      `goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

exports = FooBarModule;`;

test('adds goog.require', t => {
  const transformed = new Transformer(initialModule)
        .addGoogRequire('Andres', 'foo.bar.Andres')
        .toString();

  t.is(transformed,
        `goog.module('foo.bar.FooBarModule');

const Andres = goog.require('foo.bar.Andres');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

exports = FooBarModule;`);
});

test('adds module dep', t => {
  const transformed = new Transformer(initialModule)
          .addModule('AndresModule')
          .toString();

  t.is(transformed,
          `goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', [AndresModule.name]);

exports = FooBarModule;`);
});

test('throws when module not found', t => {
  t.throws(() => {
    new Transformer('').addModule('foo');
  }, 'Cannot find angular module in file');
});

test('adds service', t => {
  const transformed = new Transformer(initialModule)
          .addService('someStuff', 'SomeStuff', 'foo.bar.SomeStuff')
          .toString();

  t.is(transformed,
          `goog.module('foo.bar.FooBarModule');

const SomeStuff = goog.require('foo.bar.SomeStuff');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.service('someStuff', SomeStuff);

exports = FooBarModule;`);
});

test('adds component', t => {
  const transformed = new Transformer(initialModule)
          .addComponent('someComp', 'SomeComp', 'foo.bar.SomeComp')
          .toString();

  t.is(transformed, `goog.module('foo.bar.FooBarModule');

const SomeComp = goog.require('foo.bar.SomeComp');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.component('someComp', SomeComp);

exports = FooBarModule;`);
});

test('adds constructor argument', t => {
  const code = [
    'class Foo {',
    '  /**',
    '   * Hello world.',
    '   * @ngInject',
    '   */',
    '  constructor() {',
    '  }',
    '}'
  ].join('\n');

  const transformed = new Transformer(code)
        .addConstructorParam('abc', 'Andres')
        .toString();

  t.is(transformed,
        `class Foo {
  /**
   * Hello world.
   * @param {Andres} abc
   * @ngInject
   */
  constructor(abc) {
   /** @private {Andres} */
   this.abc_ = abc;
  }
}`);
});

test('assigns variable at the top', t => {
  const code = `class Foo {
  /**
   * Hello world.
   * @param {Andres} abc
   * @ngInject
   */
  constructor(abc) {
   this.abc_ = abc;
  }
}`;

  const transformed = new Transformer(code)
        .addConstructorParam('def', 'Juan')
        .toString();

  t.is(transformed,
        `class Foo {
  /**
   * Hello world.
   * @param {Andres} abc
   * @param {Juan} def
   * @ngInject
   */
  constructor(abc, def) {
   /** @private {Juan} */
   this.def_ = def;

   this.abc_ = abc;
  }
}`);
});

const readFile = function(fileName) {
  const filePath = path.join(__dirname, '..', 'testdata', fileName);
  return fs.readFileSync(filePath, 'utf-8');
};

test('adds goog.require and injects constructor', t => {
  const after = readFile('file-after.js');

  const transformed = new Transformer(readFile('file-before.js'))
        .injectConstructor('someService', 'foo.bar.SomeService', 'SomeService')
        .toString();

  t.is(transformed, after);
});

