angular.module('cmsService').factory('operManageService',function() {
	var service = {};


	//调用接口，获取资产管理人信息
	service.getTamgrData = function(requestData,callback) {
		cms.request('getManager',requestData,callback);
	}

	//获取操作员信息
	service.getOperData = function(requestData,callback) {
		cms.request('getOperator',requestData,callback);
	}

	//添加操作员
	service.AddNewOper = function(requestData,callback) {
		cms.request('AddOper',requestData,callback);
	}

	//修改操作员信息
	service.updateOperInfo = function(requestData,callback) {
		cms.request('AltOperInfo',requestData,callback);
	}

	//冻结、解冻操作员
	service.freezeOper = function(requestData,callback) {
		cms.request('AltOperInfo',requestData,callback);
	}

	//修改操作员密码
	service.updateOperPsw = function(requestData,callback) {
		cms.request('AltOperPsw',requestData,callback);
	}

	service.getAllRole=function(params,callback){
		cms.request("getAllRole",params,callback);
	}

	service.getProducts=function(params,callback){
		cms.request("getProduct",params,callback);
	}

	service.getTatrd=function(params,callback){
		cms.request("getCombStrategy",params,callback);
	}

	service.authorizeTrader=function(params,callback){
		cms.request("authorizeTrader",params,callback);
	}


	service.authorizeManager=function(params,callback){
		cms.request("authorizeManager",params,callback);
	}

	service.getOperatorRole=function(params,callback){
		cms.request("getOperatorRole",params,callback);
	}
	service.getAssetAccount=function(params,callback){
		cms.request("getAssetAccount",params,callback);
	}
	service.getTradeAccount=function(params,callback){
		cms.request("getTradeAccount",params,callback);
	}
	service.getUserData=function(params,callback){
		cms.request("getUserData",params,callback);
	}
	service.altUserData=function(params,callback){
		cms.request("altUserData",params,callback);
	}
	service.getAllRoles=function(params,callback){
        cms.request("getAllRoles",params,callback);
    }
	service.getUserInfoNew=function(params,callback){
        cms.request("getUserInfoNew",params,callback);
    }
	service.casUserQuery=function(params,callback){
        cms.request("casUserQuery",params,callback);
    }
	service.casUserCreate=function(params,callback){
        cms.request("casUserCreate",params,callback);
    }
	service.casUserChange=function(params,callback){
        cms.request("casUserChange",params,callback);
    }
	service.getUserByManager=function(params,callback){
        cms.request("getUserByManager",params,callback);
    }
	service.createUser=function(params,callback){
        cms.request("createUser",params,callback);
	}
	
	//获取操作员MAC绑定信息信息
	service.getOperMacBindData = function(params,callback) {
		cms.request('getOperMacBind',params,callback);
	}

	//添加操作员MAC绑定信息
	service.AddNewOperMacBind = function(params,callback) {
		cms.request('AddOperMacBind',params,callback);
	}

	//删除操作员MAC绑定信息
	service.DeleteOperMacBind = function(params,callback) {
		cms.request('deleteOperMacBind',params,callback);
	}

	//修改操作员MAC绑定信息
	service.altOperMacBind = function(params,callback) {
		cms.request('AltOperMacBind',params,callback);
	}

	//导入
	service.parseExcelFile = function(fileDom,callback) {
		cms.parseExcelFile(fileDom,callback);
	}

	service.importExcelFile = function(callback) {
		cms.importExcelFile(callback);
	}

	//导出
	service.exportDataToExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}


	return service;
})
