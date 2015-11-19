(function (ng) {
  'use strict';

  /**
   * Angular.js utility for cleaner dependency injection.
   */
  var $inject = function (cls, self, args) {
    var i;
    var key;
    var str;
    var func;
    var depNames = [];
    var deps = [];
    var l = cls.$inject.length;

    // Inject all dependencies into the self reference.
    for (i = 0; i < l; i++) {
      key = '_' + cls.$inject[i];
      self[key] = args[i];
    }

    for (key in cls.prototype) {
      if (typeof cls.prototype[key] === 'function') {
        func = cls.prototype[key];
        str = func.toString();

        // List of dependencies.
        depNames = str.match(/\/\*\s*\$inject:([^*]+)/);

        // Skip methods without the $inject comment.
        if (depNames && depNames.length < 2) continue;

        depNames = depNames[1].split(',');

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

  var $injectService = function () {
    return $inject;
  };

  ng.module('cg.inject', [])
    .factory('$inject', $injectService);
})(angular);
