const recast = require("recast");
const b = recast.types.builders;
const JsDocTransformer = require('./jsdoc_transformer');

class Transformer {
  constructor(fileContents) {
    this.ast = recast.parse(fileContents);
  }

  /**
   * @param identifier
   * @param namespace
   * @return {Transformer}
   */
  addGoogRequire(identifier, namespace) {
    const body = this.ast.program.body;
    body.splice(1, 0, this.buildGoogRequire(identifier, namespace));
    return this;
  }

  addConstructorParam(identifier, type) {
    const path = this.findConstructor();
    if (path) {
      path.get('value')
          .get('params')
          .push(b.identifier(identifier));
    }
    path.node.comments[0].value = this.injectJsDoc(path, identifier, type);

    return this;
  }

  injectJsDoc(path, identifier, type) {
    // Remove the first two spaces of each line.
    const formattedJsDoc = path.node.comments[0].value
        .split('\n')
        .map(line => line.replace(/^  /, ''))
        .join('\n');

    return new JsDocTransformer(formattedJsDoc)
        .addParam(identifier, type)
        .toString();
  }

  findConstructor() {
    let constructorMethodDefinition = null;

    recast.visit(this.ast, {
      visitMethodDefinition: function(path) {
        if (path.value.kind === 'constructor') {
          constructorMethodDefinition = path;
          return false;
        }
        this.traverse(path);
      }
    });

    return constructorMethodDefinition;
  }

  /**
   *
   * @param serviceName
   * @param className
   * @param namespace
   * @return {Transformer}
   */
  addService(serviceName, className, namespace) {
    this.addGoogRequire(className, namespace);

    const angularModule = this.findAngularModule();

    const id = angularModule.parent.get('id');
    const expressionStatement = b.expressionStatement(
        b.callExpression(
            // <moduleName>.service(...)
            b.memberExpression(id.node, b.identifier('service')),
            // ('<serviceName>', <className>)
            [b.literal(serviceName), b.identifier(className)]
        )
    );
    angularModule.parent.parent.insertAfter(expressionStatement);
    return this;
  }

  /**
   * @param moduleName
   * @return {Transformer}
   */
  addModule(moduleName) {
    // Find the call expression to get the array of dependencies in the
    // angular.module('abc, [<this array>]).
    this.findAngularModule()
        .get('arguments', 1)
        .get('elements')
        .push(this.newMemberExpression(moduleName, 'name'));

    return this;
  }

  /**
   * Creates const <identifier> = goog.require('<namespace>');
   * @param identifier
   * @param namespace
   * @return {*}
   */
  buildGoogRequire(identifier, namespace) {
    return b.variableDeclaration('const', [
      b.variableDeclarator(b.identifier(identifier),
          b.callExpression(
              this.newMemberExpression('goog', 'require'),
              [b.literal(namespace)]
          )
      )
    ]);
  }

  /**
   * Returns the call expression for the angular module.
   * @return {*}
   */
  findAngularModule() {
    let angularModulePath = null;

    recast.visit(this.ast, {
      lastIdentifier: null,
      visitIdentifier: function(path) {
        const name = path.value.name;

        // Look for two consecutive identifiers: angular.module
        if (this.visitor.lastIdentifier === 'angular' && name === 'module') {
          angularModulePath = path.parent.parent;
          return false;
        }
        this.visitor.lastIdentifier = name;
        this.traverse(path);
      }
    });

    return angularModulePath;
  }

  /**
   * Creates member expressions with multiple identifiers. e.g. goog.require,
   * angular.module, etc.
   * @param identifiers
   * @return {*}
   */
  newMemberExpression(...identifiers) {
    return b.memberExpression.apply(null, identifiers.map(b.identifier));
  }

  toString() {
    return recast.print(this.ast, {quote: 'single'}).code;
  }
}

module.exports = Transformer;
