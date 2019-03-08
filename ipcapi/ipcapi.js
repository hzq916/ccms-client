(function () {
	var ipc = require('electron').ipcMain;
	var app = require('electron').app;
	var path = require('path');
	var fs = require("fs");
	const qtpmodule = require('qtp-client');
	var cmsFgs = new qtpmodule.QtpService(), marketFgs = new qtpmodule.QtpService();
	var qtpOption = new qtpmodule.QtpMessageOption(); 
	var qtpTopicOption = new qtpmodule.QtpMessageOption();
	var alarmMessageSender = {};
	var subscribedCodeArray = {}; //保存已经订阅的行情
	var userInfo = require("./usermodel.js").userInfo;
	var CmsMsgType = require('./msgtype');
	var CmsMsgTypeNew = require('./msgtype_new');
	var BrowserWindow = require('electron').BrowserWindow;
	var windowObject = null;
	var { tgwapi } = require("./tgwpass.js");
	var lastPassword = "";
	var fgsOutTimer, cmsLoginTimer, fgsConnectTimer; //fgs登录的超时定时器

	process.on("uncaughtException", function (e) {
		console.error("ipcapi-uncaughtException", e);
		writeLog(JSON.stringify(e));
	});

	var os = require("os");
	var child_process = require("child_process");

	function writeLog(data) {
		fs.writeFileSync("./log/cmsLog.txt", data, {flag: 'a'});
	}

	function getMacAndIp(ipArray, family) {
		if (!ipArray || !ipArray.length || ipArray.length == 0) {
			writeLog("[" + new Date().toLocaleString() + "] " + ipArray+"\n");
			return { address: "127.0.0.1", mac: "000000000000" };
		}
		family = family || "IPv4"
		var networkInfo = os.networkInterfaces();
		for (var o in networkInfo) {
			var netInfoArray = networkInfo[o];
			for (var i = 0; i < netInfoArray.length; i++) {
				if (netInfoArray[i].family == family && ipArray.indexOf(netInfoArray[i].address) != -1) {
					// writeLog("[" + new Date().toLocaleString() + "] " + ipArray+"\n");
					// writeLog("[" + new Date().toLocaleString() + "] " + JSON.stringify(networkInfo)+"\n");
					return { address: netInfoArray[i].address, mac: netInfoArray[i].mac };
				}
			}
		}

		writeLog("[" + new Date().toLocaleString() + "] " + ipArray+"\n");
		writeLog("[" + new Date().toLocaleString() + "] " + JSON.stringify(networkInfo)+"\n");
		let propsArr = Object.getOwnPropertyNames(os.networkInterfaces())
		return { address: netInfoArray[propsArr[0]].address, mac: netInfoArray[propsArr[0]].mac };
	}

	function bootstrapUpdater(version, updateUrls, nowVersion) {
		console.log("update: ", version, updateUrls, nowVersion)
		var child = child_process.fork(`${__dirname}/updater.js`, [version, updateUrls, nowVersion]);
		process.on("exit", function () {
			child.kill();
		});
		child.on("message", function (ev) {
			switch (ev.type) {
				case "has-update":
					console.log("has-update ", ev.value.version)
					if (ev.value.isForce === 1) {
						autoUpdateEmit("hasUpdateForce", ev.value.version);
					} else {
						autoUpdateEmit("hasUpdate", ev.value.version);
					}
					ipc.on("cms_toupdate", (event, arg) => {
						child.send({ type: "download", value: arg });
					});
					break;
				case "downloaded":
					autoUpdateEmit("updateDownloaded", ev.value);
					var savedPath = ev.value.savedPath;
					var targetPath = ev.value.targetPath;
					var tmpPath = targetPath + ".tmp";
					var spwanCover = function () {
						child_process.spawn("cover.bat", [], {
							detached: true,
							shell: false,
							windowsHide: true,
							stdio: "ignore"
						});
					}
					ipc.on("cms_toinstall", (event, arg) => {
						// child.send({ type: "update", value: arg })
						if (arg === 1) {
							const readStream = fs.createReadStream(savedPath).pipe(fs.createWriteStream(tmpPath));
							if (process.platform.match("win")) {
								let cwd = process.cwd();
								const batStr = `Wscript sleep.vbs\r\n
                        move /Y resources\\app.asar.tmp resources\\app.asar\r\n
                        start /B ccms.exe`;
								const vbsStr = `WScript.sleep 2000`;
								readStream.on("finish", () => {
									fs.writeFileSync(path.join(cwd, "cover.bat"), batStr);
									fs.writeFileSync(path.join(cwd, "sleep.vbs"), vbsStr);
									spwanCover();
									if (!child.killed) {
										child.kill();
									}
									// autoUpdateEmit("updated", ev);
									!!windowObject && windowObject.close();
								});

							} else {
								readStream.on("error", err => {
									console.log(err);
								}).on("finish", () => {
									console.log("finished");
									fs.renameSync(tmpPath, targetPath);
									if (!child.killed) {
										child.kill();
									}
									autoUpdateEmit("updated", ev);
								});
							}
						} else {
							var readStream = fs.createReadStream(savedPath).pipe(fs.createWriteStream(tmpPath));
							if (process.platform.match("win")) {
								let cwd = process.cwd();
								const batStr = `Wscript sleep.vbs\r\n
                        move /Y resources\\app.asar.tmp resources\\app.asar\r\n`;
								const vbsStr = `WScript.sleep 1500`;
								readStream.on("finish", () => {
									fs.writeFileSync(path.join(cwd, "cover.bat"), batStr);
									fs.writeFileSync(path.join(cwd, "sleep.vbs"), vbsStr);
									app.on("quit", () => {
										spwanCover();
									});
								});
							} else {
								readStream.on("error", err => {
									console.log(err);
								}).on("finish", () => {
									app.on("quit", () => {
										fs.renameSync(tmpPath, targetPath);
									});
								});
							}
						}
					});
					break;
				case "progress":
					console.log("progress");
					break;
				case "updated":
					if (!child.killed) {
						child.kill();
					}
					autoUpdateEmit("updated", ev);
					break;
				default:
					break;
			}
		});
	}

	function autoUpdateEmit(signName, params) {
		if (windowObject && !windowObject.webContents.isDestroyed()) {
			windowObject.webContents.send(signName, params);
		}
	}

	function init(config) {

		ipc.on('setConfiguration', function (event, arg) {
			var configuration = (arg);
			userInfo.encrypt = configuration.encrypt;
			userInfo.marketFgsEncrypt = configuration.marketFgsEncrypt;
		});

		marketFgs.addSlot({
			service: 0,
			msgtype: 100,
			callback: (arg) => {
				console.log(arg.toString());
			}
		});

		cmsFgs.addSlot({
			service: 0,
			msgtype: 100,
			callback: (arg) => {
				console.log(arg.toString());
			}
		});

		ipc.on('fgs_login', function (event, arg) {
			var packager = (arg);
			var head = packager.head;
			var qtp;

			clearTimeout(fgsOutTimer);
			clearTimeout(cmsLoginTimer);
			clearTimeout(fgsConnectTimer);
			console.log("连接fgs行情站点数据--------");
			console.log(packager);

			if (packager.body.fgs_type == "marketConnection") {
				qtp = marketFgs;
				qtp.onClose = null;
				qtp.dispose();

				setTimeout(function () {
					if (userInfo.marketFgsEncrypt) {
						qtp.connect(packager.body.fgs_port, packager.body.fgs_ip);
					} else {
						qtp.connect(packager.body.fgs_port, packager.body.fgs_ip, false);
					}
				}, 1000);

			} else {
				qtp = cmsFgs;
				qtp.dispose();

				if (userInfo.encrypt) {
					qtp.connect(packager.body.fgs_port, packager.body.fgs_ip);
				} else {
					qtp.connect(packager.body.fgs_port, packager.body.fgs_ip, false);
				}
			}

			// 当30s超时后,不能再次激活onConnect函数
			fgsConnectTimer = setTimeout(function () {
				qtp.onConnect = null;
			}, 30 * 1000);

			qtp.onConnect = function (ipArray) {
				console.log("qtp.onConnect");
				clearTimeout(fgsConnectTimer);

				qtp.onClose = function () {
					console.log("fgs.onClose ");
					if (packager.body.fgs_type == "marketConnection") {
						var ret = { head: { reqsn: 3 }, body: {}, msret: { msgcode: "99", msg: "market_fgs连接关闭" } };
					} else {
						var ret = { head: { reqsn: 2 }, body: {}, msret: { msgcode: "99", msg: "cms_fgs连接关闭" } };
					}

					if (windowObject && !windowObject.webContents.isDestroyed()) {
						windowObject.webContents.send('fgs_info_back', ret);
					}





				}
				packager.body.opass = tgwapi.pass(packager.body.pass);
				delete packager.body.pass;
				var netInfo = getMacAndIp(ipArray);
				packager.body.mac = netInfo.mac.toLowerCase().replace(/:/g, "");
				packager.body.ip = netInfo.address;
				// packager.body.appname = "cms_" + os.platform();

				//md5可用就用新的,不可用,就用以前的
				if (packager.body.md5) {
					userInfo.md5 = packager.body.md5;
				}

				var loginToFGSStr = JSON.stringify({
					data: {
						user_id: packager.body.userid, password: packager.body.opass,
						dsn: packager.body.dsn, cpuid: packager.body.cpuid, mac: packager.body.mac, ip: packager.body.ip,
						app_name: packager.body.appname, app_version: packager.body.version, app_md5: userInfo.md5
					}
				});

				qtp.send(101, loginToFGSStr, 10, 1);
				fgsOutTimer = setTimeout(function () {
					var ret = { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "99", msg: "连接网关超时" } };
					if (!event.sender.isDestroyed()) {
						event.sender.send('cms_request_back', ret);
					}
				}, 30 * 1000);
			}

			qtp.onError = function () {
				if (packager.body.fgs_type == "marketConnection") {
					var ret = { head: { reqsn: 3 }, body: {}, msret: { msgcode: "99", msg: "market_fgs连接关闭" } };
				} else {
					var ret = { head: { reqsn: 2 }, body: {}, msret: { msgcode: "99", msg: "cms_fgs连接关闭" } };
				}

				if (windowObject && !windowObject.webContents.isDestroyed()) {
					windowObject.webContents.send('fgs_info_back', ret);
				}
			}

			//处理fgs登录回报
			qtp.addSlot({
				service: 10,
				msgtype: 102,
				callback: (msg) => {
					//   console.log("102",msg.toString());
					clearTimeout(fgsOutTimer);
					var loginToFGS = JSON.parse(msg.toString());
					if (loginToFGS.data.ret_code != 0) {
						var ret = { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "01", msg: loginToFGS.data.ret_msg } };
						if (!event.sender.isDestroyed()) {
							event.sender.send('cms_request_back', ret);
						}
					} else {
						if (packager.body.fgs_type == "marketConnection") {
							console.log("登录行情站点成功");
							if (!event.sender.isDestroyed()) {
								event.sender.send('fgs_info_back', { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "00", msg: "登录行情站点成功" } });
							}

							qtp.onTopic(5002, function (key, msg) {
								// console.log(msg.toString());
								if (windowObject && !windowObject.webContents.isDestroyed()) {
									windowObject.webContents.send('ukeyMarketInfo', msg.toString());
								}
							}, this);
						} else {
							userInfo.loginToFgsResult = loginToFGS;
							console.log(loginToFGS, 'fgs登录回报消息++++++++');
							lastPassword = packager.body.opass;
							var ret = { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "00", msg: "登录成功" } };
							if (!event.sender.isDestroyed()) {
								event.sender.send('cms_request_back', ret);
							}
							// var loginToCmsStr = JSON.stringify({ data: { body: packager.body, head: { reqsn: head.pkgId } } });
							// if (CmsMsgType["cmsLogin"]) {
							// 	qtp.addSlot({
							// 		service: 40,
							// 		msgtype: CmsMsgType["cmsLogin"],
							// 		callback: (arg) => {
							// 			clearTimeout(cmsLoginTimer);

							// 			if (packager.body.fgs_type != "marketConnection") {
							// 				lastPassword = packager.body.opass;
							// 			}

							// 			var cmsLoginResult = JSON.parse(arg.toString());
							// 			if (cmsLoginResult.msret.msgcode == "00") {
							// 				userInfo.userid = packager.body.userid;
							// 			}

							// 			if (!event.sender.isDestroyed()) {
							// 				event.sender.send('cms_request_back', cmsLoginResult);
							// 			}
							// 		}
							// 	});
							// 	qtp.send(CmsMsgType["cmsLogin"], loginToCmsStr, 40, 1);
							// 	cmsLoginTimer = setTimeout(function () {
							// 		var ret = { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "99", msg: "登录超时" } };
							// 		if (!event.sender.isDestroyed()) {
							// 			event.sender.send('cms_request_back', ret);
							// 		}
							// 	}, 30 * 1000);
							// } else {
							// 	console.log("没有找到cmsLogin的msgtype");
							// }
						}

					}

				}
			});
		});

		function relogin() {
			//清除掉所有回调函数
			cmsFgs.dispose();
			marketFgs.dispose();
		}

		//当重新登录时需要重置一下东西
		ipc.on('relogin', relogin);

		//处理fgs的强制退出消息
		ipc.on('fgs_kMtLogout', function (event) {
			cmsFgs.addSlot({
				service: 10,
				msgtype: 104,
				callback: (arg) => {
					console.log("该账户在其他地方登录");
					var ret = { head: { reqsn: 1 } };
					if (!event.sender.isDestroyed()) {
						event.sender.send('fgs_kMtLogout', ret);
					}
				}
			});

		});

		ipc.on('cms_request', function (event, arg) {
			var packager = arg;
			var head = packager.head;
			var conid = packager.conid;
			packager.body.params.head = { reqsn: head.pkgId, userid: userInfo.userid, operatorType: 0 };
			var requestToCms;
			var return_msgtype;
			if (packager.body.params.serviceid == 10) {
				requestToCms = {}; 
				requestToCms.data = packager.body.params.body;
				requestToCms.req = {};
				requestToCms.req.reqsn = head.pkgId;
			} else if (packager.body.params.serviceid == 42) {
				requestToCms = packager.body.params.body;
				requestToCms.reqsn = head.pkgId;
			} else {
				requestToCms = { data: packager.body.params };
			}

			if (!packager.body.params.serviceid) {
				packager.body.params.serviceid = 40;
				packager.body.params.msgtype = CmsMsgType[packager.body.actorName];
				return_msgtype = packager.body.params.msgtype;
			} else if (packager.body.params.serviceid == 42) {
				packager.body.params.msgtype = CmsMsgTypeNew[packager.body.actorName];
				return_msgtype = packager.body.params.msgtype;
			} else if (packager.body.params.serviceid == 10){
				packager.body.params.msgtype = CmsMsgTypeNew[packager.body.actorName];
				return_msgtype = packager.body.params.msgtype + 1;
			} else if (packager.body.params.serviceid == 30) {
				return_msgtype = packager.body.params.msgtype + 1;
				requestToCms.data.head['userid'] = userInfo['loginToFgsResult']['data']['user_id'];

				console.log(requestToCms);
				console.log('*********30服务');
			} else {
				return_msgtype = packager.body.params.msgtype;
			}


			cmsFgs.send(packager.body.params.msgtype, JSON.stringify(requestToCms), packager.body.params.serviceid, 1);
			cmsFgs.addSlot({
				service: packager.body.params.serviceid,
				msgtype: return_msgtype,
				callback: (body) => {
					var ret = JSON.parse(body.toString());
					if (!event.sender.isDestroyed()) {
						if (ret.req) {
							ret.head = { reqsn: ret.req.reqsn };
						}
						if (parseInt(packager.body.params.serviceid) === 30 ) {
							ret.head = {reqsn: ret.head.reqsn};
						}
						event.sender.send('cms_request_back', ret);
					}
				}
			});
		});

		ipc.on('unlockView', function (event, arg) {
			var head = arg.head;
			var unlockPassword = tgwapi.pass(arg.body.pass);
			if (lastPassword == unlockPassword) {
				var ret = { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "00", msg: "成功" } };
			} else {
				var ret = { head: { reqsn: head.pkgId }, body: {}, msret: { msgcode: "01", msg: "密码不正确" } };
			}
			if (!event.sender.isDestroyed()) {
				event.sender.send('cms_request_back', ret);
			}
		});

		ipc.on('subscribeMarket', function (event, codeArray) {
			var addCode = [];
			codeArray.forEach(function (code) {
				if (!subscribedCodeArray.hasOwnProperty(code)) {
					subscribedCodeArray[code] = 1;
					addCode.push(code);
				} else {
					++subscribedCodeArray[code];
				}
			});
			if (addCode.length) {
				marketFgs.subscribe(5002, addCode, false, 50);
			}
		});

		ipc.on('unsubscribeMarket', function (event, codeArray) {
			var delCode = [];
			codeArray.forEach(function (code) {
				if (subscribedCodeArray.hasOwnProperty(code)) {
					--subscribedCodeArray[code];
					if (subscribedCodeArray[code] == 0) {
						delCode.push(code);
						delete subscribedCodeArray[code];
					}
				}
			});
			if (delCode.length) {
				marketFgs.subscribe(5002, delCode, true, 50);
			}
		});


		//订阅告警消息 status_monitor_info  alarm_message
		ipc.on('kMtFgsSubscribe', function (event, codeArray) {
			    alarmMessageSender = event.sender;
				let options = [];
				qtpTopicOption.id = 16;
				qtpTopicOption.value = Buffer.from("alarm_message");
				options.push(qtpTopicOption);
				qtpOption.id = 13;
				qtpOption.value = Buffer.from("alarm_message");
				options.push(qtpOption);
				cmsFgs.sendWithOption(18, options, null, 40, 0);
				console.log("订阅~~~~~~~~~~~~~",options);

				cmsFgs.addSlot({
					service: 40,
					msgtype: 20,
					callback: (msg)=> {
						console.info(JSON.parse(msg));
						event.sender.send('subscribeMarket_back', JSON.parse(msg));
					}
				})
		});


		//取消订阅告警消息 
		ipc.on('unkMtFgsSubscribe', function (event, codeArray) {
			alarmMessageSender = event.sender;
			let options = [];
			qtpTopicOption.id = 16;
			qtpTopicOption.value = Buffer.from("alarm_message");
			options.push(qtpTopicOption);
			qtpOption.id = 13;
			qtpOption.value = Buffer.from("alarm_message");
			options.push(qtpOption);
			cmsFgs.sendWithOption(19, options, null, 40, 0);
			console.log("取消订阅~~~~~~~~~~~~~",options);

			cmsFgs.addSlot({
				service: 40,
				msgtype: 20,
				callback: (msg)=> {
					console.info(JSON.parse(msg));
				}
			})
	});


		
		
		

		ipc.on("cms_tgwcfg", (event, arg) => {
			event.returnValue = tgwapi.pass(arg.value);
		});

		ipc.on("cms_autoupdate", (event, arg) => {
			bootstrapUpdater(arg.version, arg.updateUrls, arg.nowVersion);
		});

	}

	function setWindowObject(win) {
		windowObject = win;
	}

	module.exports = {
		init: init,
		setWindowObject: setWindowObject
	};
})()
