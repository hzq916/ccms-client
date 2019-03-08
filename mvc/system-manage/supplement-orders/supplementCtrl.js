angular.module('cmsController').controller('supplementCtrl', function ($scope, $timeout, mainService, supplementService) {
	$scope.showSubguide = true;
	$scope.maidList = [];
	$scope.caidList = [];
	$scope.acidList = [];
	$scope.searchContent = "";
	$scope.modalInfo = {};
	$scope.guideList = [];
	$scope.marketList = [];
	$scope.marketObject = {};
	$scope.commandList = [];
	$scope.directiveList = [];
	$scope.offsetList = [];

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	//定义相关变量
	$scope.orderList = [];

	$scope.currentSelectDate = null;
	$scope.currentAddOrder = {};
	$scope.currentCaid = "";
	$scope.currentAcid = "";
	$scope.currentAcname = "";
	$scope.show_load_tips = false;

	$scope.canSupply = false;
	$scope.termid = 0;

	$scope.currentPage = 1;
	$scope.allPage = 1;
	$scope.pageCount = 20;
	$scope.currentTridList = [];
	$scope.batchData = [];

	$scope.$on("changedManager_broadcast", function (event, message) {
		$scope.supplementGetUnit();
	});

	$scope.$on("changedProduct_broadcast", function (event, message) {
		$scope.supplementGetUnit();

	});

	$scope.$on("changedAssetAccount_broadcast", function (event, message) {
		$scope.supplementGetUnit();
	});

	$scope.supplementInit = function () {
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;   //默认无定义
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.addSupplement = 1;  //手动补单
		$scope.currentSelectDate = new Date();
		$scope.supplementGetMarkets();
		//$scope.supplementGetCommands();
		$scope.supplementGetDirectives();
		$scope.supplementGetOffsets();
		$scope.supplementGetUnit();
		$scope.termid = supplementService.getTermid();
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {

	});
	//页面关闭
	$scope.$on("$destroy", function () {

	});

	//点击表头
	$scope.clickTableHeader = function (keyName, isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
	}

	//获取证券市场
	$scope.supplementGetMarkets = function () {
		var reqData = { body: {} };
		$scope.marketObject = {}
		$scope.marketList.splice(0, $scope.marketList.length);
		supplementService.getMarket(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.marketList = res.body;
				angular.forEach($scope.marketList, function (market) {
					$scope.marketObject[market.marketid] = market;
				})
			}
			else {
				cms.log("获取证券市场失败", res.msret.msg);
			}
		})
	}

	//获取业务类型
	$scope.supplementGetCommands = function () {
		var reqData = { body: {} };
		$scope.commandList.splice(0, $scope.commandList.length);
		supplementService.getCommand(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.commandList = res.body;
			}
			else {
				cms.log("获取业务类型失败.", res.msret.msg);
			}
		})
	}

	// 获取指令
	$scope.supplementGetDirectives = function () {
		var reqData = { body: {} };
		$scope.directiveList.splice(0, $scope.directiveList.length);
		supplementService.getDirective(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.directiveList = res.body;
			}
			else {
				cms.log("获取指令失败.", res.msret.msg);
			}
		})
	}

	// 获取开平方向
	$scope.supplementGetOffsets = function () {
		var reqData = { body: {} };
		$scope.offsetList.splice(0, $scope.offsetList.length);
		supplementService.getOffset(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.offsetList = res.body;
			}
			else {
				cms.log("获取指令失败.", res.msret.msg);
			}
		})
	}

	//获取单元列表
	$scope.supplementGetUnit = function () {
		//获取资产管理人
		supplementService.getTamgr({ body: {} }, function (maidres) {
			if (maidres.msret.msgcode == "00") {
				$scope.maidList.splice(0, $scope.maidList.length);
				$scope.maidList = maidres.body;
				// 开始 -- 获取产品
				supplementService.getTacap({ body: {} }, function (caidres) {
					if (caidres.msret.msgcode == "00") {
						// 开始 -- 获取策略组合
						$scope.caidList.splice(0, $scope.caidList.length);
						$scope.caidList = caidres.body;
						supplementService.getTaact({ body: {} }, function (acidres) {
							if (acidres.msret.msgcode == "00") {
								$scope.acidList.splice(0, $scope.acidList.length);
								$scope.acidList = acidres.body;
								//构造树形结构
								$scope.guideList.splice(0, $scope.guideList.length);
								$scope.supplementMakeTreeFromList();
								$scope.$apply();
							}
							else {
								cms.message.error("获取资产账户失败." + acidres.msret.msg)
							}
						})
						//结束 -- 获取策略组合
					}
					else {
						cms.message.error("获取产品失败." + caidres.msret.msg);
					}
				})
				// 结束 -- 获取产品
			}
			else {
				cms.message.error("获取资产管理人失败." + maidres.msret.msg);
			}
		})
		// 结束 -- 获取资产管理人
	}

    //将单元列表构造成树
	$scope.supplementMakeTreeFromList = function() {
		$scope.maidList.forEach(function(obj){
			obj.maid=parseInt(obj.maid);
			obj.products=[];
			obj.showChildren=true;
		});

		for (var i = 0; i < $scope.caidList.length; i++) {
			$scope.caidList[i].showChildren=true;
			$scope.caidList[i].maid=parseInt($scope.caidList[i].maid);
			$scope.caidList[i].caid=parseInt($scope.caidList[i].caid);

			var maIndex=cms.accurateSearch($scope.maidList,"maid",($scope.caidList[i].maid));
			if (maIndex != -1) {
				$scope.maidList[maIndex].products.push($scope.caidList[i]);
				$scope.caidList[i].combs=[];
				$scope.caidList[i].accounts=[];
			} else {
				var newManager = {maid: $scope.caidList[i].maid, products: [], showChildren: true};
				newManager.products.push($scope.caidList[i]);
				$scope.caidList[i].combs=[];
				$scope.caidList[i].accounts=[];
				$scope.maidList.push(newManager);
			}
		}

		for (var i = 0; i < $scope.acidList.length; i++) {
			$scope.acidList[i].maid=parseInt($scope.acidList[i].maid);
			$scope.acidList[i].caid=parseInt($scope.acidList[i].caid);
			$scope.acidList[i].acid=parseInt($scope.acidList[i].acid);

			var maIndex=cms.accurateSearch($scope.maidList,"maid",($scope.acidList[i].maid));
			if (maIndex != -1) {
				var caIndex=cms.accurateSearch($scope.maidList[maIndex].products,"caid",($scope.acidList[i].caid));
				if (caIndex != -1) {
					$scope.maidList[maIndex].products[caIndex].accounts.push($scope.acidList[i]);
				} else {
					var newProduct = {maid: $scope.acidList[i].maid, caid: $scope.acidList[i].caid, showChildren: true, combs: [], accounts: []};
					newProduct.accounts.push($scope.acidList[i]);
					$scope.maidList[maIndex].products.push(newProduct);
				}
			} else {
				var newManager = {maid: $scope.acidList[i].maid, products: [], showChildren: true};
				var newProduct = {maid: $scope.acidList[i].maid, caid: $scope.acidList[i].caid, showChildren: true, combs: [], accounts: []};
				newProduct.accounts.push($scope.acidList[i]);
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
                    if(typeof temp1.accounts != "undefined") {
                        for(var k = 0; k < temp1.accounts.length; k ++) {
                            var temp2 = temp1.accounts[k];
                            temp2.menuId = temp2.acid;
                            temp2.menuName = temp2.acname;
                            temp2.type = 'acid';
                            temp1.children.push(temp2);
                        }
                    }
                    temp.children.push(temp1);
                }
            }
            destArray.push(temp);
        }
    }

	$scope.supplementClickMenu = function (obj) {
		$scope.currentCaid = obj.caid;
		$scope.currentAcid = obj.acid;
		$scope.currentAcname = obj.acname;
		$scope.currentPage = 1;
		//$scope.supplementGetClearStat($scope.currentAcid);
		$scope.supplementGetOrders(false);
	}

	// 获取账户清算状态
	$scope.supplementGetClearStat = function (acid) {
		var reqData = { body: { acid: acid } };
		supplementService.getClearStat(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				if (res.body.length > 0) {
					var trday = $scope.currentSelectDate.getFullYear() * 10000 + ($scope.currentSelectDate.getMonth() + 1) * 100 + $scope.currentSelectDate.getDate() + "";
					if (res.body[0].trday != "19000101" && res.body[0].trday != res.body[0].clearday && res.body[0].applyday == trday) {
						$scope.canSupply = true;
					}
					else {
						$scope.canSupply = false;
					}
				}
				else {
					$scope.canSupply = false;
				}
			}
			else {
				$scope.canSupply = false;
				cms.message.error("获取清算状态失败，暂时无法补单.");
				cms.log("获取清算状态失败：", JSON.stringify(res.msret));
			}
			$scope.$apply();
		})
	}

	//获取订单列表
	$scope.supplementGetOrders = function (isBatch) {
		//$scope.orderList = [];
		// var startDate = $scope.currentSelectDate.getFullYear() * 10000 + ($scope.currentSelectDate.getMonth() + 1) * 100 + $scope.currentSelectDate.getDate();
		var acidArray = [];
		acidArray.push($scope.currentAcid);
		var reqData = {
			body: {
				acidArray: acidArray,
				page: $scope.currentPage,
				pageCount: $scope.pageCount,
				selectAddOrder: 1
			}
		}
		supplementService.getTaorder(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.orderList = res.body.data;
				if (isBatch) {
					// console.log("$scope.orderList.length" + $scope.orderList.length);
					// console.log("$scope.preOrderList.length" + $scope.preOrderList.length);
					// console.log("$scope.batchData.length" + $scope.batchData.length);

					let succLen = $scope.orderList.length - $scope.preOrderList.length;
					let failLen = $scope.batchData.length - 1 - succLen;
					cms.message.success("批量补单操作，" + succLen + "条成功；" + failLen + "条失败。");

				}
				angular.forEach($scope.orderList, function (order) {
					order.marketchname = typeof $scope.marketObject[order.marketid] == "undefined" ? "-" : $scope.marketObject[order.marketid].marketchname;
					if (order.side == 1) {
						order.showSide = "买";
					}
					else if (order.side == 2) {
						order.showSide = "卖";
					}
					else {
						order.showSide = '无';
					}
					if (order.addordertype == 1) {
						order.showAddordertype = "强平补内";
					}
					else if (order.addordertype == 2) {
						order.showAddordertype = "强平补外";
					}
					else if (order.addordertype == 3) {
						order.showAddordertype = "正常补单";
					}
					else if (order.addordertype == 4) {
						order.showAddordertype = "散股补单";
					}
					else {
						order.showAddordertype = "未识别";
					}
					order.tradeprice = Number(order.tradevol) == 0 ? 0 : (order.multiplier == 0 ? (Number(order.tradeamt) / Number(order.tradevol)) : (Number(order.tradeamt) / Number(order.tradevol) / Number(order.multiplier)));
				});
				$scope.allPage = Math.ceil(res.body.totalCount / $scope.pageCount) == 0 ? 1 : Math.ceil(res.body.totalCount / $scope.pageCount);
				$scope.supplementFilterOrder();
				$scope.$apply();
			}
			else {
				cms.message.error("获取补单列表失败." + res.msret.msg);
				cms.log("获取补单列表失败：", JSON.stringify(res.msret));
			}

		})
	}


	//过滤订单列表
	$scope.supplementFilterOrder = function () {
		if ($scope.searchContent == "") {
			angular.forEach($scope.orderList, function (order) {
				order.show = true;
			})
			return;
		}
		angular.forEach($scope.orderList, function (order) {
			order.show = false;
			if (String(order.sysorderid).indexOf($scope.searchContent) != -1 || String(order.trid).indexOf($scope.searchContent) != -1) {
				order.show = true;
			}
			else if (String(order.marketcode).indexOf($scope.searchContent) != -1 || String(order.cname).indexOf($scope.searchContent) != -1) {
				order.show = true;
			}
			else { }
		})

	}

	// 跳转页面
	$scope.goToPage = function (page) {
		page = page > $scope.allPage ? $scope.allPage : page;
		page = page < 1 ? 1 : page;
		$scope.currentPage = page;
		$scope.supplementGetOrders(false);
	}

	//改变日期
	$scope.supplementChangeDate = function () {
		if ($scope.currentAcid == "") {
			return;
		}
		$scope.currentPage = 1;
		//$scope.supplementGetClearStat($scope.currentAcid);
		$scope.supplementGetOrders(false);
	}

	//刷新
	$scope.supplementRefresh = function (isBatch) {
		if ($scope.currentAcid == "") {
			return;
		}
		$scope.supplementGetClearStat($scope.currentAcid);
		$scope.preOrderList = $scope.orderList;
		$scope.supplementGetOrders(isBatch);
	}

	//打开弹框
	$scope.supplementShowModal = function (state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.addSupplement:
				$scope.modalInfo.path = "../system-manage/supplement-orders/supplement-add.html";
				break;
			default:

		}
	}

	//弹框加载完成
	$scope.supplementModalLoadReady = function () {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addSupplement:
				mainService.showModal("supplement_modal_back", "supplement_add_modal", "supplement_add_modal_title")
				break;
			default:

		}
	}

	//关闭弹框
	$scope.supplementHideModal = function () {
		mainService.hideModal("supplement_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//通过ID获取市场列表
	$scope.supplementGetCommandByMarket = function (marketid) {
		var list = [];
		angular.forEach($scope.commandList, function (cmd) {
			if (cmd.marketid == marketid || cmd.marketid == 0) {
				list.push(cmd);
			}
		})
		return list;
	}

	//手动补单
	$scope.supplementByHand = function () {
		if ($scope.currentAcid == "") {
			cms.message.error("请先选择一个资产账户.");
			return;
		}
		$scope.currentAddOrder.trdate = new Date();
		// $scope.currentAddOrder.trday = $scope.currentSelectDate.getFullYear() * 10000 + ($scope.currentSelectDate.getMonth() + 1) * 100 + $scope.currentSelectDate.getDate();
		$scope.currentAddOrder.caid = $scope.currentCaid;
		$scope.currentAddOrder.acid = $scope.currentAcid;
		$scope.currentAddOrder.show_acid = $scope.currentAcname + "(" + $scope.currentAcid + ")";
		$scope.currentAddOrder.tridList = [];
		// $scope.currentAddOrder.traderList = [];
		$scope.currentAddOrder.strategyList = [];
		$scope.currentAddOrder.trid = "";
		// $scope.currentAddOrder.traderid = "";
		$scope.currentAddOrder.stgid = "";
		$scope.currentAddOrder.borderid = "";
		$scope.currentAddOrder.marketid = $scope.marketList.length > 0 ? $scope.marketList[0].marketid : "";
		$scope.currentAddOrder.ukcode = "";
		$scope.currentAddOrder.marketcode = "";
		$scope.currentAddOrder.cname = "";
		$scope.currentAddOrder.directive = $scope.directiveList.length > 0 ? $scope.directiveList[0].typeid : "";
		$scope.currentAddOrder.offset = $scope.offsetList.length > 0 ? $scope.offsetList[0].typeid : "";
		$scope.currentAddOrder.ordervol = "";
		$scope.currentAddOrder.orderprice = "";
		$scope.currentAddOrder.currencyid = "";
		//获取交易单元
		supplementService.getTatrd({ body: { caid: $scope.currentCaid } }, function (tridres) {
			if (tridres.msret.msgcode == "00") {
				$scope.currentAddOrder.tridList = tridres.body;
				if ($scope.currentAddOrder.tridList.length > 0) {
					$scope.currentAddOrder.trid = $scope.currentAddOrder.tridList[0].trid;
					//获取策略
					supplementService.getStrategy({ body: { trid: $scope.currentAddOrder.trid, stat: 1 } }, function (res) {
						if (res.msret.msgcode == "00") {
							$scope.currentAddOrder.strategyList = res.body;
							if ($scope.currentAddOrder.strategyList.length > 0) {
								$scope.currentAddOrder.stgid = $scope.currentAddOrder.strategyList[0].stgid;
							}
							else {
								cms.log("策略列表为空.")
							}
						}
						else {
							cms.log("获取策略列表失败：", res.msret.msg);
						}
						$scope.supplementShowModal($scope.modalInfo.stateEnum.addSupplement);
						$scope.$apply();
					})
				}
				else {
					cms.log("交易单元列表为空.");
					$scope.supplementShowModal($scope.modalInfo.stateEnum.addSupplement);
					$scope.$apply();
				}
			}
			else {
				cms.log("获取交易单元失败:", tridres.msret.msg);
				$scope.supplementShowModal($scope.modalInfo.stateEnum.addSupplement);
				$scope.$apply();
			}
		})

	}

	//改变交易单元
	$scope.supplementChangeTatrd = function () {
		//获取交易员
		// $scope.currentAddOrder.traderList = [];
		// $scope.currentAddOrder.traderid = "";
		$scope.currentAddOrder.strategyList = [];
		$scope.currentAddOrder.stgid = "";
		supplementService.getStrategy({ body: { trid: $scope.currentAddOrder.trid, stat: 1 } }, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.currentAddOrder.strategyList = res.body;
				if ($scope.currentAddOrder.strategyList.length > 0) {
					$scope.currentAddOrder.stgid = $scope.currentAddOrder.strategyList[0].stgid;
				}
				else {
					cms.log("策略列表为空.")
				}
			}
			else {
				cms.log("获取策略列表失败：", res.msret.msg);
			}
			$scope.$apply();
		})
	}

	//改变交易员
	$scope.supplementChangeTrader = function () {
		$scope.currentAddOrder.strategyList = [];
		$scope.currentAddOrder.stgid = "";
		supplementService.getStrategy({ body: { traderid: $scope.currentAddOrder.traderid, trid: $scope.currentAddOrder.trid } }, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.currentAddOrder.strategyList = res.body;
				if ($scope.currentAddOrder.strategyList.length > 0) {
					$scope.currentAddOrder.stgid = $scope.currentAddOrder.strategyList[0].stgid;
				}
				else {
					cms.log("策略列表为空.")
				}
			}
			else {
				cms.log("获取策略列表失败：", res.msret.msg);
			}
			$scope.$apply();
		})
	}

	//改变ukcode
	$scope.supplementChangeUkcode = function (type) {
		$scope.currentAddOrder.ukcode = "";
		$scope.currentAddOrder.cname = "";
		if (type == 1) {
			$scope.currentAddOrder.commandList = $scope.supplementGetCommandByMarket($scope.currentAddOrder.marketid);
			$scope.currentAddOrder.cmdid = $scope.currentAddOrder.commandList.length > 0 ? $scope.currentAddOrder.commandList[0].cmdid : "";
		}
		if ($scope.currentAddOrder.marketid == "" || $scope.currentAddOrder.marketcode == "") {
			return;
		}
		var reqData = {
			body: {
				marketid: $scope.currentAddOrder.marketid,
				marketcode: $scope.currentAddOrder.marketcode
			}
		}
		supplementService.getUkeyInfo(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				if (res.body.length > 0) {
					$scope.currentAddOrder.ukcode = res.body[0].ukcode;
					$scope.currentAddOrder.cname = res.body[0].chabbr;
					$scope.currentAddOrder.currencyid = res.body[0].currencyid;
					$scope.$apply();
				}
			}
			else {
				cms.log("获取ukcode失败.", res.msret.msg);
			}
		})
	}

	// 确定补单
	$scope.supplementAddOrderSure = function () {
		var iReg = /^[1-9][0-9]*$/;
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		if (typeof $scope.currentAddOrder.trdate == "undefined") {
			cms.message.error("请输入委托时间.");
			return;
		}
		if ($scope.currentAddOrder.trid == "") {
			cms.message.error("请选择一个策略组合.");
			return;
		}
		// if ($scope.currentAddOrder.traderid == "") {
		// 	cms.message.error("请选择一个交易员.");
		// 	return;
		// }
		if ($scope.currentAddOrder.stgid == "") {
			cms.message.error("请选择一个策略.");
			return;
		}
		if ($scope.currentAddOrder.borderid == "") {
			cms.message.error("请输入券商订单号.");
			return;
		}
		if ($scope.currentAddOrder.ukcode == "") {
			cms.message.error("请正确输入证券代码.");
			return;
		}
		if ($scope.currentAddOrder.directive == "") {
			cms.message.error("请选择指令.");
			return;
		}
		if ($scope.currentAddOrder.offset == "") {
			cms.message.error("请选择开平方向.");
			return;
		}
		if (!iReg.test($scope.currentAddOrder.ordervol)) {
			cms.message.error("请正确输入成交数量.");
			return;
		}
		if (!fReg.test($scope.currentAddOrder.orderprice)) {
			cms.message.error("请正确输入成交价格.");
			return;
		}
		var trday = $scope.currentAddOrder.trdate.getFullYear() * 10000 + ($scope.currentAddOrder.trdate.getMonth() + 1) * 100 + $scope.currentAddOrder.trdate.getDate() + "";
		var ordertm = supplementService.formatTime($scope.currentAddOrder.trdate);
		// console.log(ordertm);
		// 提交
		var reqData = {
			body: {
				trday: trday,
				caid: $scope.currentAddOrder.caid,
				trid: $scope.currentAddOrder.trid,
				stgid: $scope.currentAddOrder.stgid,
				traderid: 0,
				acid: $scope.currentAddOrder.acid,
				borderid: $scope.currentAddOrder.borderid,
				ukcode: $scope.currentAddOrder.ukcode,
				marketid: $scope.currentAddOrder.marketid,
				marketcode: $scope.currentAddOrder.marketcode,
				cname: $scope.currentAddOrder.cname,
				currencyid: $scope.currentAddOrder.currencyid,
				directive: $scope.currentAddOrder.directive,
				offset: $scope.currentAddOrder.offset,
				ordervol: $scope.currentAddOrder.ordervol,
				orderprice: $scope.currentAddOrder.orderprice,
				termid: $scope.termid,
				ordertm: ordertm
			}
		};

		supplementService.addOrder(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("补单已成功提交.", 5);
				$scope.supplementHideModal();
				$scope.supplementRefresh(false);
			}
			else {
				cms.log("补单失败：", JSON.stringify(res.msret))
				cms.message.error("操作失败." + res.msret.msg);
			}
		})
	}

	//批量导入
	$scope.supplementByFile = function () {
		$scope.currentTridList = [];
		if ($scope.currentAcid == "") {
			cms.message.error("请先选择一个资产账户.");
			return;
		}
		//获取交易单元
		supplementService.getTatrd({ body: { caid: $scope.currentCaid } }, function (tridres) {
			if (tridres.msret.msgcode == "00") {
				for (let i = 0; i < tridres.body.length; i++) {
					$scope.currentTridList.push(tridres.body[i].trid);
				}
			}
		});
		supplementService.importExcelFile(function (err, res) {
			if (err) return;
			if (res.result == true) {
				$scope.supplementAnlazyData(res.data);
			}
			else {
				cms.log(res.reason);
				cms.message.error(res.reason);
			}
		})
	}

	$scope.supplementShowTips = function () {
		$scope.show_load_tips = !$scope.show_load_tips;
	}

	//分析数据
	$scope.supplementAnlazyData = function (data) {
		if (data.length <= 1) {
			cms.message.error("选择的文件无数据，请重新选择.")
			return;
		}
		var dateReg = /^[0-9]{1,4}-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1]))\s(([0-1][0-9])|(2[0-3])):[0-5][0-9]:[0-5][0-9]\.[0-9]{3}$/;
		var temp = [];
		$scope.batchData = data;
		for (var i = 1; i < data.length; i++) {
			// 校验导入的订单策略组合是否正确
			if (!$scope.currentTridList.some(item => {
				return item === data[i][2];
			})) {
				cms.message.error("第" + (i + 1) + "行订单策略组合不正确.");
				continue;
			}

			if (data[i].length < 12) {
				cms.message.error("第" + (i + 1) + "行存在空数据，请修改后重试.");
				continue;
			}
			//匹配交易市场
			var j = 0;
			for (j = 0; j < $scope.marketList.length; j++) {
				if (data[i][5] == $scope.marketList[j].marketid) {
					break;
				}
			}
			if (j >= $scope.marketList.length) {
				cms.message.error("第" + (i + 1) + "行无法匹配市场，请修改后重试.");
				continue;
			}
			if (!dateReg.test(data[i][0])) {
				cms.message.error("第" + (i + 1) + "行委托时间错误，请修改后重试.");
				continue;
			}
			var trday = data[i][0].split(" ")[0].replace(/-/g, "");
			var tmpObj = {
				trday: trday,
				ordertm: data[i][0],
				caid: $scope.currentCaid,
				acid: $scope.currentAcid,
				borderid: data[i][1],
				trid: data[i][2],
				traderid: 0,
				stgid: data[i][3],
				ukcode: data[i][4],
				marketid: data[i][5],
				currencyid: $scope.marketList[j].currencyid,
				marketcode: data[i][6],
				cname: data[i][7],
				directive: data[i][8],
				offset: data[i][9],
				ordervol: data[i][10],
				orderprice: data[i][11],
				termid: $scope.termid
			}
			temp.push(tmpObj);
		}
		if (temp.length == 0) {
			cms.message.error("选择的文件无正确数据，请检查后重试.");
			return;
		}
		var reqData = {
			body: {
				orderList: temp
			}
		};
		supplementService.addMultipleOrder(reqData, function (res) {
			if (res.msret.msgcode == "00") {

				cms.message.success("操作成功，补单已提交.", 5);
				$scope.supplementRefresh(true);
			}
			else {
				cms.message.error("操作失败." + res.msret.msg);
				cms.log("批量补单失败：", JSON.stringify(res.msret));
			}
		})
	}

	//导出数据
	$scope.supplementExportsData = function () {
		if ($scope.orderList.length == 0) {
			cms.message.error("表格中无数据可导出.");
			return;
		}
		var trday = $scope.currentSelectDate.getFullYear() * 10000 + ($scope.currentSelectDate.getMonth() + 1) * 100 + $scope.currentSelectDate.getDate();
		var exportData = {};
		var headers = ["日期", "资产账户", "系统订单号", "策略组合", "交易所",
			"证券代码", "证券名称", "买卖类型", "业务名称", "成交数量", "成交均价", "成交金额",
			"账户订单费用", "组合订单费用", "补单类型", "订单信息"
		];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "账户" + $scope.currentAcid + "-" + trday + "-补单";
		exportData.data = [];
		angular.forEach($scope.orderList, function (order) {
			var temp = [];
			temp.push(order.trday);
			temp.push(order.acid);
			temp.push(order.sysorderid);
			// temp.push(order.traderid);
			temp.push(order.trid);
			temp.push(order.marketchname);
			temp.push(order.marketcode);
			temp.push(order.cname);
			temp.push(order.showSide);
			temp.push(order.cmdname);
			temp.push(Number(order.tradevol).toFixed(0));
			temp.push(Number(order.tradeprice).toFixed(3));
			temp.push(Number(order.tradeamt).toFixed(3));
			temp.push(Number(order.tractfee).toFixed(3));
			temp.push(Number(order.trdfee).toFixed(3));
			temp.push(order.showAddordertype);
			temp.push(order.msg);
			exportData.data.push(temp);
		})
		supplementService.exportExcelFile(exportData, function (err, res) {
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
})
