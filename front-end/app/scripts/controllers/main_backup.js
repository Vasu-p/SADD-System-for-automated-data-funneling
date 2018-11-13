'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the middlewareAngularApp
 */


angular.module('middlewareAngularApp')
  .controller('MainCtrl', function ($scope, $http, $route, $q, $rootScope, $location, DepartmentService) {

    $scope.subdepartments = [];
    $scope.successSubDept = [];
    $scope.errorMessageSubDept = [];
    $rootScope.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJaajdXdk0xQTVPb2JTU1VXQzhQQklUeXZsTVA0dEM2Z3lOOE5aWVpLOWRNPSIsImlhdCI6MTQ5MjA4ODk1NSwibmJmIjoxNDkyMDg4OTU1LCJleHAiOjE0OTIxMzIxNTUsImRhdGEiOnsiVXNlcm5hbWUiOiJ0ZXN0X3VzZXIiLCJVc2VySWQiOjJ9fQ.PJAbydsZ8CsANJDAQCbhjCFpwdoXYNPwT3HLu_xQaG0';
    var requestPromise = [];
    // for debugging
    $scope.debuginfo = DepartmentService.getAll();
    $scope.debugOn = false;

    function findId(deptName)
    {
        var i;
        for(i = 0; i < $scope.departments.length; i++)
          if($scope.departments[i].DeptName == deptName)
            return $scope.departments[i].DeptId;
    }

    $scope.getDepartments = function()
    {
        var promise = $http({
        method : 'get',
        url : 'http://localhost/slimapp/index-new.php/departments',
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        }

      }).then(function onSuccess(response){
          $scope.departments = response.data.results;
          $scope.successDept = true;
          //alert($scope.data);
        }, function onError(response){
          $scope.errorMessageDept = response.data.message;
          $scope.successDept = false;
          //alert($scope.data);
        }); 
        requestPromise.push(promise);
    };

    
    
    $scope.getSubDepartments = function(id){

        if($scope.subdepartments[''+id] != null)
          return;
        
        $http({
        method : 'get',
        url : 'http://localhost/slimapp/index-new.php/departments/'+id+'/subdepartments',
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        }

      }).then(function onSuccess(response){
          $scope.subdepartments[''+id] = response.data.results;
          $scope.successSubDept[''+id] = true;
          //alert($scope.data);
        }, function onError(response){
          $scope.errorMessageSubDept[''+id] = response.data.message;
          $scope.successSubDept[''+id] = false;
          //alert($scope.data);
        }); 
        
    };
  
    $scope.addDepartment = function(){

      $http({
        method : 'post',
        url : 'http://localhost/slimapp/index-new.php/departments',
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        },
        data : JSON.stringify({'DeptName' : $scope.deptName})

      }).then(function onSuccess(response){
          
          swal("Success", "Department Added!!", "success");
          $route.reload();

        }, function onError(response){
          swal("Something went wrong", response.data.message, "error");
          
            
        }); 

    };

    $scope.addSubDepartment = function(deptName){

      var id = findId(deptName);

      $http({
        method : 'post',
        url : 'http://localhost/slimapp/index-new.php/subdepartments',
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        },
        data : JSON.stringify({'SubDeptName' : $scope.subDeptName, 'DeptId' : id})

      }).then(function onSuccess(response){
          swal("Success", "Sub Department Added!!", "success");
          $route.reload();

        }, function onError(response){
          swal("Something went wrong", response.data.message, "error");
        }); 
    };

    $scope.deleteDepartment = function(id){

      $http({
        method : 'delete',
        url : 'http://localhost/slimapp/index-new.php/departments/' + id,
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        }

      }).then(function onSuccess(response){
          swal("Success", "Department Deleted!!", "success");
          $route.reload();

        }, function onError(response){
          swal("Something went wrong", response.data.message, "error");
        }); 

    };

    $scope.deleteSubDepartment = function(id){

        $http({
        method : 'delete',
        url : 'http://localhost/slimapp/index-new.php/subdepartments/' + id,
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        }

      }).then(function onSuccess(response){
          swal("Success", "Sub Department Deleted!!", "success");
          $route.reload();

        }, function onError(response){
          swal("Something went wrong", response.data.message, "error");
        }); 
    }

    $scope.getInfoDepartment = function(id)
    {
        
        if($('#modalbody'+id).children().length == 0)
        {

        var promise = $http({
        method : 'get',
        url : 'http://localhost/slimapp/index-new.php/departments/' + id,
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        }

      }).then(function onSuccess(response){
          
          var dept = response.data.results[0];
          
            $('#modalbody'+id).append('<p>Id :: ' + dept.DeptId + '</p>');
            $('#modalbody'+id).append('<p>Created By :: ' + dept.CreatedBy + '</p>');
            $('#modalbody'+id).append('<p>Created At :: ' + dept.CreatedDateTime + '</p>');
            $('#modalbody'+id).append('<p>Modified By :: ' + dept.ModifyBy + '</p>');
            $('#modalbody'+id).append('<p>Modified At :: ' + dept.ModifyDateTime + '</p>');


        }, function onError(response){
          swal("Something went wrong", response.data.message, "error");
        }); 
      }
      requestPromise.push(promise);
      $q.all(requestPromise).then(function(data){
          $('#modal'+id).modal('show');
      });

      
    };

    $scope.getInfoSubDepartment = function(id)
    {
        if($('#modalbodysub'+id).children().length == 0)
        {

        var promise = $http({
        method : 'get',
        url : 'http://localhost/slimapp/index-new.php/subdepartments/' + id,
        headers : {
          'Authorization' : 'Bearer ' + $rootScope.token
        }

      }).then(function onSuccess(response){
          
          var subdept = response.data.results[0];
          
            $('#modalbodysub'+id).append('<p>Id :: ' + subdept.SubDeptId + '</p>');
            $('#modalbodysub'+id).append('<p>Created By :: ' + subdept.CreatedBy + '</p>');
            $('#modalbodysub'+id).append('<p>Created At :: ' + subdept.CreatedDateTime + '</p>');
            $('#modalbodysub'+id).append('<p>Modified By :: ' + subdept.ModifyBy + '</p>');
            $('#modalbodysub'+id).append('<p>Modified At :: ' + subdept.ModifyDateTime + '</p>');


        }, function onError(response){
          swal("Something went wrong", response.data.message, "error");
        }); 
      }
      requestPromise.push(promise);
      $q.all(requestPromise).then(function(data){
          $('#modalsub'+id).modal('show');
      });

    };

    $scope.gotoProject = function(DeptId, SubDeptId){

        $rootScope.DeptId = DeptId;
        $rootScope.SubDept = SubDeptId;
        
        var url = "/project";
        $location.path(url);
    }


    function loadAndStoreSubDepartments()
    {
        var i = 0;
        for(i = 0; i < $scope.departments.length; i++)
          $scope.getSubDepartments($scope.departments[i].DeptId);
    }



    $scope.getDepartments();

    $q.all(requestPromise).then(function(data){
      loadAndStoreSubDepartments();
    });
    

  });
