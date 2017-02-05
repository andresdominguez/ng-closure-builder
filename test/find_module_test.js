const assert = require('assert');
const path = require('path');
const findModule = require('./find_module');

describe('Find module', () => {
  const dir = path.join(__dirname, '..', 'testdata');

  const runFind = function(symbolName) {
    return findModule(dir, symbolName).then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  };

  it('finds service with module on same line', () => {
    const symbolName = 'serviceOne';
    return findModule(dir, symbolName).then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  });

  it('should finds service in multiple lines', function() {
    const symbolName = 'serviceTwo';
    return findModule(dir, symbolName).then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  });

  it('should finds service with string in next line', function() {
    const symbolName = 'serviceThree';
    return runFind(symbolName);
  });
});
