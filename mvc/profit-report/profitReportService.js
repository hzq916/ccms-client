angular.module('cmsService').factory('profitReportService',function() {
	var service = {};
	service.getTamgr = function(params,callback) {
		cms.request('getManager',params,callback);
	}

	service.getTacap = function(params,callback) {
		cms.request('getProduct',params,callback);
	}

	service.getTatrd = function(params,callback) {
		cms.request('getCombStrategy',params,callback);
	}

	service.getProfitReport = function(params,callback) {
		cms.request('getProfitReport',params,callback);
	}

	service.exportExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}

	return service;
})
