angular.module('cmsService').factory('alarmMessageService', function () {
	var service = {};
	service.getAlarmMessage = function (params, callback) {
		cms.request("getAlarmMessageOpt", params, callback);
	}

	service.editAlarmMessage = function (params, callback) {
		cms.request('editAlarmMessage', params, callback);
	}

	//导出
	service.exportDataToExcelFile = function (params, callback) {
		cms.exportExcelFile(params, callback);
	}

	service.kMtFgsSubscribe = function(params,callback) {
		cms.request("kMtFgsSubscribe",params,callback);
	}


	return service;
})
