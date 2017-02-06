const path = require('path');
const test = require('ava');
const findModule = require('../lib/find_module');

const dir = path.join(__dirname, '..', 'testdata');

test('finds service with module on same line', async t => {
  const result = await findModule(dir, 'serviceOne');
  t.regex(result.fileName, /module-with-service.js/);
  t.is(result.namespace, 'foo.bar.FooBarModule');
});

test('finds service in multiple lines', async t => {
  const result = await findModule(dir, 'serviceOne');
  t.regex(result.fileName, /module-with-service.js/);
  t.is(result.namespace, 'foo.bar.FooBarModule');
});

test('finds service with string in next line', async t => {
  const result = await findModule(dir, 'serviceOne');
  t.regex(result.fileName, /module-with-service.js/);
  t.is(result.namespace, 'foo.bar.FooBarModule');
});

test('finds component', async t => {
  const result = await findModule(dir, 'compOne');
  t.regex(result.fileName, /module-with-service.js/);
  t.is(result.namespace, 'foo.bar.FooBarModule');
});

test('rejects promise when not found', async t => {
  t.throws(findModule(dir, 'nonExistent'));
});
