angular.module('cmsService').factory('brokerManageService',function() {
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

	return service;
})
