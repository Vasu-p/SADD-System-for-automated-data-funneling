'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.APIRequestFactory
 * @description
 * # APIRequestFactory
 * Factory in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .factory('APIRequestFactory', function ($resource, TokenService, UtilityService) {
      var token = TokenService.getToken('himita', 'himita');
      var host = UtilityService.getHost();
      return $resource('http://'+ host +'/slimapp/index-new.php/api-requests/:id', {}, {

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
        mappings : {

        url : 'http://'+ host +'/slimapp/index-new.php/api-requests/:id/mappings',
        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      },
      attributes : {

        url : 'http://'+ host +'/slimapp/index-new.php/api-requests/:id/attributes',
        method : 'get',
        headers : {
          'Authorization' : 'Bearer ' + token
        } 
      }


       
      });

  });
