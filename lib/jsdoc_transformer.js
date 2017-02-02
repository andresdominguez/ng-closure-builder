const doctrine = require('doctrine');

class JSDocTransformer {
  constructor(comments) {
    this.comments_ = comments;
    this.ast = doctrine.parse(comments, {unwrap: true, lineNumbers: true});
  }

  addParam(name, type) {
    const lines = this.comments_.split('\n');
    const lineNumber = this.findInsertLineNumber();
    if (lineNumber === -1) {
      const insertLine = lines.length - 1;
      lines.splice(insertLine, 0, ' * @ngInject');
      lines.splice(insertLine, 0, ` * @param {${type}} ${name}`);
    } else {
      lines.splice(lineNumber, 0, ` * @param {${type}} ${name}`);
    }

    this.comments_ = lines.join('\n');
    return this;
  }

  findInsertLineNumber() {
    // No tags?
    if (!this.ast.tags.length) {
      return -1;
    }

    const params = this.ast.tags.filter(tag => tag.title === 'param');
    if (params.length) {
      return params.pop().lineNumber + 1;
    }

    // Put the param before the last tag.
    return this.ast.tags[this.ast.tags.length - 1].lineNumber;
  }

  toString() {
    return this.comments_;
  }
}

module.exports = JSDocTransformer;
