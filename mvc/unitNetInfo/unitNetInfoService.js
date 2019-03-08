angular.module('cmsService').service("unitNetInfoService",function(){
    this.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
    }

    this.getProducts=function(params,callback){
        cms.request("getProduct",params,callback);
    }

    this.getAssetAccounts=function(params,callback){
        cms.request("getAssetAccount",params,callback);
    }

    this.getCombStrategy=function(params,callback){
        cms.request("getCombStrategy",params,callback);
    }

    this.getCombStrategyNetInfo = function(params,callback){
        cms.request("getCombStrategyNetInfo",params,callback);
    }

    this.getTradeUnitHoldPosition = function(params,callback){
        cms.request("getTradeUnitHoldPosition",params,callback);
    }


    this.getUnitPositionInfo = function(params,callback){
        cms.request("getUnitPositionInfo",params,callback);
    }

});
