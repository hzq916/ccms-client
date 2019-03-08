angular.module('cmsService').factory('operatorLogService',function() {
	var service = {};

	service.getOperatorLogData = function(requestData,callback) {
		cms.request('getTsoperLog',requestData,callback);
	}

	return service;
})
