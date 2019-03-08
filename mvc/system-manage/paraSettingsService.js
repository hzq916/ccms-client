angular.module('cmsService').factory('paraSettingsService',function() {
	var service = {};

	//获取全局参数配置信息
	service.getGlobalParaData = function(requestData,callback) {
		cms.request('getGlobalConfig',requestData,callback);
	}

	//修改全局参数配置信息
	service.setGlobalParaData = function(requestData,callback) {
		cms.request('AltGlobalConfig',requestData,callback);
	}
	return service;
})
