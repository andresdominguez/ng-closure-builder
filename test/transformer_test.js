const Transformer = require('../lib/transformer');
const assert = require('assert');

describe('Transformer', function() {

  const initalModule = [
    `goog.module('foo.bar.FooBarModule');`,
    ``,
    `const FooBarModule = angular.module('foo.bar.FooBarModule', []);`,
    ``,
    `exports = FooBarModule;`,
  ].join('\n');

  it('adds goog.require', function() {
    const transformed = new Transformer(initalModule)
        .addGoogRequire('Andres', 'foo.bar.Andres')
        .toString();

    assert.equal(transformed,
        `goog.module('foo.bar.FooBarModule');

const Andres = goog.require('foo.bar.Andres');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

exports = FooBarModule;`);
  });


  it('adds module dep', function() {
    const transformed = new Transformer(initalModule)
        .addModule('AndresModule')
        .toString();

    assert.equal(transformed,
        `goog.module('foo.bar.FooBarModule');

const FooBarModule = angular.module('foo.bar.FooBarModule', [AndresModule.name]);

exports = FooBarModule;`);
  });

  it('adds service', function() {
    const transformed = new Transformer(initalModule)
        .addService('someStuff', 'SomeStuff', 'foo.bar.SomeStuff')
        .toString();

    assert.equal(transformed,
        `goog.module('foo.bar.FooBarModule');

const SomeStuff = goog.require('foo.bar.SomeStuff');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.service('someStuff', SomeStuff);

exports = FooBarModule;`);
  });

  it('adds constructor argument', function() {
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
   this.abc_ = abc;
  }
}`);
  });

  it('assigns variable at the top', function() {
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
   this.def_ = def;
   this.abc_ = abc;
  }
}`);
  });
});
