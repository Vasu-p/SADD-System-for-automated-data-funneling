'use strict';

/**
 * @ngdoc service
 * @name middlewareAngularApp.StorageService
 * @description
 * # StorageService
 * Service in the middlewareAngularApp.
 */
angular.module('middlewareAngularApp')
  .service('StorageService', function () {
    
    	var deptId;
    	var subDeptId;
    	var subDeptName;
    	var deptName;

    	var projectId;
    	var projectName;

        var request;

    	this.storeDeptSubDept = function(DeptId, SubDeptId, DeptName, SubDeptName)
    	{
            //console.log(SubDeptName);
    		deptId = DeptId;
    		subDeptId = SubDeptId;
    		deptName = DeptName;
    		subDeptName = SubDeptName;
    	};

    	this.storeProject = function(ProjectId, ProjectName)
    	{
    		projectId = ProjectId;
    		projectName = ProjectName;
    	};

        this.storeRequest = function(Request)
        {
            request = Request;
        };

    	this.getDeptId = function(){ return deptId; };
    	this.getSubDeptId = function(){ return subDeptId; };
    	this.getSubDeptName = function(){ return subDeptName; };
    	this.getDeptName = function(){ return deptName; };

    	this.getProjectId = function(){ return projectId; };
    	this.getProjectName = function(){ return projectName; };

        this.getRequest = function(){ return request; };
        
  });
