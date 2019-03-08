angular.module('cmsService').service("permissionManageService",function(){
    this.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
    }
    this.getAllRole=function(params,callback){
        cms.request("getAllRole",params,callback);
    }

    this.getAllRight=function(params,callback){
        cms.request("getRight",params,callback);
    }

    this.getRoleRight=function(params,callback){
        cms.request("getRoleRight",params,callback);
    }

    this.addRole=function(params,callback){
        cms.request("addRole",params,callback);
    }

    this.editRole=function(params,callback){
        cms.request("editRole",params,callback);
    }

    this.delRole=function(params,callback){
        cms.request("delRole",params,callback);
    }

    this.modifyRoleRight=function(params,callback){
        cms.request("modifyRoleRight",params,callback);
    }

    this.getAllRoles=function(params,callback){
        cms.request("getAllRoles",params,callback);
    }

    this.getAllRights=function(params,callback){
        cms.request("getAllRights",params,callback);
    }

    this.getRoleRights=function(params,callback){
        cms.request("getRoleRights",params,callback);
    }
    this.AddRole=function(params,callback) {
        cms.request("AddRole",params,callback);
    }
    this.EditRole=function(params,callback) {
        cms.request("EditRole",params,callback);
    }
    this.DeleteRole=function(params,callback) {
        cms.request("DeleteRole",params,callback);
    }
    this.EditRoleRight=function(params,callback) {
        cms.request("EditRoleRight",params,callback);
    }
});
