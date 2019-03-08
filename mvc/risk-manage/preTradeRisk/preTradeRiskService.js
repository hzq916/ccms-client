angular.module('cmsService').factory('preriskService',function() {
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
	service.getTaact = function(params,callback) {
		cms.request('getAssetAccount',params,callback);
	}
	service.getRiskIndex = function(params,callback) {
		cms.request('getRiskIndex',params,callback);
	}
	service.getRiskCfgValue = function(params,callback) {
		cms.request('getRiskCfgvalue',params,callback);
	}
	service.addRiskCfgValue = function(params,callback) {
		cms.request('AddRiskCfg',params,callback);
	}
	service.updateRiskCfgValue = function(params,callback) {
		cms.request('AltRiskCfg',params,callback);
	}
	service.deleteRiskCfgValue = function(params,callback) {
		cms.request('DeleteRiskCfg',params,callback);
	}
	return service;
})
