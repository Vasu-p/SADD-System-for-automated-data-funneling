'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the middlewareAngularApp
 */
angular.module('middlewareAngularApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
