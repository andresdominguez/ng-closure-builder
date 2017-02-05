const recast = require('recast');
const JsDocTransformer = require('./jsdoc_transformer');

const b = recast.types.builders;

class Transformer {
  /**
   * Pass the contents of the file to initialize it.
   * @param {string} fileContents
   */
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

  /**
   * Adds an injectable to a constructor. Adds the following:
   *
   * 1. An argument to the constructor.
   * 2. A @param tag
   * 3. A private instance variable: this.injectable_ = injectable;
   * 4. A goog.require at the top of the file.
   *
   * goog.module('abc);
   *
   * const <injectableType> = goog.require(<namespace>) // [4]
   *
   * class Foo {
   *
   *   param {!<injectableType>} <injectableName> // [2]
   *   constructor(<injectableName>) {
   *     private {!<injectableType>}
   *     this.<injectableName>_ = <injectableName>;
   *   }
   * }
   *
   * @param {string} injectableName Name of angular injectable (eg. service).
   * @param {string} namespace goog.provide namespace
   * @param {string} injectableType Name of the variable for goog.require
   * @return {Transformer}
   */
  injectConstructor(injectableName, namespace, injectableType) {
    return this.addConstructorParam(injectableName, '!' + injectableType)
        .addGoogRequire(injectableType, namespace);
  }

  /**
   * Adds
   * @param {string} identifier
   * @param {string} type Param type
   * @return {Transformer}
   */
  addConstructorParam(identifier, type) {
    const path = this.findConstructor();
    if (!path) {
      return this;
    }

    this.addFunctionParam_(path, identifier);
    this.addThisExpression_(path, identifier, type);
    this.injectJsDoc_(path, identifier, type);

    return this;
  }

  addFunctionParam_(path, identifier) {
    path.get('value')
        .get('params')
        .push(b.identifier(identifier));
  }

  addThisExpression_(path, identifier, type) {
    const es = b.expressionStatement(
        b.assignmentExpression(
            '=',
            b.memberExpression(
                b.thisExpression(),
                b.identifier(identifier + '_')
            ),
            b.identifier(identifier)
        )
    );

    es.comments = [b.commentBlock(`* @private {${type}} `)];

    path.value.value.body.body.unshift(es);
  }

  injectJsDoc_(path, identifier, type) {
    // Remove the first two spaces of each line.
    const formattedJsDoc = path.node.comments[0].value.replace(/^ {2}/mg, '');

    path.node.comments[0].value = new JsDocTransformer(formattedJsDoc)
        .addParam(identifier, type)
        .toString();
  }

  findConstructor() {
    let constructorMethodDefinition = null;

    recast.visit(this.ast, {
      visitMethodDefinition(path) {
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
    return this.addInjectableToModule('service', serviceName, className);
  }

  /**
   *
   * @param componentName
   * @param className
   * @param namespace
   * @return {Transformer}
   */
  addComponent(componentName, className, namespace) {
    this.addGoogRequire(className, namespace);
    return this.addInjectableToModule('component', componentName, className);
  }

  /**
   *
   * @param injectableType
   * @param injectableName
   * @param className
   * @return {Transformer}
   */
  addInjectableToModule(injectableType, injectableName, className) {
    const angularModule = this.findAngularModule();

    const id = angularModule.parent.get('id');

    const expressionStatement = b.expressionStatement(
        b.callExpression(
            // <moduleName>.injectable(...)
            b.memberExpression(id.node, b.identifier(injectableType)),
            // ('<injectableName>', <className>)
            [b.literal(injectableName), b.identifier(className)]
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
      visitIdentifier(path) {
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

    if (angularModulePath === null) {
      throw new Error('Cannot find angular module in file');
    }
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
