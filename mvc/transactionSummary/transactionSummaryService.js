angular.module('cmsService').service("transactionSummaryService",function(){

    this.getTamgr = function(params,callback) {
		cms.request('getManager',params,callback);
	}

    this.getSelectProduct=function(params,callback){
        cms.request("getProduct",params,callback);
    }
    this.getSelectStrategy=function(params,callback){
        cms.request("getTatrdDetail",params,callback);
    }
    this.getTransactionSummary=function(params,callback){
        cms.request("getTransactionSummary",params,callback);
    }

    this.getAssetAccount=function(params,callback){
		cms.request("getAssetAccount",params,callback);
	}

    //导出
	this.exportDataToExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}
});
