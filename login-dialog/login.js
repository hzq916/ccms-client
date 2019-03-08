var loginApp = angular.module('loginApp', [
	'loginServices',
	'loginControllers',
	'cmsDirective'
]);
angular.module('cmsDirective', []);
loginServices = angular.module('loginServices', []);
loginServices.factory('LoginService', function () {
	var service = {};
	service.getClientVersion = function () {
		return cms.getClientVersion();
	}
	service.setLogPath = function () {
		cms.setLogPath();
	}
	service.readFileSync = function (path) {
		return cms.readFileSync(path);
	}
	service.writeFileSync = function (path, data) {
		return cms.writeFileSync(path, data);
	}
	service.minLoginWindow = function () {
		cms.send('mini-login-window');
	}
	service.closeLoginWindow = function () {
		cms.send('close-login-window');
	}
	service.showLoginWindow = function () {
		cms.send('show-login-window');
	}
	service.encrypt = function (str) {
		return cms.simple_encrypt(str);
	}
	service.decrypt = function (str) {
		return cms.simple_decrypt(str);
	}
	service.fgsLogin = function (params, callback) {
		cms.fgsLogin(params, callback);
	}

	service.loginSuccess = function () {
		cms.send('login-success');
	}
	service.saveLoginInfo = function (params) {
		cms.send('set-user-info', params);
	}
	service.getMd5Code = function (callback) {
		cms.getMd5(callback);
	}
	//显示弹框
	// service.showModal = function (back, modal, title) {
	// 	var backDiv = document.getElementById(back);
	// 	var modalDiv = document.getElementById(modal);
	// 	var titleDiv = document.getElementById(title);
	// 	// if (1) {
	// 	if (backDiv && modalDiv && titleDiv) {
	// 		//先重置modal位置，并center
	// 		backDiv.style.display = "block";
	// 		//获取背景框的大小
	// 		var backWidth = backDiv.offsetWidth;
	// 		var backHeight = backDiv.offsetHeight;
	// 		//获取弹框大小
	// 		var modalWidth = modalDiv.offsetWidth;
	// 		var modalHeight = modalDiv.offsetHeight;
	// 		//弹框位置
	// 		var leftPos = backWidth / 2 - modalWidth / 2;
	// 		var topPos = backHeight / 2 - modalHeight / 2;
	// 		leftPos = leftPos < 5 ? 5 : leftPos;
	// 		topPos = topPos < 5 ? 5 : topPos;
	// 		modalDiv.style.left = leftPos + "px";
	// 		modalDiv.style.top = topPos + "px";
	// 		function centerModal() {
	// 			if (backDiv && modalDiv && titleDiv) {
	// 				//获取背景框的大小
	// 				var backWidth1 = backDiv.offsetWidth;
	// 				var backHeight1 = backDiv.offsetHeight;
	// 				//获取弹框大小
	// 				var modalWidth1 = modalDiv.offsetWidth;
	// 				var modalHeight1 = modalDiv.offsetHeight;
	// 				//弹框位置
	// 				var leftPos1 = backWidth1 / 2 - modalWidth1 / 2;
	// 				var topPos1 = backHeight1 / 2 - modalHeight1 / 2;
	// 				leftPos1 = leftPos1 < 5 ? 5 : leftPos1;
	// 				topPos1 = topPos1 < 5 ? 5 : topPos1;
	// 				modalDiv.style.left = leftPos1 + "px";
	// 				modalDiv.style.top = topPos1 + "px";
	// 			}
	// 		}
	// 		//为titleDiv添加鼠标按下事件
	// 		//titleDiv.addEventListener('mousedown',startDrag);
	// 		window.addEventListener('resize', centerModal);
	// 		var oDrag = new Drag(modalDiv, { handle: titleDiv, maxContainer: backDiv });
	// 	}
	// }

	// service.hideModal = function (back) {
	// 	var backDiv = document.getElementById(back);
	// 	if (backDiv != undefined) {
	// 		backDiv.style.display = "none";
	// 	}
	// }


	return service;
});
loginControllers = angular.module('loginControllers', []);
loginControllers.controller('loginCtrl', function ($scope, $timeout, LoginService) {
	

	$scope.config = {};
	$scope.systemConfiguration = {};
	$scope.loginInfo = {};
	$scope.showUserForm = true;
	$scope.MD5 = "";
	$scope.clientVersion = "";

	$scope.showKeyBoard = false;
	$scope.modalInfo = {
		path: ""
	};
	$scope.webConfig = {
		type: "",
		name: "",
		ip: "",
		port: ""
	};
	$scope.webConfigTips = {
		name: "",
		ip: "",
		port: ""
	};
	$scope.isAlertBoxHidden = true;


	$scope.electronAppName = "中国银河证券";
	$scope.electronAppLogo = "logo.png";


	
	$scope.loginInit = function () {
		var appLogoPath = process.cwd() + "/logo2.png";
		var appNamePath = process.cwd() + "/name.txt";
		if (cms.checkFile(appLogoPath,appNamePath)) {
			//true 表示存在配置
			console.log('存在配置');
			$scope.electronAppLogo = appLogoPath;
			$scope.electronAppName = cms.checkFile(appLogoPath,appNamePath)["name"];
		} else {
			//false 表示不存在配置
			console.log('不存在配置');
			$scope.electronAppLogo = "logo.png";
			$scope.electronAppName = "";
		}
		//设置日志路径
		LoginService.setLogPath();

		$scope.loginInfo.maidError = false;
		$scope.loginInfo.oidError = false;
		$scope.loginInfo.passError = false;
		$scope.loginInfo.ipError = false;
		$scope.loginInfo.portError = false;
		$scope.loginInfo.login = false;
		$scope.loginInfo.errorString = "";
		$scope.showUserForm = true;
		$scope.clientVersion = LoginService.getClientVersion();
		$scope.loginInfo.savePass = false;
		LoginService.getMd5Code(function (res) {
			$scope.MD5 = res;
			// console.info($scope.MD5)
			if ($scope.loginInfo.login == true) {
				$scope.loginCommit();
			}
		});
		// 读取保存的账号密码
		$scope.config = {
			"login_save_": "0",   //是否保存登录信息 0-不保存 1-保存
			"login_maid_": "",    //登录资产管理人id
			"login_name_": "",    //登录用户名
			"login_psw_": "",     //登录密码
			"login_ip_": "",      //登录IP
			"login_port_": "",    //登录端口
			"webConfigList": [],	//网络配置列表
			"mainWebConfig": ""		//主配置项
		};
		cms.readFile("saveconfig.json", function (err, data) {
			if (!err) {
				try {
					var config_file = JSON.parse(data);
				} catch (e) {
					cms.log("read saveconfig.json error: ", String(e));
					return;
				}
				$scope.config.login_save_ = config_file.login_save_ || $scope.config.login_save_;
				$scope.config.login_maid_ = config_file.login_maid_ || $scope.config.login_maid_;
				$scope.config.login_name_ = config_file.login_name_ || $scope.config.login_name_;
				$scope.config.login_psw_ = config_file.login_psw_ || $scope.config.login_psw_;


				if (config_file.webConfigList) {
					$scope.config.webConfigList = config_file.webConfigList;
					$scope.config.mainWebConfig = config_file.mainWebConfig;
					let webConfig = $scope.getWebConfig($scope.config.mainWebConfig);
					$scope.webConfig.name = webConfig.name;
					$scope.webConfig.ip = webConfig.ip;
					$scope.webConfig.port = webConfig.port;
				} else {
					$scope.config.login_ip_ = config_file.login_ip_ || $scope.config.login_ip_;
					$scope.config.login_port_ = config_file.login_port_ || $scope.config.login_port_;
					$scope.webConfig.ip = $scope.config.login_ip_;
					$scope.webConfig.port = $scope.config.login_port_;
					$scope.config.mainWebConfig = " " + $scope.config.login_ip_ + ":" + $scope.config.login_port_;
					$scope.config.webConfigList.push($scope.config.mainWebConfig);
				}
				$scope.loginInfo.savePass = $scope.config.login_save_ == '1';
				$scope.loginInfo.maid = $scope.config.login_maid_;
				$scope.loginInfo.oid = $scope.config.login_name_;
				$scope.loginInfo.pass = LoginService.decrypt($scope.config.login_psw_);

				$scope.$apply();
			}
		});
		$scope.systemConfiguration = {
			"encrypt": false,
			"marketFgsEncrypt": false
		};
		// 读取配置文件
		cms.readFile("systemConfiguration.json", function (sys_err, sys_data) {
			if (!sys_err) {
				try {
					var sys_file = JSON.parse(sys_data);
				} catch (e) {
					cms.log("read systemConfiguration.json error: ", String(e));
					return;
				}
				$scope.systemConfiguration.encrypt = sys_file.encrypt || $scope.systemConfiguration.encrypt;
				$scope.systemConfiguration.marketFgsEncrypt = sys_file.marketFgsEncrypt || $scope.systemConfiguration.marketFgsEncrypt;
			}
		});
	}
	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {
		LoginService.showLoginWindow();
	});

	//最小化
	$scope.loginMinWindow = function () {
		LoginService.minLoginWindow();
	}
	//关闭
	$scope.loginCloseWindow = function () {
		LoginService.closeLoginWindow();
	}

	//点击保存密码
	$scope.savePass = function () {
		if ($scope.loginInfo.login == true) return;
		$scope.loginInfo.savePass = !$scope.loginInfo.savePass;
	}

	//点击切换
	$scope.loginShowUserForm = function (type, selectConfig) {
		if ($scope.loginInfo.login == true) return;
		$scope.webConfigTips = {
			name: "",
			ip: "",
			port: ""
		};
		$scope.showUserForm = !$scope.showUserForm;
		if (type == 1) {// type:0->添加；1->修改
			$scope.webConfig.type = 1;
			$scope.configType = "修改服务器地址";
			if (selectConfig != "") {
				$scope.config.mainWebConfig = selectConfig;
				let mainWebConfig = $scope.getWebConfig(selectConfig);
				$scope.webConfig.name = mainWebConfig.name;
				$scope.webConfig.ip = mainWebConfig.ip;
				$scope.webConfig.port = mainWebConfig.port;
			}
		} else if (type == 0) {
			$scope.webConfig.type = 0;
			$scope.configType = "添加服务器地址";
			$scope.webConfig.name = "";
			$scope.webConfig.ip = "";
			$scope.webConfig.port = "";
		}
	}

	$scope.getWebConfig = function (strConfig) {
		let webConfig = {};
		webConfig.name = strConfig.split(" ")[0];
		webConfig.ip = strConfig.split(" ")[1].split(":")[0];
		webConfig.port = strConfig.split(" ")[1].split(":")[1];
		return webConfig;
	}

	// $scope.toModifyConfig = function (selectConfig) {
	// 	let selectName = selectConfig.split(" ")[0];
	// 	let selectIp = selectConfig.split(" ")[1].split(":")[0];
	// 	let selectPort = selectConfig.split(" ")[1].split(":")[1];

	// 	console.log("修改" + selectName + ">>" + selectIp + ">>" + selectPort);
	// }
	// $scope.toAddConfig = function () {
	// 	console.log("添加");
	// 	// $scope.modalInfo.path = "./operManage_Add.html";
	// 	// $scope.modalInfo.state = "editAssetAccountDialog";
	// 	// LoginService.showModal("operManage_modal_back", "operManage_Add_modal", "operManage_Add_modal_title");

	// }


	$scope.showKeyBoardDiv = function () {
		$scope.showKeyBoard = !$scope.showKeyBoard;
	}





	//输入框聚焦，取消错误
	// $scope.loginHideError = function (kind) {


	// 	if ($scope.loginInfo.login == true) return;
	// 	switch (kind) {
	// 		case 1:
	// 			//maid
	// 			$scope.loginInfo.maidError = false;
	// 			break;
	// 		case 2:
	// 			//oid
	// 			$scope.loginInfo.oidError = false;
	// 			break;
	// 		case 3:
	// 			//pass
	// 			$scope.loginInfo.passError = false;
	// 			break;
	// 		case 4:
	// 			//ip
	// 			$scope.loginInfo.ipError = false;
	// 			break;
	// 		case 5:
	// 			//port
	// 			$scope.loginInfo.portError = false;
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	$scope.loginInfo.errorString = "";
	// }

	//保存服务器地址信息
	$scope.loginSaveNetInfo = function () {
		$scope.webConfigTips = {
			name: "",
			ip: "",
			port: ""
		};
		var ipReg = /^((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))\.((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))\.((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))\.((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))$/;
		var portReg = /^(0|([1-9][0-9]*))$/;
		if ($scope.webConfig.name === "") {
			$scope.webConfigTips.name = "名称不能为空";
		}
		else if (!ipReg.test($scope.webConfig.ip)) {
			$scope.webConfigTips.ip = "服务器地址不正确";
			$scope.loginInfo.ipError = true;
		}
		else if (!portReg.test($scope.webConfig.port) || Number($scope.webConfig.port) > 65535) {
			$scope.webConfigTips.port = "服务器端口不正确";
			$scope.loginInfo.portError = true;
		}
		else {
			//保存配置信息
			let name = $scope.webConfig.name;
			let ip = $scope.webConfig.ip;
			let port = $scope.webConfig.port;

			if ($scope.webConfig.type == 1) {// 修改
				let index = $scope.config.webConfigList.indexOf($scope.config.mainWebConfig);
				if ($scope.config.mainWebConfig == name + " " + ip + ":" + port) {
					$scope.webConfigTips.port = "修改的配置不能与原配置一致";
					return;
				}
				for (let i = 0; i < $scope.config.webConfigList.length; i++) {
					let configObj = $scope.getWebConfig($scope.config.webConfigList[i]);
					if (index != i && ip + ":" + port == configObj.ip + ":" + configObj.port) {
						$scope.webConfigTips.port = "Ip和端口已存在";
						return;
					} else if (index != i && name == configObj.name) {
						$scope.webConfigTips.name = "名称已存在";
						return;
					}
				}

				$scope.config.mainWebConfig = name + " " + ip + ":" + port;
				$scope.config.webConfigList.splice(index, 1, $scope.config.mainWebConfig);
			} else if ($scope.webConfig.type == 0) {// 添加
				for (let i = 0; i < $scope.config.webConfigList.length; i++) {
					let configObj = $scope.getWebConfig($scope.config.webConfigList[i]);
					if (ip + ":" + port == configObj.ip + ":" + configObj.port) {
						$scope.webConfigTips.port = "Ip和端口已存在";
						return;
					} else if (name == configObj.name) {
						$scope.webConfigTips.name = "名称已存在";
						return;
					}
				}
				if ($scope.config.webConfigList.length == 0) {
					$scope.config.mainWebConfig = name + " " + ip + ":" + port;
				}
				$scope.config.webConfigList.push(name + " " + ip + ":" + port);
			}
			LoginService.writeFileSync("saveconfig.json", JSON.stringify($scope.config));//保存配置
			// $scope.showUserForm = !$scope.showUserForm;
			$scope.loginShowUserForm();
		}
	}

	$scope.delConfig = function (selectConfig) {
		let index = $scope.config.webConfigList.indexOf($scope.config.mainWebConfig);
		$scope.config.webConfigList.splice(index, 1);
		$scope.config.mainWebConfig = $scope.config.webConfigList.length > 0 ? $scope.config.webConfigList[0] : "";
		LoginService.writeFileSync("saveconfig.json", JSON.stringify($scope.config));//保存配置
		$scope.isAlertBoxHidden = true;
	}
	$scope.showAlert = function () {
		$scope.isAlertBoxHidden = false;
	}
	$scope.hiddenAlert = function () {
		$scope.isAlertBoxHidden = true;
	}
	//点击登录
	$scope.loginToServer = function (selectConfig) {
		$scope.config.mainWebConfig = selectConfig;
		let mainWebConfig = $scope.getWebConfig(selectConfig);
		$scope.webConfig.name = mainWebConfig.name;
		$scope.webConfig.ip = mainWebConfig.ip;
		$scope.webConfig.port = mainWebConfig.port;
		if ($scope.loginInfo.login == true) return;
		var ipReg = /^((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))\.((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))\.((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))\.((1[0-9][0-9])|(2[0-4][0-9])|(25[0-5])|([1-9][0-9])|([0-9]))$/;
		var portReg = /^(0|([1-9][0-9]*))$/;
		if ($scope.webConfig.name == "") {
			$scope.loginInfo.errorString = "请输入配置服务名称";
		}
		else if (!ipReg.test($scope.webConfig.ip)) {
			$scope.loginInfo.errorString = "请正确配置服务器地址";
			$scope.loginInfo.ipError = true;
		}

		else if (!portReg.test($scope.webConfig.port) || Number($scope.webConfig.port) > 65535) {
			$scope.loginInfo.errorString = "请正确配置服务器端口";
			$scope.loginInfo.portError = true;
		}
		else if ($scope.loginInfo.maid == "") {
			$scope.loginInfo.errorString = "资产管理人不能为空";
			$scope.loginInfo.maidError = false;
		}
		else if ($scope.loginInfo.oid == "") {
			$scope.loginInfo.errorString = "操作员账号不能为空";
			$scope.loginInfo.oidError = false;
		}
		else if ($scope.loginInfo.pass == "") {
			$scope.loginInfo.errorString = "操作员密码不能为空";
			$scope.loginInfo.passError = false;
		}
		else {
			$scope.loginInfo.errorString = "正在登录...";

			$scope.config.mainWebConfig = $scope.webConfig.name + " " + $scope.webConfig.ip + ":" + $scope.webConfig.port;

			if (!$scope.config.webConfigList) {
				$scope.config.webConfigList.push($scope.config.mainWebConfig);
			}
			if ($scope.loginInfo.savePass == true) {
				$scope.config.login_save_ = '1';
				$scope.config.login_maid_ = $scope.loginInfo.maid;
				$scope.config.login_name_ = $scope.loginInfo.oid;
				$scope.config.login_psw_ = LoginService.encrypt($scope.loginInfo.pass);
			}
			else {
				$scope.config.login_save_ = '0';
				$scope.config.login_maid_ = "";
				$scope.config.login_name_ = "";
				$scope.config.login_psw_ = "";
			}
			LoginService.writeFileSync("saveconfig.json", JSON.stringify($scope.config));//保存配置
			$scope.loginInfo.login = true;
			cmsNet.setConfiguration($scope.systemConfiguration);
			$scope.loginCommit();

		}
	}

	//进行登录
	$scope.loginCommit = function () {
		if ($scope.MD5 != "") {
			var loginData = {
				head: {},
				body: {
					maid: $scope.loginInfo.maid, oid: parseInt($scope.loginInfo.maid) * 10000 + parseInt($scope.loginInfo.oid),
					pass: $scope.loginInfo.pass, md5: $scope.MD5, appname: "cms", version: $scope.clientVersion,
					fgs_ip: $scope.webConfig.ip, fgs_port: $scope.webConfig.port, operatorType: 0,
					dsn: "*", cpuid: "*", mac: "127.0.0.1", ip: "127.0.0.1"
				}
			};
			loginData.body.userid = loginData.body.oid;

			LoginService.fgsLogin(loginData,
				function (res) {
					if (res.msret.msgcode == "00") {
						//判断写入config
						$scope.loginInfo.errorString = "登录成功";

						var info = {};
						info.maid = $scope.loginInfo.maid;
						info.oid = $scope.loginInfo.maid * 10000 + $scope.loginInfo.oid * 1;
						LoginService.saveLoginInfo(info);
						LoginService.loginSuccess();
						$scope.$apply();
					}
					else {
						$scope.loginInfo.login = false;
						$scope.loginInfo.errorString = res.msret.msg;
						$scope.$apply();
					}
				});
			cms.listenQtpClose(function (res1) {
				if (res1.msret.msgcode != "00") {
					$scope.loginInfo.login = false;
					$scope.loginInfo.errorString = res1.msret.msg;
					$scope.$apply();
				}
			});
		}
	}

	// 登录界面按enter
	$scope.loginKeyDown = function (ev) {
		if (ev.keyCode == "13") {
			$scope.loginToServer();
			return;
		}
	}

	// 网络地址框按enter
	$scope.netInfoKeyDown = function (ev) {
		if (ev.keyCode == "13") {
			$scope.loginSaveNetInfo();
			return;
		}
	}

});
// function Drag() {
//     //初始化
//     this.initialize.apply(this, arguments)
// }
// Drag.prototype = {
//     //初始化
//     initialize: function (drag, options) {
//         this.drag = this.$(drag);
//         this._x = this._y = 0;
//         this._moveDrag = this.bind(this, this.moveDrag);
//         this._stopDrag = this.bind(this, this.stopDrag);

