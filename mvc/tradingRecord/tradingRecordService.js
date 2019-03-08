angular.module('cmsService').service("tradingRecordService",function(){
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


    this.getTradingRecord = function(params,callback){
        cms.request("getTradingRecord",params,callback);
    }




});
