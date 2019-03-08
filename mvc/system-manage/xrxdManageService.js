angular.module('cmsService').factory('xrxdManageService',function() {
	var service = {};

	//查询ukey表数据
	service.SelUkeyInfo = function(requestData,callback) {
		cms.request('getUkey',requestData,callback);
	}

	//添加除权除息数据
	service.AddNewXrxd = function(requestData,callback) {
		cms.request('AddXrXd',requestData,callback);
	}

	//修改除权除息数据
	service.updateXrxdInfo = function(requestData,callback) {
		cms.request('AltXrXd',requestData,callback);
	}

	//删除xrxd数据
	service.delXrxdInfo = function(requestData,callback) {
		cms.request('DelXrXd',requestData,callback);
	}

	//查询除权除息数据
	service.getXrxdData = function(requestData,callback) {
		cms.request('getXrXd',requestData,callback);
	}

	return service;
})
