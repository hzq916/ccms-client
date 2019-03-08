angular.module('cmsService').factory('whitelistService',function() {
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
	service.parseExcelFile = function(fileDom,callback) {
		cms.parseExcelFile(fileDom,callback);
	}

	service.importExcelFile = function(callback) {
		cms.importExcelFile(callback);
	}

	service.getTatract = function(params,callback) {
		cms.request('getTradeAccount',params,callback);
	}

	service.getMarket = function(params,callback) {
		cms.request('getMarket',params,callback);
	}

	service.getTatractSa = function(params,callback) {
		cms.request('getTatractSa',params,callback);
	}

	service.getUkeyInfo = function(params,callback) {
		cms.request('getUkey',params,callback);
	}

	service.addTatractSa = function(params,callback) {
		cms.request('AddTatractSa',params,callback);
	}

	service.loadTatractValidsaReset = function(params,callback) {
		cms.request('LoadTatractValidsaReset',params,callback);
	}

	service.loadTatractValidsaAdd = function(params,callback) {
		cms.request('LoadTatractValidsaAdd',params,callback);
	}

	service.loadTatractPlansaReset = function(params,callback) {
		cms.request('LoadTatractPlansaReset',params,callback);
	}

	service.loadTatractPlansaAdd = function(params,callback) {
		cms.request('LoadTatractPlansaAdd',params,callback);
	}

	service.exportExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}

	service.getTatrdSa = function(params,callback) {
		cms.request('getTatrdSa',params,callback);
	}

	service.loadTatrdValidsaReset = function(params,callback) {
		cms.request('LoadTatrdValidsaReset',params,callback);
	}

	service.loadTatrdValidsaAdd = function(params,callback) {
		cms.request('LoadTatrdValidsaAdd',params,callback);
	}

	service.loadTatrdPlansaReset = function(params,callback) {
		cms.request('LoadTatrdPlansaReset',params,callback);
	}

	service.loadTatrdPlansaAdd = function(params,callback) {
		cms.request('LoadTatrdPlansaAdd',params,callback);
	}

	service.updateTatractPlansa = function(params,callback) {
		cms.request('AltTatractPlansa',params,callback);
	}
	service.updateTatractValidsa = function(params,callback) {
		cms.request('AltTatractValidsa',params,callback);
	}
	service.updateTatrdPlansa = function(params,callback) {
		cms.request('AltTatrdPlansa',params,callback);
	}
	service.updateTatrdValidsa = function(params,callback) {
		cms.request('AltTatrdValidsa',params,callback);
	}

	return service;
})
