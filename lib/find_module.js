const exec = require('child_process').exec;
const path = require('path');
const findNs = require('./find_ns');

const last = lines => lines[lines.length - 1];

const defaultTypes = [
  'service',
  'component',
  'directive',
  'goog.module',
  'goog.provide',
  'factory',
];

/**
 * Results may contain multiple files. They are separated by '--'. Each file
 * contains 2 lines.
 * @param lines
 * @return {Array<{fileName: string, lines: string}>}
 */
const collectFileNamesAndText = lines => {
  // Group by file.
  const buckets = [];
  let currentBucket = [];
  lines.forEach(l => {
    if (l.startsWith('--')) {
      buckets.push(currentBucket);
      currentBucket = [];
    } else {
      currentBucket.push(l);
    }
  });
  if (currentBucket.length > 0) {
    buckets.push(currentBucket);
  }

  // The results look like:
  // file-name.js-   some text
  // file-name.js:   more text
  return buckets.map(b => {
    const lastLine = last(b);
    const colonIndex = lastLine.indexOf(':');
    const fileName = lastLine.substring(0, colonIndex);

    // Remove file name from each line and trim the rest.
    const lines = b.map(line => line.substring(colonIndex + 1).trim());
    return {fileName, lines: lines.join('')};
  });
};

/**
 *
 * @param {string} dir
 * @param {string} symbolName
 * @param {Array<string>} types
 * @return {Promise}
 */
const findFile = (dir, symbolName, types = defaultTypes) => {
  // Find the string containing the injectable. -B 1 returns one line of context
  // before.
  const grepCommand = `grep -r --include "*js" -B 1 '${symbolName}' ${dir}`;
  const notFoundError = `Unable to find "${symbolName}"`;

  console.log('Running find command:', grepCommand);

  return new Promise((resolve, reject) => exec(grepCommand, (error, stdout) => {
    if (error !== null) {
      console.log(notFoundError);
      return reject(error);
    }

    // Remove empty lines.
    const lines = stdout.split('\n').filter(line => Boolean(line));
    const buckets = collectFileNamesAndText(lines);

    for (let type of types) {
      const regExp = new RegExp(`${type}\\('${symbolName}`);
      const found = buckets.find(b => b.lines.match(regExp));
      if (found) {
        return resolve(found.fileName);
      }
    }

    reject(notFoundError);
  }));
};

const find = (dir, symbolName, type) => {
  return findFile(dir, symbolName, type).then(fileName => {
    const filePath = path.resolve(fileName);
    return findNs(filePath).then(ns => ({fileName, namespace: ns}));
  });
};

module.exports = find;
