angular.module('cmsService').factory('lrTatractService',function() {
	var service = {};
	service.getTatractHold = function(params,callback) {
		cms.request('getTatractHold',params,callback);
	}
	service.addConjuncture = function(code,type) {
		if(type == 1) {
			cms.addLevel2(code,102);
		}
		else if(type == 10) {
			cms.addCtp(code,102);
		}
		else {}
	}
	service.removeConjuncture = function(code,type) {
		if(type == 1) {
			cms.rmLevel2(code,102);
		}
		else if(type == 10) {
			cms.rmCtp(code,102);
		}
		else {}
	}
	service.sendConjuncture = function(level2,ctp) {
		if(level2 == 1) {
			cms.sendLevel2(102);
		}
		if(ctp) {
			cms.sendCtp(102);
		}
	}
	return service;
});
