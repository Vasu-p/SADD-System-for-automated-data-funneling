'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:MappingCtrl
 * @description
 * # MappingCtrl
 * Controller of the middlewareAngularApp
 */
angular.module('middlewareAngularApp')
  .controller('MappingCtrl', function ($scope, $route, $location, StorageService, MappingFactory, APIRequestFactory, UtilityService, $q) {
    	
    	$scope.request = StorageService.getRequest();
    	$scope.mappings = [];
    	$scope.attributes = [];
    	$scope.answers = [];

    	$scope.successMapping = false;
    	$scope.errorMessage = 'Not Loaded';

    	$scope.showAdd = false;

    	$scope.dbDisable = true;
    	$scope.tableDisable = true;
    	$scope.colDisable = true;

    	$scope.showTable = false;
    	$scope.tableRows = 1;

    	$scope.filterVal = {};
    	$scope.filterList = {};

    	function makeLists(){
    		for(var i = 0; i < $scope.mappings.length; i++)
    		{
    			var map = $scope.mappings[i];
    			var filterServers = Object.keys($scope.filterList);
    			if(filterServers.includes(map.ExecServerName) == false)
    				$scope.filterList[map.ExecServerName] = {};
    			
    			var filterDbs = Object.keys($scope.filterList[map.ExecServerName]);
    			if(filterDbs.includes(map.ExecDbName) == false)
    				$scope.filterList[map.ExecServerName][map.ExecDbName] = {};
    			
    			var filterTables = Object.keys($scope.filterList[map.ExecServerName][map.ExecDbName]);
    			if(filterTables.includes(map.ExecObjName) == false)
    				$scope.filterList[map.ExecServerName][map.ExecDbName][map.ExecObjName] = {};	

    		}
    		//console.log($scope.filterList);
    	}

    	$scope.getFilterServer = function(){
    		return Object.keys($scope.filterList);
    	};
    	$scope.getFilterDb = function(){
    		if($scope.filterVal.ExecServerName!=undefined)
    			return Object.keys($scope.filterList[$scope.filterVal.ExecServerName]);
    		else
    			return [];
    	};	
    	$scope.getFilterTable = function(){
    		if($scope.filterVal.ExecServerName!=undefined && $scope.filterVal.ExecDbName!=undefined)
    			return Object.keys($scope.filterList[$scope.filterVal.ExecServerName][$scope.filterVal.ExecDbName]);
    		else
    			return [];    	
    	};
    	$scope.refreshDb = function(){

    		$scope.filterVal.ExecDbName = '';
    		$scope.getFilterDb();   		
    	};
    	$scope.refreshTable = function(){	
    		$scope.filterVal.ExecObjName = '';
    		$scope.getFilterTable();

    	};

    	function init(){
    		showLoader();
    		APIRequestFactory.mappings({id : $scope.request.RequestId}, function onSuccess(data){
    			$scope.mappings = data.results;
    			$scope.successMapping = true;
    			makeLists();
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


    	// $scope.addMapping = function(){
    	// 	showLoader();
    	// 	var data = { 'AttributeId' : $scope.attribute.AttributeId, 'ExecServerName':$scope.server, 'ExecDbName': $scope.database, 'ExecObjName': $scope.table,
    	// 	'ExecUserName': $scope.username, 'ColumnName': $scope.column };
    	// 	MappingFactory.save(JSON.stringify(data), function onSuccess(data){
	    //         swal("Success", "Mapping Added!!", "success");
	    //         $route.reload();

	    //     }, function onError(data){
	    //     	disableLoader();
	    //         swal("Something went wrong", data.statusText, "error");
	    //     });
    	// };

    	
    	$scope.addedMappings = [];
    	
    	$scope.addMapping = function(){
    		
    		var addedCount = 0;
    		var proceed = true;
    		var promises = [];
    		for(var i = 0; i < $scope.answers.length; i++)
    		{
    			if(!proceed)
    				break;
    			var data = {'AttributeId' : $scope.answers[i], 'ExecServerName':$scope.server, 'ExecDbName': $scope.database, 'ExecObjName': $scope.table,
    	 					'ExecUserName': $scope.username, 'ColumnName': $scope.col_list[i]};
    	 		
    	 		var promise = MappingFactory.save(JSON.stringify(data), function onSuccess(data){
		            // swal("Success", "Mapping Added!!", "success");
		            // $route.reload();
		            var id = data.results[0].MappingId;
		            console.log(id);

		            
		            $scope.addedMappings.push(id);
		            

		        }, function onError(data){
		        	proceed = false;
		        	
		        });
		        promises.push(promise.$promise);

    		}
    		 
	      	// check if multiple ajax calls are completed and recover even if any one of them fails

    		$q.all(promises).then(function onSuccess(response){
    			//console.log("all added");
    			swal("Success", "Mappings added !!", "success");
    			$route.reload();

    		}, function onError(response){
    			//var promiseList = [];
    			console.log("some mapping failed to add");
    			console.log($scope.addedMappings);
    			console.log(response);
    			
				// for(var i = 0; i < $scope.addedMappings.length; i++)
				// {
				// 	// delete each mapping which is added
				// 	var id = $scope.addedMappings[i];
				// 	var pro = MappingFactory.delete({id : id}, function onSuccess(data){
						
			            
			 //        }, function onError(data){
			 //        	console.log("error in deleting");
		  //       	});
		  //       	promiseList.push(pro.$promise);
				// }
				// $q.all(promiseList).then(function onSuccess(){

				// 	swal("Error", "Unable to add one or more mappings.. Recovered", "error");
				// 	//$route.reload();

				// }, function onError(){
				// 	swal("Error", "Unable to add.. Please delete inconsistent mappings", "error");
				// 	$route.reload();
				// });

    			

    			
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

    	function checkServer(){
    		var data = {"URL" : $scope.server};
    		UtilityService.checkServer(data).then(function onSuccess(response){
    			if(response.data.message == "success")
    				$scope.isURLValid = true;
    			else
    				$scope.isURLValid = false;
    		}, function onError(data){
    			console.log("some-valid");
    		});

    	};	

    	$scope.fetchDBs = function(){

    		initAddFields();
    		showLoader();
    		var data = {"URL" : $scope.server};
    		UtilityService.checkServer(data).then(function onSuccess(response){
    			if(response.data.message == "success")
    			{
    				$('#serverfield').removeClass("has-error").addClass('has-success');
                    $('#successSymbol').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    
    				$scope.isURLValid = true;
    				var data_inner = {"URL":$scope.server};
		    		UtilityService.getDBs(data_inner).then(function onSuccess(response){
		    			$scope.db_list = response.data.results;
		    			$scope.dbDisable = false;
		    			disableLoader();
		    		}, function onError(data){
		    			console.log("Error");
		    			disableLoader();
		    		});	
    			}
    			else
    			{
    				disableLoader();
    				$('#serverfield').removeClass("has-success").addClass('has-error');
                    $('#successSymbol').removeClass('glyphicon-ok').addClass('glyphicon-remove');
                    $scope.isURLValid = false;
    			}
    				
    		}, function onError(data){
    			disableLoader();
    			$('#serverfield').removeClass("has-success").addClass('has-error');
                $('#successSymbol').removeClass('glyphicon-ok').addClass('glyphicon-remove');
                $scope.isURLValid = false;
    		});

    		
    	};

    	$scope.fetchTables = function(){
    		showLoader();
    		var data = {"URL":$scope.server, "DatabaseName": $scope.database};
    		UtilityService.getTables(data).then(function onSuccess(response){
    			$scope.table_list = response.data.results;
    			$scope.tableDisable = false;
    			disableLoader();
    		}, function onError(data){
    			disableLoader();
    			console.log("Error");
    		});
    	};

    	$scope.fetchColumns = function(){
    		showLoader();
    		var data = {"URL":$scope.server, "DatabaseName":$scope.database, "TableName":$scope.table};
    		UtilityService.getColumns(data).then(function onSuccess(response){
    			$scope.col_list = response.data.results;
    			$scope.tableRows = Math.ceil($scope.col_list.length/4);
    			$scope.showTable = true;

    			disableLoader();
    		}, function onError(data){
    			console.log("Error");
    			disableLoader();
    		});
    	};

    	function initAddFields(){
    		$scope.dbDisable = true;
	    	$scope.tableDisable = true;
	    	$scope.colDisable = true;
	    	$scope.showTable = false;

	    	$scope.db_list = [];
	    	$scope.table_list = [];
	    	$scope.col_list = [];
    	}

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
	    $scope.range = function(i)
	    {
	    	return new Array(i);
	    };
	    $scope.getColsRange = function(i)
	    {

	    	return $scope.col_list.slice(i*4,i*4+4);
	    };

  });
