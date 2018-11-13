'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.DepartmentService
 * @description
 * # DepartmentService
 * Service in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .service('DepartmentService', function ($http, TokenService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    var result;
    
    var errorMessage = '';
    var success = false;


    var token = TokenService.getToken('himita', 'himita');

    this.getDepartments = function() {

    	return $http({
        method : 'get',
        url : 'http://localhost/slimapp/index-new.php/departments',
        headers : {
          'Authorization' : 'Bearer ' + token
        }

      }).then(function onSuccess(response){
      	  result = {};
          result.departments = response.data.results;
          result.success = true;	
          return result;
          
        }, function onError(response){
       	  result = {};
    	  result.success = false;
    	  result.errorMessage = response.data.message;
    	  return result; 	

        }); 

        
    };

    this.getDepartment = function(id){

    	return $http({
        method : 'get',
        url : 'http://localhost/slimapp/index-new.php/departments/' + id,
        headers : {
          'Authorization' : 'Bearer ' + token
        }

      }).then(function onSuccess(response){
          result = {};
          result.department = response.data.results[0];
          result.success = true;
          return result;


        }, function onError(response){
          result = {};
          result.errorMessage = response.data.message;
          result.success = false;
          return result;

        }); 
    };

    



  });
