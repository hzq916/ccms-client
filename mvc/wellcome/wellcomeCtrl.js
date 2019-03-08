angular.module('cmsController').controller('wellcomeCtrl',function($scope,$interval,mainService,wellcomeService) {
	$scope.basicInfo = [];
	$scope.servers = [];
	$scope.showServerInfo = false;
	$scope.currentServer = {};
	$scope.serviceListTmp = [];
	$scope.portListTmp = [];
	$scope.servicelist = [];

	$scope.showDetail = false;
	$scope.currentDetail = {};

	$scope.refreshTime = null;
	//设置定时拉取数据
	$scope.timeRuning = false;
	$scope.timer = null;

	$scope.moduleList = [];

	$scope.modalInfo = {};
	$scope.currentEditServer = {};
	$scope.currentService = {};
	$scope.currentEditPort = {};

	$scope.channelTypeList = [];
	$scope.brokerList = [];
	$scope.currentChannel = {};

	$scope.sdsModuleid = cms.c_moduleid_sds;
	$scope.ogsModuleid = cms.c_moduleid_ogs;
	$scope.omsModuleid = cms.c_moduleid_oms;

	$scope.basicDataTime = {};


	$scope.wellcomeInit = function() {
		$scope.basicInfo = [];
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.addServer = 1;
		$scope.modalInfo.stateEnum.deleteServer = 2;
		$scope.modalInfo.stateEnum.addService = 3;
		$scope.modalInfo.stateEnum.deleteService = 4;
		$scope.modalInfo.stateEnum.moveService = 5;
		$scope.modalInfo.stateEnum.editChannel = 6;

		$scope.wellcomeGetOpsBasicInfo();
		$scope.basicDataTime = setInterval(function(){
			$scope.wellcomeGetOpsBasicInfo();
		},1000)
		$scope.servers = [];
		$scope.wellcomeGetOpsServer();
		$scope.wellcomeGetModule();
		$scope.wellcomeGetChannelType();
		$scope.timeRuning = true;
		$scope.timer = $interval(function () {
			$scope.wellcomeRefreshInfo();
		},1000 * 60 * 5);
	}

	//页面关闭
	$scope.$on("$destroy", function() {
		clearInterval($scope.basicDataTime);
		if($scope.refreshTime != null) {
			$interval.cancel($scope.refreshTime);
			$scope.refreshTime = null;
		}
		if($scope.timeRuning == true) {
			$scope.timeRuning = false;
			$interval.cancel($scope.timer);
			$scope.timer = null;
		}
    });

	//菜单改变
	$scope.$on("mainMenuChange",function(event,menu) {
		if(menu.menuId == "2001001" ) {
			$scope.wellcomeRefreshInfo();
			$scope.timeRuning = true;
			$scope.timer = $interval(function () {
				$scope.wellcomeRefreshInfo();
			},1000 * 60 * 5);
		}
		else {
			if($scope.timeRuning == true) {
				$scope.timeRuning = false;
				$interval.cancel($scope.timer);
				$scope.timer = null;
			}
		}
	})

	//刷新页面
	$scope.wellcomeRefreshInfo = function() {
		$scope.wellcomeGetOpsBasicInfo();
		$scope.wellcomeGetOpsServer();
	}

	// 获取模块
	$scope.wellcomeGetModule = function() {
		wellcomeService.getModule({}, function(res) {
			if(res.msret.msgcode == "00") {
				$scope.moduleList = res.body;
				$scope.$apply();
			}
			else {
				cms.message.error("获取模块列表失败.");
				cms.log("获取模块列表失败 : ",JSON.stringify(res.msret));
			}
		});
	}

	// 获取通道类型
	$scope.wellcomeGetChannelType = function() {
		wellcomeService.getChannelType({body:{}},function(typeres) {
			if(typeres.msret.msgcode == "00") {
				$scope.channelTypeList = typeres.body;
			}
			else {
				// cms.message.error("获取通道类型失败，请稍候重试");
				cms.log("获取通道失败：",typeres.msret.msg);
			}
		})
	}

	//获取基础信息
	$scope.wellcomeGetOpsBasicInfo = function() {
		console.log("获取基础信息");
		wellcomeService.getOpsBasicInfo({body:{}},function(res) {
			console.log(res);
			if(res.msret.msgcode == "00") {
				if(res.body.data.length > 0) {
					$scope.basicInfo = res.body.data;
					for(let i = 0; i< $scope.basicInfo.length; i++) {
						$scope.basicInfo[i]["status_info"] = JSON.parse($scope.basicInfo[i]["status_info"]);
					}
					console.log($scope.basicInfo);
				}
			}
			else {
				cms.message.error("读取数据失败.");
				console.log("读取服务器列表失败----");
				cms.log("读取服务器列表失败：",JSON.stringify(res.msret));
			}
			$scope.$apply();
		})
	}



	//获取服务器列表
	$scope.wellcomeGetOpsServer = function() {
		wellcomeService.getOpsServer({body:{}},function(res) {
			if(res.msret.msgcode == "00") {
				if($scope.refreshTime != null) {
					$interval.cancel($scope.refreshTime);
					$scope.refreshTime = null;
				}
				$scope.servers = res.body;
				angular.forEach($scope.servers,function(server) {
					var error = false;
					//解析cpu
					try {
						var cpuInfo = JSON.parse(server.cpu_info);
					} catch (e) {
						cms.log("解析cpu信息失败：",e);
						error = true;
					}
					if(error) {
						server.cpu = "-%";
					}
					else {
						server.cpu = Number(cpuInfo.usage) + "%";
					}
					error = false;
					//解析内存状态
					try {
						var memoryInfo = JSON.parse(server.memory_info);
					} catch (e) {
						cms.log("解析memory信息失败：",e);
						error = true;
					}
					if(error) {
						server.memory = "-";
					}
					else {
						server.memory = Number(memoryInfo.MemUsage_p) + "%";
					}
					if($scope.showServerInfo == true && $scope.currentServer.serverid == server.serverid) {
						$scope.showServerInfo = false;
						$scope.wellcomeClickServer(server);
					}
				})
				$scope.$apply();
				$scope.refreshTime = $interval(function () {
					$scope.wellcomeRefreshServerRuntime();
				}, 1000);
			}
			else {
				cms.message.error("读取数据失败.");
				console.log("读取服务器列表失败----=");
				cms.log("读取服务器列表失败：",JSON.stringify(res.msret));
			}
		})
	}

	//刷新运行时间
	$scope.wellcomeRefreshServerRuntime = function() {
		angular.forEach($scope.servers,function(server) {
			server.runtime_second = Number(server.runtime_second) + 1 ;
			if(server.runtime_second >= 60) {
				server.runtime_second = 0 ;
				server.runtime_minute = Number(server.runtime_minute) + 1;
			}
			if(server.runtime_minute >= 60) {
				server.runtime_minute = 0 ;
				server.runtime_hour = Number(server.runtime_hour) + 1;
			}
		})
	}

	//获取服务列表
	$scope.getOpsService = function() {
		if ( typeof $scope.currentServer.serverid == "undefined") {
			return ;
		}
		var key = false;
		for (var i = 0; i < $scope.servers.length; i ++) {
			if($scope.currentServer.serverid == $scope.servers[i].serverid) {
				key = true;
				break;
			}
		}
		if (key == false) {
			return ;
		}
		var serverid = $scope.currentServer.serverid;
		var reqData = {body: {
			serverid: serverid
		}}
		wellcomeService.getOpsService(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.serviceListTmp = res.body;
				$scope.wellcomeGetOpsServicePorts(serverid);
				$scope.$apply();
			}
			else {
				cms.message.error("读取数据失败.");
				console.log("getOpsService-----");
				cms.log("读取服务列表失败：",JSON.stringify(res.msret));
			}
		})
	}

	// 获取端口信息
	$scope.wellcomeGetOpsServicePorts = function(serverid) {
		var reqData = {body:{
			serverid: serverid
		}};
		wellcomeService.getServicePort(reqData, function(res) {
			if(res.msret.msgcode == "00") {
				$scope.portListTmp = res.body;
				$scope.wellcomeGetChannel(serverid);
			}
			else {
				cms.message.error("读取数据失败.");
				console.log("读取端口数据失败------");
				cms.log("读取端口失败：",JSON.stringify(res.msret));
			}
		})
	}

	// 获取通道信息
	$scope.wellcomeGetChannel = function(serverid) {
		var reqData = {body:{
			serverid: serverid
		}};
		wellcomeService.getTschannel(reqData, function(res) {
			if(res.msret.msgcode == "00") {
				$scope.wellcomeMakeServiceTree($scope.serviceListTmp,$scope.portListTmp,res.body)
				$scope.$apply();
			}
			else {
				// cms.message.error("读取数据失败.");
				console.log("读取通道失败------");
				cms.log("读取通道失败：",JSON.stringify(res.msret));
			}
		})
	}

	// 生成列表
	$scope.wellcomeMakeServiceTree = function(serviceArrTemp,portArr,channelArr) {
		var serviceArr = [];
		$scope.wellcomeSortService(serviceArrTemp,serviceArr);
		for (var i = 0; i < serviceArr.length; i ++) {
			serviceArr[i].checked = false;
			serviceArr[i].leaf = false;
			serviceArr[i].ports = [];
			for (var j = 0; j < portArr.length; ) {
				if ( portArr[j].serviceid == serviceArr[i].serviceid) {
					serviceArr[i].ports.push(portArr[j]);
					portArr.splice(j,1);
				}
				else {
					j ++;
				}
			}
		}
		$scope.servicelist = [];
		var channelChildList = {};
		for(var i = 0; i < channelArr.length; i ++ ) {
			channelChildList[channelArr[i].serviceid] = channelChildList[channelArr[i].serviceid] || [];
			channelChildList[channelArr[i].serviceid].push(channelArr[i]);
		}
		for(var i = 0; i < serviceArr.length; i ++) {
			serviceArr[i].hasChild = false;
			if(channelChildList[serviceArr[i].serviceid]) {
				serviceArr[i].hasChild = true;
			}
			serviceArr[i].leaf = false;
			serviceArr[i].fold = false;
			serviceArr[i].show = true;
			$scope.servicelist.push(serviceArr[i]);
			if(channelChildList[serviceArr[i].serviceid]) {
				for(var j = 0; j < channelChildList[serviceArr[i].serviceid].length; j ++) {
					channelChildList[serviceArr[i].serviceid][j].leaf = true;
					channelChildList[serviceArr[i].serviceid][j].show = true;
					$scope.servicelist.push(channelChildList[serviceArr[i].serviceid][j]);
				}
			}
		}
	}

	// 排序
	$scope.wellcomeSortService = function(zNodes,new_zNodes) {
		zNodes.sort(function(a,b){
            return a.parentid == b.parentid ? a.serviceid - b.serviceid : a.parentid - b.parentid ;
        });
		var parentidList = [];
		var parentObj = {};
		for (var i = 0; i < zNodes.length; i ++) {
			parentObj[zNodes[i].parentid] = zNodes[i].parentid;
		}
		for (var o in parentObj) {
			parentidList.push(parentObj[o]);
		}
		parentidList.sort(function(a,b) {
			return a - b;
		});
		var childList = {};
		for(var i=0;i<zNodes.length;i++){
            childList[zNodes[i].parentid] =   childList[zNodes[i].parentid] || [];
            childList[zNodes[i].parentid].push(zNodes[i]);
        };
		function sort_tree(pId){
            var data    =   childList[pId];
            //不存在子节点，退出
            if(!data ) return ;
			if (parentidList.indexOf(pId) != -1) {
                parentidList.splice(parentidList.indexOf(pId),1);
            }
            //遍历子节点，填充
            for(var i=0;i<data.length;i++){
				new_zNodes.push(data[i]);
				sort_tree(data[i].serviceid);
            }
        };
        // //指定从根节点[pId=0]开始进行排序
		while (parentidList.length > 0) {
			sort_tree(parentidList[0]);
		}
	}

	//点击服务器
	$scope.wellcomeClickServer = function(obj) {
		if($scope.showServerInfo == true && $scope.currentServer.serverid == obj.serverid) {
			$scope.showServerInfo = false;
			return ;
		}
		$scope.showServerInfo = true;
		$scope.currentServer.serverid = obj.serverid;
		$scope.currentServer.servername = obj.servername;
		$scope.currentServer.ip = obj.ip;
		$scope.currentServer.cpu_stat = obj.cpu_stat;
		$scope.currentServer.memory_stat = obj.memory_stat;
		$scope.currentServer.disk_stat = obj.disk_stat;
		$scope.currentServer.network_stat = obj.network_stat;
		$scope.currentServer.show_cpu_stat = $scope.wellcomeGetOpsIndexStat(obj.cpu_stat);
		$scope.currentServer.show_memory_stat = $scope.wellcomeGetOpsIndexStat(obj.memory_stat);
		$scope.currentServer.show_disk_stat = $scope.wellcomeGetOpsIndexStat(obj.disk_stat);
		$scope.currentServer.show_network_stat = $scope.wellcomeGetOpsIndexStat(obj.network_stat);
		$scope.getOpsService();
		//解析服务器
		var error = false;
		//解析cpu信息
		$scope.currentServer.cpuInfo = {
			idel : '-',
			iowait : '-',
			system : '-',
			user : '-',
			usage : '-'
		};
		try {
			var cpuInfo = JSON.parse(obj.cpu_info);
		} catch (e) {
			cms.log("解析cpu信息失败：",e);
			error = true;
		}
		if(error == false) {
			$scope.currentServer.cpuInfo = cpuInfo;
		}
		error = false;
		//解析内存
		$scope.currentServer.memoryInfo = {
			MemTotal : '-',
			MemUsage : '-',
			MemFree : '-',
			MemUsage_p : '-',
			SwapTotal : '-',
			SwapUsage : '-',
			SwapFree : '-',
			SwapUsage_p : '-',
			Cached : '-',
			Buffers : '-'
		};
		try {
			var memoryInfo = JSON.parse(obj.memory_info);
		} catch (e) {
			cms.log("解析memory信息失败：",e);
			error = true;
		}
		if(error == false) {
			$scope.currentServer.memoryInfo = memoryInfo;
		}
		error = false;
		//解析硬盘
		$scope.currentServer.diskInfos = [];
		try {
			var diskInfo = JSON.parse(obj.disk_info);
		} catch (e) {
			cms.log("解析disk信息失败：",e);
			error = true;
		}
		if(error == false) {
			if(diskInfo.multiple_data != undefined) {
				for(var o in diskInfo.multiple_data ) {
					var temp = {};
					temp.diskName = o;
					temp.params = diskInfo.multiple_data[o];
					$scope.currentServer.diskInfos.push(temp);
				}
			}
			else {
				for(var o in diskInfo ) {
					var temp = {};
					temp.diskName = o;
					temp.params = diskInfo[o];
					$scope.currentServer.diskInfos.push(temp);
				}
			}
		}
		error = false;
		//解析网络
		$scope.currentServer.networkInfos = [];
		try {
			var networkInfo = JSON.parse(obj.network_info);
		} catch (e) {
			cms.log("解析network信息失败：",e);
			error = true;
		}
		if(error == false) {
			if(networkInfo.multiple_data != undefined) {
				for(var o in networkInfo.multiple_data ) {
					var temp = {};
					temp.showDetail = false;
					temp.networkName = o;
					temp.params = networkInfo.multiple_data[o];
					$scope.currentServer.networkInfos.push(temp);
				}
			}
			else {
				for(var o in networkInfo ) {
					var temp = {};
					temp.showDetail = false;
					temp.networkName = o;
					temp.params = networkInfo[o];
					$scope.currentServer.networkInfos.push(temp);
				}
			}
		}
	}

	//解析硬件状态
	$scope.wellcomeGetOpsIndexStat = function(stat) {
		var name = "未知";
		if (stat == 1) {
			name = "正常";
		}
		if (stat == 2) {
			name = "警告";
		}
		if (stat == 3) {
			name = "严重";
		}
		if (stat == 4) {
			name = "危险";
		}
		return name;
	}

	//悬浮详情
	$scope.wellcomeCheckMemoryDetail = function(obj) {
		obj.showDetail = !obj.showDetail;
	}

	// 显示弹框
	$scope.wellcomeShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addServer:
				$scope.modalInfo.path = "../wellcome/addServer.html";
				break;
			case $scope.modalInfo.stateEnum.deleteServer:
				$scope.modalInfo.path = "../wellcome/deleteServer.html";
				break;
			case $scope.modalInfo.stateEnum.addService:
				$scope.modalInfo.path = "../wellcome/addService.html";
				break;
			case $scope.modalInfo.stateEnum.deleteService:
				$scope.modalInfo.path = "../wellcome/deleteService.html";
				break;
			case $scope.modalInfo.stateEnum.moveService:
				$scope.modalInfo.path = "../wellcome/moveService.html";
				break;
			case $scope.modalInfo.stateEnum.editChannel:
				$scope.modalInfo.path = "../wellcome/editChannel.html";
				break;
			default:

		}
	}

	// 弹框加载完成
	$scope.wellcomeLoadModalReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addServer:
				mainService.showModal("wellcome_modal_back","wellcome_add_server_modal","wellcome_add_server_modal_title");
				break;
			case $scope.modalInfo.stateEnum.deleteServer:
				mainService.showModal("wellcome_modal_back","wellcome_delete_server_modal","wellcome_delete_server_modal_title");
				break;
			case $scope.modalInfo.stateEnum.addService:
				mainService.showModal("wellcome_modal_back","wellcome_add_service_modal","wellcome_add_service_modal_title");
				break;
			case $scope.modalInfo.stateEnum.deleteService:
				mainService.showModal("wellcome_modal_back","wellcome_delete_service_modal","wellcome_delete_service_modal_title");
				break;
			case $scope.modalInfo.stateEnum.moveService:
				mainService.showModal("wellcome_modal_back","wellcome_move_service_modal","wellcome_move_service_modal_title");
				break;
			case $scope.modalInfo.stateEnum.editChannel:
				mainService.showModal("wellcome_modal_back","wellcome_channel_edit_modal","wellcome_channel_edit_modal_title");
				break;
			default:

		}
	}

	// 关闭弹框
	$scope.wellcomeCloseModal = function() {
		mainService.hideModal("wellcome_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	// 添加服务器
	$scope.wellcomeAddServer = function() {
		$scope.currentEditServer.edit = false;
		$scope.currentEditServer.servername = "";
		$scope.currentEditServer.ip = "";
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.addServer);
	}

	// 编辑服务器
	$scope.wellcomeEditServer = function(obj,_event) {
		$scope.currentEditServer.edit = true;
		$scope.currentEditServer.serverid = obj.serverid;
		$scope.currentEditServer.servername = obj.servername;
		$scope.currentEditServer.ip = obj.ip;
		_event.stopPropagation();
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.addServer);
	}

	// 保存服务器
	$scope.wellcomeSaveEditServer = function() {
		var ipReg = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
		if ($scope.currentEditServer.servername == "") {
			cms.message.error("服务器名称不能为空");
			return ;
		}
		if (!ipReg.test($scope.currentEditServer.ip)) {
			cms.message.error("请正确输入服务器地址");
			return ;
		}
		var reqData = {body: {
			servername: $scope.currentEditServer.servername,
			ip: $scope.currentEditServer.ip
		}};
		if ($scope.currentEditServer.edit == true) {
			reqData.body.serverid = $scope.currentEditServer.serverid;
			wellcomeService.updateServer(reqData, function(res) {
				if (res.msret.msgcode == "00") {
					cms.message.success("操作成功.",5);
					$scope.wellcomeCloseModal();
					$scope.wellcomeGetOpsServer();
				} else {
					cms.message.error("操作失败: "+res.msret.msg);
					cms.log("修改服务器失败: " , JSON.stringify(res.msret));
				}
			});
		}
		else {
			wellcomeService.addServer(reqData, function(res) {
				if (res.msret.msgcode == "00") {
					cms.message.success("操作成功.",5);
					$scope.wellcomeCloseModal();
					$scope.wellcomeGetOpsServer();
				} else {
					cms.message.error("操作失败: "+res.msret.msg);
					cms.log("添加服务器失败: " , JSON.stringify(res.msret));
				}
			});
		}
	}

	// 删除服务器
	$scope.wellcomeDeleteServer = function(obj,_event) {
		$scope.currentEditServer.serverid = obj.serverid;
		$scope.currentEditServer.servername = obj.servername;
		$scope.currentEditServer.ip = obj.ip;
		_event.stopPropagation();
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.deleteServer);
	}

	// 确定删除
	$scope.wellcomeDeleteServerSure = function() {
		var reqData = {body: {
			serverid: $scope.currentEditServer.serverid
		}};
		wellcomeService.deleteServer(reqData, function(res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功.",5);
				$scope.wellcomeCloseModal();
				$scope.wellcomeGetOpsServer();
			} else {
				cms.message.error("操作失败: "+res.msret.msg);
				cms.log("删除服务器失败: " , JSON.stringify(res.msret));
			}
		})
	}

	// 展开服务
	$scope.wellcomeUnfoldService = function(obj,index) {
		obj.fold = false;
		for (var i = index +1 ; i < $scope.servicelist.length; i ++ ) {
			if ($scope.servicelist[i].serviceid > obj.serviceid) {
				return ;
			}
			if ($scope.servicelist[i].serviceid == obj.serviceid) {
				$scope.servicelist[i].show = true;
			}
		}
	}

	// 收起服务
	$scope.wellcomeFoldService = function(obj,index) {
		obj.fold = true;
		for (var i = index +1 ; i < $scope.servicelist.length; i ++ ) {
			if ($scope.servicelist[i].serviceid > obj.serviceid) {
				return ;
			}
			if ($scope.servicelist[i].serviceid == obj.serviceid) {
				$scope.servicelist[i].show = false;
			}
		}
	}

	// 添加服务
	$scope.wellcomeAddService = function() {
		$scope.currentService.edit = false;
		$scope.currentService.serverid = $scope.currentServer.serverid;
		$scope.currentService.servicename = "";
		$scope.currentService.moduleid = $scope.moduleList.length > 0 ? $scope.moduleList[0].moduleid : "";
		$scope.currentService.parentid = "0";
		$scope.currentService.servicetype = "1";
		$scope.currentService.cfg = "*";
		$scope.currentService.ports = [];
		$scope.currentService.addPort = false;
		$scope.currentService.currentAddPort = {};
		$scope.currentService.services = [];
		$scope.currentService.services.push({serviceid: 0, servicename: "无"});
		var serverid = $scope.currentServer.serverid;
		var reqData = {body: {
		}}
		wellcomeService.getOpsService(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				for (var i = 0; i < res.body.length; i ++) {
					$scope.currentService.services.push(res.body[i]);
				}
				$scope.$apply();
			}
		})
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.addService);
	}

	// 编辑服务
	$scope.wellcomeEditService = function(obj) {
		$scope.currentService.edit = true;
		$scope.currentService.serverid = obj.serverid;
		$scope.currentService.serviceid = obj.serviceid;
		$scope.currentService.servicename = obj.servicename;
		$scope.currentService.moduleid = obj.moduleid;
		$scope.currentService.parentid = String(obj.parentid);
		$scope.currentService.servicetype = obj.servicetype;
		$scope.currentService.cfg = obj.cfg;
		$scope.currentService.ports = [];
		for (var i = 0; i < obj.ports.length; i ++) {
			var temp = {};
			temp.port = obj.ports[i].port;
			temp.portname = obj.ports[i].portname;
			temp.edit = false;
			$scope.currentService.ports.push(temp);
		}
		$scope.currentService.addPort = false;
		$scope.currentService.services = [];
		$scope.currentService.services.push({serviceid: 0, servicename: "无"});
		$scope.currentService.currentAddPort = {};
		var serverid = $scope.currentServer.serverid;
		var reqData = {body: {}}
		wellcomeService.getOpsService(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				var temp = res.body;
				$scope.getNotChildArray(temp, $scope.currentService.serviceid);
				for (var i = 0; i < temp.length; i ++) {
					if (temp[i].serviceid != $scope.currentService.serviceid) {
						$scope.currentService.services.push(temp[i]);
					}
				}
				$scope.$apply();
			}
		})
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.addService);
	}

	// 获取非儿子节点
	$scope.getNotChildArray = function(zNodes, serviceid) {
		var childList = {};
		for(var i=0;i<zNodes.length;i++){
            childList[zNodes[i].parentid] =   childList[zNodes[i].parentid] || [];
            childList[zNodes[i].parentid].push(zNodes[i]);
        };
		function filtetChild(nodeid) {
			var data = childList[nodeid];
			if (!data) return ;
			for (var i = 0; i < data.length; i ++) {
				for (var k = 0; k < zNodes.length; k ++) {
					if (data[i].serviceid == zNodes[k].serviceid) {
						zNodes.splice(k, 1);
						break;
					}
				}
				filtetChild(data[i].serviceid);
			}
		}
		filtetChild(serviceid);
	}

	$scope.changeServiceModule = function() {
		if ($scope.currentService.moduleid != $scope.sdsModuleid && $scope.currentService.moduleid != $scope.omsModuleid) {
			$scope.currentService.servicetype = "1";
		}
	}

	// 添加端口
	$scope.wellcomeServiceAddPort = function() {
		$scope.currentService.addPort = true;
		$scope.currentService.currentAddPort.port = "";
		$scope.currentService.currentAddPort.portname = "";
	}

	// 编辑端口
	$scope.wellcomeServiceEditPort = function(obj) {
		obj.edit = true;
		obj.new_port = obj.port;
		obj.new_portname = obj.portname;
	}

	// 保存编辑
	$scope.wellcomeServiceEditPortSave = function(obj) {
		var iReg = /^(0|([1-9][0-9]{0,10}))$/;
		if(!(iReg.test(obj.new_port)  && parseInt(obj.new_port) <= 65535)) {
			cms.message.error("端口地址只能为0~65535");
			return ;
		}
		if (obj.new_portname == "") {
			cms.message.error("端口名称不能为空.");
			return ;
		}
		if (obj.new_port == obj.port) {
			obj.portname = obj.new_portname;
			obj.edit = false;
			return ;
		}
		for (var i = 0; i < $scope.currentService.ports.length; i ++) {
			if ($scope.currentService.ports[i].port == obj.new_port) {
				cms.message.error("该端口已存在.");
				return ;
			}
		}
		obj.port = obj.new_port;
		obj.portname = obj.new_portname;
		obj.edit = false;
		return ;
	}

	// 保存添加端口
	$scope.wellcomeServiceSaveAddPort = function() {
		var iReg = /^(0|([1-9][0-9]{0,10}))$/;
		if(!(iReg.test($scope.currentService.currentAddPort.port)  && parseInt($scope.currentService.currentAddPort.port) <= 65535)) {
			cms.message.error("端口地址只能为0~65535");
			return ;
		}
		if ($scope.currentService.currentAddPort.portname == "") {
			cms.message.error("端口名称不能为空.");
			return ;
		}
		for (var i = 0; i < $scope.currentService.ports.length; i ++) {
			if ($scope.currentService.ports[i].port == $scope.currentService.currentAddPort.port) {
				cms.message.error("该端口已存在.");
				return ;
			}
		}
		var temp = {
			port: $scope.currentService.currentAddPort.port,
			portname: $scope.currentService.currentAddPort.portname,
			edit: false
		};
		$scope.currentService.ports.push(temp);
		$scope.currentService.addPort = false;
	}

	// 取消添加
	$scope.wellcomeServiceCancelAddPort = function() {
		$scope.currentService.addPort = false;
	}

	// 删除端口
	$scope.wellcomeServiceDeletePort = function(index) {
		if ($scope.currentService.ports[index].edit == true) {
			$scope.currentService.ports[index].edit = false;
			return ;
		}
		$scope.currentService.ports.splice(index,1);
	}

	// 保存服务
	$scope.wellcomeSaveService = function() {
		var iReg = /^(0|([1-9][0-9]{0,10}))$/;
		if ($scope.currentService.servicename == "") {
			cms.message.error("服务名称不能为空.");
			return ;
		}
		if ($scope.currentService.moduleid == "") {
			cms.message.error("请选择所属模块.");
			return ;
		}
		if ($scope.currentService.servicetype != "1" && $scope.currentService.servicetype != "0") {
			cms.message.error("请选择服务类型.");
			return ;
		}
		if (!iReg.test($scope.currentService.parentid)) {
			cms.message.error("请输入父服务编号.");
			return ;
		}
		if ($scope.currentService.cfg == "") {
			cms.message.error("请输入服务配置.");
			return ;
		}
		var reqData = {body: {
			serverid: $scope.currentService.serverid,
			servicename: $scope.currentService.servicename,
			moduleid: $scope.currentService.moduleid,
			servicetype: $scope.currentService.servicetype,
			parentid: $scope.currentService.parentid,
			cfg: $scope.currentService.cfg
		}};
		var portList = [];
		angular.forEach($scope.currentService.ports,function(port) {
			var temp = {};
			temp.port = port.port;
			temp.portname = port.portname;
			portList.push(temp);
		});
		reqData.body.portList = portList;
		if ($scope.currentService.edit == true) {
			reqData.body.serviceid = $scope.currentService.serviceid;
			wellcomeService.updateService(reqData, function(res) {
				if (res.msret.msgcode == "00") {
					cms.message.success("操作成功.",5);
					$scope.wellcomeCloseModal();
					$scope.getOpsService();
				} else {
					cms.message.error("操作失败: "+res.msret.msg);
					cms.log("修改服务失败: " , JSON.stringify(res.msret));
				}
			});
		}
		else {
			wellcomeService.addService(reqData, function(res) {
				if (res.msret.msgcode == "00") {
					cms.message.success("操作成功.",5);
					$scope.wellcomeCloseModal();
					$scope.getOpsService();
				} else {
					cms.message.error("操作失败: "+res.msret.msg);
					cms.log("添加服务失败: " , JSON.stringify(res.msret));
				}
			});
		}
	}

	// 删除服务
	$scope.wellcomeDeleteService = function(obj) {
		$scope.currentService.serviceid = obj.serviceid;
		$scope.currentService.servicename = obj.servicename;
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.deleteService);
	}

	// 确定删除服务
	$scope.wellcomeDeleteServiceSure = function() {
		var reqData = {body: {serviceid: $scope.currentService.serviceid}}
		wellcomeService.deleteService(reqData, function(res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功.",5);
				$scope.wellcomeCloseModal();
				$scope.getOpsService();
			} else {
				cms.message.error("操作失败: "+res.msret.msg);
				cms.log("删除服务失败: " , JSON.stringify(res.msret));
			}
		});
	}

	// 转移服务
	$scope.wellcomeMoveService = function() {
		$scope.currentService.old_serverid = $scope.currentServer.serverid;
		$scope.currentService.old_servername = $scope.currentServer.servername + "(" + $scope.currentServer.serverid + ")";
		$scope.currentService.servers = [];
		for (var i = 0; i < $scope.servers.length; i ++) {
			if ($scope.servers[i].serverid != $scope.currentService.old_serverid) {
				$scope.currentService.servers.push({serverid: $scope.servers[i].serverid, servername: $scope.servers[i].servername});
			}
		}
		$scope.currentService.serverid = $scope.currentService.servers.length == 0 ? "" : $scope.currentService.servers[0].serverid;
		$scope.currentService.services = [];
		angular.forEach($scope.servicelist, function(service) {
			if (service.checked == true) {
				$scope.currentService.services.push(service.serviceid);
			}
		})
		if ($scope.currentService.services.length == 0) {
			cms.message.error("请先选择要转移的服务");
			return ;
		}
		$scope.wellcomeShowModal($scope.modalInfo.stateEnum.moveService);
	}

	// 确定转移服务
	$scope.wellcomeMoveServiceSure = function() {
		if ($scope.currentService.serverid == "") {
			cms.message.error("请选择一个服务器");
			return ;
		}
		var reqData = {body: {
			serverid: $scope.currentService.serverid,
			services: $scope.currentService.services
		}};
		wellcomeService.moveService(reqData, function(res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功.",5);
				$scope.wellcomeCloseModal();
				$scope.getOpsService();
			} else {
				cms.message.error("操作失败: "+res.msret.msg);
				cms.log("转移服务失败: " , JSON.stringify(res.msret));
			}
		});
	}


	// 添加通道
	$scope.wellcomeAddChannel = function(service) {
		$scope.currentChannel.edit = false;
		$scope.currentChannel.serviceid = service.serviceid;
		$scope.currentChannel.service_name = service.servicename + "(" + service.serviceid + ")";
		$scope.currentChannel.chid = "";
		$scope.currentChannel.chname = "";
		$scope.currentChannel.bid = "";
		$scope.currentChannel.chtype = "";
		$scope.currentChannel.ip = "";
		$scope.currentChannel.port = "";
		$scope.currentChannel.cfg = "*";
		$scope.currentChannel.stat = "0";
		if($scope.channelTypeList.length > 0) {
			$scope.currentChannel.chtype = String($scope.channelTypeList[0].typeid);
		}
		//获取经纪商
		$scope.brokerList.splice(0,$scope.brokerList.length);
		wellcomeService.getTsbroker({body:{}},function(tbres) {
			if(tbres.msret.msgcode == "00") {
				$scope.brokerList = tbres.body;
				if($scope.brokerList.length > 0) {
					$scope.currentChannel.bid = String($scope.brokerList[0].bid);
				}
				$scope.wellcomeShowModal($scope.modalInfo.stateEnum.editChannel);
				$scope.$apply();
			}
			else {
				cms.message.error("获取经纪商列表失败，请稍候重试");
				cms.log("获取经纪商列表失败",tbres.msret.msg);
			}
		})
	}

	// 编辑通道
	$scope.wellcomeEditChannel = function(channel) {
		$scope.currentChannel.edit = true;
		$scope.currentChannel.chid = channel.chid;
		$scope.currentChannel.serviceid = channel.serviceid;
		$scope.currentChannel.service_name = channel.servicename+"("+channel.serviceid+")";
		$scope.currentChannel.chname = channel.chname;
		$scope.currentChannel.bid = channel.bid;
		$scope.currentChannel.broker = channel.bname + "("+channel.bid+")";
		$scope.currentChannel.chtype = channel.chtype;
		$scope.currentChannel.typename = channel.typename;
		$scope.currentChannel.ip = channel.ip;
		$scope.currentChannel.port = channel.port;
		$scope.currentChannel.cfg = channel.cfg;
		$scope.currentChannel.stat = String(channel.stat);
		$scope.currentChannel.services = [];
		//获取服务列表
		wellcomeService.getOpsService({body:{modules:[cms.c_moduleid_sds,cms.c_moduleid_ogs]}}, function(res) {
			if (res.msret.msgcode != "00") {
				cms.message.error("获取服务失败");
				return;
			}
			$scope.currentChannel.services = res.body;
			$scope.brokerList.splice(0,$scope.brokerList.length);
			wellcomeService.getTsbroker({body:{}},function(tbres) {
				if(tbres.msret.msgcode == "00") {
					$scope.brokerList = tbres.body;
					$scope.wellcomeShowModal($scope.modalInfo.stateEnum.editChannel);
					$scope.$apply();
				}
				else {
					cms.message.error("获取经纪商列表失败，请稍候重试");
					cms.log("获取经纪商列表失败",tbres.msret.msg);
				}
			})
		});
	}

	// 确定
	$scope.wellcomeEditChannelSure = function() {
		var cReg = /^[1-9][0-9]{0,10}$/;
		var iReg = /^(0|([1-9][0-9]{0,10}))$/;
		var ipReg = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
		if(!cReg.test($scope.currentChannel.chid)) {
			cms.message.error("通道编号必须为正整数");
			return ;
		}
		if($scope.currentChannel.chname == "") {
			cms.message.error("通道名称不能为空");
			return ;
		}
		if($scope.currentChannel.bid == "") {
			cms.message.error("请选择一个经纪商");
			return ;
		}
		if( isNaN($scope.currentChannel.serviceid) ) {
			cms.message.error("请选择一个服务");
			return ;
		}
		if($scope.currentChannel.chtype == "") {
			cms.message.error("请设置通道类型");
			return ;
		}
		if(!ipReg.test($scope.currentChannel.ip)) {
			cms.message.error("请正确输入通讯地址IP");
			return ;
		}
		if(!(iReg.test($scope.currentChannel.port)  && parseInt($scope.currentChannel.port) <= 65535)) {
			cms.message.error("端口地址只能为0~65535");
			return ;
		}
		if($scope.currentChannel.cfg == "") {
			cms.message.error("属性配置不能为空，如无需设置请填*");
			return ;
		}
		var reqData = {
			body: {
				chid: $scope.currentChannel.chid,
				serviceid: $scope.currentChannel.serviceid,
				chname: $scope.currentChannel.chname,
				bid: $scope.currentChannel.bid,
				chtype:$scope.currentChannel.chtype,
				ip:$scope.currentChannel.ip,
				port:$scope.currentChannel.port,
				cfg: $scope.currentChannel.cfg,
				stat: $scope.currentChannel.stat
			}
		};
		if($scope.currentChannel.edit == false) {
			wellcomeService.addChannel(reqData,function(addres) {
				if(addres.msret.msgcode == "00") {
					cms.message.success("操作成功",5);
					$scope.wellcomeCloseModal();
					$scope.getOpsService();
					$scope.$emit("changedChannel");
				}
				else {
					cms.message.error("新增通道失败："+addres.msret.msg);
					cms.log("新增通道失败：",addres.msret.msgcode,addres.msret.msg);
				}
			})
		}
		else {
			wellcomeService.updateChannel(reqData,function(updateres) {
				if(updateres.msret.msgcode == "00") {
					cms.message.success("操作成功",5);
					$scope.wellcomeCloseModal();
					$scope.getOpsService();
					$scope.$emit("changedChannel");
				}
				else {
					cms.message.error("修改通道失败："+updateres.msret.msg);
					cms.log("新增通道失败：",updateres.msret.msgcode,updateres.msret.msg);
				}
			})
		}
	}

})
