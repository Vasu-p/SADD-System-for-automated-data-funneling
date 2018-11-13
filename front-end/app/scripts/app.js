'use strict';

/**
 * @ngdoc overview
 * @name middlewareAngularApp
 * @description
 * # middlewareAngularApp
 *
 * Main module of the application.
 */
angular
  .module('middlewareAngularApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
        
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
        
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/project', {
        templateUrl: 'views/project.html',
        controller: 'ProjectCtrl',
        controllerAs: 'project'
      })
      .when('/apirequest', {
        templateUrl: 'views/apirequest.html',
        controller: 'ApirequestCtrl',
        controllerAs: 'apirequest'
      })
      .when('/mapping', {
        templateUrl: 'views/mapping.html',
        controller: 'MappingCtrl',
        controllerAs: 'mapping'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
