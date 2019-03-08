angular.module('cmsController').controller('operManageCtrl', function ($scope, $rootScope, $timeout, mainService, operManageService) {

    $scope.rightList = [];
	$scope.cellid_list_cp = [];
	$scope.selectRole = {};
	$scope.roleList = [];
	$scope.enableList = [{id: 0, name: "不启用"}, {id: 1, name: "启用"}];
	$scope.tsiEnable = $scope.enableList[0];
	$scope.modalInfo = {};
	$scope.currentMaid = 1;
	$scope.operManage_maidList = [];//资产管理人信息列表
	$scope.operManage_operList = [];//操作员信息列表
	$scope.notTheSame = true;
	$scope.isSuper = false;
	$scope.placeholderText = "";
	$scope.showHaveRight = false;
	$scope.showTips = false;
	$scope.cross_mgr = false;
	$scope.permissionMaidIndex = 0;

	//终端绑定

	$scope.operMacBind_DataList=[];//具体的某一个操作员MAC绑定信息列表
	$scope.operMacBind_All_DataList = [];//当前资产管理人下的所有操作员MAC信息
	$scope.keyName2 = "";
	$scope.reverse2 = false;
	$scope.sortFunction2 = null;
	$scope.nowDaysOperatorName = ""; // 当前打开的终端绑定弹框属于哪一个弹框
	$scope.nowDaysOperatorId = ""; // 当前打开的某个操作员ID
	$scope.modalInfoLv2 = { state: "", path: "" };
	$scope.addMacBindInfo = {};      //当前要新增的操作员MAC绑定信息
	$scope.changeMacBindInfo = {};   //修改当前操作员MAC绑定信息
	$scope.beforeChangeMacBindInfo = {};  //修改当前操作员MAC绑定信息之前的原始mac信息
	$scope.deleteMacBindInfo = [];   //删除当前操作员终端信息绑定
	$scope.isAllChecked = false; //终端绑定总是否全部选中的状态

	$scope.showImportTips = false;

	//终端绑定


	$scope.allProduct = [];
	$scope.allTradeUnit = [];

	$scope.allTraderProduct = [];
	$scope.allTraderTradeUnit = [];	//授权交易员界面的交易单元

	$scope.self = $scope;

	$scope.curClickedIndex = -1;

	$scope.freezeInfo = {};   //当前冻结操作员的信息
	$scope.altOperInfo = {};  //当前修改操作员的信息

	// $scope.authorizeDestination = "trader";
	$scope.authorizeManager = {};
	$scope.authorizeProduct = {};
	$scope.authorizeAccount= {};
	// $scope.authorizeTraderManager = {};
	// $scope.authorizeTraderProduct = {};

	$scope.authorizeData = { permissionLevel: 0, cellid_list: [] };
	$scope.authorizeTraderData = { permissionLevel: 0, cellid_list: [] };

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;
	$scope.inputErrorTips = {
		operNum: "",
		operName: "",
		operPwd: "",
		beSurePwd: ""
	}
	$scope.changePwdErrorTips = {
		oldPwd: "",
		newPwd: "",
		beSurePwd: ""
	}
	$scope.currentOperator = mainService.currentOperator;
	// var initial=1;
	$scope.$on("changedManager_broadcast", function (event, message) {
		$scope.getTamgrDataInfo();
	});

	$scope.operManageInit = function () {
		$scope.curClickedIndex = -1;

		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.addOper = 1;           //新建操作员
		$scope.modalInfo.stateEnum.altOper = 2;		      //修改操作员
		$scope.modalInfo.stateEnum.freezeOper = 3;	      //冻结
		$scope.modalInfo.stateEnum.altOperPsw = 4;	      //修改密码
		$scope.modalInfo.stateEnum.resetOperPsw = 5;	      //重置密码
		$scope.modalInfo.stateEnum.authorize = 6;	      //重置密码
		$scope.modalInfo.stateEnum.newOperMacBind =7;
		$scope.modalInfoLv2 = { state: "", path: "" }; //二级弹框


		$scope.getTamgrDataInfo();
		
	}



	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {

	});
	//页面关闭
	$scope.$on("$destroy", function () {

	});

	//表格行点击
	$scope.itemClicked = function (index) {
		$scope.curClickedIndex = index;
	}

	//点击表头
	$scope.clickTableHeader = function (keyName, isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
	}

	//打开弹框
	$scope.operManageShowModal = function (state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.newOperMacBind:
				$scope.modalInfo.path = "../unit-manage/newOperMacBind.html";
				break;
			case $scope.modalInfo.stateEnum.addOper:
				$scope.modalInfo.path = "../unit-manage/operManage_Add.html";
				break;
			case $scope.modalInfo.stateEnum.altOper:
				$scope.modalInfo.path = "../unit-manage/operManage_Alt.html";
				break;
			case $scope.modalInfo.stateEnum.freezeOper:
				$scope.modalInfo.path = "../unit-manage/operManageFreeze.html";
				break;
			case $scope.modalInfo.stateEnum.altOperPsw:
			case $scope.modalInfo.stateEnum.resetOperPsw:
				$scope.modalInfo.path = "../unit-manage/operManage_AltPsw.html";
				break;
			case $scope.modalInfo.stateEnum.authorize:
				$scope.modalInfo.path = "../unit-manage/operManage_authorize.html";
				// $scope.authorizeDestination = "trader";
                mainService.getGlobalConfig({ "body": {} }, function (res1) {
                    if (res1.msret.msgcode !== "00" || res1.body.length == 0) {
                        cms.message.error("版本有问题，请勿使用");
                        return;
                    }
                    for (var i = 0; i < res1.body.length; ++i) {
                        var data = res1.body[i];
                        if (data.cfgid == "cross_mgr_auth") {
                            $scope.cross_mgr = Number(data.cfgvalue) == 1 ? true : false;
                        }                
                    }
					$scope.user_maidList = [];
					$scope.user_caidList = [];
					$scope.user_acidList = [];
					$scope.user_tridList = [];
					$scope.user_maidList_cp = [];
					$scope.user_caidList_cp = [];
					$scope.user_acidList_cp = [];
					$scope.user_tridList_cp = [];
					$scope.permissionMaidIndex = 0;
					$scope.getManager();
					$scope.getProduct();
					$scope.getAccount();
					$scope.getTrd();
					$scope.authorizeData.permissionLevel = 0;
					$scope.authorizeData.cellid_list = [];
					$scope.cellid_list_cp = [];
					$scope.rightList = [];
					$scope.setPermissionLevel(1);
                });  

				// $scope.authorizeTraderData.permissionLevel = 0;
				// $scope.authorizeTraderData.cellid_list = [];

				// var index = cms.binarySearch($scope.operManage_maidList, "id", parseInt($scope.altOperInfo.maid));
				// if (index != -1) {
				// 	$scope.authorizeTraderManager = $scope.operManage_maidList[index];
				// 	$scope.changeTraderManager();
				// }

				// var requestData = { body: { oid: $scope.altOperInfo.oid } };
				// operManageService.getOperatorRole(requestData, function (res) {
				// 	if (res.msret.msgcode != '00') {
				// 		cms.message.error("获取操作员权限失败." + res.msret.msg);
				// 		return;
				// 	}
				// 	// cms.message.success("获取操作员权限成功.");
				// 	$scope.operatorRoles = res.body;
				// 	var i = 0, exist = false;
				// 	for (var i = 0; i < $scope.operatorRoles.length; i++) {

				// 		$scope.operatorRoles[i].roleid = parseInt($scope.operatorRoles[i].roleid);
				// 		if ($scope.operatorRoles[i].roleid != 6) {
				// 			if (!exist) {
				// 				exist = true;
				// 				var roleIndex = cms.binarySearch($scope.allRole, "roleid", $scope.operatorRoles[i].roleid);
				// 				if (roleIndex != -1) {
				// 					$scope.allRole[roleIndex].selected = true;
				// 				}

				// 				$scope.setPermissionLevel($scope.operatorRoles[i].rightlv);
				// 				var cellid_string_list = $scope.operatorRoles[i].cellid_list.split(",");
				// 				cellid_string_list.forEach(function (obj) {
				// 					if (obj == "") {
				// 						return;
				// 					}
				// 					$scope.authorizeData.cellid_list.push({ id: obj, name: obj });
				// 				});
				// 			}

				// 		} else {
				// 			// $scope.setTraderPermissionLevel($scope.operatorRoles[i].rightlv);
				// 			$scope.authorizeTraderData.permissionLevel = $scope.operatorRoles[i].rightlv;
				// 			var cellid_string_list = $scope.operatorRoles[i].cellid_list.split(",");
				// 			cellid_string_list.forEach(function (obj) {
				// 				if (obj == "") {
				// 					return;
				// 				}
				// 				$scope.authorizeTraderData.cellid_list.push({ id: obj, name: obj });
				// 			});
				// 		}

				// 	}

				// 	$scope.$apply();
				// });
				break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.operManageLoadModalReady = function () {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addOper:
                mainService.getGlobalConfig({ "body": {} }, function (res1) {
                    if (res1.msret.msgcode !== "00" || res1.body.length == 0) {
                        cms.message.error("版本有问题，请勿使用");
                        return;
                    }
                    for (var i = 0; i < res1.body.length; ++i) {
                        var data = res1.body[i];
                        if (data.cfgid == "passwd_complexity") {
                            $rootScope.passwordType = Number(data.cfgvalue);
							if ($rootScope.passwordType == 0) {
								$scope.placeholderText = "8-20位，任意字母、数字或者特殊字符均可";
							} else if ($rootScope.passwordType == 1) {
								$scope.placeholderText = "8-20位，需同时包含数字、字母、特殊字符";
							}
                        }                
                    }
                });  

				mainService.showModal("operManage_modal_back", "operManage_Add_modal", "operManage_Add_modal_title");
				$scope.selectRole = $scope.roleList[0];
				$scope.tsiEnable = $scope.enableList[0];
				break;
			case $scope.modalInfo.stateEnum.altOper:
				mainService.showModal("operManage_modal_back", "operManage_Alt_modal", "operManage_Alt_modal_title");
				$scope.isSuper = false;
				operManageService.getUserInfoNew({ serviceid: $rootScope.serviceid["ccms-server"], body: {oid: $scope.altOperInfo.oid} }, function (data) {
					if (data.error) {
						cms.message.error(data.error.msg);
						return;
					}
					if (data.res.length > 0) {
						if (data.res[0].roleid == 1) {
							$scope.isSuper = true;
							$scope.selectRole = {roleid: 1, rolename: "超级管理员(全局管理人)"}
						} else {
							for (var i = 0; i < $scope.roleList.length; ++i) {
								if ($scope.roleList[i].roleid == data.res[0].roleid) {
									$scope.selectRole = $scope.roleList[i];
									break;
								}
							}
						}
						var num = Number(data.res[0].tsi_enable);
						$scope.tsiEnable = $scope.enableList[num];
					}
					console.log(data,$scope.altOperInfo.oid);
				});
				break;
			case $scope.modalInfo.stateEnum.freezeOper:
				mainService.showModal("operManage_modal_back", "operManage_freeze_modal", "operManage_freeze_modal_title");
				break;
			case $scope.modalInfo.stateEnum.altOperPsw:
			case $scope.modalInfo.stateEnum.resetOperPsw:
				$scope.changePwdErrorTips = {
					oldPwd: "",
					newPwd: "",
					beSurePwd: ""
				}

                mainService.getGlobalConfig({ "body": {} }, function (res1) {
                    if (res1.msret.msgcode !== "00" || res1.body.length == 0) {
                        cms.message.error("版本有问题，请勿使用");
                        return;
                    }
                    for (var i = 0; i < res1.body.length; ++i) {
                        var data = res1.body[i];
                        if (data.cfgid == "passwd_complexity") {
                            $rootScope.passwordType = Number(data.cfgvalue);
							if ($rootScope.passwordType == 0) {
								$scope.placeholderText = "8-20位，任意字母、数字或者特殊字符均可";
							} else if ($rootScope.passwordType == 1) {
								$scope.placeholderText = "8-20位，需同时包含数字、字母、特殊字符";
							}	
                        }                
                    }
                });  		

				mainService.showModal("operManage_modal_back", "operManage_AltPsw_modal", "operManage_AltPsw_modal_title");
				break;
			case $scope.modalInfo.stateEnum.authorize:
				mainService.showModal("operManage_modal_back", "operManage_authorize_modal", "operManage_authorize_modal_title");
				break;
			case $scope.modalInfo.stateEnum.newOperMacBind:
				mainService.showModal("operManage_modal_back", "newOperMacBind_modal", "newOperMacBind_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭新建操作员对话框
	$scope.operManageAdd_HideModal = function () {
		mainService.hideModal("operManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭冻结操作员对话框
	$scope.operManageFreeze_HideModal = function () {
		mainService.hideModal("operManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭修改操作员信息对话框
	$scope.operManageAlt_HideModal = function () {
		mainService.hideModal("operManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭修改,重置密码对话框
	$scope.operManageAltPsw_HideModal = function () {
		mainService.hideModal("operManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//关闭终端绑定弹框
	$scope.newOperMacBind_HideModal = function(){
		mainService.hideModal("operManage_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}


	$scope.refreshOperDataTable = function () {

		$scope.filterContent = "";
		$scope.curClickedIndex = -1;
		$scope.getOperDataInfo($scope.selectedTamgr.maid);
	}

	//新建操作员
	$scope.operManage_AddOper = function () {
		$scope.add_oid = "";
		$scope.add_oname = "";
		$scope.add_psw = "";
		$scope.add_confirm_psw = "";
		$scope.add_email = "";
		$scope.add_phone = "";
		$scope.add_idcard = "";
		$scope.inputErrorTips = {
			operNum: "",
			operName: "",
			operPwd: "",
			beSurePwd: ""
		}
		$scope.operManageShowModal($scope.modalInfo.stateEnum.addOper);
	}

	//显示冻结解冻操作员界面
	$scope.showFreezeOperDlg = function (dataCell) {
		if ($scope.currentOperator.oid == dataCell.oid) {
			cms.message.error("不能冻结/解冻自己!");
			return;
		}
		cms.deepCopy(dataCell, $scope.freezeInfo);//拷贝对象值到$scope.freezeInfo
		//$scope.freezeInfo = dataCell;
		$scope.freezeInfo.modalTitle = dataCell.stat == '1' ? "冻结操作员" : "解冻操作员";
		$scope.freezeInfo.tips = dataCell.stat == '1' ? "你确定要冻结编号为" + dataCell.oid + "操作员吗?" : "你确定要解冻编号为" + dataCell.oid + "操作员吗？";
		$scope.freezeInfo.stat = dataCell.stat == '1' ? '0' : '1';
		$scope.operManageShowModal($scope.modalInfo.stateEnum.freezeOper);
	}



	//显示授权操作员信息界面
	$scope.showAuthorizeOperInfoDlg = function (dataCell) {
		if ($scope.currentOperator.oid == dataCell.oid) {
			cms.message.error("不能给自己授权!");
			return;
		}

		cms.deepCopy(dataCell, $scope.altOperInfo);//拷贝对象值到$scope.altOperInfo
		$scope.operManageShowModal($scope.modalInfo.stateEnum.authorize);
	}

	//显示修改操作员信息界面
	$scope.showAltOperInfoDlg = function (dataCell) {
		$scope.notTheSame = true;
		if ($scope.currentOperator.oid == dataCell.oid) {
			$scope.notTheSame = false;
		}
		cms.deepCopy(dataCell, $scope.altOperInfo);//拷贝对象值到$scope.altOperInfo
		$scope.altOperInfo.maidDisplayName = $scope.altOperInfo.maname + "(" + $scope.altOperInfo.maid + ")"

		$scope.operManageShowModal($scope.modalInfo.stateEnum.altOper);
	}

	// //显示修改操作员信息界面
	// $scope.showAltOperInfoDlg = function (dataCell) {
	// 	cms.deepCopy(dataCell, $scope.altOperInfo);//拷贝对象值到$scope.altOperInfo
	// 	$scope.altOperInfo.maidDisplayName = $scope.altOperInfo.maname + "(" + $scope.altOperInfo.maid + ")"

	// 	$scope.operManageShowModal($scope.modalInfo.stateEnum.altOper);
	// }


	//显示修改,重置操作员密码界面  type: 'reset'-重置密码 'alt'-修改密码
	$scope.showAltOperPswDlg = function (dataCell, type) {
		cms.deepCopy(dataCell, $scope.altOperInfo);//拷贝对象值到$scope.altOperInfo

		$scope.altOperInfo.altPsw = {};
		$scope.altOperInfo.altPsw.type = type;
		$scope.altOperInfo.altPsw.DlgTitle = type === 'reset' ? "重置密码" : "修改密码";

		$scope.altOperInfo.altPsw.oldPsw = "";
		$scope.altOperInfo.altPsw.newPsw = "";
		$scope.altOperInfo.altPsw.confirmPsw = "";

		$scope.operManageShowModal(type === 'reset' ? $scope.modalInfo.stateEnum.resetOperPsw : $scope.modalInfo.stateEnum.altOperPsw);
	}

	//获取资产管理人信息
	$scope.getTamgrDataInfo = function () {

		var requestData = { body: {} };
		operManageService.getTamgrData(requestData, function (retData) {
			console.log(retData);


			if (retData.msret.msgcode == '00') {

				var tmpData = retData.body;

				var maidList = []
				for (var i = 0; i < tmpData.length; i++) {

					var dataCell = {};
					dataCell = tmpData[i];
					dataCell.displayName = dataCell.maname + "(" + dataCell.maid + ")"
					dataCell.name = dataCell.maname;
					dataCell.id = parseInt(dataCell.maid);
					maidList.push(dataCell);
				}
				$scope.operManage_maidList = maidList;
				$scope.$apply();

				if ($scope.operManage_maidList.length > 0) {
					$scope.selectedTamgr = $scope.operManage_maidList[0];//初始化maid组合选择框值(选择第一个)

					//获取第一个资产管理人下的操作员
					$scope.getAllRoles($scope.selectedTamgr.maid);
					$scope.getOperDataInfo($scope.operManage_maidList[0].maid);
					//$scope.getAllOperMacBindDataInfo($scope.selectedTamgr.maid);
				}
			}
			else {
				cms.message.error("获取资产管理人数据出错." + retData.msret.msg);
			}
		})
	}

	$scope.getAllRoles=function(maid){
		$scope.roleList = [];
		$scope.selectRole = {};
		operManageService.getAllRoles({ serviceid: $rootScope.serviceid["ccms-server"], body: {maid: maid} }, function (data) {
			console.log(data);
			if (data.error) {
				cms.message.error(data.error.msg);
				return;
			}

			if (data.res.length > 0) {
				$scope.roleList = data.res;
				for (var i = 0; i < $scope.roleList.length; ++ i) {
					$scope.roleList[i].name = $scope.roleList[i].rolename+"("+$scope.roleList[i].maname+")";
				}
				$scope.roleList.shift();
				$scope.selectRole = $scope.roleList[0];
			} else {
				cms.message.error("查询成功，但没有数据");
			}
		});
	}

	//获取资产管理人信息
	$scope.getManager = function () {
		if ($scope.cross_mgr) {
			var requestData = { body: {} };
		} else {
			var requestData = { body: {maid: $scope.selectedTamgr.maid} };
		}
		operManageService.getTamgrData(requestData, function (retData) {
			if (retData.msret.msgcode == '00') {
				$scope.user_maidList= retData.body;
				for (var i = 0; i < $scope.user_maidList.length; ++i) {
					$scope.user_maidList[i].name = $scope.user_maidList[i].maname+"("+$scope.user_maidList[i].maid+")";
				}
				if (typeof maid == "undefined") {
					$scope.user_maidList.unshift({maid: -1, name:"全部"});
				}
				$scope.authorizeManager = $scope.user_maidList[0];
				for (var i = 0; i < $scope.user_maidList.length; ++i) {
					if ($scope.selectedTamgr.maid == $scope.user_maidList[i].maid) {
						$scope.permissionMaidIndex = i;
						console.log($scope.permissionMaidIndex);
						break;
					}
				}
				cms.deepCopy($scope.user_maidList, $scope.user_maidList_cp);
			}
			else {
				cms.message.error("获取资产管理人数据出错." + retData.msret.msg);
			}
		})
	}

	//获取产品信息
	$scope.getProduct= function () {
		if ($scope.cross_mgr) {
			var requestData = { body: {} };
		} else {
			var requestData = { body: {maid: $scope.selectedTamgr.maid} };
		}
		operManageService.getProducts(requestData, function (retData) {
			if (retData.msret.msgcode == '00') {
				$scope.user_caidList = retData.body;
				for (var i = 0; i < $scope.user_caidList.length; ++i) {
					$scope.user_caidList[i].name = $scope.user_caidList[i].caname+"("+$scope.user_caidList[i].caid+")";
				}
				$scope.user_caidList.unshift({caid: -1, name:"全部"});
				$scope.authorizeProduct = $scope.user_caidList[0];
				cms.deepCopy($scope.user_caidList, $scope.user_caidList_cp);
			}
			else {
				cms.message.error("获取产品数据出错." + retData.msret.msg);
			}
		})
	}

	//获取资金账户信息
	$scope.getAccount= function () {
		if ($scope.cross_mgr) {
			var requestData = { body: {} };
		} else {
			var requestData = { body: {maid: $scope.selectedTamgr.maid} };
		}
		operManageService.getAssetAccount(requestData, function (retData) {
			if (retData.msret.msgcode == '00') {
				$scope.user_acidList = retData.body;
				for (var i = 0; i < $scope.user_acidList.length; ++i) {
					$scope.user_acidList[i].name = $scope.user_acidList[i].acname+"("+$scope.user_acidList[i].acid+")";
				}
				$scope.user_acidList.unshift({acid: -1, name:"全部"});
				$scope.authorizeAccount = $scope.user_acidList[0];
				cms.deepCopy($scope.user_acidList, $scope.user_acidList_cp);
			}
			else {
				cms.message.error("获取资产管理人数据出错." + retData.msret.msg);
			}
		})
	}

	//获取组合信息
	$scope.getTrd= function () {
		if ($scope.cross_mgr) {
			var requestData = { body: {} };
		} else {
			var requestData = { body: {maid: $scope.selectedTamgr.maid} };
		}
		operManageService.getTatrd(requestData, function (retData) {
			if (retData.msret.msgcode == '00') {
				$scope.user_tridList = retData.body;
				for (var i = 0; i < $scope.user_tridList.length; ++i) {
					$scope.user_tridList[i].name = $scope.user_tridList[i].trname+"("+$scope.user_tridList[i].trid+")";
				}
				$scope.user_tridList.unshift({trid: -1, name:"全部"});
				$scope.authorizeTrd = $scope.user_tridList[0];
				cms.deepCopy($scope.user_tridList, $scope.user_tridList_cp);
			}
			else {
				cms.message.error("获取组合数据出错." + retData.msret.msg);
			}
		})
	}

	$scope.changeManager = function () {
		$scope.allProduct = [];
		$scope.allTradeUnit = [];
		var requestData = { body: { maid: $scope.authorizeManager.maid } };
		operManageService.getProducts(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取所有产品失败." + res.msret.msg);
				return;
			}

			$scope.allProduct = res.body;
			for (var i = 0; i < $scope.allProduct.length; i++) {
				$scope.allProduct[i].id = $scope.allProduct[i].caid;
				$scope.allProduct[i].name = $scope.allProduct[i].caname;
			}
			if ($scope.authorizeData.permissionLevel == 10) {
				if ($scope.allProduct.length) {
					$scope.authorizeProduct = $scope.allProduct[0];
					$scope.changedProduct();
				}

			}
			$scope.$apply();
		});
	}

	$scope.changedProduct = function () {
		if (!$scope.authorizeProduct || !$scope.authorizeProduct.caid) {
			return;
		}
		$scope.allTradeUnit = [];
		var requestData = { body: { caid: $scope.authorizeProduct.caid } };
		operManageService.getTatrd(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取所有的组合策略失败." + res.msret.msg);
				return;
			}
			$scope.allTradeUnit = res.body;
			var i = 0, j = 0;
			for (; i < $scope.allTradeUnit.length; i++) {
				$scope.allTradeUnit[i].id = ($scope.allTradeUnit[i].trid);
				$scope.allTradeUnit[i].name = ($scope.allTradeUnit[i].trname);
			}

			$scope.$apply();
		});
	}

	$scope.changeTraderManager = function () {
		$scope.allTraderProduct = [];
		$scope.allTraderTradeUnit = [];
		var requestData = { body: { maid: $scope.authorizeTraderManager.maid } };
		operManageService.getProducts(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取所有产品失败." + res.msret.msg);
				return;
			}

			$scope.allTraderProduct = res.body;
			for (var i = 0; i < $scope.allTraderProduct.length; i++) {
				$scope.allTraderProduct[i].id = $scope.allTraderProduct[i].caid;
				$scope.allTraderProduct[i].name = $scope.allTraderProduct[i].caname;
			}
			if ($scope.allTraderProduct.length) {
				$scope.authorizeTraderProduct = $scope.allTraderProduct[0];
				$scope.changedTraderProduct();
			}

			$scope.$apply();
		});
	}

	$scope.changedTraderProduct = function () {
		if (!$scope.authorizeTraderProduct || !$scope.authorizeTraderProduct.caid) {
			return;
		}
		$scope.allTraderTradeUnit = [];
		var requestData = { body: { caid: $scope.authorizeTraderProduct.caid } };
		operManageService.getTatrd(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取所有的组合策略失败." + res.msret.msg);
				return;
			}
			$scope.allTraderTradeUnit = res.body;
			var i = 0, j = 0;
			for (; i < $scope.allTraderTradeUnit.length; i++) {
				$scope.allTraderTradeUnit[i].id = ($scope.allTraderTradeUnit[i].trid);
				$scope.allTraderTradeUnit[i].name = ($scope.allTraderTradeUnit[i].trname);
			}

			$scope.$apply();
		});
	}

	//获取操作员信息
	$scope.getOperDataInfo = function (maid) {

		// var requestData = { body: { "maid": maid } };

		// operManageService.getOperData(requestData, function (retData) {

		// 	if (retData.msret.msgcode == '00') {
		// 		var tmpData = retData.body;

		// 		var operList = []
		// 		for (var i = 0; i < tmpData.length; i++) {
		// 			var dataCell = {};
		// 			dataCell = tmpData[i];
		// 			dataCell.show = true;//默认此行数据显示
		// 			operList.push(dataCell);
		// 		}
		// 		$scope.operManage_operList = operList;
		// 		$scope.$apply();
		// 	}
		// 	else {
		// 		$scope.operManage_operList.splice(0, $scope.operManage_operList.length);
		// 		$scope.apply;
		// 		cms.message.error("获取操作员数据出错." + retData.msret.msg);
		// 	}
		// })

		$scope.currentMaid = maid;
		operManageService.getUserByManager({ serviceid: $rootScope.serviceid["ccms-server"], body: { maid: maid, oid: "" } }, function (data) {
			$scope.operManage_operList = [];
			if (data.error) {
				cms.message.error("获取操作员数据出错." + data.error.msg);
				return;
			}
			console.log(data);
			if (data.res.length > 0) {
				$scope.operManage_operList = data.res;
				for (var i = 0; i < $scope.operManage_operList.length; i++) {
					$scope.operManage_operList[i].show = true;//默认此行数据显示
				}
				$scope.$apply()				
			}
		});
	}

	//资产管理人选择发生变化时,加载当前选择的资产管理人下的操作员信息
	$scope.operManage_tamgrChanged = function () {
        $scope.getAllRoles($scope.selectedTamgr.maid);
		$scope.getOperDataInfo($scope.selectedTamgr.maid);
		// $scope.getAllOperMacBindDataInfo($scope.selectedTamgr.maid);
	}

	//发送冻结操作员指令
	$scope.operManageFreezeConfirm = function () {
		var requestData = {
				oid: $scope.freezeInfo.oid, stat: $scope.freezeInfo.stat
		};

		operManageService.altUserData({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
			if (data.error) {
				cms.message.error("操作出错." + data.error.msg);
				return;
			}
			cms.message.success("操作成功.");
			$scope.operManageAdd_HideModal();//关闭对话框
			$scope.refreshOperDataTable();
		})
	}

	$scope.oidInputBlur = function () {
		if ($scope.add_oid == "") {
			$scope.inputErrorTips.operNum = "操作员编号不能为空";
			return;
		} else {
			$scope.inputErrorTips.operNum = "";
		}
	}
	$scope.onameInputBlur = function () {
		if ($scope.add_oname == "") {
			$scope.inputErrorTips.operName = "操作员姓名不能为空";
			return;
		} else {
			$scope.inputErrorTips.operName = "";
		}
	}
	$scope.pwdInputBlur = function () {
		let tips = mainService.pwdInputBlur($scope.add_psw, $scope.inputErrorTips.operPwd, $scope.add_confirm_psw, $scope.inputErrorTips.beSurePwd,0,0,$rootScope.passwordType);
		$scope.inputErrorTips.operPwd = tips.pwdTip;
		$scope.inputErrorTips.beSurePwd = tips.beSurePwdTip;
	}
	$scope.beSurePwdInputBlur = function () {
		let tips = mainService.beSurePwdInputBlur($scope.add_psw, $scope.inputErrorTips.operPwd, $scope.add_confirm_psw, $scope.inputErrorTips.beSurePwd, $rootScope.passwordType);
		$scope.inputErrorTips.operPwd = tips.pwdTip;
		$scope.inputErrorTips.beSurePwd = tips.beSurePwdTip;
	}
	//添加操作员确认
	$scope.operManageAddConfirm = function () {
		// if ($scope.add_oid == "") {
		// 	$scope.inputErrorTips.operNum = "操作员编号不能为空";
		// 	return;
		// }
		if ($scope.add_oname == "") {
			$scope.inputErrorTips.operName = "操作员姓名不能为空";
			return;
		}
		if ($scope.add_psw == "") {
			$scope.inputErrorTips.operPwd = "密码不能为空";
			return;
		}
		if ($scope.add_confirm_psw == "") {
			$scope.inputErrorTips.beSurePwd = "确认密码不能为空";
			return;
		}
		if ($scope.inputErrorTips.operNum != "" || $scope.inputErrorTips.operName != "" || $scope.inputErrorTips.operPwd != "" || $scope.inputErrorTips.beSurePwd != "") {
			return;
		}
		// var tmp_oid = parseInt($scope.selectedTamgr.maid) * 10000 + parseInt($scope.add_oid);//转换成数据库中的oid
		var md5_psw = cms.tgwCfg("pass", $scope.add_psw);//加密密码

		var requestData = {
			"password": md5_psw, "user_name": $scope.add_oname,
			"telphone": $scope.add_phone, "email": $scope.add_email, "idcard": $scope.add_idcard
		};

		operManageService.casUserCreate({ serviceid: $rootScope.serviceid["cas"], body: requestData }, function (ret) {
			console.log(ret);
			if (ret.data.ret_code != 0) {
				cms.message.error("新增用户失败." + ret.data.ret_msg);
				return;
			}
			var request_data = {
				maid: $scope.currentMaid, userid: ret.data.user_id,
				roleid: $scope.selectRole.roleid, username: $scope.add_oname, tsi_enable: $scope.tsiEnable.id
			}
			operManageService.createUser({ serviceid: $rootScope.serviceid["ccms-server"], body: request_data }, function (data) {
				if (data.error) {
					cms.message.error("新增操作员失败." + data.error.msg);
					return;
				}
				$scope.selectRole = $scope.roleList[0];
				$scope.tsiEnable = $scope.enableList[0];
				cms.message.success("新增操作员成功.");
				$scope.operManageAdd_HideModal();//关闭对话框
				$scope.refreshOperDataTable();//刷新界面
			});
		});
	}

	//修改操作员信息确认
	$scope.operManageAltConfirm = function () {

		if ($scope.altOperInfo.oid == "" || $scope.altOperInfo.oname == "") {

			cms.message.error("必填选项不能为空.");
			return;
		}

		var requestData = {
			oid: $scope.altOperInfo.oid, phone: $scope.altOperInfo.phone,
			email: $scope.altOperInfo.email, idcard: $scope.altOperInfo.idcard,
			roleid: $scope.selectRole.roleid, tsi_enable: $scope.tsiEnable.id
		};

		operManageService.altUserData({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
			if (data.error) {
				cms.message.error("修改操作员信息失败." + data.error.msg);
				return;
			}
			$scope.selectRole = $scope.roleList[0];
			$scope.tsiEnable = $scope.enableList[0];
			cms.message.success("修改操作员信息成功.");
			$scope.operManageAlt_HideModal();//关闭对话框
			$scope.refreshOperDataTable();//刷新界面
			$scope.$emit("changedTrader", "changedTrader");
		});
	}
	$scope.changePwdBlur = function () {
		let tips = mainService.pwdInputBlur($scope.altOperInfo.altPsw.newPsw, $scope.changePwdErrorTips.newPwd, $scope.altOperInfo.altPsw.confirmPsw, $scope.changePwdErrorTips.beSurePwd, $scope.altOperInfo.altPsw.oldPsw, $scope.changePwdErrorTips.oldPwd, $rootScope.passwordType);
		$scope.changePwdErrorTips.newPwd = tips.pwdTip;
		$scope.changePwdErrorTips.beSurePwd = tips.beSurePwdTip;
	}
	$scope.changePwdBeSureBlur = function () {
		let tips = mainService.beSurePwdInputBlur($scope.altOperInfo.altPsw.newPsw, $scope.changePwdErrorTips.newPwd, $scope.altOperInfo.altPsw.confirmPsw, $scope.changePwdErrorTips.beSurePwd, $rootScope.passwordType);
		$scope.changePwdErrorTips.newPwd = tips.pwdTip;
		$scope.changePwdErrorTips.beSurePwd = tips.beSurePwdTip;
	}
	$scope.changePwdOldBlur = function () {
		if ($scope.altOperInfo.altPsw.oldPsw == "") {
			$scope.changePwdErrorTips.oldPwd = "原密码不能为空";
			return;
		} else {
			$scope.changePwdErrorTips.oldPwd = "";
			if ($scope.altOperInfo.altPsw.oldPsw == $scope.altOperInfo.altPsw.newPsw) {
				$scope.changePwdErrorTips.newPwd = "修改密码与原密码不能一致";
				return;
			} else {
				$scope.changePwdErrorTips.newPwd = "";
			}
		}
	}


	//修改，重置操作员密码确认
	$scope.operManageAltPswConfirm = function () {

		// if ($scope.altOperInfo.altPsw.type == "alt") {
		// 	if ($scope.altOperInfo.altPsw.oldPsw == "") {
		// 		$scope.changePwdErrorTips.oldPwd = "原密码不能为空";
		// 		return;
		// 	}
		// 	if ($scope.changePwdErrorTips.oldPwd !== "")
		// 		return;
		// }
		if ($scope.altOperInfo.altPsw.newPsw == "") {
			$scope.changePwdErrorTips.newPwd = "新密码不能为空";
			return;
		}

		// if ($scope.altOperInfo.altPsw.oldPsw == $scope.altOperInfo.altPsw.newPsw) {
		// 	$scope.changePwdErrorTips.newPwd = "修改密码与原密码不能一致";
		// 	return;
		// }

		if ($scope.altOperInfo.altPsw.confirmPsw == "") {
			$scope.changePwdErrorTips.beSurePwd = "确认密码不能为空";
			return;
		}
		if ($scope.changePwdErrorTips.newPwd !== "" || $scope.changePwdErrorTips.beSurePwd !== "")
			return;

		// if ($scope.altOperInfo.altPsw.newPsw == "" || $scope.altOperInfo.altPsw.confirmPsw == "") {
		// 	cms.message.error("必填选项不能为空.");
		// 	return;
		// }

		if ($scope.altOperInfo.altPsw.newPsw != $scope.altOperInfo.altPsw.confirmPsw) {
			cms.message.error("两次输入的密码不一致.");
			return;
		}

		var md5_psw_new = cms.tgwCfg("pass", $scope.altOperInfo.altPsw.newPsw);//加密传送新密码
		// var md5_psw_old;
		// if ($scope.altOperInfo.altPsw.type == "alt") {
		// 	md5_psw_old = cms.tgwCfg("pass", $scope.altOperInfo.altPsw.oldPsw);//加密传送原密码
		// }

		var requestData = {
			"user_id": $scope.altOperInfo.oid, "password": md5_psw_new,
			"is_reset": true
		};

		operManageService.casUserChange({ serviceid: $rootScope.serviceid["cas"], body: requestData }, function (ret) {
			console.log(ret);
			if (ret.data.ret_code != 0) {
				cms.message.error("重置操作员密码失败." + ret.data.ret_msg);
				return;
			}
			cms.message.success("重置操作员密码成功.");
			$scope.operManageAltPsw_HideModal();//关闭对话框
			$scope.$apply();
		});
	}

	//过滤显示操作员信息表
	$scope.operManageFilter = function () {

		angular.forEach($scope.operManage_operList, function (cellObj) {
			if (cellObj.oid.toString().match($scope.filterContent) || cellObj.oname.toString().match($scope.filterContent)) {
				cellObj.show = true;
			}
			else {
				cellObj.show = false;
			}
		});
	}
	$scope.clickRole = function (role) {
		role.selected = !role.selected;

		for (var i = 0; i < $scope.allRole.length; i++) {
			if ($scope.allRole[i].selected) {
				break;
			}
		}

		if (i == $scope.allRole.length) {
			$scope.authorizeData.permissionLevel = 0;
			$scope.authorizeData.cellid_list = [];
		}
	}

	// $scope.setPermissionLevel = function (level) {
	// 	for (var i = 0; i < $scope.allRole.length; i++) {
	// 		if ($scope.allRole[i].selected) {
	// 			break;
	// 		}
	// 	}

	// 	if (i == $scope.allRole.length) {
	// 		cms.message.error("请先选择岗位");
	// 		return;
	// 	}

	// 	if ($scope.authorizeData.permissionLevel == level) {
	// 		$scope.authorizeData.permissionLevel = 0;
	// 	} else {
	// 		$scope.authorizeData.permissionLevel = level;
	// 		if (level == 10 || level == 50) {
	// 			if ($scope.operManage_maidList.length) {
	// 				$scope.authorizeManager = $scope.operManage_maidList[0];
	// 				$scope.changeManager();
	// 			}
	// 		}
	// 	}
	// 	$scope.authorizeData.cellid_list = [];

	// }

	$scope.setPermissionLevel = function (level, isSubmit) {
		console.log($scope.authorizeManager,$scope.authorizeAccount,$scope.authorizeData.permissionLevel,level,$scope.authorizeData,$scope.user_maidList,$scope.user_caidList,$scope.user_acidList);
		if ($scope.authorizeData.permissionLevel == level) {
			return;
		}
		var changeArr = $scope.checkChange($scope.cellid_list_cp, $scope.authorizeData.cellid_list);
		if (changeArr.length > 0) {
			if (confirm("还有修改未提交，确定放弃这些修改直接切换？"))　{
			} else {
				return;
			}
		}
		cms.deepCopy($scope.user_caidList_cp, $scope.user_caidList);
		cms.deepCopy($scope.user_acidList_cp, $scope.user_acidList);
		cms.deepCopy($scope.user_tridList_cp, $scope.user_tridList);
		if ($scope.user_maidList.length > 0) {
			$scope.authorizeManager = $scope.user_maidList[0];
		}
		if ($scope.user_caidList.length > 0) {
			$scope.authorizeProduct = $scope.user_caidList[0];
		}
		if ($scope.user_acidList.length > 0) {
			$scope.authorizeAccount = $scope.user_acidList[0];
		}
		if ($scope.user_tridList.length > 0) {
			$scope.authorizeTrd = $scope.user_tridList[0];
		}
		$scope.authorizeData.permissionLevel = level;
		$scope.authorizeData.cellid_list = [];
		$scope.cellid_list_cp = [];
		if(!isSubmit) {
			$scope.selectConfig = {};
			$scope.isSubmit = false;
		}
		$scope.getUserData(level);
		console.log($scope.permissionMaidIndex);
		// $scope.$apply();
	}

	$scope.getUserData = function (level) {
		$scope.rightList = [];
		operManageService.getUserData({ serviceid: $rootScope.serviceid["ccms-server"], body: {oid: $scope.altOperInfo.oid, type: level, rights: 0} }, function (data) {
            if (data.error) {
                cms.message.error(data.error.msg);
                return;
            }
			console.log(data.res);

            if (data.res.length > 0) {
				$scope.rightList = data.res;
            }
			switch (level) {
				case 1:
					if ($scope.cross_mgr) {
						var requestData = { body: {} };
					} else {
						var requestData = { body: {maid: $scope.selectedTamgr.maid} };
					}
					operManageService.getTamgrData(requestData, function (retData) {
						if (retData.msret.msgcode == '00') {
							console.log(retData.body);
							$scope.authorizeData.cellid_list = retData.body;
							for (var i = 0; i < $scope.authorizeData.cellid_list.length; i++) {
								$scope.authorizeData.cellid_list[i].right = 0;
								if ($scope.rightList.length > 0) {
									for (var j = 0; j < $scope.rightList.length; ++j) {
										if ($scope.rightList[j].maid == $scope.authorizeData.cellid_list[i].maid) {
											$scope.authorizeData.cellid_list[i].right = $scope.rightList[j].rights;
										}
									}
								}
								$scope.authorizeData.cellid_list[i].show = true;
								$scope.authorizeData.cellid_list[i].cellname = $scope.authorizeData.cellid_list[i].maname+"("+$scope.authorizeData.cellid_list[i].maid+")";
								var newMap = {id: Number($scope.authorizeData.cellid_list[i].maid), right: $scope.authorizeData.cellid_list[i].right};
								$scope.cellid_list_cp.push(newMap);
							}
							$scope.filterCellList(0);
							if ($scope.isSubmit) {
								cms.deepCopy($scope.selectConfig.manager, $scope.authorizeManager);
								$scope.filterCellList(1);
							} else if ($scope.permissionMaidIndex != 0) {
								$scope.authorizeManager = $scope.user_maidList[$scope.permissionMaidIndex];
								$scope.filterCellList(1);
							}
						}
						else {
							cms.message.error("获取资产管理人数据出错." + retData.msret.msg);
						}
					});
					break;
				case 2:
					if ($scope.cross_mgr) {
						var requestData = { body: {} };
					} else {
						var requestData = { body: {maid: $scope.selectedTamgr.maid} };
					}
					operManageService.getProducts(requestData, function (retData) {
						if (retData.msret.msgcode == '00') {
							console.log(retData.body);
							$scope.authorizeData.cellid_list = retData.body;
							for (var i = 0; i < $scope.authorizeData.cellid_list.length; i++) {
								$scope.authorizeData.cellid_list[i].right = 0;
								if ($scope.rightList.length > 0) {
									for (var j = 0; j < $scope.rightList.length; ++j) {
										if ($scope.rightList[j].caid == $scope.authorizeData.cellid_list[i].caid) {
											$scope.authorizeData.cellid_list[i].right = $scope.rightList[j].rights;
										}
									}
								}
								$scope.authorizeData.cellid_list[i].show = true;
								$scope.authorizeData.cellid_list[i].cellname = $scope.authorizeData.cellid_list[i].caname+"("+$scope.authorizeData.cellid_list[i].caid+")";
								var newMap = {id: Number($scope.authorizeData.cellid_list[i].caid), right: $scope.authorizeData.cellid_list[i].right};
								$scope.cellid_list_cp.push(newMap);
							}
							$scope.filterCellList(0);
							if ($scope.isSubmit) {
								cms.deepCopy($scope.selectConfig.manager, $scope.authorizeManager);
								$scope.filterCellList(1);
							} else if ($scope.permissionMaidIndex != 0) {
								$scope.authorizeManager = $scope.user_maidList[$scope.permissionMaidIndex];
								$scope.filterCellList(1);
							}
						}
						else {
							cms.message.error("获取产品数据出错." + retData.msret.msg);
						}
					});
					break;
				case 4:
					if ($scope.cross_mgr) {
						var requestData = { body: {} };
					} else {
						var requestData = { body: {maid: $scope.selectedTamgr.maid} };
					}
					operManageService.getTatrd(requestData, function (retData) {
						if (retData.msret.msgcode == '00') {
							console.log(retData.body);
							$scope.authorizeData.cellid_list = retData.body;
							for (var i = 0; i < $scope.authorizeData.cellid_list.length; i++) {
								$scope.authorizeData.cellid_list[i].right = 0;
								if ($scope.rightList.length > 0) {
									for (var j = 0; j < $scope.rightList.length; ++j) {
										if ($scope.rightList[j].trid == $scope.authorizeData.cellid_list[i].trid) {
											$scope.authorizeData.cellid_list[i].right = $scope.rightList[j].rights;
										}
									}
								}
								$scope.authorizeData.cellid_list[i].show = true;
								$scope.authorizeData.cellid_list[i].cellname = $scope.authorizeData.cellid_list[i].trname+"("+$scope.authorizeData.cellid_list[i].trid+")";
								var newMap = {id: Number($scope.authorizeData.cellid_list[i].trid), right: $scope.authorizeData.cellid_list[i].right};
								$scope.cellid_list_cp.push(newMap);
							}
							$scope.filterCellList(0);
							if ($scope.isSubmit) {
								cms.deepCopy($scope.selectConfig.manager, $scope.authorizeManager);
								$scope.filterCellList(1);
							} else if ($scope.permissionMaidIndex != 0) {
								$scope.authorizeManager = $scope.user_maidList[$scope.permissionMaidIndex];
								$scope.filterCellList(1);
							}
						}
						else {
							cms.message.error("获取策略组合数据出错." + retData.msret.msg);
						}
					});
					break;
				case 3:
					if ($scope.cross_mgr) {
						var requestData = { body: {} };
					} else {
						var requestData = { body: {maid: $scope.selectedTamgr.maid} };
					}
					operManageService.getAssetAccount(requestData, function (retData) {
						if (retData.msret.msgcode == '00') {
							console.log(retData.body);
							$scope.authorizeData.cellid_list = retData.body;
							for (var i = 0; i < $scope.authorizeData.cellid_list.length; i++) {
								$scope.authorizeData.cellid_list[i].right = 0;
								if ($scope.rightList.length > 0) {
									for (var j = 0; j < $scope.rightList.length; ++j) {
										if ($scope.rightList[j].acid == $scope.authorizeData.cellid_list[i].acid) {
											$scope.authorizeData.cellid_list[i].right = $scope.rightList[j].rights;
										}
									}
								}
								$scope.authorizeData.cellid_list[i].show = true;
								$scope.authorizeData.cellid_list[i].cellname = $scope.authorizeData.cellid_list[i].acname+"("+$scope.authorizeData.cellid_list[i].acid+")";
								var newMap = {id: Number($scope.authorizeData.cellid_list[i].acid), right: $scope.authorizeData.cellid_list[i].right};
								$scope.cellid_list_cp.push(newMap);
							}
							$scope.filterCellList(0);
							if ($scope.isSubmit) {
								cms.deepCopy($scope.selectConfig.manager, $scope.authorizeManager);
								$scope.filterCellList(1);
							} else if ($scope.permissionMaidIndex != 0) {
								$scope.authorizeManager = $scope.user_maidList[$scope.permissionMaidIndex];
								$scope.filterCellList(1);
							}
						}
						else {
							cms.message.error("获取资金账户数据出错." + retData.msret.msg);
						}
					});
					break;
				case 5:
					if ($scope.cross_mgr) {
						var requestData = { body: {} };
					} else {
						var requestData = { body: {maid: $scope.selectedTamgr.maid} };
					}
					operManageService.getTradeAccount(requestData, function (retData) {
						if (retData.msret.msgcode == '00') {
							console.log(retData.body);
							$scope.authorizeData.cellid_list = retData.body;
							for (var i = 0; i < $scope.authorizeData.cellid_list.length; i++) {
								$scope.authorizeData.cellid_list[i].right = 0;
								if ($scope.rightList.length > 0) {
									for (var j = 0; j < $scope.rightList.length; ++j) {
										if ($scope.rightList[j].tracid == $scope.authorizeData.cellid_list[i].tracid) {
											$scope.authorizeData.cellid_list[i].right = $scope.rightList[j].rights;
										}
									}
								}
								$scope.authorizeData.cellid_list[i].show = true;
								$scope.authorizeData.cellid_list[i].cellname = $scope.authorizeData.cellid_list[i].tracname+"("+$scope.authorizeData.cellid_list[i].tracid+")";
								var newMap = {id: Number($scope.authorizeData.cellid_list[i].tracid), right: $scope.authorizeData.cellid_list[i].right};
								$scope.cellid_list_cp.push(newMap);
							}
							$scope.filterCellList(0);
							if ($scope.isSubmit) {
								cms.deepCopy($scope.selectConfig.manager, $scope.authorizeManager);
								$scope.filterCellList(1);
							} else if ($scope.permissionMaidIndex != 0) {
								$scope.authorizeManager = $scope.user_maidList[$scope.permissionMaidIndex];
								$scope.filterCellList(1);
							}
						}
						else {
							cms.message.error("获取交易账户数据出错." + retData.msret.msg);
						}
					});
					break;
				default:
			}
        });
	}

	$scope.clickRight=function(cell,type) {
		switch(type) {
			case 0　:
			    if ($scope.authorizeData.permissionLevel == 4 || $scope.authorizeData.permissionLevel == 3) {
					cell.right = cell.right == 31 ? 0 : 31;
				} else {
					cell.right = cell.right == 15 ? 0 : 15;
				}
				break;
		    case 1 :
				if ((cell.right & 1) > 0) {
					cell.right -= 1;
				} else {
					cell.right += 1;
				}
				break;
		    case 2 :
				if ((cell.right & 2) > 0) {
					cell.right -= 2;
				} else {
					cell.right += 2;
				}
				break;
		    case 3 :
				if ((cell.right & 4) > 0) {
					cell.right -= 4;
				} else {
					cell.right += 4;
				}
				break;
		    case 4 :
				if ((cell.right & 8) > 0) {
					cell.right -= 8;
				} else {
					cell.right += 8;
				}
				break;
		    case 5 :
				if ((cell.right & 16) > 0) {
					cell.right -= 16;
				} else {
					cell.right += 16;
				}
				break;
			default:
				break;
		}
		console.log(cell.right);
		// $scope.$apply();
	}

	$scope.checkChange=function(old_arr,new_arr) {
		var changeArray = [];
		console.log(old_arr,new_arr);
		if (old_arr.length == 0) {
			return changeArray;
		}
		for (var i = 0; i < old_arr.length; ++i) {
			if (old_arr[i].right != new_arr[i].right) {
				var newMap = {id: old_arr[i].id, right: new_arr[i].right};
				changeArray.push(newMap); 
				console.log(newMap,changeArray);
			}
		}
		console.log(changeArray);
		return changeArray;
	}

	$scope.checkRight=function(right, num){
		if ((right & num) != 0) {
			return true;
		} else {
			return false;
		}
	}

	$scope.altUserData=function() {
		$scope.rightList = [];
		var changeArr = $scope.checkChange($scope.cellid_list_cp, $scope.authorizeData.cellid_list);
		if (changeArr.length == 0) {
			return;
		}
		console.log($scope.altOperInfo.oid,$scope.authorizeData.permissionLevel,changeArr);
		if ($scope.authorizeData.permissionLevel == 1) {
			for (var i =0 ;i < changeArr.length;++i) {
				if ($scope.selectedTamgr.maid != changeArr[i].id) {
					if (confirm("该操作员"+$scope.altOperInfo.oid+"不属于资产管理人"+changeArr[i].id+"，请确认是否进行跨资产管理人授权？"))　{
						break;
					} else {
						return;
					}
				}
			}
		}
		operManageService.altUserData({ serviceid: $rootScope.serviceid["ccms-server"], body: {oid: $scope.altOperInfo.oid, type: $scope.authorizeData.permissionLevel,rights: changeArr} }, function (data) {
			if (data.error) {
				cms.message.error(data.error.msg);
				return;
			}
			console.log(data);
			cms.message.success("操作成功.");
			var level = $scope.authorizeData.permissionLevel;
			$scope.isSubmit = true;
			$scope.selectConfig = {manager: {}, product: {}, trd: {}, account: {}};
			switch (level) {
				case 1 : 
				    cms.deepCopy($scope.authorizeManager, $scope.selectConfig.manager);
					break;
				case 2 : 
					cms.deepCopy($scope.authorizeManager, $scope.selectConfig.manager);
					cms.deepCopy($scope.authorizeProduct, $scope.selectConfig.product);
					break;
				case 4 : 
					cms.deepCopy($scope.authorizeManager, $scope.selectConfig.manager);
					cms.deepCopy($scope.authorizeProduct, $scope.selectConfig.product);
					cms.deepCopy($scope.authorizeTrd, $scope.selectConfig.trd);
					break;
				case 3 : 
					cms.deepCopy($scope.authorizeManager, $scope.selectConfig.manager);
					cms.deepCopy($scope.authorizeAccount, $scope.selectConfig.account);
					break;
			}
			$scope.authorizeData.permissionLevel = 0;
			$scope.authorizeData.cellid_list = [];
			$scope.cellid_list_cp = [];
			$scope.rightList = [];
			$scope.setPermissionLevel(level, true);
		});
	}

	$scope.filterCellList=function(type) {
		//console.log($scope.authorizeAccount.acid);
		switch(type) {
			case 1:
				for (var i = 0; i < $scope.authorizeData.cellid_list.length; ++i) {
					if ($scope.authorizeManager.maid == -1 || $scope.authorizeData.cellid_list[i].maid == $scope.authorizeManager.maid) {
						$scope.authorizeData.cellid_list[i].show = true;
					} else {
						$scope.authorizeData.cellid_list[i].show = false;
					}
				}

				$scope.user_caidList = [{caid: -1, name:"全部"}];
				$scope.user_acidList = [{acid: -1, name:"全部"}];
				$scope.user_tridList = [{trid: -1, name:"全部"}];
				for (var i = 1; i < $scope.user_caidList_cp.length; ++i) {
					if ($scope.authorizeManager.maid == -1 || $scope.user_caidList_cp[i].maid == $scope.authorizeManager.maid) {
						$scope.user_caidList.push($scope.user_caidList_cp[i]);
					}
				}
				$scope.authorizeProduct = $scope.user_caidList[0];
				for (var i = 1 ; i < $scope.user_acidList_cp.length; ++i) {
					if ($scope.authorizeManager.maid == -1 || $scope.user_acidList_cp[i].maid == $scope.authorizeManager.maid) {
						$scope.user_acidList.push($scope.user_acidList_cp[i]);
					}
				}
				$scope.authorizeAccount = $scope.user_acidList[0];
				for (var i = 1 ; i < $scope.user_tridList_cp.length; ++i) {
					if ($scope.authorizeManager.maid == -1 || $scope.user_tridList_cp[i].maid == $scope.authorizeManager.maid) {
						$scope.user_tridList.push($scope.user_tridList_cp[i]);
					}
				}
				$scope.authorizeTrd = $scope.user_tridList[0];
				console.log($scope.user_caidList,$scope.user_acidList,$scope.user_tridList);
				console.log($scope.user_caidList_cp,$scope.user_acidList_cp,$scope.user_tridList_cp);
				console.log($scope.authorizeManager,$scope.authorizeProduct,$scope.authorizeAccount,$scope.authorizeTrd)
				break;
			case 2:
				for (var i = 0; i < $scope.authorizeData.cellid_list.length; ++i) {
					if (($scope.authorizeManager.maid == -1 || $scope.authorizeData.cellid_list[i].maid == $scope.authorizeManager.maid) && ($scope.authorizeProduct.caid == -1 || $scope.authorizeData.cellid_list[i].caid == $scope.authorizeProduct.caid)) {
						$scope.authorizeData.cellid_list[i].show = true;
					} else {
						$scope.authorizeData.cellid_list[i].show = false;
					}
				}

				$scope.user_tridList = [{trid: -1, name:"全部"}];
				for (var i = 1 ; i < $scope.user_tridList_cp.length; ++i) {
					if ($scope.authorizeProduct.caid == -1 || $scope.user_tridList_cp[i].caid == $scope.authorizeProduct.caid || $scope.user_tridList_cp[i].trid == -1) {
						$scope.user_tridList.push($scope.user_tridList_cp[i]);
					}
				}
				$scope.authorizeTrd = $scope.user_tridList[0];
				break;
			case 3:
				for (var i = 0; i < $scope.authorizeData.cellid_list.length; ++i) {
					if (($scope.authorizeManager.maid == -1 || $scope.authorizeData.cellid_list[i].maid == $scope.authorizeManager.maid) && ($scope.authorizeAccount.acid == -1 || $scope.authorizeData.cellid_list[i].acid == $scope.authorizeAccount.acid)) {
						$scope.authorizeData.cellid_list[i].show = true;
					} else {
						$scope.authorizeData.cellid_list[i].show = false;
					}
				}
				break;
			case 4:
				for (var i = 0; i < $scope.authorizeData.cellid_list.length; ++i) {
					if (($scope.authorizeManager.maid == -1 || $scope.authorizeData.cellid_list[i].maid == $scope.authorizeManager.maid) && ($scope.authorizeProduct.caid == -1 || $scope.authorizeData.cellid_list[i].caid == $scope.authorizeProduct.caid) && ($scope.authorizeTrd.trid == -1 || $scope.authorizeData.cellid_list[i].trid == $scope.authorizeTrd.trid)) {
						$scope.authorizeData.cellid_list[i].show = true;
					} else {
						$scope.authorizeData.cellid_list[i].show = false;
					}
				}
				break;
			case 0 :
				for (var i = 0; i < $scope.authorizeData.cellid_list.length; ++i) {
					$scope.authorizeData.cellid_list[i].haveRight = true;
					if($scope.showHaveRight) {
						if($scope.authorizeData.cellid_list[i].right == 0) {
							$scope.authorizeData.cellid_list[i].haveRight = false;
						}
					}
				}	
		}
	}

	$scope.clickHaveRight = function() {
		if ($scope.showHaveRight) {
			$scope.showHaveRight = false;
		} else {
			$scope.showHaveRight = true;
		}
		$scope.filterCellList(0);
	}

	$scope.setTraderPermissionLevel = function (level) {
		if ($scope.authorizeTraderData.permissionLevel == level) {
			$scope.authorizeTraderData.permissionLevel = 0;
		} else {
			$scope.authorizeTraderData.permissionLevel = level;
			if (level == 10 || level == 50) {
				if ($scope.allTraderProduct.length) {
					$scope.authorizeTraderProduct = $scope.allTraderProduct[0];
					$scope.changedTraderProduct();
				}
			}
		}
		$scope.authorizeTraderData.cellid_list = [];
	}

	$scope.addUnitToPool = function (units, unit) {
		//此处可以用查找二叉树实现,或者直接显示左侧的选中的那部分
		for (var i = 0; i < units.length; i++) {
			if (unit.id == units[i].id) {
				return;
			}
		}
		if (i == units.length) {
			units.push(unit);
		}
	}


	$scope.showCancelUnit = function (unit) {
		unit.show = true;

	}

	$scope.hideCancelUnit = function (unit) {
		unit.show = false;
	}

	$scope.cancelUnit = function (units, unit, index) {
		units.splice(index, 1);
	}

	$scope.switchDestination = function (destStr) {
		$scope.authorizeDestination = destStr;
	}

	$scope.authorizeAssistant = function (destStr) {
		$scope.authorizeData.permissionLevel = 0;
		switch (destStr) {
			case "kehu":

				$scope.allRole[0].selected = true;
				$scope.allRole[1].selected = true;
				$scope.allRole[2].selected = false;
				$scope.allRole[3].selected = true;
				$scope.allRole[4].selected = true;
				$scope.setPermissionLevel(50);
				break;
			case "tuandui":
				$scope.allRole[0].selected = true;
				$scope.allRole[1].selected = true;
				$scope.allRole[2].selected = false;
				$scope.allRole[3].selected = true;
				$scope.allRole[4].selected = false;
				$scope.setPermissionLevel(10);
				break;
			case "zichang":
				$scope.allRole[0].selected = true;
				$scope.allRole[1].selected = false;
				$scope.allRole[2].selected = true;
				$scope.allRole[3].selected = true;
				$scope.allRole[4].selected = false;
				$scope.setPermissionLevel(50);
				break;
			case "qiye":

				$scope.allRole[0].selected = false;
				$scope.allRole[1].selected = false;
				$scope.allRole[2].selected = true;
				$scope.allRole[3].selected = true;
				$scope.allRole[4].selected = false;
				$scope.setPermissionLevel(70);
				break;
			case "quanshang":

				$scope.allRole[0].selected = false;
				$scope.allRole[1].selected = false;
				$scope.allRole[2].selected = false;
				$scope.allRole[3].selected = false;
				$scope.allRole[4].selected = true;
				$scope.setPermissionLevel(90);
				break;
			case "chaoji":
				$scope.allRole[0].selected = true;
				$scope.allRole[1].selected = true;
				$scope.allRole[2].selected = false;
				$scope.allRole[3].selected = true;
				$scope.allRole[4].selected = true;
				$scope.setPermissionLevel(90);
				break;
			default:

		}

	}

	$scope.clearAllPermission = function (destStr) {
		$scope.allRole.forEach(function (obj) {
			obj.selected = false;
		});

		$scope.authorizeData.permissionLevel = 0;
		$scope.authorizeData.cellid_list = [];
	}


	$scope.clearTraderAllPermission = function (destStr) {
		$scope.authorizeTraderData.permissionLevel = 0;
		$scope.authorizeTraderData.cellid_list = [];
	}


	$scope.editPermission = function () {
		if ($scope.authorizeDestination == "trader") {
			var requestData = { body: { oid: $scope.altOperInfo.oid, roleid: 6, rightlv: $scope.authorizeTraderData.permissionLevel, cellid_list: [] } };

			$scope.authorizeTraderData.cellid_list.forEach(function (obj) {
				requestData.body.cellid_list.push(parseInt(obj.id));
			});

			requestData.body.cellid_list.sort();
			operManageService.authorizeTrader(requestData, function (res) {
				if (res.msret.msgcode != '00') {
					cms.message.error("授权交易员权限失败." + res.msret.msg);
					return;
				}
				cms.message.success("授权交易员权限成功.");
				$scope.$emit("changedTrader", "changedTrader");
				$scope.operManageAdd_HideModal();
				$scope.$apply();
			});
		} else {
			var requestData = { body: { oid: $scope.altOperInfo.oid, roleid_list: [], rightlv: $scope.authorizeData.permissionLevel, cellid_list: [] } };
			$scope.authorizeData.cellid_list.forEach(function (obj) {
				requestData.body.cellid_list.push(parseInt(obj.id));
			});
			requestData.body.cellid_list.sort();

			$scope.allRole.forEach(function (obj) {
				if (obj.selected) {
					requestData.body.roleid_list.push(parseInt(obj.roleid));
				}
			});
			requestData.body.roleid_list.sort();

			if (requestData.body.roleid_list.length && !requestData.body.rightlv) {
				cms.message.error("必须选择权限级别");
				return;
			}
			operManageService.authorizeManager(requestData, function (res) {
				if (res.msret.msgcode != '00') {
					cms.message.error("授权管理权限失败." + res.msret.msg);
					return;
				}
				cms.message.success("授权管理权限成功.");
				$scope.operManageAdd_HideModal();
				$scope.$apply();
			});
		}


	}

    //导出数据
    $scope.exportOperList = function () {
        if ($scope.operManage_operList.length == 0) {
            cms.message.error("表格中无可导出的数据.")
            return;
        }
        var exportData = {};
        var headers = ["操作员编号", "操作员姓名", "联系电话", "电子邮箱", "身份证号", "角色", "状态"];
        exportData.headers = headers;
        exportData.fileType = "xlsx";
        exportData.fileName = $scope.selectedTamgr.displayName + "操作员列表";
        exportData.data = [];
        angular.forEach($scope.operManage_operList, function (data) {
            var temp = [];
            temp.push(data.oid);
            temp.push(data.oname);
            temp.push(data.phone);
            temp.push(data.email);
            temp.push(data.idcard);
            temp.push(data.rolename);
            temp.push(data.stat==1?"可用":"不可用");
            exportData.data.push(temp);
        });
        cms.exportExcelFile(exportData, function (err, res) {
            if (err) return;
            if (res.result == true) {
                cms.message.success("导出成功.", 5);
            }
            else {
                cms.message.error("导出文件失败，" + res.reason);
                cms.log("导出文件失败：", res.reason);
            }
        })
	}

	//关闭二级弹框
    $scope.mainHideModalLv2 = function () {
        $scope.modalInfoLv2.state = 0;
        $scope.modalInfoLv2.path = "";
        mainService.hideModal("main_modal_back_lv2");
    }


	//终端绑定二级弹框加载完成
    $scope.operManageLoadModal2Ready = function () {
        switch ($scope.modalInfoLv2.state) {
            case "addOperMacBind":
                mainService.showModal("main_modal_back_lv2", "operMacBind_Add_modal", "operMacBind_Add_modal_title");
                break;
            case "changeOperMacBind":
                mainService.showModal("main_modal_back_lv2", "operMacBind_change_modal", "operMacBind_change_modal_title");
                break;
            case "deleteOPerMacBind":
                mainService.showModal("main_modal_back_lv2", "operMacBind_delete_modal", "operMacBind_delete_modal_title");
                break;
            default:
                break;
        }
    }

	
	//显示终端绑定弹框
	$scope.showNewOperMacBind=function(tempData){
		console.log(tempData);
		$scope.nowDaysOperatorName = tempData.oname;
		$scope.nowDaysOperatorId = tempData.oid;
		$scope.getOperMacBindDataInfo($scope.selectedTamgr.maid, tempData.oid);
		$scope.operManageShowModal($scope.modalInfo.stateEnum.newOperMacBind);
	}

	//点击表头
	$scope.clickTableHeader2 = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	$scope.operMacShowTips = function(state) {
		$scope.showImportTips = state;
	}


	//获取具体的某一个作员mac绑定信息信息
	$scope.getOperMacBindDataInfo = function(maid,oid) {

		var requestData={body:{"maid":maid, "oid": oid}};

		operManageService.getOperMacBindData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				if(tmpData.length<=0){
					cms.message.error("查询没有符合条件的数据.");
					console.log(tmpData);
				}

				var operMacBindList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					if(!tmpData[i].oname){
						dataCell.oname='-';
					}
					dataCell.idx=i+1;

					dataCell.active=false;
					dataCell.edit_oid_flag=false;
					dataCell.edit_mac_flag=false;
					dataCell.edit_cellid_flag=false;
					dataCell.mac_edit_value = dataCell.mac;
					dataCell.oid_edit_value = dataCell.oid;
					dataCell.cellid_edit_value = dataCell.cellid;
					dataCell.ip_edit_value = dataCell.ip;

					dataCell.show=true;//默认此行数据显示
					dataCell.isChecked = false;
					operMacBindList.push(dataCell);
				}
				$scope.isAllChecked = false;
				console.log(operMacBindList);
				$scope.operMacBind_DataList=operMacBindList;
				$scope.$apply();
			}
			else{
				$scope.operMacBind_DataList.splice(0,$scope.operMacBind_DataList.length);
				$scope.$apply();
				cms.message.error("获取操作员MAC绑定数据出错."+retData.msret.msg);
			}
		})
	}

	//获取当前资产管理人下的所有操作员mac绑定信息
	$scope.getAllOperMacBindDataInfo = function(maid) {

		var requestData={body:{"maid":maid}};

		operManageService.getOperMacBindData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				if(tmpData.length<=0){
					cms.message.error("查询没有符合条件的终端mac数据.");
				}

				var operMacBindList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					if(!tmpData[i].oname){
						dataCell.oname='-';
					}
					dataCell.idx=i+1;

					dataCell.active=false;
					dataCell.edit_oid_flag=false;
					dataCell.edit_mac_flag=false;
					dataCell.edit_cellid_flag=false;
					dataCell.mac_edit_value = dataCell.mac;
					dataCell.oid_edit_value = dataCell.oid;
					dataCell.cellid_edit_value = dataCell.cellid;
					dataCell.ip_edit_value = dataCell.ip;

					dataCell.show=true;//默认此行数据显示
					dataCell.isChecked = false;
					operMacBindList.push(dataCell);
				}
				$scope.isAllChecked = false;
				console.log(operMacBindList);
				$scope.operMacBind_All_DataList=operMacBindList;
				$scope.$apply();
			}
			else{
				$scope.operMacBind_All_DataList.splice(0,$scope.operMacBind_All_DataList.length);
				$scope.$apply();
				cms.message.error("获取操作员MAC绑定数据出错."+retData.msret.msg);
			}
		})
	}

	//打开新增操作员mac绑定
	$scope.showOperMacBind_AddDlg = function() {

		$scope.addMacBindInfo={};
		$scope.addMacBindInfo.add_maid=$scope.selectedTamgr.maid;
		$scope.addMacBindInfo.add_maidDisplayName=$scope.selectedTamgr.maname+"("+$scope.selectedTamgr.maid+")";
		$scope.addMacBindInfo.add_oid=$scope.nowDaysOperatorId;
		$scope.addMacBindInfo.add_mac="";
		$scope.addMacBindInfo.add_cellid="*";
		$scope.addMacBindInfo.add_ip="";

		$scope.modalInfoLv2.path = "../unit-manage/operMacBind_Add.html";
        $scope.modalInfoLv2.state = "addOperMacBind";
	}

	//添加操作员mac确认
	$scope.operMacBindAddConfirm = function() {

		if ($scope.addMacBindInfo.add_oid==""){
			cms.message.error("操作员不可以为空.");
			return;
		}

		if($scope.addMacBindInfo.add_mac=="" && $scope.addMacBindInfo.add_ip==""){
			cms.message.error("MAC地址和IP地址不可以同时为空.");
			return;
		}

		if( $scope.addMacBindInfo.add_mac!="" && !cms.checkMacValid($scope.addMacBindInfo.add_mac)){
			cms.message.error("MAC地址有误,请检查后再试.");
			return;
		}

		if ($scope.addMacBindInfo.add_ip != "" && !cms.checkIpValid($scope.addMacBindInfo.add_ip)) {
			cms.message.error("IP地址有误,请检查后再试.");
			return;
		}

		var single_add_flag='1';//单个手动添加
		var data_list=[];

		var tmp_oid=parseInt($scope.addMacBindInfo.add_oid);//581001
		var dataCell={"oid":tmp_oid,"mac":$scope.addMacBindInfo.add_mac,"cellid":$scope.addMacBindInfo.add_cellid, "ip": $scope.addMacBindInfo.add_ip};
		data_list.push(dataCell);

		var requestData={body:{"single_add":single_add_flag,"data_list":data_list, maid: $scope.addMacBindInfo.add_maid}};
		operManageService.AddNewOperMacBind(requestData,function(retData) {

			// console.log("AddNewOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				//console.log("新增操作员成功");//提示信息
				cms.message.success("新增操作员MAC终端绑定信息成功.");

				$scope.mainHideModalLv2();//关闭对话框
				$scope.getOperMacBindDataInfo($scope.selectedTamgr.maid, $scope.nowDaysOperatorId);//刷新界面
				$scope.getAllOperMacBindDataInfo($scope.selectedTamgr.maid);
			}
			else{
				//console.log("新增操作员失败",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("新增操作员MAC终端绑定信息失败."+retData.msret.msg);
			}
		})
	}

	//打开修改操作员终端绑定信息
    $scope.showOperMacBind_ChangeDlg = function(cell) {
		$scope.changeMacBindInfo={};
		$scope.beforeChangeMacBindInfo = {};
		$scope.changeMacBindInfo.add_maid=$scope.selectedTamgr.maid;
		$scope.changeMacBindInfo.add_maidDisplayName=$scope.selectedTamgr.maname+"("+$scope.selectedTamgr.maid+")";
		$scope.changeMacBindInfo.add_oid=cell.oid;
		$scope.changeMacBindInfo.add_mac=cell.mac;
		$scope.changeMacBindInfo.add_cellid=cell.cellid;
		$scope.changeMacBindInfo.add_ip=cell.ip; // 这里需要传递ip地址数据
		// 保存一份修改钱的原始数据
		$scope.beforeChangeMacBindInfo.add_maid=$scope.selectedTamgr.maid;
		$scope.beforeChangeMacBindInfo.add_maidDisplayName=$scope.selectedTamgr.maname+"("+$scope.selectedTamgr.maid+")";
		$scope.beforeChangeMacBindInfo.add_oid=cell.oid;
		$scope.beforeChangeMacBindInfo.add_mac=cell.mac;
		$scope.beforeChangeMacBindInfo.add_cellid=cell.cellid;
		$scope.beforeChangeMacBindInfo.add_ip=cell.ip;
		
		$scope.modalInfoLv2.path = "../unit-manage/operMacBind_change.html";
        $scope.modalInfoLv2.state = "changeOperMacBind";
	}

	// 提交终端MAC信息修改
	$scope.subscribOperMacBind = function() {
		console.log('提交修改的请求');
		if ($scope.changeMacBindInfo.add_oid=="") {
			cms.message.error("操作员编号不能为空.");
			return;
		}

		if( $scope.changeMacBindInfo.add_mac=="" && $scope.changeMacBindInfo.add_ip==""){
			cms.message.error("MAC地址和IP不能同时为空.");
			return;
		}

		if($scope.changeMacBindInfo.add_mac !="" && !cms.checkMacValid($scope.changeMacBindInfo.add_mac)){
			cms.message.error("MAC地址有误,请检查后再试.");
			return;
		}
		if ($scope.changeMacBindInfo.add_ip != "" && !cms.checkIpValid($scope.changeMacBindInfo.add_ip)) {
			cms.message.error("IP地址有误,请检查再试.");
			return;
		}
		var single_add_flag='1';//单个手动添加

		var requestData={
			body:{
			"single_add":single_add_flag,
			"oid":$scope.changeMacBindInfo.add_oid,
			"mac":$scope.changeMacBindInfo.add_mac,
			"cellid":$scope.changeMacBindInfo.add_cellid, 
			"ip": $scope.changeMacBindInfo.add_ip,
			"org_ip": $scope.beforeChangeMacBindInfo.add_ip,
			"org_mac": $scope.beforeChangeMacBindInfo.add_mac,
			"org_oid": $scope.beforeChangeMacBindInfo.add_oid,
			"maid": $scope.beforeChangeMacBindInfo.add_maid
		}};
		operManageService.altOperMacBind(requestData,function(retData) {

			// console.log("altOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				cms.message.success("修改操作员终端绑定信息成功.");

				$scope.mainHideModalLv2();//关闭对话框
				$scope.getOperMacBindDataInfo($scope.selectedTamgr.maid, $scope.nowDaysOperatorId);//刷新界面
				$scope.getAllOperMacBindDataInfo($scope.selectedTamgr.maid);
			}
			else{
				cms.message.error("修改操作员终端绑定信息失败."+retData.msret.msg);
			}
		})
		
	}

	//导出操作员MAC终端绑定信息表数据
	$scope.exportOperMacBindDataClick = function(){
		var requestData={body:{"maid":$scope.selectedTamgr.maid}};

		operManageService.getOperMacBindData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				if(tmpData.length<=0){
					cms.message.error("查询没有符合条件的终端mac数据.");
				}

				var operMacBindList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					if(!tmpData[i].oname){
						dataCell.oname='-';
					}
					dataCell.idx=i+1;

					dataCell.active=false;
					dataCell.edit_oid_flag=false;
					dataCell.edit_mac_flag=false;
					dataCell.edit_cellid_flag=false;
					dataCell.mac_edit_value = dataCell.mac;
					dataCell.oid_edit_value = dataCell.oid;
					dataCell.cellid_edit_value = dataCell.cellid;
					dataCell.ip_edit_value = dataCell.ip;

					dataCell.show=true;//默认此行数据显示
					dataCell.isChecked = false;
					operMacBindList.push(dataCell);
				}
				$scope.isAllChecked = false;
				console.log(operMacBindList);
				$scope.operMacBind_All_DataList=operMacBindList;
				if($scope.operMacBind_All_DataList.length<=0){
					cms.message.error("表中没有可导出的数据");
					return;
				}

				var exportData = {};
				var headers = ["操作员编号","MAC地址","IP地址"];
				exportData.headers = headers;
				exportData.fileType = "xlsx";
				exportData.fileName = "资产管理人"+$scope.selectedTamgr.displayName+"-操作员终端绑定信息导出";
				exportData.data = [];

				angular.forEach($scope.operMacBind_All_DataList,function(dataCell) {
					var tempCell = [];
					tempCell.push(dataCell.oid);
					tempCell.push(dataCell.mac);
					tempCell.push(dataCell.ip);

					exportData.data.push(tempCell);
				})

				operManageService.exportDataToExcelFile(exportData,function(err,res) {
					if(err) return ;
					if(res.result == true) {
						cms.message.success("导出数据成功.");
					}
					else {
						cms.message.error("导出数据失败."+res.reason);
						cms.log("导出数据失败：",res.reason);
					}
				})
				$scope.$apply();
			}
			else{
				$scope.operMacBind_All_DataList.splice(0,$scope.operMacBind_All_DataList.length);
				$scope.$apply();
				cms.message.error("获取操作员MAC绑定数据出错."+retData.msret.msg);
			}
		})
	}

	//点击终端导入
	$scope.importOperMacBindDataClick = function() {
		// document.getElementById("operMacBind_import_open_file_form").reset();
		// document.getElementById("operMacBind_import_open_file").click();
		operManageService.importExcelFile(function(err,res) {
			if(err) return ;
			if(res.result == true) {
				if($scope.importDataCheck(res.data)){
					var importData=[];
					for(var i=1;i<res.data.length;i++){

						var dataCell=res.data[i];

						//去掉空行
						if(res.data[i].length==0) continue;

						importData.push(dataCell)

					}
					$scope.operMacBindImport(importData);
				}
			}
			else {
				cms.log(res.reason);
				cms.message.error("解析文件失败，请检查后重试.");
			}
		})
	}

	//检查导入数据的正确性
	$scope.importDataCheck = function(data){

		if(data.length <= 1) {
			cms.message.error("选择的文件无数据，请确认后重试.")
			return false;
		}
		else {

			//第一行为表头，从第2行读起
			for(var i = 1; i < data.length; i ++) {
				if(data[i].length==0){
					continue;//空行跳过
				}

				if(!data[i][0] || (!data[i][1] && !data[i][2])){
					cms.message.error("导入表格数据中，第"+i+"行有数据为空的项,请检查后再试.");
					return false;
				}
				if(data[i][1] && !cms.checkMacValid(data[i][1])){
					cms.message.error("导入表格数据中，第"+i+"行有MAC地址有误,请检查后再试.");
					return false;
				}
				if (data[i][2] && !cms.checkIpValid(data[i][2])){
					cms.message.error("导入表格数据中,第"+i+"行有IP地址有误,请检查后再试.");
					return false;
				}

				if(parseInt(data[i][0]/10000) != parseInt($scope.selectedTamgr.maid)){
					cms.message.error("导入表格数据中，第"+i+"行，导入的操作员ID与当前选择的资产管理人不一致,请检查后再试.");
					return false;
				}
			}
		}

		return true;
	}

	//导入操作员MAC绑定信息
	$scope.operMacBindImport = function(data) {
		var single_add_flag='0';//单个手动添加
		var data_list=[];

		for(var i=0;i<data.length;i++){
			var cellData={};
			cellData.oid=data[i][0];
			cellData.mac=data[i][1] ? data[i][1] : "";
			cellData.ip=data[i][2] ? data[i][2]: "";
			cellData.cellid = "*";

			data_list.push(cellData);
		}

		var requestData={body:{"single_add":single_add_flag,"data_list":data_list, "maid": $scope.selectedTamgr.maid}};
		operManageService.AddNewOperMacBind(requestData,function(retData) {

			console.log(requestData);

			console.log("AddNewOperMacBind>>>>>>>>>>>>",JSON.stringify(retData));
			if(retData.msret.msgcode=='00'){

				//console.log("新增操作员成功");//提示信息
				cms.message.success("导入操作员MAC终端绑定信息成功.");

				$scope.mainHideModalLv2();//关闭对话框
			}
			else{
				//console.log("新增操作员失败",retData.msret.msgcode,retData.msret.msg);//提示信息
				cms.message.error("导入操作员MAC终端绑定信息失败."+retData.msret.msg);
			}
		})
	}

	//删除mac绑定信息，可以支持批量删除,显示删除确认弹框
	$scope.showOperMacBind_DeleteDlg = function() {
		var temp = 0;
		$scope.deleteMacBindInfo = [];
		for(var i = 0;i<$scope.operMacBind_DataList.length;i++){
			if ($scope.operMacBind_DataList[i]["isChecked"]){
				temp+=1;
			}
		}
		if (temp === 0){
			cms.message.error("没有选中要删除的终端信息.");
			return;
		} else {
			$scope.modalInfoLv2.path = "../unit-manage/operMacBind_delete.html";
            $scope.modalInfoLv2.state = "deleteOPerMacBind";
		}
	}

	//点击了全选按钮之后修改
	$scope.clickSelectAllChecked = function(){
		if($scope.isAllChecked) {
			$scope.isAllChecked = false;
			for(var i = 0; i<$scope.operMacBind_DataList.length; i++){
				$scope.operMacBind_DataList[i]["isChecked"] = false;
			}
		} else {
			$scope.isAllChecked = true;
			for(var i = 0; i<$scope.operMacBind_DataList.length; i++){
				$scope.operMacBind_DataList[i]["isChecked"] = true;
			}
		}
	}

	//点击修改了选中状态
	$scope.clickSelectCheckBox=function(cell){
		var temp = 0;
		if(cell.isChecked) {
			cell.isChecked = false;
		} else {
			cell.isChecked = true;
		}
		for (var i = 0;i<$scope.operMacBind_DataList.length;i++){
			if ($scope.operMacBind_DataList[i]["isChecked"]){
				temp+=1;
			}
		}
		if (temp === $scope.operMacBind_DataList.length) {
			$scope.isAllChecked = true;
		} else {
			$scope.isAllChecked = false;
		}
		console.log(temp);
		console.log($scope.operMacBind_DataList);
	}

	//确认删除MAC绑定
	$scope.confirmDelete = function() {
		for(var i = 0;i<$scope.operMacBind_DataList.length;i++){
			if($scope.operMacBind_DataList[i]["isChecked"]){
				//代表选中要删除的
				var tempData = {};
				tempData["ip"]=$scope.operMacBind_DataList[i]["ip"];
				tempData["mac"]=$scope.operMacBind_DataList[i]["mac"];
				$scope.deleteMacBindInfo.push(tempData);
			}
		}
		var requestData={
			body:{
			"oid":$scope.nowDaysOperatorId,
			data_list:$scope.deleteMacBindInfo,
			"maid": $scope.selectedTamgr.maid
		}};
		operManageService.DeleteOperMacBind(requestData,function(retData) {
			if(retData.msret.msgcode=='00'){

				cms.message.success("删除操作员MAC终端绑定信息成功.");

				$scope.mainHideModalLv2();//关闭对话框
				$scope.getOperMacBindDataInfo($scope.selectedTamgr.maid, $scope.nowDaysOperatorId);//刷新界面
				$scope.getAllOperMacBindDataInfo($scope.selectedTamgr.maid);
			}
			else{
				cms.message.error("删除操作员MAC终端绑定信息失败."+retData.msret.msg);
			}
		})
	}

});
