angular.module('cmsService').service("positionManageService",function(){
    this.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
    }

    this.getProducts=function(params,callback){
        cms.request("getProduct",params,callback);
    }

    this.getAssetAccounts=function(params,callback){
        cms.request("getAssetAccount",params,callback);
    }

    this.getTatrd=function(params,callback){
        cms.request("getCombStrategy",params,callback);
    }

    this.getTradeAccount=function(params,callback){
        cms.request("getTradeAccount",params,callback);
    }

    this.getTrader=function(params,callback){
        cms.request("getOperator",params,callback);
    }

    this.getCurrency=function(params,callback){
        cms.request("getCurrency",params,callback);
    }

    this.getAssetAccountPosition=function(params,callback){
        cms.request("getTradeAccountHoldPosition",params,callback);
    }

    this.getTradeUnitPosition=function(params,callback){
        cms.request("getTradeUnitHoldPosition",params,callback);
    }

    this.saveTradeAccountPosition=function(params,callback){
        cms.request("saveTradeAccountPosition",params,callback);
    }

    this.addTradeAccountPosition=function(params,callback){
        cms.request("addTradeAccountPosition",params,callback);
    }

    this.saveTradeUnitPosition=function(params,callback){
        cms.request("saveTradeUnitPosition",params,callback);
    }

    this.addTradeUnitPosition=function(params,callback){
        cms.request("addTradeUnitPosition",params,callback);
    }

    this.editTradeAccountSinglePosition = function(params,callback) {
        cms.request("editTradeAccountSinglePosition",params,callback);
    }

    this.editTradeUnitSinglePosition = function(params,callback) {
        cms.request("editTradeUnitSinglePosition",params,callback);
    }


    //覆盖式导入证券账户持仓 --账户证券
    this.saveStockTradeAccountPosition = function(params,callback) {
        cms.request("saveStockTradeAccountPosition",params,callback);
    }
 
    //覆盖式导入期货期权账户持仓 --账户期货
    this.saveFutureTradeAccountPosition = function(params,callback) {
        cms.request("saveFutureTradeAccountPosition",params,callback);
    }

    //覆盖式导入组合证券账户持仓 --组合证券
    this.saveStockTradeUnitPosition = function(params,callback) {
        cms.request("saveStockTradeUnitPosition",params,callback);
    }

    //覆盖式导入组合期货期权账户持仓 --组合期货
    this.saveFutureTradeUnitPosition = function(params,callback) {
        cms.request("saveFutureTradeUnitPosition",params,callback);
    }


    //增量导入证券交易账户的持仓　--增量证券账户
    this.addStockTradeAccountPosition = function(params,callback) {
        cms.request("addStockTradeAccountPosition",params,callback);
    }

    //增量导入期货期权交易账户的持仓  --增量期货账户
    this.addFutureTradeAccountPosition = function(params,callback) {
        cms.request("addFutureTradeAccountPosition",params,callback);
    }
    //增量导入期货期权组合的持仓　--增量期货组合
    this.addFutureTradeUnitPosition = function(params,callback) {
        cms.request("addFutureTradeUnitPosition",params,callback);
    }
    //增量导入证券组合的持仓  --增量证券组合
    this.addStockTradeUnitPosition = function(params,callback) {
        cms.request("addStockTradeUnitPosition",params,callback);
    }

});
