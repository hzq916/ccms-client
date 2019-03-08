angular.module('cmsService').factory('wellcomeService',function() {
	var service = {};
	service.getOpsServer = function(params,callback) {
		cms.request('getOpsServer',params,callback);
	}
	service.getOpsService = function(params,callback) {
		cms.request('getOpsService',params,callback);
	}
	service.getOpsBasicInfo = function(params,callback) {
		cms.request('getStatusMonitorInfo',params,callback);
	}
	service.getServicePort = function(params,callback) {
		cms.request('getServicePort',params,callback);
	}
	service.getTschannel = function(params,callback) {
		cms.request('getTschannel',params,callback);
	}
	service.getModule = function(params,callback) {
		cms.request('getModule',params,callback);
	}
	service.addServer = function(params,callback) {
		cms.request('addServer',params,callback);
	}
	service.updateServer = function(params,callback) {
		cms.request('updateServer',params,callback);
	}
	service.deleteServer = function(params,callback) {
		cms.request('deleteServer',params,callback);
	}
	service.addService = function(params,callback) {
		cms.request('addService',params,callback);
	}
	service.updateService = function(params,callback) {
		cms.request('updateService',params,callback);
	}
	service.deleteService = function(params,callback) {
		cms.request('deleteService',params,callback);
	}
	service.moveService = function(params,callback) {
		cms.request('moveService',params,callback);
	}
	service.getChannelType = function(params,callback) {
		cms.request('getChannelType',params,callback);
	}
	service.getTsbroker = function(params,callback) {
		cms.request('getTsbroker',params,callback);
	}

	service.addChannel = function(params,callback) {
		cms.request('AddChannel',params,callback);
	}

	service.updateChannel = function(params,callback) {
		cms.request('AltChannel',params,callback);
	}
	return service;
})
