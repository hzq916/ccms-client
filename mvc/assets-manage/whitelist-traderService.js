angular.module("cmsService").factory("traderWhiteListService",function() {
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
	service.getTaact = function(params,callback) {
		cms.request('getAssetAccount',params,callback);
	}
	service.getTatract = function(params,callback) {
		cms.request('getTradeAccount',params,callback);
	}
	service.parseExcelFile = function(fileDom,callback) {
		cms.parseExcelFile(fileDom,callback);
	}

	service.importExcelFile = function(callback) {
		cms.importExcelFile(callback);
	}

	service.exportExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}
	service.getMarket = function(params,callback) {
		cms.request('getMarket',params,callback);
	}
	service.getTatrdSa = function(params,callback) {
		cms.request('getTatrdSa',params,callback);
	}
	service.getTraderSa = function(params,callback) {
		cms.request('getTraderSa',params,callback);
	}
	service.getCodeTraderSa = function(params,callback) {
		cms.request('getCodeTradersa',params,callback);
	}
	service.loadTstradersaReset = function(params,callback) {
		cms.request('LoadTradersaReset',params,callback);
	}
	service.loadTstradersaAdd = function(params,callback) {
		cms.request('LoadTradersaAdd',params,callback);
	}
	service.updateTstraderValidsa = function(params,callback) {
		cms.request('AltTstraderValidsa',params,callback);
	}
	return service;
})
