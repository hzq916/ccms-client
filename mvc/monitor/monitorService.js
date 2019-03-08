angular.module('cmsService').service("monitorService",function(){
    this.getAllTaMgr=function(params,callback){
        params.serviceid = 30;
        params.msgtype = 2640;
        cms.request("KMtQueryManager",params,callback);
    }

    this.getProducts=function(params,callback){
        params.serviceid = 30;
        params.msgtype = 2650;
        cms.request("QueryProduct",params,callback);
    }

    this.getMonitorProducts=function(params,callback){
        params.serviceid = 30;
        params.msgtype = 2652;
        cms.request("QueryProductMonitor",params,callback);
    }


    this.getStrategyHold = function(params,callback){
        params.serviceid = 30;
        params.msgtype = 11004;
        cms.request("getStrategyHold",params,callback);
    }

    this.getStrategyFundInfo = function(params,callback){
        params.serviceid = 30;
        params.msgtype = 2659;
        cms.request("QueryStrategyAmtAns",params,callback);
    }


    this.getUkType = function(params,callback){
        params.serviceid = 30;
        params.msgtype = 11001;
        cms.request("getUkType",params,callback);
    }


    this.getProductNet = function(params,callback){
        params.serviceid = 30;
        params.msgtype = 11000;
        cms.request("getProductNet",params,callback);
    }

    this.getProductSubject = function(params,callback){
        params.serviceid = 30;
        params.msgtype = 11007;
        cms.request("getProductSubject",params,callback);
    }

    this.getProductAmt = function(params,callback){
        params.serviceid = 30;
        params.msgtype = 2654;
        cms.request("QueryProductAmt",params,callback);
    }
});
