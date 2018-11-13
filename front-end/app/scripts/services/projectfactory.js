'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.ProjectFactory
 * @description
 * # ProjectFactory
 * Factory in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .factory('ProjectFactory', function ($resource, TokenService, UtilityService) {
      
    var token = TokenService.getToken('himita', 'himita');
    var host = UtilityService.getHost();

    return $resource('http://'+ host +'/slimapp/index-new.php/projects/:id', {}, {

      get : {
        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      },
      query : {

        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      },
      delete : {

        method : 'delete',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      },
      update : {

        method : 'put',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      },
      save : {

        method : 'post',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      },
      requests : {

        url : 'http://'+ host +'/slimapp/index-new.php/projects/:id/api-requests',
        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      }

    });
  });
