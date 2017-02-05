const path = require('path');
const test = require('ava');
const findModule = require('../lib/find_module');

const dir = path.join(__dirname, '..', 'testdata');

const runFind = function(t, symbolName) {
  return findModule(dir, symbolName, 'service')
      .then(({fileName, namespace}) => {
        t.true(fileName.indexOf('module-with-service.js') !== -1);
        t.is(namespace, 'foo.bar.FooBarModule');
      });
};

test('finds service with module on same line', t => {
  return runFind(t, 'serviceOne');
});

test('should finds service in multiple lines', t => {
  return runFind(t, 'serviceTwo');
});

test('should finds service with string in next line', t => {
  return runFind(t, 'serviceThree');
});
