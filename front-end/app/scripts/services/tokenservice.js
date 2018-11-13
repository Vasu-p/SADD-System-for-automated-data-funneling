'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.TokenService
 * @description
 * # TokenService
 * Service in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .service('TokenService', function () {
    this.getToken = function(username, password)
    {
    	return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJMUm9GVDNXdjhZOHc4TWZKbUJFd2taQjh4dU5oVlcySm51cUFENVcyczlvPSIsImlhdCI6MTQ5MjkzMTEzNCwibmJmIjoxNDkyOTMxMTM0LCJleHAiOjE0OTU1MjMxMzQsImRhdGEiOnsiVXNlcm5hbWUiOiJoaW1pdGEiLCJVc2VySWQiOjF9fQ.1khRVc6c-tVL4YXIz3yfuFd7eNxmTO3l5BXvHhFW3mg';
    };
  });
