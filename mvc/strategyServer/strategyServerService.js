angular.module('cmsService').service("strategyServerService",function(){
    this.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
    }

    this.getProducts=function(params,callback){
        cms.request("getProduct",params,callback);
    }

    this.getCombStrategy=function(params,callback){
        cms.request("getCombStrategy",params,callback);
    }

    this.getTrader=function(params,callback){
        cms.request("getTstrader",params,callback);
    }

    this.getStrategyServer=function(params,callback){
        cms.request("getStrategyServer",params,callback);
    }

    this.getStrategyTemplate=function(params,callback){
        cms.request("getStrategyTemplate",params,callback);
    }

    this.addStrategyConfig=function(params,callback){
        cms.request("addStrategyConfig",params,callback);
    }

    this.editStrategyConfig=function(params,callback){
        cms.request("editStrategyConfig",params,callback);
    }

    this.delStrategyConfig=function(params,callback){
        cms.request("delStrategyConfig",params,callback);
    }

    this.addStrategyServer = function(params,callback) {
        cms.request("addStrategyServer",params,callback);
    }

    this.editStrategyServer = function(params,callback) {
        cms.request("editStrategyServer",params,callback);
    }

    this.relateStrategyServer = function(params,callback) {
        cms.request("relateStrategyServer",params,callback);
    }
    this.deleteStrategyServer = function(params,callback) {
        cms.request("deleteStrategyServer",params,callback);
    }

    this.editStrategyPermission = function(params,callback) {
        cms.request("editStrategyPermission",params,callback);
    }

    this.getStrategyPermission = function(params,callback) {
        cms.request("getStrategyPermission",params,callback);
    }

    this.getOperator = function(params,callback) {
        cms.request("getOperator",params,callback);
    }


});
