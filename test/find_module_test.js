const assert = require('assert');
const path = require('path');
const findModule = require('./find_module');

describe('Find module', () => {
  it('finds service with module on same line', () => {
    const dir = path.join(__dirname, '..', 'testdata');
    return findModule(dir, 'serviceOne').then(fileName => {
      assert(fileName.indexOf('module-with-service.js') !== -1,
          'File not found');
    });
  });
});
