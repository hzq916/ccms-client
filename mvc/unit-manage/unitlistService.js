angular.module('cmsService').factory('unitlistService',function() {
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

	service.getTatrdDetail = function(params,callback) {
		cms.request('getTatrdDetail',params,callback);
	}

	service.getCurrency = function(params,callback) {
		cms.request('getCurrency',params,callback);
	}

	service.addTamgr = function(params,callback) {
		cms.request('AddTamgr',params,callback);
	}

	service.updateTamgr = function(params,callback) {
		cms.request('AltTamgrInfo',params,callback);
	}

	service.addTacap = function(params,callback) {
		cms.request('AddTacap',params,callback);
	}

	service.updateTacap = function(params,callback) {
		cms.request('AltTacapInfo',params,callback);
	}

	service.createCombStrategy = function(params,callback) {
		cms.request('createCombStrategy',params,callback);
	}

	service.updateTatrd = function(params,callback) {
		cms.request('AltTatrdInfo',params,callback);
	}

	service.getTatrdFund = function(params,callback) {
		cms.request('getTatrdFund',params,callback);
	}

	service.getTatrdTaact = function(params,callback) {
		cms.request('getTatrdTaact',params,callback);
	}

	service.getTaact = function(params,callback) {
		cms.request('getAssetAccount',params,callback);
	}

	service.getTatract = function(params,callback) {
		cms.request('getTradeAccount',params,callback);
	}

	service.addTatrdFund = function(params,callback) {
		cms.request('AddTatrdFund',params,callback);
	}

	service.updateTatrdFund = function(params,callback) {
		cms.request("AltTatrdFundTotalamt",params,callback);
	}

	service.changeTatrdFundInAcids = function(params,callback) {
		cms.request('ChangeTatrdFundInAcids',params,callback);
	}

	service.getTrdTractMapping = function(params,callback) {
		cms.request('getTrdTractMapping',params,callback);
	}

	service.updateTrdTatractMapping = function(params,callback) {
		cms.request('ResetTrdTractMapping',params,callback);
	}

	service.getMarket=function(params,callback){
		cms.request("getMarket",params,callback);
	}

	service.getTschannel=function(params,callback){
		cms.request("getTschannel",params,callback);
	}

	service.getCommand=function(params,callback){
        cms.request("getCommand",params,callback);
    }

	service.saveMultipleStockFeeRate=function(params,callback){
        cms.request("saveMultipleStockFeeRate",params,callback);
    }

	service.getStockFeeRateTemplate=function(params,callback){
		cms.request("getStockFeerateTemplate",params,callback);
	}

	service.getTatrdStockFeeRate=function(params,callback){
        cms.request("getTastockFeerate",params,callback);
    }

	service.getTatrdWithAccountType=function(params,callback){
        cms.request("getTatrdWithAccountType",params,callback);
    }

	service.getTatrdWithTradeMarket=function(params,callback){
        cms.request("getTatrdWithTradeMarket",params,callback);
    }

	service.parseExcelFile = function(fileDom,callback) {
		cms.parseExcelFile(fileDom,callback);
	}

	service.importExcelFile = function(callback) {
		cms.importExcelFile(callback);
	}

	service.getFuturesMargin = function(params,callback) {
		cms.request("getFuturesMargin",params,callback);
	}
	service.getFuturesOrder = function(params,callback) {
		cms.request("getFuturesOrder",params,callback);
	}
	service.getFuturesFeerate = function(params,callback) {
		cms.request("getFuturesFeerate",params,callback);
	}
	service.getFuturesDelay = function(params,callback) {
		cms.request("getFuturesDelay",params,callback);
	}

	service.loadFuturesMargin = function(params,callback) {
		cms.request("LoadFuturesMargin",params,callback);
	}

	service.loadFuturesOrder = function(params,callback) {
		cms.request("LoadFuturesOrder",params,callback);
	}
	service.loadFuturesFeerate = function(params,callback) {
		cms.request("LoadFuturesFeerate",params,callback);
	}
	service.loadFuturesDelay = function(params,callback) {
		cms.request("LoadFuturesDelay",params,callback);
	}

	service.updateFuturesMargin = function(params,callback) {
		cms.request("AltFuturesMargin",params,callback);
	}

	service.updateFuturesOrder = function(params,callback) {
		cms.request("AltFuturesOrder",params,callback);
	}
	service.updateFuturesFeerate = function(params,callback) {
		cms.request("AltFuturesFeerate",params,callback);
	}
	service.updateFuturesDelay = function(params,callback) {
		cms.request("AltFuturesDelay",params,callback);
	}

	service.getProductSubject = function(params,callback) {
		cms.request("getProductSubject",params,callback);
	}

	service.getProductSubjectType = function(params,callback) {
		cms.request("getProductSubjectType",params,callback);
	}

	service.addProductSubject = function(params,callback) {
		cms.request("addProductSubject",params,callback);
	}

	service.updateProductSubject = function(params,callback) {
		cms.request("updateProductSubject",params,callback);
	}

	service.deleteProductSubject = function(params,callback) {
		cms.request("deleteProductSubject",params,callback);
	}

	service.getProductChannelInfo = function(params,callback) {
		cms.request("getProductChannelInfo",params,callback);
	}

	service.updateProductChannel = function(params,callback) {
		cms.request("updateProductChannel",params,callback);
	}

	service.getOpsService = function(params,callback) {
		cms.request("getOpsService",params,callback);
	}
	service.createCombStrategyNew = function(params,callback) {
		cms.request("createCombStrategyNew",params,callback);
	}
	service.createProductNew = function(params,callback) {
		cms.request("createProductNew",params,callback);
	}
	service.createManagerNew = function(params,callback) {
		cms.request("createManagerNew",params,callback);
	}

	//获取当前设置的资产管理人配置信息
	service.getTamgrSetting = function(params,callback) {
		cms.request("getTamgrSetting",params,callback);
	}

	//设置资产管理人参数信息
	service.altTamgrSetting = function(params,callback) {
		cms.request("altTamgrSetting",params,callback);
	}

	//导出
	service.exportDataToExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}
	service.getLoginUserInfo = function() {
		return cms.sendSync("get-user-info");
	}

	return service;
})
