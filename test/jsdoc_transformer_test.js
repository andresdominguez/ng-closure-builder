const test = require('ava');
const JsDocTransformer = require('../lib/jsdoc_transformer');

const comments = [
  '/**',
  ' * Hello world',
  ' * @param {string} foo',
  ' * @ngInject',
  ' */',
].join('\n');

test('adds param', (t) => {
  const transformed = new JsDocTransformer(comments)
      .addParam('john', '!SomeJohn')
      .toString();

  t.is(transformed,
      `/**
 * Hello world
 * @param {string} foo
 * @param {!SomeJohn} john
 * @ngInject
 */`);
});

test('adds first param', (t) => {
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
  t.is(transformed,
      `/**
 * Some stuff
 * @param {!SomeJohn} john
 * @ngInject
 */`);
});

test('adds ngInject and param', (t) => {
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
  t.is(transformed,
      `/**
 * Some stuff
 * @param {!SomeJohn} john
 * @ngInject
 */`);
});

