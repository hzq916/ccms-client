angular.module('cmsService').service("accountManageService",function(){
    this.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
    }

    this.getProducts=function(params,callback){
        cms.request("getProduct",params,callback);
    }

    this.getAssetAccounts=function(params,callback){
        cms.request("getAssetAccount",params,callback);
    }

    this.getAssetAccountsDetail=function(params,callback){
        cms.request("getAssetAccountsDetail",params,callback);
    }

    this.getTsBroker=function(params,callback){
        cms.request("getTsbroker",params,callback);
    }

    this.addAssetAccount=function(params,callback){
        cms.request("addAssetAccount",params,callback);
    }

    this.editAssetAccount=function(params,callback){
        cms.request("editAssetAccount",params,callback);
    }

    this.bindAssetAccount=function(params,callback){
        cms.request("bindAssetAccount",params,callback);
    }

    this.getCurrency=function(params,callback){
        cms.request("getCurrency",params,callback);
    }

    this.getTaacctFund=function(params,callback){
        cms.request("getTaacctFund",params,callback);
    }

    this.createTaacctFund=function(params,callback){
        cms.request("createTaacctFund",params,callback);
    }

    this.editTaacctFund=function(params,callback){
        cms.request("editTaacctFund",params,callback);
    }

    this.transferTaacctFund=function(params,callback){
        cms.request("transferTaacctFund",params,callback);
    }

    this.simple_encrypt = function(str) {
        return cms.simple_encrypt(str);
    }

    this.updatePassword = function(params,callback) {
        cms.request("AltAccountPassword",params,callback);
    }

    this.getAccountType = function(params,callback) {
        cms.request("getAccountType",params,callback);
    }
    this.createAccountNew = function(params,callback) {
        cms.request("createAccountNew",params,callback);
    }
    this.createOptionAccount = function(params,callback) {
        cms.request("createOptionAccount",params,callback);
    }
    //修改资金账号数据
    this.editAssetAccountOther = function(params,callback) {
        cms.request("editAssetAccountOther",params,callback);
    }
});
