(function() {
	if(typeof cmsNet == "undefined") {
		cmsNet = {
			ukeyMarketInfo:{}
					};
	}
	var ipcRenderer = require('electron').ipcRenderer;
	var pkgId = 10; //1表示fgs的退出账户的消息对应的函数,2表示cmsFgs的onClose错误信息,3表示行情fgs的错误信息
	var cbs = {} , fgsInfoCbs = {};

	function cmslog() {
		var date = new Date();
		var output = "["+date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]";
		for(var i = 0; i < arguments.length; i ++) {
			if (typeof arguments[i] == "object") {
				output += JSON.stringify(arguments[i]);
			} else {
				output += String(arguments[i]);
			}
			output+="\r\n";
		}
		// console.log(output);
		cmsFile.log(output);
	}

	cmsNet.netConnect = false;
	ipcRenderer.on('cms_request_back',function(event,arg) {
		if(typeof arg.head != "undefined" && typeof cbs[arg.head.reqsn] == "function") {
			console.log("=====================");
			cbs[arg.head.reqsn](arg);
			delete cbs[arg.head.reqsn];
		}
	})

	ipcRenderer.on('fgs_info_back',function(event,arg) {
		if(typeof arg.head != "undefined" && typeof cbs[arg.head.reqsn] == "function") {
			fgsInfoCbs[arg.head.reqsn](arg);
		}
	})

	ipcRenderer.on('fgs_kMtLogout',function(event,arg) {
		if(typeof arg.head != "undefined" && typeof cbs[arg.head.reqsn] == "function") {
			cbs[arg.head.reqsn](arg);
			delete cbs[arg.head.reqsn];
		}
	})
	var count = 0;
	ipcRenderer.on("ukeyMarketInfo",function(event, message) {
		var newMarketInfo = JSON.parse(message);
		if (newMarketInfo.last != 0) {
			newMarketInfo.last /= 10000;
		} else {
			newMarketInfo.last = newMarketInfo.pre_close / 10000;
		}

		// if (!cmsNet.ukeyMarketInfo.hasOwnProperty(newMarketInfo.ukey)) {
		// 	 console.log(++count, newMarketInfo.ukey, new Date());
		// }
		cmsNet.ukeyMarketInfo[newMarketInfo.ukey] = newMarketInfo;
	});

	cmsNet.setNetworkState = function(state) {
		cmsNet.netConnect = state;
	}

	cmsNet.setConfiguration = function(configurationString) {
		ipcRenderer.send("setConfiguration",configurationString);
	}

	cmsNet.fgsLogin = function(params,callback) {
		console.log("点击了连接行情确定按钮--------");
		console.log(params);
		if (typeof params.head.pkgId != "undefined") {
			fgsInfoCbs[params.head.pkgId] = callback;
			cbs[params.head.pkgId] = callback;
		} else {
			params.head.pkgId = ++pkgId;
			cbs[pkgId] = callback;
		}
		console.log("-----点击了连接marketINfo");
		ipcRenderer.send("fgs_login",params);
		console.log("&&&&&&&&&&&&&&&@@@@@@@22222");
	}

	// 仅仅是为了设置登录fgs的回调函数,在主界面显示连接变比
	cmsNet.fgsLogin_setCallBack = function(params,callback) {
		fgsInfoCbs[params.head.pkgId] = callback;
	}

	cmsNet.unlockView = function(params,callback) {
		params.head = {pkgId: ++pkgId};
		ipcRenderer.send("unlockView",params);
		cbs[pkgId] = callback;
	}

	cmsNet.request = function(actorName,params,callback,conid) {
		if(cmsNet.netConnect == false) {
			callback({msret:{msgcode:"99",msg:"网络连接已断开，请稍候重试."},body:{}})
			return ;
		}
		var reqData = {};
		if(typeof conid == "undefined") {
			conid = 101;
		}
		reqData.head = {};
		reqData.head.pkgId = ++pkgId;
		reqData.body = {"actorName":actorName,"params":params};
		reqData.conid=conid;
		ipcRenderer.send("cms_request",reqData);
		cbs[pkgId] = callback;
	}

	cmsNet.setAutoUpdateListener = function(funcName, callback) {
		cbs[funcName] = callback;
		ipcRenderer.on(funcName, function(event, arg) {
			if (typeof cbs[funcName] == "function") {
				cbs[funcName](arg);
				delete cbs[funcName];
			}
		});
	}

	cmsNet.listenQtpClose = function(callback) {
		ipcRenderer.on("fgs_info_back", function(event, arg) {
			if (arg.head.reqsn == 2) {
				callback({msret:{msgcode: "99", msg: "网关连接已断开"}});
			}
		});
	}

	cmsNet.fgs_kMtLogout = function(callback) {
		ipcRenderer.send("fgs_kMtLogout");
		cbs[1] = callback;
	}

	cmsNet.tgwCfg = function(id,value) {
		var params={};
		params.id=id;
		params.value=value;
		return ipcRenderer.sendSync("cms_tgwcfg",params);
	}

	cmsNet.send = function(msg,arg) {
		if(typeof arg != "undefined") {
			ipcRenderer.send(msg,arg);
		}
		else {
			ipcRenderer.send(msg);
		}
	}
	cmsNet.sendSync = function(msg,arg) {
		if(typeof arg != "undefined") {
			return ipcRenderer.sendSync(msg,arg);
		}
		else {
			return ipcRenderer.sendSync(msg);
		}
	}
	cmsNet.setWaitTime = function(time) {
		var reqData = {'time':time};
		ipcRenderer.send("cms_set_wait",reqData);
	}

	cmsNet.subscribeMarket = function(codeArray) {
		ipcRenderer.send("subscribeMarket",codeArray);
	}

	//接收告警消息的结果推送消息
	cmsNet.subscribeMarket_back = function(callback) {
		ipcRenderer.on("subscribeMarket_back",function(event, arg) {
			console.log("=====================");
			callback(arg);
		});
	}

	//订阅告警消息
	cmsNet.kMtFgsSubscribe = function(codeArray) {
		ipcRenderer.send("kMtFgsSubscribe",codeArray);
	}

	//取消订阅告警消息
	cmsNet.unkMtFgsSubscribe = function(codeArray) {
		ipcRenderer.send("unkMtFgsSubscribe",codeArray);
	}


	cmsNet.checkWindow = function(callback) {
		ipcRenderer.on("window-maximize", function() {
			callback(true);
		});
		ipcRenderer.on("window-unmaximize", function() {
			callback(false);
		});
	}

})()
