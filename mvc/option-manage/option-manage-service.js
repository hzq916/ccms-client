angular.module('cmsService').factory('optionManageService',function() {
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

	service.getTatrdOptionHold = function(params,callback) {
		cms.request('getTatrdOptionHold',params,callback);
	}

	service.getTatrdOptionHoldAudit = function(params,callback) {
		cms.request('getTatrdOptionHoldAudit',params,callback);
	}
	service.addTatrdOptionHoldAudit = function(params,callback) {
		cms.request('addTatrdOptionHoldAudit',params,callback);
	}
	service.updateTatrdOptionHoldAudit = function(params,callback) {
		cms.request('updateTatrdOptionHoldAudit',params,callback);
	}
	service.updateTatrdOptionHold = function(params,callback) {
		cms.request('updateTatrdOptionHold',params,callback);
	}
	service.auditTatrdOptionHold = function(params,callback) {
		cms.request('auditTatrdOptionHold',params,callback);
	}

	service.getUkeyInfo = function(params, callback) {
		cms.request('getUkey',params,callback);
	}

	return service;
})
