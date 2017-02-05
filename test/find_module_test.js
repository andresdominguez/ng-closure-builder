const assert = require('assert');
const path = require('path');
const findModule = require('./find_module');

describe('Find module', () => {
  const dir = path.join(__dirname, '..', 'testdata');

  it('finds service with module on same line', () => {
    return findModule(dir, 'serviceOne').then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  });

  it('should finds service in multiple lines', function() {
    return findModule(dir, 'serviceTwo').then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  });

  it('should finds service with string in next line', function() {
    return findModule(dir, 'serviceThree').then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  });
});
