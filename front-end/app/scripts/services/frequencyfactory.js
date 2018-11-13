'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.FrequencyFactory
 * @description
 * # FrequencyFactory
 * Factory in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .factory('FrequencyFactory', function ($resource, TokenService, UtilityService) {
    var token = TokenService.getToken('himita', 'himita');
    var host = UtilityService.getHost();
      return $resource('http://'+ host +'/slimapp/index-new.php/frequencies/:id', {}, {

        
        query : {

          method : 'get',
          headers : {
            'Authorization' : 'Bearer ' + token
          } 
        }

       
      });

  });
