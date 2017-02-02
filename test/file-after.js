goog.module('foo.bar.SomeComponent');

const SomeService = goog.require('foo.bar.SomeService');

class SomeComponent {
  /**
   * @param {!SomeService} someService
   * @ngInject
   */
  constructor(someService) {
    /** @private {!SomeService} */
    this.someService_ = someService;
  }
}

exports = SomeComponent;
