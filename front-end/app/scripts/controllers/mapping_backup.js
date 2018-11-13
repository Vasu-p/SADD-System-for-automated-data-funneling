'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:MappingCtrl
 * @description
 * # MappingCtrl
 * Controller of the middlewareAngularApp
 */
angular.module('middlewareAngularApp')
  .controller('MappingCtrl', function ($scope, $route, $location, StorageService, MappingFactory, APIRequestFactory) {
    	
    	$scope.request = StorageService.getRequest();
    	$scope.mappings = [];
    	$scope.attributes = [];

    	$scope.successMapping = false;
    	$scope.errorMessage = 'Not Loaded';

    	$scope.showAdd = false;

    	function init(){
    		showLoader();
    		APIRequestFactory.mappings({id : $scope.request.RequestId}, function onSuccess(data){
    			$scope.mappings = data.results;
    			$scope.successMapping = true;
    			disableLoader();
    		}, function onError(data){
    			$scope.errorMessage = data.statusText;
    			$scope.successMapping = false;
    			disableLoader();
    		});

    		showLoader();
			APIRequestFactory.attributes({id : $scope.request.RequestId}, function onSuccess(data){
    			$scope.attributes = data.results;	
    			disableLoader();
    			
    		}, function onError(data){
    			console.log("Error in fetching attributes" + data.statusText);
    			disableLoader();
    		});    		
    	}

    	init();

    	$scope.addMapping = function(){
    		showLoader();
    		var data = { 'AttributeId' : $scope.attribute.AttributeId, 'ExecServerName':$scope.server, 'ExecDbName': $scope.database, 'ExecObjName': $scope.table,
    		'ExecUserName': $scope.username, 'ColumnName': $scope.column };
    		MappingFactory.save(JSON.stringify(data), function onSuccess(data){
	            swal("Success", "Mapping Added!!", "success");
	            $route.reload();

	        }, function onError(data){
	        	disableLoader();
	            swal("Something went wrong", data.statusText, "error");
	        });
    	};

    	$scope.getInfoMapping = function(id){
    		if($('#modalbody'+id).children().length == 0)
	        {
	        	showLoader();
	    		var mapping = null;
	    		var attribute = null;
	    		for(var i=0; i < $scope.mappings.length; i++)
	    		{
	    			if($scope.mappings[i].MappingId == id)
					{
						mapping = $scope.mappings[i];
						break;
					}
	    		}
	    		for(var i=0; i < $scope.attributes.length; i++)
	    		{
	    			if($scope.attributes[i].AttributeId == mapping.AttributeId)
					{
						attribute = $scope.attributes[i];
						break;
					}
	    		}


	    		$('#modalbody'+id).append('<pre>Id :: <span class="text-primary">' + mapping.MappingId + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Attribute :: <span class="text-primary">' + attribute.AttributeName + '</span></pre>');
	            $('#modalbody'+id).append('<pre>AttributeId :: <span class="text-primary">' + attribute.AttributeId + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Server Name :: <span class="text-primary">' + mapping.ExecServerName + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Database Name :: <span class="text-primary">' + mapping.ExecDbName + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Table Name :: <span class="text-primary">' + mapping.ExecObjName + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Column Name :: <span class="text-primary">' + mapping.ColumnName + '</span></pre>');
	            
	            $('#modalbody'+id).append('<pre>Created By :: <span class="text-primary">' + mapping.CreatedBy + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Created At :: <span class="text-primary">' + showPretty(mapping.CreatedDateTime) + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Modified By :: <span class="text-primary">' + mapping.ModifyBy + '</span></pre>');
	            $('#modalbody'+id).append('<pre>Modified At :: <span class="text-primary">' + showPretty(mapping.ModifyDateTime) + '</span></pre>');

	            disableLoader();
	            $('#modal'+id).modal('show');
              }
              else
              {
              	$('#modal'+id).modal('show');
              }
    	};

    	$scope.deleteMapping = function(id){
    		showLoader();
    		MappingFactory.delete({id : id}, function onSuccess(data){

	            swal("Success", "Mapping Deleted!!", "success");
	            $route.reload();
	        }, function onError(data){
	        	disableLoader();
	            swal("Something went wrong", data.statusText, "error");
	        });
    	};

    	function showPretty(datestring){
	        var curr_date = new Date(datestring);
            //console.log(curr_date);
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
