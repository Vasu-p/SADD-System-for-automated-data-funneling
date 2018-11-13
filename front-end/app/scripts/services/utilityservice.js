'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.UtilityService
 * @descriptions
 * # UtilityService
 * Service in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .service('UtilityService', function ($http, TokenService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var token = TokenService.getToken('', '');
    var host = 'localhost';

    this.isURLValid = function(url){
    	return $http.get(url, {
    		headers: {
		        "Authorization": 'Bearer ' + token
		    }
    	});
    };

    this.getDBs = function(data){
      return $http.post('http://'+ host +'/slimapp/index-new.php/databases', data, {
        headers: {
            "Authorization": 'Bearer ' + token
        }
      });

    };

    this.getTables = function(data){

      return $http.post('http://'+ host +'/slimapp/index-new.php/tables', data, {
        headers: {
            "Authorization": 'Bearer ' + token
        }
      });

    };

    this.getColumns = function(data){
      return $http.post('http://'+ host +'/slimapp/index-new.php/columns', data, {
        headers: {
            "Authorization": 'Bearer ' + token
        }
      });

    };

    this.checkServer = function(data){
        return $http.post('http://'+ host +'/slimapp/index-new.php/check-server-url', data, {
        headers: {
            "Authorization": 'Bearer ' + token
        }
      });
    };

    this.checkServerAll = function(data){
        return $http.post('http://'+ host +'/slimapp/index-new.php/check-server-all', data, {
        headers: {
            "Authorization": 'Bearer ' + token
        }
      });
    };

    this.getHost = function(){
      return 'localhost';
    };




  });
