angular.module('cmsService').factory('laterRiskService',function() {
	var service = {};
	service.getTamgr = function(params,callback) {
		cms.request("getManager",params,callback);
	}
	service.getTatrd = function(params,callback) {
		cms.request('getCombStrategy',params,callback);
	}
	service.getTacap = function(params,callback) {
		cms.request('getProduct',params,callback);
	}
	service.getTaact = function(params,callback) {
		cms.request('getAssetAccount',params,callback);
	}
	service.getTrader = function(params,callback) {
		cms.request('getTstrader',params,callback);
	}
	service.getOrderStats = function(params,callback) {
		cms.request('getOrderStats',params,callback);
	}
	return service;
})
