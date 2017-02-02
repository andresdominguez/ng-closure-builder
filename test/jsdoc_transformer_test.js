const assert = require('assert');
const JsDocTransformer = require('../lib/jsdoc_transformer');

describe('js doc transformer', function() {

  const comments = [
    '/**',
    ' * Hello world',
    ' * @param {string} foo',
    ' * @ngInject',
    ' */',
  ].join('\n');


  it('adds param', function() {
    const transformed = new JsDocTransformer(comments)
        .addParam('john', '!SomeJohn')
        .toString();

    assert.equal(transformed,
`/**
 * Hello world
 * @param {string} foo
 * @param {!SomeJohn} john
 * @ngInject
 */`);
  });

  it('adds first param', function() {
    // Given jsdoc without params.
    const comments = [
      '/**',
      ' * Some stuff',
      ' * @ngInject',
      ' */',
    ].join('\n');

    // When you add param.
    const transformed = new JsDocTransformer(comments)
        .addParam('john', '!SomeJohn')
        .toString();

    // Then ensure the param was added.
    assert.equal(transformed,
`/**
 * Some stuff
 * @param {!SomeJohn} john
 * @ngInject
 */`);
  });

  it('adds ngInject and param', function() {
    // Given jsdoc without params and ngInject.
    const comments = [
      '/**',
      ' * Some stuff',
      ' */',
    ].join('\n');

    // When you add param.
    const transformed = new JsDocTransformer(comments)
        .addParam('john', '!SomeJohn')
        .toString();

    // Then ensure the param was added and and @ngInject.
    assert.equal(transformed,
`/**
 * Some stuff
 * @param {!SomeJohn} john
 * @ngInject
 */`);
  });
});
