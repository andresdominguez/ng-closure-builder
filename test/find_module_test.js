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
    runFind('serviceOne');
  });

  it('should finds service in multiple lines', function() {
    runFind('serviceTwo');
  });

  it('should finds service with string in next line', function() {
    return runFind('serviceThree');
  });
});
