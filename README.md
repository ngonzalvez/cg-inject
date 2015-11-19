# cg-inject
This is a simple service that provides a very clean way to inject dependencies in an Angular controller, service, factory or provider when using Prototypes.

### Prototypes
If you've worked some time with AngularJS in a medium to large app, you've probably ended up with very long controller functions as I did. In order to improve the legibility of the code, I decided to use prototypes.

Here is an example of what a controller looks like when using prototypes.

~~~js
/**
 * Sample controller using prototype.
 */
var SampleCtrl = function ($someDep, $otherDep, $lastDep) {

};

/**
 * Prevent code minifiers from breaking the dependency injection.
 */
SampleCtrl.$inject = [
  '$someDep',
  '$otherDep',
  '$lastDep'
];

/**
 * Method that does stuff.
 */
SampleCtrl.prototype.someMethod = function () {

};

/**
 * Do something really awesome with param.
 */
SampleCtrl.prototype.doSomething = function (param) {

};

angular
	.module('myModule', [])
	.controller('SampleCtrl', SampleCtrl);
~~~

### Methods dependencies
Some times your methods will need some dependencies that are being injected to your controller. Then, a simple way to do pass the dependency to the controller is to make it a pseudo-private property of the controller.

~~~js
var SampleCtrl = function ($someDep, $otherDep, $lastDep) {
	this._$someDep = $someDep;
	this._$otherDep = $otherDep;
};

SampleCtrl.$inject = [
  '$someDep',
  '$otherDep',
  '$lastDep'
];
~~~

And then we can use it in our method like this:

~~~js
SampleCtrl.prototype.someMethod = function () {
	var $someDep = this._$someDep;
	var $otherDep = this._$otherDep;
};
~~~

### Dependency Overflow
Although this might work for simple controllers, there are some times when you will have tens of dependencies in your controllers, and it may start to look something like a this:

~~~js
var SampleCtrl = function ($scope, $stateParams, UsersManager, VideosManager, PdfRenderer, Auth, Modal, SomeClassFactory) {
	this._$scope = $scope;
	this._$stateParams = $stateParams;
	this._UsersManager = UsersManager;
	this._VideosManager = VideosManager;
	this._PdfRenderer = PdfRenderer;
	this._Auth = Auth;
	this._Modal = Modal;
	this._SomeClassFactory = SomeClassFactory;
};

SampleCtrl.$inject = [
	'$scope',
	'$stateParams',
	'UsersManager',
	'VideosManager',
	'PdfRenderer',
	'Auth',
	'Modal',
	'SomeClassFactory'
];
~~~

As you  can see, there's a lot of code there just for getting the dependencies injected. Each time we want to add a new dependency, we need to add it in the same three places: $inject, controller signature and `this` reference.
 
And that's bad, because it distracts the developer working on this code. We need to keep the code simple and focus only on the business logic. Dependency injection should be transparent to us.


### The solution
**$inject** solves the dependency injection problem by automatically injecting all dependencies into the `this` object and into the controller methods. This is how it works:

~~~js
var SampleCtrl = function ($inject) {
    $inject(SampleCtrl, this, arguments);
};

SampleCtrl.$inject = [
    '$inject',
    '$scope',
    '$stateParams',
    'UsersManager',
    'VideosManager',
    'PdfRenderer',
    'Auth',
    'Modal',
    'SomeClassFactory'
];
~~~

The above code will inject the dependencies the same we were doing it previously, but it requires less lines of code. We still can access the dependencies in the controller with: `this._$scope` or `this._$stateParams`.

In order to use $inject you need to follow three simple steps:

1) Add `cg.inject` as a dependency of your app module.

~~~js
angular.module('myApp', ['cg.inject']);
~~~

2) Add $inject function as the first dependency of your controller.

~~~js
var AppCtrl = function ($inject) {

};

AppCtrl.$inject = ['$inject'];

~~~

3) Call it from your controller constructor. It requires 3 arguments: Controller class, reference to the current controller instance (this) and the arguments list.

~~~js
var AppCtrl = function ($inject) {
  $inject(AppCtrl, this, arguments);
};
~~~

That's all! You have clean dependency injection in your controller.

**$inject** also works for services, factories, providers, directives and everything dependency-injected that is using prototypes.

### Method Dependency Injection

Apart from injecting the dependencies into the `this` object, $inject can also inject the dependencies into the controller methods based on the method arguments names. The only thing you must do is enable it by adding `/* $inject: dependencyName */` to your method body.

NOTE: Dependency Injection won't work if the $inject comment is removed by a minifier.

~~~js

var SampleCtrl = function ($inject) {
    $inject(SampleCtrl, this, arguments);
};

SampleCtrl.$inject = [
    '$inject',
    '$scope',
    'UsersManager'
];

SampleCtrl.prototype.updateQueryParams = function ($scope, UsersManager) {
  /* $inject: $scope, UsersManager */
  
  UsersManager
  	.getAll()
  	.then(function (users) {
  	  $scope.users = users;
  	});
};
~~~
