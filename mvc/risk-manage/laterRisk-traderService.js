angular.module('cmsService').factory('lrTraderService',function() {
	var service = {};
	service.getTraderHold = function(params,callback) {
		cms.request('getTraderHold',params,callback);
	}
	return service;
});
