(function(){
	var ipc = require('electron').ipcMain;
	var login_info = {userid:"", fgs_ip:"", fgs_port:"", fgs_user:"", fgs_password:"",md5:""}; 	 //保存登录信息  maid,oid
	var maxWindow  =  false;     //为后面做窗口最大化和还原预留
	var autoMove = false;
	var logPath = "";			 // 日志路径


	function init() {
		var date = new Date();
		var day = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
		var time = date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds();
		logPath = "cms_" + day + "_" + time + ".txt";

		ipc.on('get-log-path',function(event) {
			event.returnValue = logPath;
		})
		ipc.on('set-user-info',function(event,arg) {
			login_info = (arg);
		})
		ipc.on('get-user-info',function(event) {
			event.returnValue = (login_info);
		})

	}
	function setMaxWindow(state) {
		maxWindow = state;
	}
	function getMaxWindow() {
		return maxWindow;
	}

	function setAutoMove(state) {
		autoMove = state;
	}
	function getAutoMove() {
		return autoMove;
	}
	function resetLoginInfo() {
		login_info = {userid:"", fgs_ip:"", fgs_port:"", fgs_user:"", fgs_password:""};
	}
	module.exports = {
		init : init,
		setMaxWindow: setMaxWindow,
		getMaxWindow: getMaxWindow,
		setAutoMove: setAutoMove,
		getAutoMove: getAutoMove,
		resetLoginInfo: resetLoginInfo,
		userInfo: login_info
	}
})()
