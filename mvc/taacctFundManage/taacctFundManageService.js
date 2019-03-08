angular.module('cmsService').service("taacctFundManageService",function(){
    this.getTaacctFund=function(params,callback){
        cms.request("getTaacctFund",params,callback);
    }

    this.createTaacctFund=function(params,callback){
        cms.request("createTaacctFund",params,callback);
    }

    this.editTaacctFund=function(params,callback){
        cms.request("editTaacctFund",params,callback);
    }

    this.getProduct = function(params,callback) {
        cms.request("getProduct",params,callback);
    }


});