//         this.setOptions(options);

//         this.handle = this.$(this.options.handle);
//         this.maxContainer = this.$(this.options.maxContainer);

//         this.maxTop = Math.max(this.maxContainer.clientHeight, this.maxContainer.scrollHeight) - this.drag.offsetHeight;
//         this.maxLeft = Math.max(this.maxContainer.clientWidth, this.maxContainer.scrollWidth) - this.drag.offsetWidth;

//         this.limit = this.options.limit;
//         this.lockX = this.options.lockX;
//         this.lockY = this.options.lockY;
//         this.lock = this.options.lock;

//         this.onStart = this.options.onStart;
//         this.onMove = this.options.onMove;
//         this.onStop = this.options.onStop;

//         this.handle.style.cursor = "move";

//         this.changeLayout();

//         this.addHandler(this.handle, "mousedown", this.bind(this, this.startDrag))
//     },
//     changeLayout: function () {
//         this.drag.style.top = this.drag.offsetTop + "px";
//         this.drag.style.left = this.drag.offsetLeft + "px";
//         this.drag.style.position = "absolute";
//         this.drag.style.margin = "0"
//     },
//     startDrag: function (event) {
//         var event = event || window.event;

//         this._x = event.clientX - this.drag.offsetLeft;
//         this._y = event.clientY - this.drag.offsetTop;

