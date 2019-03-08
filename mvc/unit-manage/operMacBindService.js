angular.module('cmsService').factory('operMacBindService',function() {
	var service = {};


	//调用接口，获取资产管理人信息
	service.getTamgrData = function(requestData,callback) {
		cms.request('getManager',requestData,callback);
	}

	//获取操作员MAC绑定信息信息
	service.getOperMacBindData = function(requestData,callback) {
		cms.request('getOperMacBind',requestData,callback);
	}

	//添加操作员MAC绑定信息
	service.AddNewOperMacBind = function(requestData,callback) {
		cms.request('AddOperMacBind',requestData,callback);
	}

	//删除操作员MAC绑定信息
	service.DeleteOperMacBind = function(requestData,callback) {
		cms.request('deleteOperMacBind',requestData,callback);
	}

	//禁用、启用操作员MAC绑定信息
	service.freezeOperMacBind = function(requestData,callback) {
		cms.request('AltOperMacBind',requestData,callback);
	}

	//修改操作员MAC绑定信息
	service.altOperMacBind = function(requestData,callback) {
		cms.request('AltOperMacBind',requestData,callback);
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
