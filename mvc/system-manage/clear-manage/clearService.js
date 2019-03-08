angular.module("cmsService").factory('clearService',function() {
	var service = {};
	service.getTamgr = function(params,callback) {
		cms.request('getManager',params,callback);
	}
	service.getMarket = function(params,callback) {
		cms.request('getMarket',params,callback);
	}
	service.getTacap = function(params,callback) {
		cms.request('getProduct',params,callback);
	}
	service.getTaactClearStat = function(params,callback) {
		cms.request('getTaactClearStat',params,callback);
	}
	service.getClearSteps = function(params,callback) {
		cms.request('getClearStep',params,callback);
	}
	service.getClearLog = function(params,callback) {
		cms.request('getClearLog',params,callback);
	}
	service.clearTaact = function(params,callback) {
		cms.request('ClearTaact',params,callback);
	}
	service.clearRevoke = function(params,callback) {
		cms.request('ClearRevoke',params,callback);
	}
	service.clearOnce = function(params,callback) {
		cms.request('ClearOnce',params,callback);
	}
	return service;
})
