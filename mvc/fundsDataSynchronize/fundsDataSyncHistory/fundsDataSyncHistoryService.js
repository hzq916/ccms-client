angular.module('cmsService').factory('fundsDataSyncHIstoryService',function() {
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
	

	service.getOperatorLogData = function(params,callback) {
		cms.request('getTsoperLog',params,callback);
	}

	//查询操作日志明细
	service.getTsoperLogDetail=function(params,callback){
        cms.request("getTsoperLogDetail",params,callback);
	}
	return service;
})