//         this.addHandler(document, "mousemove", this._moveDrag);
//         this.addHandler(document, "mouseup", this._stopDrag);

//         event.preventDefault && event.preventDefault();
//         this.handle.setCapture && this.handle.setCapture();

//         this.onStart()
//     },
//     moveDrag: function (event) {
//         var event = event || window.event;

//         var iTop = event.clientY - this._y;
//         var iLeft = event.clientX - this._x;

//         if (this.lock) return;

//         this.limit && (iTop < 5 && (iTop = 5), iLeft < 5 && (iLeft = 5), iTop > this.maxTop - 5 && (iTop = this.maxTop - 5), iLeft > this.maxLeft - 5 && (iLeft = this.maxLeft - 5));

//         this.lockY || (this.drag.style.top = iTop + "px");
//         this.lockX || (this.drag.style.left = iLeft + "px");

//         event.preventDefault && event.preventDefault();

//         this.onMove()
//     },
//     stopDrag: function () {
//         this.removeHandler(document, "mousemove", this._moveDrag);
//         this.removeHandler(document, "mouseup", this._stopDrag);

//         this.handle.releaseCapture && this.handle.releaseCapture();

//         this.onStop()
//     },
//     //参数设置
//     setOptions: function (options) {
//         this.options =
//             {
//                 handle: this.drag, //事件对象
//                 limit: true, //锁定范围
//                 lock: false, //锁定位置
//                 lockX: false, //锁定水平位置
//                 lockY: false, //锁定垂直位置
//                 maxContainer: document.documentElement || document.body, //指定限制容器
//                 onStart: function () { }, //开始时回调函数
//                 onMove: function () { }, //拖拽时回调函数
//                 onStop: function () { }  //停止时回调函数
//             };
//         for (var p in options) this.options[p] = options[p]
//     },
//     //获取id
//     $: function (id) {
//         return typeof id === "string" ? document.getElementById(id) : id
//     },
//     //添加绑定事件
//     addHandler: function (oElement, sEventType, fnHandler) {
//         return oElement.addEventListener ? oElement.addEventListener(sEventType, fnHandler, false) : oElement.attachEvent("on" + sEventType, fnHandler)
//     },
//     //删除绑定事件
//     removeHandler: function (oElement, sEventType, fnHandler) {
//         return oElement.removeEventListener ? oElement.removeEventListener(sEventType, fnHandler, false) : oElement.detachEvent("on" + sEventType, fnHandler)
//     },
//     //绑定事件到对象
//     bind: function (object, fnHandler) {
//         return function () {
//             return fnHandler.apply(object, arguments)
//         }
//     }
// };
