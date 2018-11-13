'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.MappingFactory
 * @description
 * # MappingFactory
 * Factory in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .factory('MappingFactory', function ($resource, TokenService, UtilityService) {
    
      var token = TokenService.getToken('himita', 'himita');
      var host = UtilityService.getHost();
      return $resource('http://'+ host +'/slimapp/index-new.php/mappings/:id', {}, {


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
        }


       
      });
  });
