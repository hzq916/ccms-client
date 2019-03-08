angular.module('cmsService').factory('loginLogService',function() {
	var service = {};

	service.getLoginLogData = function(requestData,callback) {
		cms.request('getTsoperLoginLog',requestData,callback);
	}


	return service;
})
