angular.module('cmsService').factory('traderManageService',function() {
	var service = {};
	service.getTamgr = function(params,callback) {
		cms.request('getManager',params,callback);
	}

	service.getTacap = function(params,callback) {
		cms.request('getProduct',params,callback);
	}

	service.getTatrd = function(params,callback) {
		cms.request('getCombStrategy',params,callback);
	}

	service.getTrader = function(params,callback) {
		cms.request('getTstrader',params,callback);
	}

	service.updateTrader = function(params,callback) {
		cms.request('AltTraderInfo',params,callback);
	}

	return service;
})
