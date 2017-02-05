const path = require('path');
const test = require('ava');
const nsFinder = require('../lib/ns_finder');

test('finds namespace', t => {
  const filePath =
      path.join(__dirname, '..', 'testdata', 'module-with-service.js');
  return nsFinder(filePath).then(found => t.is(found, 'foo.bar.FooBarModule'));
});

test('rejects promise when no goog.module is present', async t => {
  const filePath =
      path.join(__dirname, '..', 'testdata', 'random-module.js');
  const error = await t.throws(nsFinder(filePath));
  t.regex(error, /Cannot find goog.module in file/);
});
