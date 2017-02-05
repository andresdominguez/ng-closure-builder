const fs = require('fs');
const pify = require('pify');

/**
 * Finds the namespace declared in a goog.module inside a file.
 * @param {string} filePath
 * @return {Promise<string>}
 */
const findNs = filePath => {
  const newVar = pify(fs.readFile)(filePath, 'utf8');

  return newVar.then(data => {
    const match = data.match(/goog\.module\(["'](.*)["']/);
    if (match !== null) {
      return match[1];
    }
    return Promise.reject('Cannot find goog.module in file ' + filePath);
  });
};

module.exports = findNs;
