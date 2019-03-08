angular.module('cmsService').factory('lrOrderService',function() {
	var service = {};
	service.getCommand = function(params,callback) {
		cms.request('getCommand',params,callback);
	}
	service.getOrder = function(params,callback) {
		cms.request('getTaorder',params,callback);
	}
	service.getHisOrder = function(params,callback) {
		cms.request('getHisOrder',params,callback);
	}
	service.exportExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}
	service.modifyOrder = function(params,callback) {
		cms.request('altOrder',params,callback);
	}
	return service;
});
