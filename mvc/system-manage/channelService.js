angular.module('cmsService').factory('channelService',function() {
	var service = {};
	service.getChannel = function(params,callback) {
		cms.request('getTschannel',params,callback);
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
