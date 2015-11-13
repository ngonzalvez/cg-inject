(function (ng) {
  'use strict';

  var $inject = function (cls, self, args) {
    var i;
    var key;
    var str;
    var func;
    var depNames = [];
    var deps = [];
    var l = cls.$inject.length;

    for (i = 0; i < l; i++) {
      key = '_' + cls.$inject[i];
      self[key] = args[i];
    }

    for (key in self) {
      if (typeof self[key] === 'function') {
        func = self[key];
        str = func.toString();

        // Skip functions with dependency injection not enabled.
        if (str.indexOf('/* $inject: enabled */') === -1) continue;

        // List of parameter names in the function signature.
        depNames = str.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].split(',');

        // Map the dependency names to the actual dependencies.
        args = depNames.map(function (name) {
          return self['_' + name.trim()];
        });

        // Add the "this" value to the arguments list.
        args.unshift(func);

        self[key] = func.bind.apply(func, args);
      }
    }
  };

  ng.module('cg.inject', [])
    .service('$inject', $inject);
})(angular);
