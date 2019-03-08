angular.module('cmsService').factory('riskMessageService',function() {
	var service = {};
	service.getRiskMessage = function(params,callback) {
		cms.request("getRiskMessage",params,callback);
	}

	service.getRiskType = function(params,callback) {
		cms.request('getRiskType',params,callback);
	}

	service.setRiskMessageState = function(params,callback) {
		cms.request('setRiskMessageState',params,callback);
	}


	return service;
})
