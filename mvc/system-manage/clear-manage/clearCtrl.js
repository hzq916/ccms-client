angular.module('cmsController').controller('clearCtrl',function($scope,mainService,$interval,clearService) {
	$scope.tamgrList = [];
	$scope.tacapList = [];
	$scope.currentMaid = "";
	$scope.taskLogList = [];
	$scope.marketList = [];
	$scope.accountList = [];
	$scope.clearSteps = [];
	$scope.clickTr = -1;
	$scope.showSubguide = true;
	$scope.filterContent = "";
	$scope.guideTree = [];
	$scope.currentMenu = {};
	$scope.currentAcid = "";

	//设置定时拉取数据
	$scope.timer = null;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.log_keyName = "";
	$scope.log_reverse = false;
	$scope.logSortFunction = null;

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	//点击表头
	$scope.logClickTableHeader = function(keyName,isNumber) {
		$scope.log_reverse = $scope.log_keyName == keyName ? !$scope.log_reverse : false;
		$scope.log_keyName = keyName;
		$scope.logSortFunction = mainService.getSortFunc($scope.log_reverse,isNumber);
	}

	$scope.clearInit = function() {
		$scope.clearSteps.splice(0,$scope.clearSteps.length);
		clearService.getClearSteps({body:{}},function(stepres) {
			if(stepres.msret.msgcode == "00") {
				$scope.clearSteps = stepres.body;
			}
			else {
				cms.message.error("获取清算步骤失败.");
				cms.log("获取清算步骤失败.",JSON.stringify(stepres.msret));
			}
		})
		$scope.showSubguide = true;
		$scope.filterContent = "";
		$scope.clickTr = -1;
		$scope.currentMenu.type = "";
		$scope.currentMenu.id = "";
		$scope.currentAcid = "";
		$scope.clearGetUnit();
	}

	//菜单改变
	$scope.$on("mainMenuChange",function(event,menu) {
		if(menu.menuId == "2005003" ) {
			$scope.clearRefreshAccountList();
			$scope.timer = $interval(function () {
				$scope.clearRefreshAccountList();
			}, 5000);
		}
		else {
			if($scope.timer != null) {
				$interval.cancel($scope.timer);
				$scope.timer = null;
			}
		}
	})

	//页面关闭
	$scope.$on("$destroy", function() {
		if($scope.timer != null) {
			$interval.cancel($scope.timer);
			$scope.timer = null;
		}
    });


	//获取单元列表
	$scope.clearGetUnit = function() {
		clearService.getTamgr({body:{}},function(res) {
			//获取资产管理人
			if(res.msret.msgcode == "00") {
				//获取产品
				clearService.getTacap({body:{}},function(cares) {
					if(cares.msret.msgcode == "00") {
						$scope.tamgrList.splice(0,$scope.tamgrList.length);
						$scope.tamgrList = res.body;
						$scope.tacapList.splice(0,$scope.tacapList.length);
						$scope.tacapList = cares.body;
						//构造树结构
						$scope.clearMakeGuideTree();
						$scope.$apply();
					}
					else {
						cms.message.error("获取产品失败.");
						cms.log("获取产品失败.",JSON.stringify(cares.msret));
					}
				})
			}
			else {
				cms.message.error("获取资产管理人失败.");
				cms.log("获取资产管理人失败.",JSON.stringify(res.msret));
			}
		})
	}
	//将单元列表构造成树
	$scope.clearMakeGuideTree = function() {
		$scope.tamgrList.forEach(function(obj){
			obj.maid=parseInt(obj.maid);
			obj.products=[];
			obj.showChildren=true;
		});

		for (var i = 0; i < $scope.tacapList.length; i++) {
			$scope.tacapList[i].showChildren=true;
			$scope.tacapList[i].maid=parseInt($scope.tacapList[i].maid);
			$scope.tacapList[i].caid=parseInt($scope.tacapList[i].caid);

			var maIndex=cms.accurateSearch($scope.tamgrList,"maid",($scope.tacapList[i].maid));
			if (maIndex != -1) {
				$scope.tamgrList[maIndex].products.push($scope.tacapList[i]);
			} else {
				var newManager = {maid: $scope.tacapList[i].maid, products: [], showChildren: true};
				newManager.products.push($scope.tacapList[i]);
				$scope.tamgrList.push(newManager);
			}
		}

		$scope.guideTree.splice(0,$scope.guideTree.length);
		$scope.makeNewTree($scope.tamgrList,$scope.guideTree);

		$scope.$apply();
	}

    $scope.makeNewTree = function(srcArray,destArray) {
        for(var i = 0; i < srcArray.length; i ++) {
            var temp = srcArray[i];
            temp.menuId = temp.maid;
            temp.menuName = temp.maname;
            temp.type = 'maid';
            temp.children = [];
            if(typeof temp.products != "undefined") {
                for(var j = 0; j < temp.products.length; j++) {
                    var temp1 = temp.products[j];
                    temp1.menuId = temp1.caid;
                    temp1.menuName = temp1.caname;
                    temp1.type = 'caid';
                    temp.children.push(temp1);
                }
            }
            destArray.push(temp);
        }
    }

	//点击菜单
	$scope.clearClickMenu = function(obj) {
		$scope.currentMenu.type = obj.type;
		$scope.currentMenu.id = obj.menuId;
		$scope.clickTr = -1;
		$scope.currentAcid = "";
		$scope.keyName = "";
		$scope.reverse = false;
		$scope.sortFunction = null;

		$scope.log_keyName = "";
		$scope.log_reverse = false;
		$scope.logSortFunction = null;

		$scope.clearGetAccountList(obj.type,obj.menuId);
		$scope.timer = $interval(function () {
			$scope.clearRefreshAccountList();
		}, 5000);
	}

	//获取账户结构
	$scope.clearGetAccountList = function(type,id) {
		var reqData = {body:{}};
		if(type == 'maid') {
			reqData.body.maid = id;
		}
		if(type == 'caid' ) {
			reqData.body.caid = id;
		}
		clearService.getTaactClearStat(reqData,function(acres) {
			if(acres.msret.msgcode == "00") {
				$scope.accountList = acres.body;
				var clearday = "";
				angular.forEach($scope.accountList,function(account,index) {
					account.acIndex = index;
					account.trday = (account.current_step == 0 || (account.current_step == 1 && account.stepstat == 0)) ? "-" : (account.trday == "19000101" ? "-" : account.trday );
					account.clearday = (account.current_step == $scope.clearSteps.length && account.stepstat == 2) ? account.clearday : (account.trday == "-" ? account.clearday : account.trday );
					account.clearday = account.tatractCount == 0 ? "-" : account.clearday;
					account.clearday = account.clearday == "00000000" ? "-" : account.clearday;
					if(account.current_step == $scope.clearSteps.length && account.stepstat == 2 && account.trday != account.clearday) {
						account.current_step = 1;
						account.stepstat = 0;
					}
					if(account.acid == $scope.currentAcid) {
						$scope.clickTr = index;
						clearday = account.trday;
					}
					account.show = true;
				});
				$scope.clearFilterAccount();
				if( $scope.currentAcid == "") {
					$scope.taskLogList.splice(0,$scope.taskLogList.length);
				}
				$scope.$apply();
				if($scope.currentAcid != "") {
					$scope.clearGetTaskLog($scope.currentAcid,clearday);
				}
			}
			else {
				$scope.accountList.splice(0,$scope.accountList.length);
				$scope.$apply();
				cms.message.error("获取账户失败.");
				cms.log("获取账户失败.",JSON.stringify(acres.msret));
			}
		})
	}

	//过滤账户
	$scope.clearFilterAccount = function() {
		if($scope.filterContent == "") {
			angular.forEach($scope.accountList,function(account) {
				account.show = true;
			});
			return ;
		}
		else {
			angular.forEach($scope.accountList,function(account) {
				if(account.acid.indexOf($scope.filterContent) != -1 || account.acname.indexOf($scope.filterContent) != -1) {
					account.show = true;
				}
				else {
					account.show = false;
				}
			});
		}
	}

	//刷新列表
	$scope.clearRefreshAccountList = function() {
		if($scope.currentMenu.type == "") {
			return ;
		}
		$scope.clearGetAccountList($scope.currentMenu.type,$scope.currentMenu.id);
	}

	//点击行
	$scope.clearClickTr = function(obj) {
		$scope.clickTr = obj.acIndex;
		$scope.currentAcid = obj.acid;
		$scope.clearGetTaskLog(obj.acid,obj.trday);
	}

	//获取操作日志
	$scope.clearGetTaskLog = function(acid,clearday) {
		if(clearday == "" || clearday == "-") {
			return ;
		}
		var reqData = {
			body: {
				acid: acid
			}
		}
		clearService.getClearLog(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.taskLogList = res.body;
				for (var i = 0; i < $scope.taskLogList.length; ++i) {
					if ($scope.taskLogList[i].success_flag == "0") {
						$scope.taskLogList[i].success_flag = "失败";
					} else if ($scope.taskLogList[i].success_flag == "1") {
						$scope.taskLogList[i].success_flag = "成功";
					} else {
						$scope.taskLogList[i].success_flag = "";
					}
				}
				$scope.$apply();
			}
			else {
				$scope.taskLogList.splice(0,$scope.taskLogList.length);
				$scope.$apply();
				cms.message.error("读取清算日志失败.");
				cms.log("读取清算日志失败.",JSON.stringify(res.msret));
			}
		})
	}

	//清算
	$scope.clearClickStep = function(step,data) {
		var reqData = {body:{
			acid: data.acid,
			stepcode: step.stepcode,
			clearday:data.clearday
		}};
		data.current_step = step.stepid;
		data.stepstat = 1;
		clearService.clearTaact(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("执行成功.",5);
			}
			else {
				cms.message.error("执行失败."+res.msret.msg);
				cms.log("执行失败.",JSON.stringify(res.msret));
			}
			$scope.clearRefreshAccountList();
		})
	}

	//一键清算
	$scope.clearOnceClick = function(obj) {
		if(obj.clearday == '-' || !(obj.current_step == 0 || (obj.current_step == 1 && obj.stepstat == 0) )) {
			reutrn ;
		}
		var reqData = {body:{
			acid: obj.acid,
			clearday:obj.clearday
		}}
		obj.stepstat = 1;
		clearService.clearOnce(reqData,function(res) {
			console.log(res);
			if(res.msret.msgcode == "00") {
				cms.message.success("执行成功.",5);
			}
			else {
				cms.message.error("执行失败."+res.msret.msg);
				cms.log("执行失败.",JSON.stringify(res.msret));
			}
			$scope.clearRefreshAccountList();
		})
	}

	//撤销清算
	$scope.clearRevoke = function(obj) {
		if(obj.trday == '-' || obj.stepstat == 1 || obj.current_step == 0 || (obj.current_step == 1 && obj.stepstat == 0)) {
			return ;
		}
		var reqData = {body:{
			acid: obj.acid,
			clearday:obj.clearday
		}}
		clearService.clearRevoke(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("执行成功.",5);
			}
			else  if (res.msret.msgcode == "20") {
				cms.message.error("撤销成功，但同步gemfire失败，请手动同步或重试.");
				cms.log("同步失败：",res.msret.msg);
			}
			else {
				cms.message.error("执行失败."+res.msret.msg);
				cms.log("执行失败.",JSON.stringify(res.msret));
			}
			$scope.clearRefreshAccountList();
		})
	}

})
