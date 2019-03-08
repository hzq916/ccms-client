angular.module('cmsController').controller('channelCtrl',function($scope,mainService,channelService) {
	$scope.modalInfo = {};
	$scope.currentChannel = {};
	$scope.freezeInfo = {};
	$scope.channelList = [];
	$scope.searchContent = "";
	$scope.channelTypeList = [];
	$scope.brokerList = [];

	$scope.services = [];

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;
	//点击的行
	$scope.clickTr = -1;

	//初始化
	$scope.channelInit = function() {
		$scope.modalInfo.state = 0;             // 弹框默认状态，无定义
		$scope.modalInfo.path = "";				// 弹框路径
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.editChannel = 1;  // 通道编辑，新建
		//$scope.modalInfo.stateEnum.freeze = 2;      // 冻结，解冻
		$scope.searchContent = "";
		$scope.clickTr = -1;
		$scope.channelGetChannel();
		$scope.getChannelType();
	}

	//点击行
	$scope.channelClickTr = function(index) {
		$scope.clickTr = index;
	}

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	// 获取通道类型
	$scope.getChannelType = function() {
		$scope.channelTypeList.splice(0,$scope.channelTypeList.length);
		channelService.getChannelType({body:{}},function(typeres) {
			if(typeres.msret.msgcode == "00") {
				$scope.channelTypeList = typeres.body;
			}
			else {
				cms.log("获取通道失败：",typeres.msret.msg);
			}
		})
	}

	//获取所有的通道信息
	$scope.channelGetChannel = function() {
		var reqData = {body:{}};
		channelService.getChannel(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.channelList = res.body;
				if($scope.searchContent == "") {
					angular.forEach($scope.channelList,function(channel) {
						if(channel.stat == 0) {
							channel.show_stat = "未连接";
						}
						else if(channel.stat == 1) {
							channel.show_stat = "已连接";
						}
						else {
							channel.show_stat = "无效";
						}
						channel.show = true;
					})
				}
				else {
					angular.forEach($scope.channelList,function(channel) {
						if(channel.stat == 0) {
							channel.show_stat = "未连接";
						}
						else if(channel.stat == 1) {
							channel.show_stat = "已连接";
						}
						else {
							channel.show_stat = "无效";
						}
						if(channel.chid.indexOf($scope.searchContent) >= 0 || channel.chname.indexOf($scope.searchContent) >= 0 || channel.bid.indexOf($scope.searchContent) >= 0 || channel.bname.indexOf($scope.searchContent) >= 0 || channel.typename.indexOf($scope.searchContent) >= 0) {
							channel.show = true;
						}
						else {
							channel.show = false;
						}
					})
				}
				$scope.$apply();
			}
			else {
				$scope.channelList.splice(0,$scope.channelList.length);
				$scope.$apply();
				// cms.message.error("获取通道信息失败："+res.msret.msg);
				cms.log("获取通道信息失败："+res.msret.msg);
			}
		})
	}

	//过滤通道
	$scope.channelFilterChannel = function() {
		if($scope.searchContent == "") {
			angular.forEach($scope.channelList,function(channel) {
				channel.show = true;
			})
		}
		else {
			angular.forEach($scope.channelList,function(channel) {
				if(channel.chid.indexOf($scope.searchContent) >= 0 || channel.chname.indexOf($scope.searchContent) >= 0 || channel.bid.indexOf($scope.searchContent) >= 0 || channel.bname.indexOf($scope.searchContent) >= 0 || channel.typename.indexOf($scope.searchContent) >= 0) {
					channel.show = true;
				}
				else {
					channel.show = false;
				}
			})
		}
	}

	//打开弹框
	$scope.channelShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.editChannel:
				$scope.modalInfo.path = "../system-manage/channelEdit.html";
				break;
			case $scope.modalInfo.stateEnum.freeze:
				$scope.modalInfo.path = "../system-manage/channelFreeze.html";
				break;
			default:
				break;
		}
	}
	//弹框加载完成
	$scope.channelLoadModalReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.editChannel:
				mainService.showModal("channel_modal_back","channel_edit_modal","channel_edit_modal_title");
				break;
			case $scope.modalInfo.stateEnum.freeze:
				mainService.showModal("channel_modal_back","channel_freeze_modal","channel_freeze_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭弹框
	$scope.channelHideModal = function() {
		mainService.hideModal("channel_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//新建通道
	$scope.channelAddChannel = function() {
		$scope.currentChannel.edit = false;
		$scope.currentChannel.serviceid = "";
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

		//获取服务列表
		mainService.getOpsService({body:{modules:[cms.c_moduleid_sds,cms.c_moduleid_ogs]}}, function(res) {
			if (res.msret.msgcode != "00") {
				cms.message.console.error("获取服务失败");
				return;
			}
			$scope.services = res.body;
			if ($scope.services.length) {
				$scope.currentChannel.serviceid = $scope.services[0].serviceid;
			}
			$scope.brokerList.splice(0,$scope.brokerList.length);
			channelService.getTsbroker({body:{}},function(tbres) {
				if(tbres.msret.msgcode == "00") {
					$scope.brokerList = tbres.body;
					if($scope.brokerList.length > 0) {
						$scope.currentChannel.bid = String($scope.brokerList[0].bid);
					}
					$scope.channelShowModal($scope.modalInfo.stateEnum.editChannel);
					$scope.$apply();
				}
				else {
					cms.message.error("获取经纪商列表失败，请稍候重试");
					cms.log("获取经纪商列表失败",tbres.msret.msg);
				}
			})
		});
	}

	//编辑通道
	$scope.channelEditChannel = function(channel) {
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
		//获取服务列表
		mainService.getOpsService({body:{modules:[cms.c_moduleid_sds,cms.c_moduleid_ogs]}}, function(res) {
			if (res.msret.msgcode != "00") {
				cms.message.error("获取服务失败");
				return;
			}
			$scope.services = res.body;
			$scope.brokerList.splice(0,$scope.brokerList.length);
			channelService.getTsbroker({body:{}},function(tbres) {
				if(tbres.msret.msgcode == "00") {
					$scope.brokerList = tbres.body;
					$scope.channelShowModal($scope.modalInfo.stateEnum.editChannel);
					$scope.$apply();
				}
				else {
					cms.message.error("获取经纪商列表失败，请稍候重试");
					cms.log("获取经纪商列表失败",tbres.msret.msg);
				}
			})
		});
	}

	//保存信息
	$scope.channelEditChannelSure = function() {
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
		if( isNaN(parseInt($scope.currentChannel.serviceid)) ) {
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
			channelService.addChannel(reqData,function(addres) {
				if(addres.msret.msgcode == "00") {
					cms.message.success("操作成功",5);
					$scope.channelHideModal();
					$scope.channelGetChannel();
					$scope.$emit("changedChannel");
				}
				else {
					cms.message.error("新增通道失败："+addres.msret.msg);
					cms.log("新增通道失败：",addres.msret.msgcode,addres.msret.msg);
				}
			})
		}
		else {
			channelService.updateChannel(reqData,function(updateres) {
				if(updateres.msret.msgcode == "00") {
					cms.message.success("操作成功",5);
					$scope.channelHideModal();
					$scope.channelGetChannel();
					$scope.$emit("changedChannel");
				}
				else {
					cms.message.error("修改通道失败："+updateres.msret.msg);
					cms.log("新增通道失败：",updateres.msret.msgcode,updateres.msret.msg);
				}
			})
		}
	}

	//冻结，解冻通道
	$scope.channelFreezeChannel = function(index) {
		var channel = $scope.channelList[index];
		$scope.currentChannel.chid = channel.chid;
		$scope.currentChannel.chname = channel.chname;
		$scope.currentChannel.bid = channel.bid;
		$scope.currentChannel.chtype = channel.chtype;
		$scope.currentChannel.ip = channel.ip;
		$scope.currentChannel.port = channel.port;
		$scope.currentChannel.cfg = channel.cfg;
		$scope.currentChannel.stat = channel.stat == "0" ? 1 : 0;
		$scope.freezeInfo.modalTitle = channel.stat == "0" ? "解冻" :"冻结通道";
		$scope.freezeInfo.tips = channel.stat == "0" ? "你确定要解除 "+channel.chname+" 的冻结状态吗？" :"你确定要冻结 "+channel.chname+" 吗？";
		$scope.channelShowModal($scope.modalInfo.stateEnum.freeze);
	}

	//确定冻结，解冻
	$scope.channelFreezeSure = function() {
		var reqData = {
			body: {
				chid: $scope.currentChannel.chid,
				chname: $scope.currentChannel.chname,
				bid: $scope.currentChannel.bid,
				chtype:$scope.currentChannel.chtype,
				ip:$scope.currentChannel.ip,
				port:$scope.currentChannel.port,
				cfg: $scope.currentChannel.cfg,
				stat: $scope.currentChannel.stat
			}
		};
		channelService.updateChannel(reqData,function(updateres) {
			if(updateres.msret.msgcode == "00") {
				cms.message.success("操作成功",5);
				$scope.channelHideModal();
				$scope.channelGetChannel();
			}
			else {
				cms.message.error("操作失败："+updateres.msret.msg);
				cms.log("冻结/解冻失败：",updateres.msret.msgcode,updateres.msret.msg);
			}
		})
	}

})
