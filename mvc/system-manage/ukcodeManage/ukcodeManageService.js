angular.module('cmsService').service("ukcodeManageService",function(){
    this.getMarket=function(params,callback){
        cms.request("getMarket",params,callback);
    }

    this.getCurrency=function(params,callback){
        cms.request("getCurrency",params,callback);
    }

    this.getUkType=function(params,callback){
        cms.request("getUkType",params,callback);
    }

    this.getUkcode=function(params,callback){
        cms.request("getUkey",params,callback);
    }

    this.addUkcode=function(params,callback){
        cms.request("addUkcode",params,callback);
    }

    this.editUkcode=function(params,callback){
        cms.request("editUkcode",params,callback);
    }

    this.delUkcode=function(params,callback){
        cms.request("delUkcode",params,callback);
    }

});
