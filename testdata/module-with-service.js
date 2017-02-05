goog.module('foo.bar.FooBarModule');

const Andres = goog.require('foo.bar.Andres');
const SomeStuff = goog.require('foo.bar.SomeStuff');

const FooBarModule = angular.module('foo.bar.FooBarModule', []);

FooBarModule.service('serviceOne', SomeStuff);
FooBarModule.service('serviceTwo',
    SomeStuff);
FooBarModule.service(
    'serviceThree', SomeStuff);

exports = FooBarModule;
