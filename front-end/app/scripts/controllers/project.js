'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:ProjectCtrl
 * @description
 * # ProjectCtrl
 * Controller of the middlewareAngularApp
 */
angular.module('middlewareAngularApp')
  .controller('ProjectCtrl', function ($scope, $route, $location, StorageService, ProjectFactory, SubDepartmentFactory) {
    	
    	//console.log(StorageService.getSubDeptName());
    	$scope.DeptId = StorageService.getDeptId();
    	$scope.DeptName = StorageService.getDeptName();
    	$scope.SubDeptName = StorageService.getSubDeptName();
    	$scope.SubDeptId = StorageService.getSubDeptId();
    	$scope.projects = [];

    	$scope.successProj = false;
    	$scope.errorMessage = 'Not Loaded';
    	function init(){
            showLoader();
    		SubDepartmentFactory.projects({id : $scope.SubDeptId}, function onSuccess(data){
    			$scope.projects = data.results;
    			$scope.successProj = true;
                disableLoader();
    		}, function onError(data){
    			$scope.errorMessage = data.statusText;
    			$scope.successProj = false;
                disableLoader();
    		});	
    	}
    	//console.log($scope.DeptId+$scope.SubDeptId+$scope.SubDeptName);
    	init();

    	$scope.addProject = function(){

    		var data = JSON.stringify({'ProjectName' : $scope.projectName, 'SubDeptId' : $scope.SubDeptId, 'DeptId' : $scope.DeptId});
            showLoader();
	        ProjectFactory.save(data, function onSuccess(data){
	            swal("Success", "Project Added!!", "success");
	            $route.reload();

	        }, function onError(data){
                disableLoader();
	            swal("Something went wrong", data.statusText, "error");
	        });
    	};

    	$scope.deleteProject = function(id){
            showLoader();
    		ProjectFactory.delete({id : id}, function onSuccess(data){

	            swal("Success", "Project Deleted!!", "success");
	            $route.reload();
	        }, function onError(data){
                disableLoader();
	            swal("Something went wrong", data.statusText, "error");
	        });
    	};

    	$scope.getInfoProject = function(id){

    		if($('#modalbody'+id).children().length == 0)
	        {
                showLoader();
            	ProjectFactory.get({id : id}, function onSuccess(data){
                var project = data.results[0];
                $('#modalbody'+id).append('<pre>Id :: <span class="text-primary">' + project.ProjectId + '</span></pre>');
                $('#modalbody'+id).append('<pre>Department :: <span class="text-primary">' + $scope.DeptName + '</span></pre>');
              
                $('#modalbody'+id).append('<pre>Created By :: <span class="text-primary">' + project.CreatedBy + '</span></pre>');
                $('#modalbody'+id).append('<pre>Created At :: <span class="text-primary">' + showPretty(project.CreatedDateTime) + '</span></pre>');
                $('#modalbody'+id).append('<pre>Modified By :: <span class="text-primary">' + project.ModifyBy + '</span></pre>');
                $('#modalbody'+id).append('<pre>Modified At :: <span class="text-primary">' + showPretty(project.ModifyDateTime) + '</span></pre>');

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

    	$scope.gotoAPIRequest = function(ProjectId, ProjectName){
            
    		StorageService.storeProject(ProjectId, ProjectName);
    		// console.log(StorageService.getProjectId());
    		// console.log(StorageService.getProjectName());
    		$location.url('/apirequest');

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
  });
