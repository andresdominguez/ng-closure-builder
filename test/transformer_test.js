const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Transformer = require('../lib/transformer');

describe('Transformer', () => {
  const initialModule =
`goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

exports = FooBarModule;`;

  it('adds goog.require', () => {
    const transformed = new Transformer(initialModule)
        .addGoogRequire('Andres', 'foo.bar.Andres')
        .toString();

    assert.equal(transformed,
        `goog.module('foo.bar.FooBarModule');

const Andres = goog.require('foo.bar.Andres');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

exports = FooBarModule;`);
  });

  describe('Modules', () => {
    it('adds module dep', () => {
      const transformed = new Transformer(initialModule)
          .addModule('AndresModule')
          .toString();

      assert.equal(transformed,
          `goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', [AndresModule.name]);

exports = FooBarModule;`);
    });

    it('adds service', () => {
      const transformed = new Transformer(initialModule)
          .addService('someStuff', 'SomeStuff', 'foo.bar.SomeStuff')
          .toString();

      assert.equal(transformed,
          `goog.module('foo.bar.FooBarModule');

const SomeStuff = goog.require('foo.bar.SomeStuff');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.service('someStuff', SomeStuff);

exports = FooBarModule;`);
    });

    it('adds component', () => {
      const transformed = new Transformer(initialModule)
          .addComponent('someComp', 'SomeComp', 'foo.bar.SomeComp')
          .toString();

      assert.equal(transformed, `goog.module('foo.bar.FooBarModule');

const SomeComp = goog.require('foo.bar.SomeComp');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.component('someComp', SomeComp);

exports = FooBarModule;`);
    });
  });

  it('adds constructor argument', () => {
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

    assert.equal(transformed,
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

  it('assigns variable at the top', () => {
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

    assert.equal(transformed,
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
    return fs.readFileSync(path.join(__dirname, fileName), 'utf-8');
  };

  it('adds goog.require and injects constructor', () => {
    const after = readFile('file-after.js');

    const transformed = new Transformer(readFile('file-before.js'))
        .injectConstructor('someService', 'foo.bar.SomeService', 'SomeService')
        .toString();

    assert.equal(transformed, after);
  });
});
