angular.module('cmsService').service("tradeAccountService",function(){
    this.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
    }

    this.getProducts=function(params,callback){
        cms.request("getProduct",params,callback);
    }

    this.getAssetAccounts=function(params,callback){
        cms.request("getAssetAccount",params,callback);
    }

    this.getTradeAccount=function(params,callback){
        cms.request("getTradeAccount",params,callback);
    }

    this.editTradeAccount=function(params,callback){
        cms.request("editTradeAccount",params,callback);
    }

    this.editTaactStockFeeRate=function(params,callback){
        cms.request("editTaactStockFeeRate",params,callback);
    }

    this.editTaactFutureFeeRate=function(params,callback){
        cms.request("editTaactFutureFeeRate",params,callback);
    }

    this.getTradeAccountStockFeeRate=function(params,callback){
        cms.request("getTastockFeerate",params,callback);
    }

    this.getTradeAccountFutureFeeRate=function(params,callback){
        cms.request("getTradeAccountFutureFeeRate",params,callback);
    }

    this.getStockFeeRateTemplate=function(params,callback){
        cms.request("getStockFeerateTemplate",params,callback);
    }

    this.getCommand=function(params,callback){
        cms.request("getCommand",params,callback);
    }

    this.getCurrency=function(params,callback){
        cms.request("getCurrency",params,callback);
    }

    this.getMarket=function(params,callback){
        cms.request("getMarket",params,callback);
    }

    this.getTschannel=function(params,callback){
        cms.request("getTschannel",params,callback);
    }

    this.addTradeAccount=function(params,callback){
        cms.request("addTradeAccount",params,callback);
    }

    this.editTradeAccount=function(params,callback){
        cms.request("editTradeAccount",params,callback);
    }


    this.saveMultipleStockFeeRate=function(params,callback){
        cms.request("saveMultipleStockFeeRate",params,callback);
    }


    this.delteteTractStockFeeRate=function(params,callback){
        cms.request("delteteTractStockFeeRate",params,callback);
    }

    this.getTsBroker=function(params,callback){
        cms.request("getTsbroker",params,callback);
    }

    this.getTradeAccountMarket=function(params,callback){
        cms.request("getTradeAccountMarket",params,callback);
    }

    this.parseExcelFile = function(fileDom,callback) {
        cms.parseExcelFile(fileDom,callback);
    }

    this.importExcelFile = function(callback) {
        cms.importExcelFile(callback);
    }

    this.getFuturesMargin = function(params,callback) {
		cms.request("getFuturesMargin",params,callback);
	}

    this.getFuturesOrder = function(params,callback) {
		cms.request("getFuturesOrder",params,callback);
	}
	this.getFuturesFeerate = function(params,callback) {
		cms.request("getFuturesFeerate",params,callback);
	}
	this.getFuturesDelay = function(params,callback) {
		cms.request("getFuturesDelay",params,callback);
	}

	this.loadFuturesMargin = function(params,callback) {
		cms.request("LoadFuturesMargin",params,callback);
	}

	this.loadFuturesOrder = function(params,callback) {
		cms.request("LoadFuturesOrder",params,callback);
	}
	this.loadFuturesFeerate = function(params,callback) {
		cms.request("LoadFuturesFeerate",params,callback);
	}
	this.loadFuturesDelay = function(params,callback) {
		cms.request("LoadFuturesDelay",params,callback);
	}

	this.updateFuturesMargin = function(params,callback) {
		cms.request("AltFuturesMargin",params,callback);
	}

	this.updateFuturesOrder = function(params,callback) {
		cms.request("AltFuturesOrder",params,callback);
	}
	this.updateFuturesFeerate = function(params,callback) {
		cms.request("AltFuturesFeerate",params,callback);
	}
	this.updateFuturesDelay = function(params,callback) {
		cms.request("AltFuturesDelay",params,callback);
	}
    this.createTradeAccountNew = function(params,callback) {
		cms.request("createTradeAccountNew",params,callback);
    }
    this.getAccountType = function(params,callback) {
        cms.request("getAccountType",params,callback);
    }

});
