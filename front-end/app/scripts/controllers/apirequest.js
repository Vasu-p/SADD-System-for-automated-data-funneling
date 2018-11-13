'use strict';

/**
 * @ngdoc function
 * @name middlewareAngularApp.controller:ApirequestCtrl
 * @description
 * # ApirequestCtrl
 * Controller of the middlewareAngularApp
 */
angular.module('middlewareAngularApp')
  .controller('ApirequestCtrl', function ($scope, $route, $location, StorageService, ProjectFactory, APIRequestFactory, FrequencyFactory, UtilityService) {
    	
    	$scope.ProjectName = StorageService.getProjectName();
    	$scope.ProjectId = StorageService.getProjectId();

    	$scope.requests = [];

    	$scope.successRequest = false;
    	$scope.errorMessage = 'Not Loaded';

    	$scope.showAdd = false;

    	$scope.frequencies = [];
        getFrequencies();

        $scope.args = [];

        $scope.urlOk = false;


        var argIndex = 0;
        $scope.addArg = function(){
            $scope.args.push({'key':'', 'value' : ''});
            argIndex++;
        }

        function getFrequencies(){
            FrequencyFactory.query({}, function onSuccess(data){
                $scope.frequencies = data.results;
            }, function onError(data){
                console.log("Freq not fethched");
            });
        }

    	function init(){
            showLoader();
    		ProjectFactory.requests({id : $scope.ProjectId}, function onSuccess(data){
    			$scope.requests = data.results;
    			$scope.successRequest = true;
                disableLoader();
    		}, function onError(data){
    			$scope.errorMessage = data.statusText;
    			$scope.successRequest = false;
                disableLoader();
    		});
    	}

    	init();

    	$scope.addRequest = function(){

            if(!$scope.urlOk)
            {
                swal("Please correct the URL", '', "error");
                return;
            }
            showLoader();
            try{
                var startFrom = $('#datetimepicker1').children()[0].value;
                var upto = $('#datetimepicker2').children()[0].value;
                var startFromISO = convertToISO(startFrom);
                var uptoISO = convertToISO(upto);
                var RequestArguments = {};
                // get the request arguments from the $scope.args 
                for(var i = 0; i<$scope.args.length; i++)
                {
                    var key = $scope.args[i].key;
                    var value = $scope.args[i].value;
                    RequestArguments[''+key] = value;
                }
            
            
            
        		var data = {'URL':'http://' + $scope.url, 'ProjectId':$scope.ProjectId, 
                'SubFrequencyId':$scope.frequency.SubFrequencyId, 'RequestType':$scope.requestType, 'Description':$scope.description, 
                'ResultType':$scope.responseType, 'StartFrom':startFromISO, 'Upto': uptoISO, 'RequestArguments':RequestArguments}; 
            }
            catch(e){
                disableLoader();
                swal("Something is wrong!!", 'Please check the data', "error");
                return;
            }
            //console.log(JSON.stringify(data));
	        APIRequestFactory.save(JSON.stringify(data), function onSuccess(data){
	            swal("Success", "Request Added!!", "success");
	            $route.reload();

	        }, function onError(data){
                disableLoader();
	            swal("Something went wrong", data.statusText, "error");
	        });
    	};

    	$scope.deleteRequest = function(id){

            showLoader();
    		APIRequestFactory.delete({id : id}, function onSuccess(data){

	            swal("Success", "Request Deleted!!", "success");
	            $route.reload();
	        }, function onError(data){
                disableLoader();
	            swal("Something went wrong", data.statusText, "error");
	        });
    	};

    	$scope.getInfoRequest = function(id){

    		if($('#modalbody'+id).children().length == 0)
	        {
                showLoader();
            	APIRequestFactory.get({id : id}, function onSuccess(data){
                var request = data.results[0];
                $('#modalbody'+id).append('<pre>Id :: <span class="text-primary">' + request.RequestId + '</span></pre>');
                $('#modalbody'+id).append('<pre>Project :: <span class="text-primary">' + $scope.ProjectName + '</span></pre>');
                $('#modalbody'+id).append('<pre>SubFrequency :: <span class="text-primary">' + request.Frequency + '</span></pre>');
                $('#modalbody'+id).append('<pre>URL :: <span class="text-primary">' + request.URL + '</span></pre>');
                $('#modalbody'+id).append('<pre>Description :: <span class="text-primary">' + request.Description + '</span></pre>');
                $('#modalbody'+id).append('<pre>ResultType :: <span class="text-primary">' + request.ResultType + '</span></pre>');
                $('#modalbody'+id).append('<pre>StartFrom :: <span class="text-primary">' + showPretty(request.StartFrom) + '</span></pre>');
                $('#modalbody'+id).append('<pre>Upto :: <span class="text-primary">' + showPretty(request.Upto) + '</span></pre>');
                $('#modalbody'+id).append('<pre>Arguments :: \n<span class="text-primary">' + JSON.stringify(request.RequestArguments, null, 2) + '</span></pre>');
                $('#modalbody'+id).append('<pre>Sample Result :: \n<span class="text-primary">' + JSON.stringify(JSON.parse(request.SampleResult),null,2) + '</span></pre>');
              
                $('#modalbody'+id).append('<pre>Created By :: <span class="text-primary">' + request.CreatedBy + '</span></pre>');
                $('#modalbody'+id).append('<pre>Created At :: <span class="text-primary">' + showPretty(request.CreatedDateTime) + '</span></pre>');
                $('#modalbody'+id).append('<pre>Modified By :: <span class="text-primary">' + request.ModifyBy + '</span></pre>');
                $('#modalbody'+id).append('<pre>Modified At :: <span class="text-primary">' + showPretty(request.ModifyDateTime) + '</span></pre>');

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

        $scope.gotoMapping = function(request){
            StorageService.storeRequest(request);
            $location.url('/mapping');
        };

        $scope.checkURL = function()
        {

            showLoader();
            var promise = UtilityService.isURLValid('http://' + $scope.url);
            promise.then(function onSuccess(response){
                disableLoader();
                
                var type = response.headers('Content-type');
                if(type.search("json") >= 0)
                {
                    $('#urlfield').removeClass("has-error").addClass('has-success');
                    $('#successSymbol').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    $scope.urlOk = true;
                }
                else
                {
                    //http://localhost/phpmyadmin/
                    //http://localhost/middleware/test_api.php
                    //http://localhost/slimapp/index-new.php/departments/2

                    // may be a json with maybe some different response type like text/html
                    // check for such cases
                    try{
                        eval(response.data);             
                        $('#urlfield').removeClass("has-error").addClass('has-success');
                        $('#successSymbol').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        $scope.urlOk = true;
                    }
                    catch(e){
                        //alert(false);
                        $('#urlfield').removeClass("has-success").addClass('has-error');
                        $('#successSymbol').removeClass('glyphicon-ok').addClass('glyphicon-remove');
                        $scope.urlOk = false;
                    }
                    
                }
            }, function onError(response){
                disableLoader();
                $('#urlfield').removeClass("has-success").addClass('has-error');
                $('#successSymbol').removeClass('glyphicon-ok').addClass('glyphicon-remove');  
                $scope.urlOk = false;
            });
        };

    	function showPretty(datestring){
	        var curr_date = new Date(datestring);
            //console.log(curr_date);
	        return curr_date.toLocaleFormat();
	    }
        function convertToISO(datestring){
            var d = new Date(datestring);

            return d.toISOString();
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
