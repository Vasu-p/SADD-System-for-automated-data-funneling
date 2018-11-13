'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the middlewareAngularApp
 */


angular.module('middlewareAngularApp')
  .controller('MainCtrl', function ($scope, $rootScope, $route, $location, DepartmentFactory, SubDepartmentFactory, StorageService, UtilityService) {

    init();

    $scope.departments = [];
    $scope.subdepartments = [];
    $scope.successSubDept = [];
    $scope.errorMessageSubDept = [];
    $scope.errorMessageDept = 'Not Laoded';
    //$rootScope.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJRUUdSN09wK1R6TGxNSWZLNlBRWHoxTGE0eHJTQXFZVVBvck51d1wvaHNjdz0iLCJpYXQiOjE0OTIyMzUxMjgsIm5iZiI6MTQ5MjIzNTEyOCwiZXhwIjoxNDkyMjc4MzI4LCJkYXRhIjp7IlVzZXJuYW1lIjoiaGltaXRhIiwiVXNlcklkIjoxfX0.HdvSEFKVeUfmRc64g3SkA3EBnefapBFe2EaoLMUOkEw';
    
    
    // for debugging
    $scope.debuginfo = 'initial debug information';
    $scope.debugOn = false;

    function findId(deptName)
    {
        var i;
        for(i = 0; i < $scope.departments.length; i++)
          if($scope.departments[i].DeptName == deptName)
            return $scope.departments[i].DeptId;
    }
    function loadAndStoreSubDepartments()
    {
        var i = 0;
        for(i = 0; i < $scope.departments.length; i++)
          $scope.getSubDepartments($scope.departments[i].DeptId);
    }

    function init(){
        showLoader();
        DepartmentFactory.query(function onSuccess(entries) {
          $scope.departments = entries.results;
          $scope.successDept = true;
          loadAndStoreSubDepartments();
          disableLoader();
        }, function onError(data){
            
            $scope.errorMessageDept = data.statusText;
            $scope.successDept = false;
            disableLoader();
        });
    }

    

    
    
    $scope.getSubDepartments = function(id){

        if($scope.subdepartments[''+id] != null)
          return;
        showLoader();
        DepartmentFactory.subdepartments({id : id}, function onSuccess(data){
            $scope.subdepartments[''+id] = data.results;
            $scope.successSubDept[''+id] = true;
            disableLoader();
        }, function onError(data){
            $scope.errorMessageSubDept[''+id] = data.statusText;
            $scope.successSubDept[''+id] = false;
            disableLoader();
        });
        
    };
  
    $scope.addDepartment = function(){

        var data = JSON.stringify({'DeptName' : $scope.deptName});
        showLoader();
        DepartmentFactory.save(data, function onSuccess(data){
            swal("Success", "Department Added!!", "success");
            $route.reload();

        }, function onError(data){
            disableLoader();
            swal("Something went wrong", data.statusText, "error");
        });

    };

    $scope.addSubDepartment = function(deptName){

        var id = findId(deptName);

        var data = JSON.stringify({'SubDeptName' : $scope.subDeptName, 'DeptId' : id});
        showLoader();
        SubDepartmentFactory.save(data, function onSuccess(data){
            swal("Success", "Sub Department Added!!", "success");
            $route.reload();

        }, function onError(data){
            disableLoader();
            swal("Something went wrong", data.statusText, "error");
        });
        
    };

    $scope.deleteDepartment = function(id){
 
        showLoader();
        DepartmentFactory.delete({id : id}, function onSuccess(data){

            swal("Success", "Department Deleted!!", "success");
            $route.reload();
        }, function onError(data){
            disableLoader();
            swal("Something went wrong", data.statusText, "error");
        });

    };

    $scope.deleteSubDepartment = function(id){

        showLoader();
        SubDepartmentFactory.delete({id : id}, function onSuccess(data){

            swal("Success", "Sub Department Deleted!!", "success");
            $route.reload();
        }, function onError(data){
            disableLoader();
            swal("Something went wrong", data.statusText, "error");
        });

        
    };

    $scope.getInfoDepartment = function(id){

        if($('#modalbody'+id).children().length == 0)
        {
            showLoader();
            DepartmentFactory.get({id : id}, function onSuccess(data){
                var dept = data.results[0];
                $('#modalbody'+id).append('<pre>Id :: <span class="text-primary">' + dept.DeptId + '</span></pre>');
                $('#modalbody'+id).append('<pre>Created By :: <span class="text-primary">' + dept.CreatedBy + '</span></pre>');
                $('#modalbody'+id).append('<pre>Created At :: <span class="text-primary">' + showPretty(dept.CreatedDateTime) + '</span></pre>');
                $('#modalbody'+id).append('<pre>Modified By :: <span class="text-primary">' + dept.ModifyBy + '</span></pre>');
                $('#modalbody'+id).append('<pre>Modified At :: <span class="text-primary">' + showPretty(dept.ModifyDateTime) + '</span></pre>');

                disableLoader();
                $('#modal'+id).modal('show');
            }, function onError(data){
                disableLoader();
                $('#modalbody'+id).append('<p> Some error Occured '+ data.statusText +'</p>');
                $('#modal'+id).modal('show');
            });
        }
        else
        {
            $('#modal'+id).modal('show');
            
        }


    };

    $scope.getInfoSubDepartment = function(id)
    {
        
        if($('#modalbodysub'+id).children().length == 0)
        {
            showLoader();
            SubDepartmentFactory.get({id : id}, function onSuccess(data){
                var subdept = data.results[0];
                $('#modalbodysub'+id).append('<pre>Id :: <span class="text-primary">' + subdept.SubDeptId + '</span></pre>');
                $('#modalbodysub'+id).append('<pre>Created By :: <span class="text-primary">' + subdept.CreatedBy + '</span></pre>');
                $('#modalbodysub'+id).append('<pre>Created At :: <span class="text-primary">' + showPretty(subdept.CreatedDateTime) + '</span></pre>');
                $('#modalbodysub'+id).append('<pre>Modified By :: <span class="text-primary">' + subdept.ModifyBy + '</span></pre>');
                $('#modalbodysub'+id).append('<pre>Modified At :: <span class="text-primary">' + showPretty(subdept.ModifyDateTime) + '</span></pre>');

                disableLoader();
                $('#modalsub'+id).modal('show');
            }, function onError(data){
                disableLoader();
                $('#modalbodysub'+id).append('<p> Some error Occured '+ data.statusText +'</p>');
                $('#modalsub'+id).modal('show');
            });
        }
        else
        {
            $('#modalsub'+id).modal('show');
            
        }


    };

    $scope.gotoProject = function(DeptId, SubDeptId, DeptName, SubDeptName){

        StorageService.storeDeptSubDept(DeptId, SubDeptId, DeptName, SubDeptName);
        
        var url = "/project";
        $location.path(url);
    };

    function showPretty(datestring){
        var curr_date = new Date(datestring);
        return curr_date.toLocaleFormat();
    }

    function showLoader()
    {
        $('.ajax-loader').css("visibility", "visible");
    }
    function disableLoader()
    {
        $('.ajax-loader').css("visibility", "hidden");
    }



  }); // end controller
