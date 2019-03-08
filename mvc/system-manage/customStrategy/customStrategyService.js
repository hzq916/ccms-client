angular.module('cmsService').service("customStrategyService",function(){

    this.getSelectProduct=function(params,callback){
        cms.request("getProduct",params,callback);
    }
    this.getSelectStrategy=function(params,callback){
        cms.request("getTatrdDetail",params,callback);
    }
    this.getCustomStrategy=function(params,callback){
        cms.request("getCustomStrategy",params,callback);
    }
    this.createCustomStrategy=function(params,callback){
        cms.request("createCustomStrategy",params,callback);
    }
    this.editCustomStrategy=function(params,callback){
        cms.request("editCustomStrategy",params,callback);
    }
    this.getCustomScript=function(params,callback){
        cms.request("getCustomScript",params,callback);
    }
    this.altCustomScript=function(params,callback){
        cms.request("altCustomScript",params,callback);
    }
    //导出
	this.exportDataToExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}
});
