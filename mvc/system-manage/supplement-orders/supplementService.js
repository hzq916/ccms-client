angular.module('cmsService').factory('supplementService',function() {
	var service = {};
	service.getTamgr = function(params,callback) {
		cms.request('getManager',params,callback);
	}

	service.getTacap = function(params,callback) {
		cms.request('getProduct',params,callback);
	}

	service.getTaact = function(params,callback) {
		cms.request('getAssetAccount',params,callback);
	}

	service.getTatrd = function(params,callback) {
		cms.request('getCombStrategy',params,callback);
	}

	service.getTrader = function(params,callback) {
		cms.request('getTstrader',params,callback);
	}

	service.getStrategy = function(params,callback) {
		cms.request("getStrategyServer",params,callback);
	}

	service.getMarket=function(params,callback){
		cms.request("getMarket",params,callback);
	}

	service.getCommand = function(params,callback) {
		cms.request('getCommand',params,callback);
	}

	service.getUkeyInfo = function(params,callback) {
		cms.request('getUkey',params,callback);
	}

	service.importExcelFile = function(callback) {
		cms.importExcelFile(callback);
	}

	service.exportExcelFile = function(params,callback) {
		cms.exportExcelFile(params,callback);
	}

	service.getTaorder = function(params,callback) {
		cms.request('getTaorder',params,callback);
	}

	service.addOrder = function(params,callback) {
		cms.request('addOrder',params,callback);
	}

	service.addMultipleOrder = function(params,callback) {
		cms.request('addMultipleOrder',params,callback);
	}

	service.getClearStat = function(params,callback) {
		cms.request("getClearStat",params,callback);
	}

	service.getTermid = function() {
		var userInfo = cms.sendSync("get-user-info");
		if(typeof userInfo.loginToFgsResult != "undefined" && typeof userInfo.loginToFgsResult.term_id != "undefined") {
			return userInfo.loginToFgsResult.term_id;
		}
		else {
			return  "1";
		}
	}

	service.getDirective = function(params,callback) {
		cms.request("getDirective",params,callback);
	}
	service.getOffset = function(params,callback) {
		cms.request("getOffset",params,callback);
	}

	service.formatTime = function(nowDate) {
		if (typeof nowDate == "undefined") {
			nowDate = new Date();
		}
		var year = nowDate.getFullYear();
		var month = nowDate.getMonth() + 1;
		var day = nowDate.getDate();
		var hour = nowDate.getHours();
		var minute = nowDate.getMinutes();
		var second = nowDate.getSeconds();
		var milisecond = nowDate.getMilliseconds();
		var dateStr = "";
		dateStr += year + "-";
		if (month <  10) {
			dateStr += "0";
		}
		dateStr += month + "-";
		if (day < 10) {
			dateStr += "0";
		}
		dateStr += day + " ";
		if (hour < 10) {
			dateStr += "0";
		}
		dateStr += hour + ":";
		if (minute < 10) {
			dateStr += "0";
		}
		dateStr += minute + ":";
		if (second < 10) {
			dateStr += "0";
		}
		dateStr += second + ".";
		if (milisecond < 10) {
			dateStr += "0";
		}
		if (milisecond < 100) {
			dateStr += "0";
		}
		dateStr += milisecond;
		return dateStr;
	}

	return service;
})
