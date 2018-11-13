'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.SubDepartmentFactory
 * @description
 * # SubDepartmentFactory
 * Factory in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .factory('SubDepartmentFactory', function (TokenService, $resource, UtilityService) {
    
    var token = TokenService.getToken('himita', 'himita');
    var host = UtilityService.getHost();

    return $resource('http://'+ host +'/slimapp/index-new.php/subdepartments/:id', {}, {

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
      projects : {

        url : 'http://'+ host +'/slimapp/index-new.php/subdepartments/:id/projects',
        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      }

    });

  });
