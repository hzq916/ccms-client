angular.module('cmsService').factory('positionDataSyncService',function() {
	var service = {};

	//获取经纪商信息
	service.getBrokerData = function(requestData,callback) {
		cms.request('getTsbroker',requestData,callback);
	}

	//添加经纪商
	service.AddNewBroker = function(requestData,callback) {
		cms.request('AddBroker',requestData,callback);
	}

	//修改经纪商信息
	service.updateBrokerInfo = function(requestData,callback) {
		cms.request('AltBroker',requestData,callback);
	}

	//删除经纪商信息
	service.delBrokerData = function(requestData,callback) {
		cms.request('DelBroker',requestData,callback);
	}

	service.getCommand=function(requestData,callback){
        cms.request("getCommand",requestData,callback);
	}
	//资金数据同步
	service.getAllTaMgr=function(params,callback){
        cms.request("getManager",params,callback);
	}
	
	//查询数据同步状态
	service.getTaacctSyncStat = function(params,callback) {
		cms.request("getTaacctSyncStat",params,callback);
	}

	//导出
	service.exportDataToExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}

	//持仓数据同步
	service.getSyncTaacctData = function(params,callback) {
		cms.request("getSyncTaacctData" ,params,callback);
	}

	//撤销
	service.RevertSyncTaacctData = function(params, callback){
		cms.request("RevertSyncTaacctData", params,callback);
	}

	//查询仓位数据同步的仓位详情数据
	service.getTatractHoldSyncDetail = function(params, callback) {
		cms.request("getTatractHoldSyncDetail", params, callback);
	}


	return service;
})
