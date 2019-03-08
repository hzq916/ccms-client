angular.module('cmsService').factory('dbErrorLogService',function() {
	var service = {};

	service.getErrorLogData = function(requestData,callback) {
		cms.request('getErrorLog',requestData,callback);
	}

	return service;
})
