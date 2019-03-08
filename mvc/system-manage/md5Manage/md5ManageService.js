angular.module('cmsService').service("md5ManageService",function(){
    this.getVersionMD5=function(params,callback){
        cms.request("getVersionMd5",params,callback);
    }

    this.getUnverifiedMD5=function(params,callback){
        cms.request("getUnverifiedMd5",params,callback);
    }

    this.addVersionMD5=function(params,callback){
        cms.request("addVersionMD5",params,callback);
    }

    this.authorizeMD5=function(params,callback){
        cms.request("addVersionMD5",params,callback);
    }

    this.editMD5=function(params,callback){
        cms.request("editMD5",params,callback);
    }

    this.delMD5=function(params,callback){
        cms.request("delMD5",params,callback);
    }

});
