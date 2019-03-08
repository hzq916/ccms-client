angular.module('cmsService').factory('currencyManageService',function() {
	var service = {};

	//获取币种信息
	service.getCurrencyData = function(requestData,callback) {
		cms.request('getCurrency',requestData,callback);
	}
	return service;
})
