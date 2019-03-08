angular.module('cmsController').controller('traderManageCtrl',function($scope,$timeout,mainService,traderManageService) {
	$scope.showSubguide = true;
	$scope.unitList = [];   //定义显示数据
	$scope.maidList = [];
	$scope.caidList =[];
	$scope.tridList = [];
	$scope.traderList = [];
	$scope.currentReqData = {};
	$scope.searchContent = "";
	$scope.modalInfo = {};
	$scope.freezeInfo = {};
	$scope.guideList = [];

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.$on("changedManager_broadcast", function(event, message) {
		$scope.tmGetUnit();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
		$scope.tmGetUnit();

	});

	$scope.$on("changedAssetAccount_broadcast", function(event, message) {
		$scope.tmGetUnit();
	});

	$scope.tmInit = function() {
		$scope.currentReqData.select = false;
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;   //默认无定义
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.freeze = 1;  //冻结解冻
		$scope.tmGetUnit();
	}

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	//获取单元列表
	$scope.tmGetUnit = function() {
		$scope.unitList.splice(0,$scope.unitList.length);
		//获取资产管理人
		traderManageService.getTamgr({body:{}},function(maidres) {
			if(maidres.msret.msgcode == "00") {
				$scope.maidList.splice(0,$scope.maidList.length);
				$scope.maidList = maidres.body;
				// 开始 -- 获取产品
				traderManageService.getTacap({body:{}},function(caidres) {
					if(caidres.msret.msgcode == "00") {
						// 开始 -- 获取策略组合
						$scope.caidList.splice(0,$scope.caidList.length);
						$scope.caidList = caidres.body;
						traderManageService.getTatrd({body:{}},function(tridres) {
							if(tridres.msret.msgcode == "00") {
								$scope.tridList.splice(0,$scope.tridList.length);
								$scope.tridList = tridres.body;
								//构造树形结构
								$scope.guideList.splice(0,$scope.guideList.length);
								$scope.tmMakeTreeFromList();
								$scope.$apply();
							}
							else {
								cms.message.error("获取策略组合失败."+tridres.msret.msg);
							}
						})
						//结束 -- 获取策略组合
					}
					else {
						cms.message.error("获取产品失败."+caidres.msret.msg);
					}
				})
				// 结束 -- 获取产品
			}
			else {
				cms.message.error("获取资产管理人失败."+maidres.msret.msg);
			}
		})
		// 结束 -- 获取资产管理人
	}

	//将单元列表构造成树
	$scope.tmMakeTreeFromList = function() {
		$scope.maidList.forEach(function(obj){
			obj.maid=parseInt(obj.maid);
			obj.products=[];
			obj.showChildren=true;
		});

		for (var i = 0; i < $scope.caidList.length; i++) {
			$scope.caidList[i].showChildren=true;
			$scope.caidList[i].maid=parseInt($scope.caidList[i].maid);
			$scope.caidList[i].caid=parseInt($scope.caidList[i].caid);

			var maIndex=cms.binarySearch($scope.maidList,"maid",($scope.caidList[i].maid));
			if (maIndex != -1) {
				$scope.maidList[maIndex].products.push($scope.caidList[i]);
				$scope.caidList[i].combs=[];
				$scope.caidList[i].tradeUnits=[];
			} else {
				var newManager = {maid: $scope.caidList[i].maid, products: [], showChildren: true};
				newManager.products.push($scope.caidList[i]);
				$scope.caidList[i].combs=[];
				$scope.caidList[i].tradeUnits=[];
				$scope.maidList.push(newManager);
			}
		}

		for (var i = 0; i < $scope.tridList.length; i++) {
			$scope.tridList[i].maid=parseInt($scope.tridList[i].maid);
			$scope.tridList[i].caid=parseInt($scope.tridList[i].caid);
			$scope.tridList[i].trid=parseInt($scope.tridList[i].trid);

			var maIndex=cms.binarySearch($scope.maidList,"maid",($scope.tridList[i].maid));
			if (maIndex != -1) {
				var caIndex=cms.binarySearch($scope.maidList[maIndex].products,"caid",($scope.tridList[i].caid));
				if (caIndex != -1) {
					$scope.maidList[maIndex].products[caIndex].combs.push($scope.tridList[i]);
				} else {
					var newProduct = {maid: $scope.tridList[i].maid, caid: $scope.tridList[i].caid, showChildren: true, combs: [], tradeUnits: []};
					newProduct.combs.push($scope.tridList[i]);
					$scope.maidList[maIndex].products.push(newProduct);
				}
			} else {
				var newManager = {maid: $scope.tridList[i].maid, products: [], showChildren: true};
				var newProduct = {maid: $scope.tridList[i].maid, caid: $scope.tridList[i].caid, showChildren: true, combs: [], tradeUnits: []};
				newProduct.combs.push($scope.tridList[i]);
				newManager.products.push(newProduct);
				$scope.maidList.push(newManager);
			}
		}

		$scope.guideList.splice(0,$scope.guideList.length);
		$scope.makeNewTree($scope.maidList,$scope.guideList);

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
                    temp1.children = [];
                    if(typeof temp1.combs != "undefined") {
                        for(var k = 0; k < temp1.combs.length; k ++) {
                            var temp2 = temp1.combs[k];
                            temp2.menuId = temp2.trid;
                            temp2.menuName = temp2.trname;
                            temp2.type = 'trid';
                            temp1.children.push(temp2);
                        }
                    }
                    temp.children.push(temp1);
                }
            }
            destArray.push(temp);
        }
    }

	$scope.tmClickMenu = function(obj) {
		var reqData = {body:{}};
		if(obj.level == 1 ) {
			reqData.body.maid = obj.maid;
		}
		else if(obj.level == 2 ) {
			reqData.body.caid = obj.caid;
		}
		else {
			reqData.body.trid = obj.trid;
		}
		$scope.currentReqData.reqData = reqData;
		$scope.currentReqData.select = true;
		$scope.tmGetTraders(reqData);
	}

	//获取交易员列表
	$scope.tmGetTraders = function(reqData) {
		traderManageService.getTrader(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.traderList = res.body;
				angular.forEach($scope.traderList,function(trader) {
					trader.show = true;
				})
				$scope.tmFilterTrader();
				$scope.$apply();
			}
			else {
				$scope.traderList.splice(0,$scope.traderList.length);
				$scope.$apply();
				cms.message.error("获取交易员数据失败.");
				cms.log("获取交易员数据失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//过滤交易员
	$scope.tmFilterTrader = function() {
		if($scope.currentReqData.select == false) {
			cms.message.error("请先选择查询范围.");
			return ;
		}
		if($scope.searchContent == "") {
			return ;
		}
		angular.forEach($scope.traderList,function(trader) {
			if(trader.traderid.indexOf($scope.searchContent) >= 0 || trader.oname.indexOf($scope.searchContent) >= 0 || trader.trid.indexOf($scope.searchContent) >= 0) {
				trader.show = true;
			}
			else {
				trader.show = false;
			}
		})
	}

	//刷新页面
	$scope.tmRefresh = function() {
		if($scope.currentReqData.select == true) {
			$scope.tmGetTraders($scope.currentReqData.reqData);
		}
		else {
			cms.message.error("请先选择查询范围.");
		}
	}

	//打开弹框
	$scope.tmShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.freeze:
				$scope.modalInfo.path = "../unit-manage/traderManage-freeze.html";
				break;
			default:

		}
	}

	//弹框加载完成
	$scope.tmModalLoadReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.freeze:
				mainService.showModal("tm_modal_back","tm_freeze_modal","tm_freeze_modal_title")
				break;
			default:

		}
	}

	//关闭弹框
	$scope.tmHideModal = function() {
		mainService.hideModal("tm_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//冻结
	$scope.tmFreezeTrader = function(traderData) {
		$scope.freezeInfo.trid = traderData.trid;
		$scope.freezeInfo.traderid = traderData.traderid;
		$scope.freezeInfo.stat = traderData.stat == "1" ? "0" : "1";
		if(traderData.stat == "1") {
			$scope.freezeInfo.title = "冻结交易员";
			$scope.freezeInfo.msg = "你确定要冻结 " + traderData.trid + " 策略组合下的 " + traderData.traderid + " 交易员吗？";
		}
		else {
			$scope.freezeInfo.title = "解冻交易员";
			$scope.freezeInfo.msg = "你确定要解除对 " + traderData.trid + " 策略组合下的 " + traderData.traderid + " 交易员的冻结吗？";
		}
		$scope.tmShowModal($scope.modalInfo.stateEnum.freeze);
	}

	//确定冻结
	$scope.tmFreezeTraderSure = function() {
		var reqData = {body:{
			trid:$scope.freezeInfo.trid,
			traderid: $scope.freezeInfo.traderid,
			stat : $scope.freezeInfo.stat
		}};
		traderManageService.updateTrader(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("操作成功.",5);
				$scope.tmHideModal();
				$scope.tmRefresh();
			}
			else {
				cms.message.error("操作失败.");
				cms.log("操作失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

})
