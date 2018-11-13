'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.departmentfactory
 * @description
 * # departmentfactory
 * Factory in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .factory('DepartmentFactory', function ($resource, TokenService, UtilityService) {
    
    var token = TokenService.getToken('himita', 'himita');
    var host = UtilityService.getHost();
    return $resource('http://'+ host +'/slimapp/index-new.php/departments/:id', {}, {

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

      subdepartments : {

        url : 'http://'+ host +'/slimapp/index-new.php/departments/:id/subdepartments',
        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      }




    });

  });
