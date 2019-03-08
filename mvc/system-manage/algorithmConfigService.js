angular.module('cmsService').factory('algorithmConfigService',function() {
    var service = {};

    service.getAlgoConfig = function(requestData,callback) {
		cms.request('getAlgoConfig',requestData,callback);
    }
    
    service.altAlgoConfig = function(requestData,callback) {
		cms.request('altAlgoConfig',requestData,callback);
    }
    
    service.addAlgoConfig = function(requestData,callback) {
		cms.request('addAlgoConfig',requestData,callback);
	}
    
    return service;
})