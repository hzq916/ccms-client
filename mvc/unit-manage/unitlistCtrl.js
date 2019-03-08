angular.module('cmsController').controller('unitlistCtrl', function ($scope, $rootScope, $timeout, mainService, unitlistService) {
	$scope.basicUnitList = []; //定义源数据
	$scope.unitObj = {};
	$scope.unitList = [];   //定义显示数据
	$scope.maidList = [];
	$scope.caidList = [];
	$scope.tridList = [];
	$scope.searchContent = "";

	$scope.modalInfo = {};
	$scope.tatrdFundModalInfo = {};
	$scope.subjectModalInfo = {};
	$scope.currentTamgr = {};
	$scope.currentSettingTamgr = {};
	$scope.currentTacap = {};
	$scope.currentTatrd = {};
	$scope.currentTatrdFund = {};
	$scope.currentTatrdFundChange = {};
	$scope.freezeInfo = {};
	$scope.unitStatOptions = [];
	$scope.unitCurrencyList = [];
	$scope.unitApprovestatOptions = [];
	$scope.currentTatrdFund = {};
	$scope.unitVerifyFlags = [];
	$scope.unitTeminalBind = [];

	//产品的服务信息
	$scope.omsServices = [];
	$scope.sdsServices = [];

	// 股票费率部分
	$scope.allTradeAccount = []; // 保存所有的交易账户
	$scope.allCurrency = [];
	$scope.allMarket = [];
	$scope.allChannel = [];

	$scope.currentStockFeeTatrd = "";

	$scope.allStockFeeRateTemplate = []; //保存所有的股票费率模板
	$scope.allStockFeeRate = []; // 保存指定交易账户所有的股票费率
	$scope.allCommand = [];
	$scope.stockFeeRateInfo = { state: "showFee", currentMarketID: "-1", showStockFeeIndex: -1, editStockFeeIndex: -1 }; //addFee, editFee
	$scope.tatrdAccountType = [];
	$scope.tatrdTradeMarket = [];

	//主页面点击的行
	$scope.homeClickTr = -1;
	//单元资金点击的行
	$scope.fundClickTr = -1;

	//期货费率相关
	$scope.currentMargin = {};
	$scope.currentOrderFee = {};
	$scope.currentFuturesFeerate = {};
	$scope.currentDelayFeerate = {};

	$scope.currentSubject = {};

	$scope.unitlistInit = function () {
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.editTamgr = 1;          //资产管理人信息
		$scope.modalInfo.stateEnum.editTacap = 2;		  //产品信息
		$scope.modalInfo.stateEnum.editTatrd = 3;         //策略组合信息
		$scope.modalInfo.stateEnum.tatrdFund = 4;		  //策略组合资金设置
		$scope.modalInfo.stateEnum.tatrdFundChange = 5;   //策略组合资金划转
		$scope.modalInfo.stateEnum.freeze = 6;			  //冻结
		$scope.modalInfo.stateEnum.tatrdConnectTatract = 7;  //关联交易账户
		$scope.modalInfo.stateEnum.tatrdRate = 8;			// 单元费率
		$scope.modalInfo.stateEnum.marginRate = 9;              // 保证金率
		$scope.modalInfo.stateEnum.orderFee = 10;				// 申报费
		$scope.modalInfo.stateEnum.futuresRate = 11;			// 期货费率
		$scope.modalInfo.stateEnum.delayRate = 12;				// 递延费率
		$scope.modalInfo.stateEnum.subject = 13;				// 外部资产
		$scope.modalInfo.stateEnum.productchannel = 14;                // 产品通道
		$scope.modalInfo.stateEnum.settingTamgr = 15;           // 资产管理人参数设置
		$scope.tatrdFundModalInfo.state = 0;
		$scope.tatrdFundModalInfo.path = "";
		$scope.tatrdFundModalInfo.stateEnum = {};
		$scope.tatrdFundModalInfo.stateEnum.addTatrdFund = 1;
		$scope.tatrdFundModalInfo.stateEnum.changeTatrdFund = 2;
		$scope.tatrdFundModalInfo.stateEnum.editTatrdFund = 3;

		$scope.subjectModalInfo.state = 0;
		$scope.subjectModalInfo.path = "";
		$scope.subjectModalInfo.stateEnum = {};
		$scope.subjectModalInfo.stateEnum.editSubject = 1;
		$scope.subjectModalInfo.stateEnum.deleteSubject = 2;

		$scope.homeClickTr = -1;
		$scope.fundClickTr = -1;

		$scope.personalUserInfo = {};

		$scope.unitStatOptions = [
			{ stat: "1", desc: "启用" },
			{ stat: "0", desc: "不启用" }
		];
		$scope.unitApprovestatOptions = [
			{ approvestat: "1", desc: "开启" },
			{ approvestat: "0", desc: "不开启" }
		];
		$scope.unitVerifyFlags = [
			{ verifyflag: "1", desc: "验券" },
			{ verifyflag: "0", desc: "验资验券" },
			{ verifyflag: "2", desc: "不验资不验券" },
			{ verifyflag: "3", desc: "验资" }
		];
		$scope.unitTeminalBind = [
			{ binding: "0", desc: "都不启用" },
			{ binding: "1", desc: "单独启用MAC绑定" },
			{ binding: "2", desc: "单独启用IP绑定" },
			{ binding: "3", desc: "同时启用IP和MAC绑定" }
		];
		$scope.unitCurrencyList = [];
		unitlistService.getCurrency({ body: {} }, function (gcres) {
			if (gcres.msret.msgcode == "00") {
				$scope.unitCurrencyList = gcres.body;
			}
			else {
				cms.message.error("获取币种信息失败");
			}
		})

		var requestData = { body: {} };
		unitlistService.getMarket(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.log("获取市场信息失败.", res.msret.msg);
				return;
			}
			$scope.allMarket = res.body;
			$scope.allMarket.forEach(function (market) {
				market.marketid = parseInt(market.marketid);
			});

			$scope.stockFeeRateInfo.currentMarketID = "-1";
			$scope.$apply();
		});

		unitlistService.getTschannel(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.log("获取通道信息失败.", res.msret.msg);
				return;
			}
			$scope.allChannel = res.body;
			$scope.allChannel.forEach(function (channel) {
				channel.chid = parseInt(channel.chid);
			});
			$scope.$apply();
		});
		$scope.getCommand();
		$scope.getStockFeeRateTemplate();
		$scope.unitlistGetUnit();
		$scope.personalUserInfo = unitlistService.getLoginUserInfo();
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {

	});
	//页面关闭
	$scope.$on("$destroy", function () {

	});

	//主页面点击行
	$scope.unitlistClickTr = function (index) {
		$scope.homeClickTr = index;
	}

	//单元资金页面点击行
	$scope.unitlistClickFundTr = function (index) {
		$scope.fundClickTr = index;
	}

	//获取单元列表
	$scope.unitlistGetUnit = function () {
		var tamgrKey = 0;
		var tacapKey = 0;
		var tatrdKey = 0;
		unitlistService.getTamgr({ body: {} }, function (maidres) {
			if (maidres.msret.msgcode !== "00") {
				cms.message.error("获取数据失败.");
				cms.log("获取资产管理人失败: ", JSON.stringify(maidres.msret));
				return;
			}
			$scope.maidList = maidres.body;
			tamgrKey = 1;
			if (tacapKey == 1 && tatrdKey == 1) {
				$scope.unitList.splice(0, $scope.unitList.length);
				$scope.basicUnitList.splice(0, $scope.basicUnitList.length);
				$scope.unitlistMakeTreeFromList();
				$scope.$apply();
			}
		});
		unitlistService.getTacap({ body: {} }, function (caidres) {
			if (caidres.msret.msgcode !== "00") {
				cms.message.error("获取数据失败.");
				cms.log("获取产品失败: ", JSON.stringify(caidres.msret));
				return;
			}
			$scope.caidList = caidres.body;
			tacapKey = 1;
			if (tamgrKey == 1 && tatrdKey == 1) {
				$scope.unitList.splice(0, $scope.unitList.length);
				$scope.basicUnitList.splice(0, $scope.basicUnitList.length);
				$scope.unitlistMakeTreeFromList();
				$scope.$apply();
			}
		});
		unitlistService.getTatrdDetail({ body: {} }, function (tridres) {
			if (tridres.msret.msgcode !== "00") {
				cms.message.error("获取数据失败.");
				cms.log("获取策略组合失败: ", JSON.stringify(tridres.msret));
				return;
			}
			$scope.tridList = tridres.body;
			tatrdKey = 1;
			if (tacapKey == 1 && tacapKey == 1) {
				$scope.unitList.splice(0, $scope.unitList.length);
				$scope.basicUnitList.splice(0, $scope.basicUnitList.length);
				$scope.unitlistMakeTreeFromList();
				$scope.$apply();
			}
		})
	}

	// 将单元列表构造成树
	$scope.unitlistMakeTreeFromList = function () {
		var tatrdChildren = {};
		for (var i = 0; i < $scope.tridList.length; i++) {
			if (typeof tatrdChildren[$scope.tridList[i].caid] == "undefined") {
				var existMaid = false;
				for (var j = 0; j < $scope.maidList.length; ++j) {
					if ($scope.maidList[j].maid == $scope.tridList[i].maid) {
						existMaid = true;
						break;
					}
				}
				if (!existMaid) {
					$scope.maidList.push({maid: $scope.tridList[i].maid, noRight: true});
				}
				var existCaid = false;
				for (var k = 0; k < $scope.caidList.length; ++k) {
					if ($scope.caidList[k].caid == $scope.tridList[i].caid) {
						existCaid = true;
						break;
					}
				}
				if (!existCaid) {;
					$scope.caidList.push({maid: $scope.tridList[i].maid, caid: $scope.tridList[i].caid, noRight: true});
				}
			}
			tatrdChildren[$scope.tridList[i].caid] = tatrdChildren[$scope.tridList[i].caid] || [];
			tatrdChildren[$scope.tridList[i].caid].push($scope.tridList[i]);
		}
		var tacapChildren = {};
		for (var i = 0; i < $scope.caidList.length; i++) {
			if (typeof tacapChildren[$scope.caidList[i].maid] == "undefined") {
				var existMaid = false;
				for (var j = 0; j < $scope.maidList.length; ++j) {
					if ($scope.maidList[j].maid == $scope.caidList[i].maid) {
						existMaid = true;
						break;
					}
				}
				if (!existMaid) {
					$scope.maidList.push({maid: $scope.caidList[i].maid, noRight: true});
				}
			}
			tacapChildren[$scope.caidList[i].maid] = tacapChildren[$scope.caidList[i].maid] || [];
			tacapChildren[$scope.caidList[i].maid].push($scope.caidList[i]);
		}
		for (var i = 0; i < $scope.maidList.length; i++) {
			var temp = $scope.maidList[i];
			temp.trackid = "m" + $scope.maidList[i].maid;
			temp.unitid = $scope.maidList[i].maid;
			temp.unitname = $scope.maidList[i].maname;
			temp.leaf = 0;
			temp.show = true;
			temp.fold = $scope.unitObj[temp.unitid] ? $scope.unitObj[temp.unitid].fold : true;
			temp.add = false;
			temp.match = true;
			temp.children = [];
			$scope.unitObj[temp.unitid] = temp;
			$scope.basicUnitList.push(temp);
			$scope.unitList.push(temp);
			if (tacapChildren[temp.maid]) {
				var data = tacapChildren[temp.maid];
				for (var j = 0; j < data.length; j++) {
					var temp1 = data[j];
					temp1.trackid = "c" + data[j].caid;
					temp1.unitid = data[j].caid;
					temp1.unitname = data[j].caname;
					temp1.leaf = 1;
					temp1.show = false;
					temp1.fold = $scope.unitObj[temp1.unitid] ? $scope.unitObj[temp1.unitid].fold : false;
					temp1.add = false;
					temp1.match = true;
					temp1.children = [];
					$scope.unitObj[temp1.unitid] = temp1;
					temp.children.push(temp1);
					$scope.unitList.push(temp1);
					if (tatrdChildren[temp1.caid]) {
						var data1 = tatrdChildren[temp1.caid];
						for (var k = 0; k < data1.length; k++) {
							var temp2 = data1[k];
							temp2.trackid = "t" + data1[k].trid;
							temp2.unitid = data1[k].trid;
							temp2.unitname = data1[k].trname;
							temp2.leaf = 2;
							temp2.show = false;
							temp2.add = false;
							temp2.match = true;
							temp1.children.push(temp2);
							$scope.unitList.push(temp2);
						}
					}
					var tatrdAdd = {};
					tatrdAdd.trackid = "c" + temp1.caid + "_";
					tatrdAdd.maid = temp.maid;
					tatrdAdd.caid = temp1.caid;
					tatrdAdd.currencyid = temp1.currencyid;
					tatrdAdd.briefcode = temp1.briefcode;
					tatrdAdd.curencychname = temp1.curencychname;
					tatrdAdd.curencyenname = temp1.curencyenname;
					tatrdAdd.leaf = 2;
					tatrdAdd.show = false;
					tatrdAdd.add = true;
					tatrdAdd.match = true;
					temp1.children.push(tatrdAdd);
					$scope.unitList.push(tatrdAdd);
				}
			}
			var caidAdd = {};
			caidAdd.trackid = "m" + temp.maid + "_";
			caidAdd.maid = temp.maid;
			caidAdd.leaf = 1;
			caidAdd.show = false;
			caidAdd.add = true;
			caidAdd.match = true;
			temp.children.push(caidAdd);
			$scope.unitList.push(caidAdd);
		}
		var maidAdd = {};
		maidAdd.trackid = "_";
		maidAdd.leaf = 0;
		maidAdd.show = true;
		maidAdd.add = true;
		maidAdd.match = true;
		$scope.basicUnitList.push(maidAdd);
		$scope.unitList.push(maidAdd);
		$scope.unitlistFilterUnit();
		for (var i = 0; i < $scope.basicUnitList.length; i++) {
			$scope.collapse($scope.basicUnitList[i], false);
		}
	}

	$scope.unitlistChangeTableFold = function (unit) {
		unit.fold = !unit.fold;
		if (unit.children) {
			for (var i = 0; i < unit.children.length; i++) {
				$scope.collapse(unit.children[i], unit.fold);
			}
		}
	}

	$scope.collapse = function (unit, parentFold) {
		unit.show = unit.match && !parentFold;
		if (unit.children) {
			for (var i = 0; i < unit.children.length; i++) {
				$scope.collapse(unit.children[i], parentFold || unit.fold);
			}
		}
	}

	//过滤单元
	$scope.unitlistFilterUnit = function () {
		for (var i = 0; i < $scope.basicUnitList.length; i++) {
			$scope.unitlistUnitFilter($scope.basicUnitList[i]);
		}
		for (var i = 0; i < $scope.basicUnitList.length; i++) {
			$scope.setShowState($scope.basicUnitList[i], true, false);
		}
	}

	//构造过滤器
	$scope.unitlistUnitFilter = function (unit) {
		if (unit.add) {
			unit.match = false;
			return;
		}
		if (String(unit.unitid).indexOf($scope.searchContent) != -1 || String(unit.unitname).indexOf($scope.searchContent) != -1) {
			unit.match = true;
		} else {
			unit.match = false;
		}
		if (unit.children) {
			for (var i = 0; i < unit.children.length; i++) {
				$scope.unitlistUnitFilter(unit.children[i]);
			}
		}
	}

	// 设置显示状态
	$scope.setShowState = function (unit, parentMatch, parentRealMatch) {
		if (unit.add) {
			unit.match = parentMatch;
			return;
		}
		var match = unit.match;
		unit.match = parentRealMatch || $scope.isChildrenMatch(unit);
		if (unit.children) {
			for (var i = 0; i < unit.children.length; i++) {
				$scope.setShowState(unit.children[i], unit.match, match);
			}
		}
	}

	// 是否有子节点匹配
	$scope.isChildrenMatch = function (unit) {
		if (unit.match) return true;
		if (unit.children) {
			for (var i = 0; i < unit.children.length; i++) {
				return $scope.isChildrenMatch(unit.children[i]);
			}
		} else {
			return false;
		}
	}

	//刷新页面
	$scope.unitlistRefresh = function () {
		$scope.unitlistGetUnit();
	}

	//导出单元列表数据
	$scope.exportUnitlistDataClick = function(){
		console.log($scope.unitList);

		if($scope.unitList.length<=0){
			cms.message.error("表中没有可导出的数据");
			return;
		}
		var exportData = {};
		var headers = ["单元类型","单元编号","单元名称","核算币种","资金汇总","总权益","份额","净值","状态"];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "资产管理人("+$scope.personalUserInfo.maid+")单元列表";
		exportData.data = [];

		console.log($scope.personalUserInfo); // 这里只有maid和oid

		angular.forEach($scope.unitList,function(dataCell) {
			var tempCell = [];
			if (dataCell["add"] === false) {
				///注意
				//leaf : 0代表资产管理人 1代表产品 2代表组合
				if (dataCell["leaf"] === 0) {
					tempCell.push("资产管理人");
				} else if (dataCell["leaf"] === 1) {
					tempCell.push("产品");
				} else {
					tempCell.push("组合");
				}
				tempCell.push(dataCell.unitid);
				tempCell.push(dataCell.unitname);
				tempCell.push(dataCell.curencychname+"("+dataCell.briefcode+")");
				tempCell.push(dataCell.tatrd_balance);
				tempCell.push(dataCell.totalint);
				tempCell.push(dataCell.totalshare);
				tempCell.push(dataCell.netvalue);
				tempCell.push(dataCell.stat === "0" ? "不可用" : "可用");

				exportData.data.push(tempCell);
			}
		})

		unitlistService.exportDataToExcelFile(exportData,function(err,res) {
			if(err) return ;
			if(res.result == true) {
				cms.message.success("导出数据成功.");
			}
			else {
				cms.message.error("导出数据失败."+res.reason);
				cms.log("导出数据失败：",res.reason);
			}
		})
	}



	//打开弹框
	$scope.unitlistShowModal = function (state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.editTamgr:
				$scope.modalInfo.path = "../unit-manage/unitlistTamgr.html";
				break;
			case $scope.modalInfo.stateEnum.editTacap:
				$scope.modalInfo.path = "../unit-manage/unitlistTacap.html";
				break;
			case $scope.modalInfo.stateEnum.editTatrd:
				$scope.modalInfo.path = "../unit-manage/unitlistTatrd.html";
				break;
			case $scope.modalInfo.stateEnum.tatrdFund:
				$scope.modalInfo.path = "../unit-manage/unitlistTatrdFund.html";
				break;
			case $scope.modalInfo.stateEnum.tatrdFundChange:
				$scope.modalInfo.path = "../unit-manage/unitlistTatrdFundChange.html";
				break;
			case $scope.modalInfo.stateEnum.freeze:
				$scope.modalInfo.path = "../unit-manage/unitlistFreeze.html";
				break;
			case $scope.modalInfo.stateEnum.tatrdConnectTatract:
				$scope.modalInfo.path = "../unit-manage/unitlistConnectTatract.html";
				break;
			case $scope.modalInfo.stateEnum.tatrdRate:
				$scope.modalInfo.path = "../unit-manage/unitlistRate.html";
				break;
			case $scope.modalInfo.stateEnum.marginRate:
				$scope.modalInfo.path = "../tradeAccountManage/futures-margin.html";
				break;
			case $scope.modalInfo.stateEnum.orderFee:
				$scope.modalInfo.path = "../tradeAccountManage/futures-order.html";
				break;
			case $scope.modalInfo.stateEnum.futuresRate:
				$scope.modalInfo.path = "../tradeAccountManage/futures-feerate.html";
				break;
			case $scope.modalInfo.stateEnum.delayRate:
				$scope.modalInfo.path = "../tradeAccountManage/futures-delay.html";
				break;
			case $scope.modalInfo.stateEnum.subject:
				$scope.modalInfo.path = "../unit-manage/unitlistSubject.html";
				break;
			case $scope.modalInfo.stateEnum.productchannel:
				$scope.modalInfo.path = "../unit-manage/unitlistproductchannel.html";
				break;
			case $scope.modalInfo.stateEnum.settingTamgr:
			    $scope.modalInfo.path = "../unit-manage/unitlistSettingTamgr.html";
			    break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.unitlistLoadModalReady = function () {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.editTamgr:
				mainService.showModal("unitlist_modal_back", "unitlist_tamgr_modal", "unitlist_tamgr_modal_title");
				break;
			case $scope.modalInfo.stateEnum.settingTamgr:
				mainService.showModal("unitlist_modal_back", "unitlist_setting_tamgr_modal", "unitlist_setting_tamgr_modal_title");
				break;
			case $scope.modalInfo.stateEnum.editTacap:
				mainService.showModal("unitlist_modal_back", "unitlist_tacap_modal", "unitlist_tacap_modal_title");
				break;
			case $scope.modalInfo.stateEnum.editTatrd:
				mainService.showModal("unitlist_modal_back", "unitlist_tatrd_modal", "unitlist_tatrd_modal_title");
				break;
			case $scope.modalInfo.stateEnum.tatrdFund:
				mainService.showModal("unitlist_modal_back", "unitlist_tatrd_fund_modal", "unitlist_tatrd_fund_modal_title");
				break;
			case $scope.modalInfo.stateEnum.tatrdFundChange:
				mainService.showModal("unitlist_modal_back", "unitlist_tatrd_fund_change_modal", "unitlist_tatrd_fund_change_modal_title");
				break;
			case $scope.modalInfo.stateEnum.freeze:
				mainService.showModal("unitlist_modal_back", "unitlist_freeze_modal", "unitlist_freeze_modal_title");
				break;
			case $scope.modalInfo.stateEnum.tatrdConnectTatract:
				mainService.showModal("unitlist_modal_back", "unitlist_connect_modal", "unitlist_connect_modal_title");
				break;
			case $scope.modalInfo.stateEnum.tatrdRate:
				mainService.showModal("unitlist_modal_back", "unitlist_rate_modal", "unitlist_rate_modal_title");
				break;
			case $scope.modalInfo.stateEnum.marginRate:
				mainService.showModal("unitlist_modal_back", "futures_margin_modal", "futures_margin_modal_title");
				//设置文件选择响应
				document.getElementById("futures_margin_file").onchange = function () {
					if (document.getElementById("futures_margin_file").value != "") {
						unitlistService.parseExcelFile(document.getElementById("futures_margin_file"), function (res) {
							if (res.result == true) {
								$scope.analyseFuturesMarginLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败." + res.reason);
								cms.log("解析文件失败.", res.reason);
							}
						})
					}
				}
				break;
			case $scope.modalInfo.stateEnum.orderFee:
				mainService.showModal("unitlist_modal_back", "futures_order_modal", "futures_order_modal_title");
				//设置文件选择响应
				document.getElementById("futures_order_file").onchange = function () {
					if (document.getElementById("futures_order_file").value != "") {
						unitlistService.parseExcelFile(document.getElementById("futures_order_file"), function (res) {
							if (res.result == true) {
								$scope.analyseFuturesOrderLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败." + res.reason);
								cms.log("解析文件失败.", res.reason);
							}
						})
					}
				}
				break;
			case $scope.modalInfo.stateEnum.futuresRate:
				mainService.showModal("unitlist_modal_back", "futures_feerate_modal", "futures_feerate_modal_title");
				//设置文件选择响应
				document.getElementById("futures_feerate_file").onchange = function () {
					if (document.getElementById("futures_feerate_file").value != "") {
						unitlistService.parseExcelFile(document.getElementById("futures_feerate_file"), function (res) {
							if (res.result == true) {
								$scope.analyseFuturesFeerateLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败." + res.reason);
								cms.log("解析文件失败.", res.reason);
							}
						})
					}
				}
				break;
			case $scope.modalInfo.stateEnum.delayRate:
				mainService.showModal("unitlist_modal_back", "futures_delay_modal", "futures_delay_modal_title");
				//设置文件选择响应
				document.getElementById("futures_delay_file").onchange = function () {
					if (document.getElementById("futures_delay_file").value != "") {
						unitlistService.parseExcelFile(document.getElementById("futures_delay_file"), function (res) {
							if (res.result == true) {
								$scope.analyseFuturesDelayLoadData(res.data);
								$scope.$apply();
							}
							else {
								cms.message.error("解析文件失败." + res.reason);
								cms.log("解析文件失败.", res.reason);
							}
						})
					}
				}
				break;
			case $scope.modalInfo.stateEnum.subject:
				mainService.showModal("unitlist_modal_back", "unitlist_subject_modal", "unitlist_subject_modal_title")
				break;
			case $scope.modalInfo.stateEnum.productchannel:
				mainService.showModal("unitlist_modal_back", "unitlist_productchange_modal", "unitlist_productchange_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭弹框
	$scope.unitlistHideModal = function (state) {
		mainService.hideModal("unitlist_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
		if (state && state == $scope.modalInfo.stateEnum.tatrdFund) {
			if ($scope.currentTatrdFund.refresh == true) {
				$scope.unitlistGetUnit();
			}
		}
	}

	//基本信息修改
	$scope.unitlistEditBasicInfo = function (index) {
		var unit = $scope.unitList[index];
		switch (unit.leaf) {
			case 0:
				//点击资产管理人
				$scope.unitlistEditTamgr(unit);
				break;
			case 1:
				//点击产品
				$scope.unitlistEditTacap(unit);
				break;
			case 2:
				//点击策略组合
				$scope.unitlistEditTatrd(unit);
				break;
			default:
				break;
		}
	}

	// 资产管理人参数设置
	$scope.unitlistSettingTamgrInfo = function(index) {
		var unitTamgr = $scope.unitList[index];
		$scope.unitlistSettingTamgr(unitTamgr);
	}

	//产品绑定资金账户
	$scope.unitlistProductContractAccount = function (product) {
		$rootScope.rootLoopMenu("2002001");
		mainService.bindProduct = cms.deepCopy(product, {});
		$scope.$emit("bindProduct", product);
	}

	//冻结，解冻
	$scope.unitlistFreeze = function (index) {
		var unit = $scope.unitList[index];
		switch (unit.leaf) {
			case 0:
				//点击资产管理人
				$scope.unitlistFreezeTamgr(unit, index);
				break;
			case 1:
				//点击产品
				$scope.unitlistFreezeTacap(unit, index);
				break;
			case 2:
				$scope.unitlistFreezeTatrd(unit, index);
				break;
			default:
				break;
		}
	}

	//确定冻结，解冻
	$scope.unitlistFreezeSure = function () {
		switch ($scope.freezeInfo.leaf) {
			case 0:
				//
				$scope.unitlistFreezeTamgrSure();
				break;
			case 1:
				$scope.unitlistFreezeTacapSure();
				break;
			case 2:
				$scope.unitlistFreezeTatrdSure();
				break;
			default:
				break;
		}
	}

	//添加资产管理人
	$scope.unitlistAddTamgr = function () {
		$scope.currentTamgr.edit = false;
		$scope.currentTamgr.maid = "";
		$scope.currentTamgr.maname = "";
		$scope.currentTamgr.malname = "";
		$scope.currentTamgr.currencyid = "";
		$scope.currentTamgr.stat = "1";
		if ($scope.unitCurrencyList.length == 0) {
			unitlistService.getCurrency({ body: {} }, function (gcres) {
				if (gcres.msret.msgcode == "00") {
					$scope.unitCurrencyList = gcres.body;
					if ($scope.unitCurrencyList.length > 0) {
						$scope.currentTamgr.currencyid = String($scope.unitCurrencyList[0].currencyid);
					}
					$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTamgr);
					$scope.$apply();
				}
				else {
					cms.message.error("获取币种信息失败，无法进行该操作");
				}
			})
		}
		else {
			$scope.currentTamgr.currencyid = $scope.unitCurrencyList[0].currencyid;
			$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTamgr);
		}
	}

	//编辑资产管理人
	$scope.unitlistEditTamgr = function (unit) {
		$scope.currentTamgr.edit = true;
		$scope.currentTamgr.maid = unit.maid;
		$scope.currentTamgr.maname = unit.maname;
		$scope.currentTamgr.malname = unit.malname;
		$scope.currentTamgr.currencyid = unit.currencyid;
		$scope.currentTamgr.briefcode = unit.briefcode;
		$scope.currentTamgr.curencychname = unit.curencychname;
		$scope.currentTamgr.curencyenname = unit.curencyenname;
		$scope.currentTamgr.show_currency = $scope.currentTamgr.curencychname + "(" + $scope.currentTamgr.briefcode + ")";
		$scope.currentTamgr.stat = String(unit.stat);
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTamgr);
	}

	// 资产管理人参数设置 
	$scope.unitlistSettingTamgr = function (unit) {
		$scope.currentSettingTamgr.setting = true;
		$scope.getNowTamgrSetting(unit.maid);
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.settingTamgr);
	}

	//当点击设置按钮获取当前资产管理人的配置信息
	/**
	 * acid_bacid_relation: 资产账户和资金账户意义对应关系'0'-否  '1'-是
	 * cancel_checkamt: 撤单金额比例限制生效值
	 * cancel_checknum: 撤单笔数比例限制生效值
	 * cap_trd_qty_limit: 产品下交易员个数限制 0表示不限制
	 * investment_advisor_order: 投资顾问下单开关 '0'-关闭 '1'-开启
	 * maid: 资产管理人ID
	 * maname: 资产管理人简称
	 * oper_station_chk: 操作员站点绑定校验 '0'不校验 '1'仅校验mac '2'仅校验ip '3'校验mac和ip
	 */
	$scope.getNowTamgrSetting = function(nowMaid) {
		unitlistService.getTamgrSetting({ body: {maid: nowMaid} }, function (gcres) {
			console.log('获取当前资产管理人配置信息数据-----');
			console.log(gcres);
			if (gcres.msret.msgcode == "00") {
				$scope.currentSettingTamgr.maid = gcres.body[0].maid;
				$scope.currentSettingTamgr.maname = gcres.body[0].maname;
				$scope.currentSettingTamgr.acid_bacid_relation = gcres.body[0].acid_bacid_relation;
				$scope.currentSettingTamgr.cap_trd_qty_limit = gcres.body[0].cap_trd_qty_limit;
				$scope.currentSettingTamgr.investment_advisor_order = gcres.body[0].investment_advisor_order;
				$scope.currentSettingTamgr.oper_station_chk = gcres.body[0].oper_station_chk;
				$scope.$apply();
			}
			else {
				cms.message.error("获取资产管理人参数失败");
			}
		})
	}

	//保存资产管理人信息
	$scope.unitlistSaveEditTamgr = function () {
		var iReg = /^[1-9][0-9]{0,3}$/;
		// if ($scope.currentTamgr.edit == false && !iReg.test($scope.currentTamgr.maid)) {
		// 	cms.message.error("资产管理人编号必须为正整数");
		// 	return;
		// }
		if ($scope.currentTamgr.maname == "") {
			cms.message.error("资产管理人简称不能为空");
			return;
		}
		if ($scope.currentTamgr.malname == "") {
			cms.message.error("资产管理人全称不能为空");
			return;
		}
		if ($scope.currentTamgr.currencyid == "") {
			cms.message.error("请选择默认币种");
			return;
		}
		var reqData = {
			body: {
				maid: $scope.currentTamgr.maid,
				maname: $scope.currentTamgr.maname,
				malname: $scope.currentTamgr.malname,
				currencyid: $scope.currentTamgr.currencyid,
				stat: $scope.currentTamgr.stat
			}
		};
		if ($scope.currentTamgr.edit == false) {
			var request_data = {
				maname: $scope.currentTamgr.maname,
				malname: $scope.currentTamgr.malname,
				currencyid: $scope.currentTamgr.currencyid,
				stat: $scope.currentTamgr.stat
			};
			//新建
			unitlistService.createManagerNew({ serviceid: $rootScope.serviceid["ccms-server"], body: request_data }, function (data) {
				if (data.error) {
					cms.message.error("新建资产管理人失败." + data.error.msg);
					return;
				}
				cms.message.success('操作成功', 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
				$scope.$emit("changedManager", "changedManager");
			});
		}
		else {
			unitlistService.updateTamgr(reqData, function (utres) {
				if (utres.msret.msgcode == "00") {
					cms.message.success('操作成功', 5);
					$scope.unitlistHideModal();
					$scope.unitlistGetUnit();
					$scope.$emit("changedManager", "changedManager");
				}
				else {
					cms.message.error("更新资产管理人信息失败." + utres.msret.msg);
				}
			})
		}
	}

	//设置资产管理人参数输入框校验
	$scope.checkInputNum = function(event, temp) {
		if (temp ===1) {
			$scope.currentSettingTamgr.cap_trd_qty_limit = ($scope.currentSettingTamgr.cap_trd_qty_limit).toString().replace(/[^\d]/g, "");
		} else {
			$scope.currentSettingTamgr.cancel_checknum = ($scope.currentSettingTamgr.cancel_checknum).toString().replace(/[^\d]/g, "");
		}
	}

	// 保存资产管理人参数设置信息
	$scope.unitlistSaveSettingTamgr = function () {
		console.log($scope.currentSettingTamgr.cancel_checkamt);
		if ($scope.currentSettingTamgr.cap_trd_qty_limit === "") {
			cms.message.error("策略组合数量限制不可以为空");
			return;
		} else {
			var requestData = {
				"maid": $scope.currentSettingTamgr.maid,
				"cap_trd_qty_limit": $scope.currentSettingTamgr.cap_trd_qty_limit,
				"oper_station_chk": $scope.currentSettingTamgr.oper_station_chk,
				"acid_bacid_relation": $scope.currentSettingTamgr.acid_bacid_relation
			}
			console.log(requestData);
			unitlistService.altTamgrSetting({body: requestData}, function(retData) {
				console.log(retData);
				if (retData.msret.msgcode == "00") {
					$scope.unitlistHideModal();
					$scope.unitlistGetUnit();
					cms.message.success("修改资产管理人参数成功");
				} else {
					cms.message.error(retData.msret.msg);
				}
			})
		}
	}

	//冻结，解冻资产管理人
	$scope.unitlistFreezeTamgr = function (unit, index) {
		$scope.freezeInfo.modalTitle = unit.stat == '1' ? "冻结资产管理人" : "解冻资产管理人";
		$scope.freezeInfo.currentIndex = index;
		$scope.freezeInfo.leaf = unit.leaf;
		$scope.freezeInfo.maid = unit.maid;
		$scope.freezeInfo.maname = unit.maname;
		$scope.freezeInfo.malname = unit.malname;
		$scope.freezeInfo.currencyid = unit.currencyid;
		$scope.freezeInfo.stat = unit.stat == '0' ? '1' : '0';
		$scope.freezeInfo.tips = unit.stat == '1' ? "你确定要冻结 " + unit.maname + "(" + unit.maid + ") 吗?" : "你确定要解除对 " + unit.maname + "(" + unit.maid + ") 的冻结吗？";
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.freeze);
	}

	//确定，解冻，冻结
	$scope.unitlistFreezeTamgrSure = function () {
		var reqData = {
			body: {
				maid: $scope.freezeInfo.maid,
				maname: $scope.freezeInfo.maname,
				malname: $scope.freezeInfo.malname,
				currencyid: $scope.freezeInfo.currencyid,
				stat: $scope.freezeInfo.stat
			}
		};
		unitlistService.updateTamgr(reqData, function (utres) {
			if (utres.msret.msgcode == "00") {
				cms.message.success('操作成功', 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
			}
			else {
				cms.message.error("操作失败." + utres.msret.msg, 5);
			}
		})
	}

	//添加产品
	$scope.unitlistAddTacap = function (index) {
		$scope.currentTacap.edit = false;
		$scope.currentTacap.maid = $scope.unitList[index].maid;
		$scope.currentTacap.caid = "";
		$scope.currentTacap.real_caid = "";
		$scope.currentTacap.caname = "";
		$scope.currentTacap.currencyid = "";
		$scope.currentTacap.captype = "1";
		$scope.currentTacap.prenetvalue = "1";
		$scope.currentTacap.totalshare = "0";
		$scope.currentTacap.management_rate = "0";
		$scope.currentTacap.establish_date = new Date();
		$scope.currentTacap.stat = "1";

		if ($scope.unitCurrencyList.length == 0) {
			unitlistService.getCurrency({ body: {} }, function (gcres) {
				if (gcres.msret.msgcode == "00") {
					$scope.unitCurrencyList = gcres.body;
					if ($scope.unitCurrencyList.length > 0) {
						$scope.currentTacap.currencyid = String($scope.unitCurrencyList[0].currencyid);
					}
					$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTacap);
					$scope.$apply();
				}
				else {
					cms.message.error("获取币种信息失败，无法进行该操作");
				}
			})
		}
		else {
			$scope.currentTacap.currencyid = $scope.unitCurrencyList[0].currencyid;
			$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTacap);
		}
	}

	//输入产品编号
	$scope.unitlistAddTacapCaidInput = function () {
		if ($scope.currentTacap.caid == "") {
			$scope.currentTacap.real_caid = "";
		}
		else {
			switch ($scope.currentTacap.caid.length) {
				case 1:
					$scope.currentTacap.real_caid = $scope.currentTacap.maid + "000" + $scope.currentTacap.caid;
					break;
				case 2:
					$scope.currentTacap.real_caid = $scope.currentTacap.maid + "00" + $scope.currentTacap.caid;
					break;
				case 3:
					$scope.currentTacap.real_caid = $scope.currentTacap.maid + "0" + $scope.currentTacap.caid;
					break;
				case 4:
					$scope.currentTacap.real_caid = $scope.currentTacap.maid + $scope.currentTacap.caid;
					break;
				default:
					break;
			}
		}
	}

	//编辑产品
	$scope.unitlistEditTacap = function (unit) {
		$scope.currentTacap.edit = true;
		$scope.currentTacap.maid = unit.maid;
		$scope.currentTacap.caid = unit.caid;
		$scope.currentTacap.caname = unit.caname;
		$scope.currentTacap.currencyid = unit.currencyid;
		$scope.currentTacap.captype = unit.captype;
		$scope.currentTacap.show_captype = unit.captype == 0 ? "模拟产品" : "生产产品";
		$scope.currentTacap.briefcode = unit.briefcode;
		$scope.currentTacap.curencychname = unit.curencychname;
		$scope.currentTacap.curencyenname = unit.curencyenname;
		$scope.currentTacap.show_currency = $scope.currentTacap.curencychname + "(" + $scope.currentTacap.briefcode + ")";
		$scope.currentTacap.prenetvalue = Number(unit.prenetvalue);
		$scope.currentTacap.totalshare = Number(unit.totalshare).toFixed(0);
		$scope.currentTacap.management_rate = Number(unit.management_rate);
		$scope.currentTacap.establish_date = new Date();
		if (unit.establish_date.length == 8) {
			var year = Number(unit.establish_date.substring(0, 4));
			var month = Number(unit.establish_date.substring(4, 6)) - 1;
			var day = Number(unit.establish_date.substring(6, 8));
			$scope.currentTacap.establish_date.setFullYear(year);
			$scope.currentTacap.establish_date.setMonth(month);
			$scope.currentTacap.establish_date.setDate(day);
		}
		$scope.currentTacap.stat = String(unit.stat);
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTacap);
	}

	//保存产品信息
	$scope.unitlistSaveEditTacap = function () {
		var iReg = /^[1-9][0-9]{0,3}$/;						    //验证单元编号
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;   //验证（17，3）浮点数
		var nReg = /^(0|([1-9][0-9]{0,13}))$/;
		// if ($scope.currentTacap.edit == false && !iReg.test($scope.currentTacap.caid)) {
		// 	cms.message.error("产品编号必须为1~9999之间的数字");
		// 	return;
		// }
		if ($scope.currentTacap.caname == "") {
			cms.message.error("产品名称不能为空");
			return;
		}
		if ($scope.currentTacap.currencyid == "") {
			cms.message.error("请选择核算币种");
			return;
		}

		if (!fReg.test($scope.currentTacap.prenetvalue)) {
			cms.message.error("上日净值必须为(17,3)浮点数");
			return;
		}
		if (!nReg.test($scope.currentTacap.totalshare)) {
			cms.message.error("份额必须为正整数");
			return;
		}
		if (!fReg.test($scope.currentTacap.management_rate)) {
			cms.message.error("管理费率必须为(17,3)浮点数");
			return;
		}
		if ($scope.currentTacap.establish_date == undefined) {
			cms.message.error("请输入正确的发行日期");
			return;
		}
		var dateStr = $scope.currentTacap.establish_date.getFullYear() * 10000 + ($scope.currentTacap.establish_date.getMonth() + 1) * 100 + $scope.currentTacap.establish_date.getDate();
		var reqData = {
			body: {
				maid: $scope.currentTacap.maid,
				caid: $scope.currentTacap.caid,
				caname: $scope.currentTacap.caname,
				currencyid: $scope.currentTacap.currencyid,
				captype: $scope.currentTacap.captype,
				prenetvalue: $scope.currentTacap.prenetvalue,
				totalshare: $scope.currentTacap.totalshare,
				management_rate: $scope.currentTacap.management_rate,
				establish_date: dateStr,
				stat: $scope.currentTacap.stat
			}
		};
		if ($scope.currentTacap.edit == false) {
			var request_data = {
				maid: $scope.currentTacap.maid,
				caname: $scope.currentTacap.caname,
				currencyid: $scope.currentTacap.currencyid,
				type: $scope.currentTacap.captype,
				netvalue: $scope.currentTacap.prenetvalue,
				totalshare: $scope.currentTacap.totalshare,
				management_rate: $scope.currentTacap.management_rate,
				date: dateStr,
				stat: $scope.currentTacap.stat
			}
			unitlistService.createProductNew({ serviceid: $rootScope.serviceid["ccms-server"], body: request_data }, function (data) {
				if (data.error) {
					cms.message.error("新增产品失败." + data.error.msg);
					return;
				}
				cms.message.success('操作成功', 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
				$scope.$emit("changedProduct", "changedProduct");
			});
		}
		else {
			unitlistService.updateTacap(reqData, function (utres) {
				if (utres.msret.msgcode == "00") {
					cms.message.success('操作成功', 5);
					$scope.unitlistHideModal();
					$scope.unitlistGetUnit();
					$scope.$emit("changedProduct", "changedProduct");
				}
				else {
					cms.message.error("更新产品信息失败." + utres.msret.msg);
				}
			})
		}
	}

	//冻结，解冻产品
	$scope.unitlistFreezeTacap = function (unit, index) {
		$scope.freezeInfo.modalTitle = unit.stat == '1' ? "冻结产品" : "解冻产品";
		$scope.freezeInfo.currentIndex = index;
		$scope.freezeInfo.leaf = unit.leaf;
		$scope.freezeInfo.maid = unit.maid;
		$scope.freezeInfo.caid = unit.caid;
		$scope.freezeInfo.caname = unit.caname;
		$scope.freezeInfo.currencyid = unit.currencyid;
		$scope.freezeInfo.prenetvalue = unit.prenetvalue;
		$scope.freezeInfo.totalshare = unit.totalshare;
		$scope.freezeInfo.management_rate = unit.management_rate;
		$scope.freezeInfo.establish_date = unit.establish_date;
		$scope.freezeInfo.stat = unit.stat == '0' ? '1' : '0';
		$scope.freezeInfo.tips = unit.stat == '1' ? "你确定要冻结 " + unit.caname + "(" + unit.caid + ") 吗?" : "你确定要解除对 " + unit.caname + "(" + unit.caid + ") 的冻结吗？";
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.freeze);
	}

	//确定冻结，解冻
	$scope.unitlistFreezeTacapSure = function () {
		var reqData = {
			body: {
				maid: $scope.freezeInfo.maid,
				caid: $scope.freezeInfo.caid,
				caname: $scope.freezeInfo.caname,
				currencyid: $scope.freezeInfo.currencyid,
				prenetvalue: $scope.freezeInfo.prenetvalue,
				totalshare: $scope.freezeInfo.totalshare,
				management_rate: $scope.freezeInfo.management_rate,
				establish_date: $scope.freezeInfo.establish_date,
				stat: $scope.freezeInfo.stat
			}
		};
		unitlistService.updateTacap(reqData, function (utres) {
			if (utres.msret.msgcode == "00") {
				cms.message.success('操作成功', 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
			}
			else {
				cms.message.error("操作失败." + utres.msret.msg);
			}
		})
	}

	//新建策略组合
	$scope.unitlistAddTatrd = function (index) {
		$scope.currentTatrd.edit = false;
		$scope.currentTatrd.maid = $scope.unitList[index].maid;
		$scope.currentTatrd.caid = $scope.unitList[index].caid;
		$scope.currentTatrd.currencyid = $scope.unitList[index].currencyid;
		$scope.currentTatrd.briefcode = $scope.unitList[index].briefcode;
		$scope.currentTatrd.curencychname = $scope.unitList[index].curencychname;
		$scope.currentTatrd.curencyenname = $scope.unitList[index].curencyenname;
		$scope.currentTatrd.show_currency = $scope.currentTatrd.curencychname + "(" + $scope.currentTatrd.briefcode + ")"
		$scope.currentTatrd.trid = "";
		$scope.currentTatrd.real_trid = "";
		$scope.currentTatrd.trname = "";
		$scope.currentTatrd.trlname = "";
		$scope.currentTatrd.verifyflag = "1";
		$scope.currentTatrd.prenetvalue = "1";
		$scope.currentTatrd.totalshare = "0";
		$scope.currentTatrd.approvestat = "0";
		$scope.currentTatrd.stat = "1";
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTatrd);
	}

	//输入策略组合编号
	$scope.unitlistAddTatrdTridInput = function () {
		if ($scope.currentTatrd.trid == "") {
			$scope.currentTatrd.real_trid = "";
		}
		else {
			switch ($scope.currentTatrd.trid.length) {
				case 1:
					$scope.currentTatrd.real_trid = $scope.currentTatrd.caid + "000" + $scope.currentTatrd.trid;
					break;
				case 2:
					$scope.currentTatrd.real_trid = $scope.currentTatrd.caid + "00" + $scope.currentTatrd.trid;
					break;
				case 3:
					$scope.currentTatrd.real_trid = $scope.currentTatrd.caid + "0" + $scope.currentTatrd.trid;
					break;
				case 4:
					$scope.currentTatrd.real_trid = $scope.currentTatrd.caid + $scope.currentTatrd.trid;
					break;
				default:
					break;
			}
		}
	}

	//编辑策略组合
	$scope.unitlistEditTatrd = function (unit) {
		$scope.currentTatrd.edit = true;
		$scope.currentTatrd.maid = unit.maid;
		$scope.currentTatrd.caid = unit.caid;
		$scope.currentTatrd.trid = unit.trid;
		$scope.currentTatrd.trname = unit.trname;
		$scope.currentTatrd.trlname = unit.trlname;
		$scope.currentTatrd.currencyid = unit.currencyid;
		$scope.currentTatrd.briefcode = unit.briefcode;
		$scope.currentTatrd.curencychname = unit.curencychname;
		$scope.currentTatrd.curencyenname = unit.curencyenname;
		$scope.currentTatrd.show_currency = $scope.currentTatrd.curencychname + "(" + $scope.currentTatrd.briefcode + ")";
		$scope.currentTatrd.prenetvalue = Number(unit.prenetvalue);
		$scope.currentTatrd.totalshare = Number(unit.totalshare).toFixed(0);
		$scope.currentTatrd.approvestat = String(unit.approvestat);
		$scope.currentTatrd.stat = String(unit.stat);
		$scope.currentTatrd.verifyflag = String(unit.verifyflag);
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.editTatrd);
	}

	//保存策略组合信息
	$scope.unitlistSaveEditTatrd = function () {
		var iReg = /^[1-9][0-9]{0,3}$/;						    //验证单元编号
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;   //验证（17，3）浮点数
		var nReg = /^(0|([1-9][0-9]{0,13}))$/;
		// if ($scope.currentTatrd.edit == false && !iReg.test($scope.currentTatrd.trid)) {
		// 	cms.message.error("策略组合编号必须为1~9999之间的数字");
		// 	return;
		// }
		if ($scope.currentTatrd.trname == "") {
			cms.message.error("策略组合简称不能为空");
			return;
		}
		if ($scope.currentTatrd.trlname == "") {
			cms.message.error("策略组合全称不能为空");
			return;
		}
		if (!fReg.test($scope.currentTatrd.prenetvalue)) {
			cms.message.error("上一日净值必须为(17,3)浮点数");
			return;
		}
		if (!nReg.test($scope.currentTatrd.totalshare)) {
			cms.message.error("份额必须为正整数");
			return;
		}
		var reqData = {
			body: {
				maid: $scope.currentTatrd.maid,
				caid: $scope.currentTatrd.caid,
				trid: $scope.currentTatrd.trid,
				trname: $scope.currentTatrd.trname,
				trlname: $scope.currentTatrd.trlname,
				currencyid: $scope.currentTatrd.currencyid,
				prenetvalue: $scope.currentTatrd.prenetvalue,
				totalshare: $scope.currentTatrd.totalshare,
				approvestat: $scope.currentTatrd.approvestat,
				stat: $scope.currentTatrd.stat,
				verifyflag: $scope.currentTatrd.verifyflag
			}
		};
		if ($scope.currentTatrd.edit == false) {
			var request_data = {
				caid: $scope.currentTatrd.caid,
				trname: $scope.currentTatrd.trname,
				trlname: $scope.currentTatrd.trlname,
				currencyid: $scope.currentTatrd.currencyid,
				netvalue: $scope.currentTatrd.prenetvalue,
				totalshare: $scope.currentTatrd.totalshare,
				approvestat: $scope.currentTatrd.approvestat,
				stat: $scope.currentTatrd.stat,
				verifyflag: $scope.currentTatrd.verifyflag
			}
			unitlistService.createCombStrategyNew({ serviceid: $rootScope.serviceid["ccms-server"], body: request_data }, function (data) {
				if (data.error) {
					cms.message.error("新增策略组合失败." + data.error.msg);
					return;
				}
				cms.message.success('操作成功', 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
				$scope.$emit("changedTradeUnit", "changedTradeUnit");
			});
		}
		else {
			unitlistService.updateTatrd(reqData, function (utres) {
				if (utres.msret.msgcode == "00") {
					cms.message.success('操作成功', 5);
					$scope.unitlistHideModal();
					$scope.unitlistGetUnit();
					$scope.$emit("changedTradeUnit", "changedTradeUnit");
				}
				else {
					cms.message.error("更新策略组合信息失败." + utres.msret.msg);
				}
			})
		}
	}

	//冻结，解冻策略组合
	$scope.unitlistFreezeTatrd = function (unit, index) {
		$scope.freezeInfo.modalTitle = unit.stat == '1' ? "冻结策略组合" : "解冻策略组合";
		$scope.freezeInfo.currentIndex = index;
		$scope.freezeInfo.leaf = unit.leaf;
		$scope.freezeInfo.maid = unit.maid;
		$scope.freezeInfo.caid = unit.caid;
		$scope.freezeInfo.trid = unit.trid;
		$scope.freezeInfo.trname = unit.trname;
		$scope.freezeInfo.trlname = unit.trlname;
		$scope.freezeInfo.prenetvalue = unit.prenetvalue;
		$scope.freezeInfo.totalshare = unit.totalshare;
		$scope.freezeInfo.commissionrate = unit.commissionrate;
		$scope.freezeInfo.min_commissionfee = unit.min_commissionfee;
		$scope.freezeInfo.approvestat = unit.approvestat;
		$scope.freezeInfo.verifyflag = unit.verifyflag;
		$scope.freezeInfo.stat = unit.stat == '0' ? '1' : '0';
		$scope.freezeInfo.tips = unit.stat == '1' ? "你确定要冻结 " + unit.trname + "(" + unit.trid + ") 吗?" : "你确定要解除对 " + unit.trname + "(" + unit.trid + ") 的冻结吗？";
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.freeze);
	}

	//确定冻结，解冻
	$scope.unitlistFreezeTatrdSure = function () {
		var reqData = {
			body: {
				maid: $scope.freezeInfo.maid,
				caid: $scope.freezeInfo.caid,
				trid: $scope.freezeInfo.trid,
				trname: $scope.freezeInfo.trname,
				trlname: $scope.freezeInfo.trlname,
				prenetvalue: $scope.freezeInfo.prenetvalue,
				totalshare: $scope.freezeInfo.totalshare,
				commissionrate: $scope.freezeInfo.commissionrate,
				min_commissionfee: $scope.freezeInfo.min_commissionfee,
				approvestat: $scope.freezeInfo.approvestat,
				stat: $scope.freezeInfo.stat,
				verifyflag: $scope.freezeInfo.verifyflag
			}
		};
		unitlistService.updateTatrd(reqData, function (utres) {
			if (utres.msret.msgcode == "00") {
				cms.message.success('操作成功', 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
			}
			else {
				cms.message.error("操作失败." + utres.msret.msg);
			}
		})
	}

	//外部资产管理
	$scope.unitlistProductAddSubject = function (obj) {
		$scope.currentSubject.caid = obj.caid;
		$scope.currentSubject.caname = obj.caname;
		$scope.currentSubject.subjectList = [];
		$scope.currentSubject.subjectTypeList = [];
		$scope.currentSubject.currencyList = [];
		$scope.currentSubject.productList = [];
		$scope.currentSubject.productList.push({ caid: "0", caname: "无", show_name: "不选择内部产品" });
		$scope.currentSubject.dealSubject = {};
		unitlistService.getProductSubject({ body: { caid: obj.caid } }, function (psres) {
			if (psres.msret.msgcode == "00") {
				$scope.currentSubject.subjectList = psres.body;
				angular.forEach($scope.currentSubject.subjectList, function (subject) {
					subject.amt = Number(subject.amt);
					subject.parms1 = Number(subject.parms1);
				})
				unitlistService.getProductSubjectType({ body: {} }, function (pstres) {
					if (psres.msret.msgcode == "00") {
						$scope.currentSubject.subjectTypeList = pstres.body;
					}
					else {
						cms.log("获取外部资产类型失败：", JSON.stringify(pstres.msret));
					}
				})
				unitlistService.getCurrency({ body: {} }, function (res) {
					if (res.msret.msgcode == "00") {
						$scope.currentSubject.currencyList = res.body;
					}
					else {
						cms.log("获取币种失败.", JSON.stringify(res.msret));
					}
				})
				unitlistService.getTacap({ body: {} }, function (cares) {
					if (cares.msret.msgcode !== "00") {
						cms.log("获取产品列表失败.", JSON.stringify(cares.msret));
						return;
					}
					var productsTemp = cares.body;
					unitlistService.getProductSubject({ body: { inside: 1 } }, function (res1) {
						if (res1.msret.msgcode !== "00") {
							cms.log("获取外部资产列表失败.", JSON.stringify(res1.msret));
							return;
						}
						var children = {};
						for (var i = 0; i < res1.body.length; i++) {
							children[res1.body[i].targetid] = children[res1.body[i].targetid] || [];
							children[res1.body[i].targetid].push(res1.body[i]);
						}
						$scope.getNotChildArray(productsTemp, children, obj.caid);
						for (var i = 0; i < productsTemp.length; i++) {
							if (productsTemp[i].caid != obj.caid) {
								var temp = {};
								temp.caid = productsTemp[i].caid;
								temp.caname = productsTemp[i].caname;
								temp.show_name = productsTemp[i].caname + "(" + productsTemp[i].caid + ")";
								$scope.currentSubject.productList.push(temp);
							}
						}
						$scope.$apply();
					})
				})
				$scope.unitlistShowModal($scope.modalInfo.stateEnum.subject);
				$scope.$apply();
			}
			else {
				cms.message.error("操作失败，请稍候重试.");
				cms.log("获取外部资产列表失败：", JSON.stringify(psres.msret));
			}
		})

	}

	$scope.getNotChildArray = function (zNodes, childList, caid) {
		function filtetChild(nodeid) {
			var data = childList[nodeid];
			if (!data) return;
			for (var i = 0; i < data.length; i++) {
				for (var k = 0; k < zNodes.length; k++) {
					if (data[i].caid == zNodes[k].caid) {
						zNodes.splice(k, 1);
						break;
					}
				}
				filtetChild(data[i].caid);
			}
		}
		filtetChild(caid);
	}

	//刷新页面
	$scope.unitlistSubjectRefresh = function () {
		var reqData = { body: { caid: $scope.currentSubject.caid } };
		unitlistService.getProductSubject(reqData, function (psres) {
			if (psres.msret.msgcode == "00") {
				$scope.currentSubject.subjectList = psres.body;
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败，请刷新重试.");
				cms.log("获取外部资产列表失败：", JSON.stringify(psres.msret));
			}
		})
	}

	//显示外部资产二级弹框
	$scope.unitlistShowSubjectModal = function (state) {
		$scope.subjectModalInfo.state = state;
		switch (state) {
			case $scope.subjectModalInfo.stateEnum.editSubject:
				$scope.subjectModalInfo.path = "../unit-manage/unitlistSubjectEdit.html"
				break;
			case $scope.subjectModalInfo.stateEnum.deleteSubject:
				$scope.subjectModalInfo.path = "../unit-manage/unitlistSubjectDelete.html"
				break;
			default:
				break;
		}
	}

	//外部资产二级弹框加载完成
	$scope.unitlistSubjectModalLoadReady = function () {
		switch ($scope.subjectModalInfo.state) {
			case $scope.subjectModalInfo.stateEnum.editSubject:
				mainService.showModal("unitlist_subject_modal_back", "unitlist_subject_edit_modal", "unitlist_subject_edit_modal_title");
				break;
			case $scope.subjectModalInfo.stateEnum.deleteSubject:
				mainService.showModal("unitlist_subject_modal_back", "unitlist_subject_delete_modal", "unitlist_subject_delete_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭外部资产二级弹框
	$scope.unitlistClodeSubjectModal = function () {
		mainService.hideModal("unitlist_subject_modal_back");
		$scope.subjectModalInfo.state = 0;
		$scope.subjectModalInfo.path = ""
	}

	//添加外部资产
	$scope.unitlistSubjectAddSubject = function () {
		$scope.currentSubject.dealSubject.edit = false;
		$scope.currentSubject.dealSubject.product = $scope.currentSubject.productList[0];
		$scope.currentSubject.dealSubject.caid = $scope.currentSubject.caid;
		$scope.currentSubject.dealSubject.caname = $scope.currentSubject.caname + "(" + $scope.currentSubject.caid + ")";
		$scope.currentSubject.dealSubject.subjectname = "";
		$scope.currentSubject.dealSubject.subjecttype = "2";
		$scope.currentSubject.dealSubject.targetid = "";
		$scope.currentSubject.dealSubject.currencyid = $scope.currentSubject.currencyList.length > 0 ? $scope.currentSubject.currencyList[0].currencyid : "";
		$scope.currentSubject.dealSubject.amt = "";
		$scope.currentSubject.dealSubject.parms1 = "";
		$scope.currentSubject.dealSubject.totalshare = "";
		$scope.currentSubject.dealSubject.begintime = new Date();
		$scope.unitlistShowSubjectModal($scope.subjectModalInfo.stateEnum.editSubject);
	}



	//编辑外部资产
	$scope.unitlistSubjectEdit = function (obj) {
		$scope.currentSubject.dealSubject.edit = true;
		$scope.currentSubject.dealSubject.caid = $scope.currentSubject.caid;
		$scope.currentSubject.dealSubject.caname = $scope.currentSubject.caname + "(" + $scope.currentSubject.caid + ")";
		$scope.currentSubject.dealSubject.subjectid = obj.subjectid;
		$scope.currentSubject.dealSubject.subjectname = obj.subjectname;
		$scope.currentSubject.dealSubject.subjecttype = obj.subjecttype;
		$scope.currentSubject.dealSubject.targetid = obj.targetid;
		$scope.currentSubject.dealSubject.currencyid = obj.currencyid;
		$scope.currentSubject.dealSubject.amt = obj.amt;
		$scope.currentSubject.dealSubject.parms1 = obj.parms1;
		$scope.currentSubject.dealSubject.totalshare = Number(obj.totalshare);
		$scope.currentSubject.dealSubject.begintime = new Date();
		if (obj.begintime.length == 10) {
			var year = Number(obj.begintime.substring(0, 4));
			var month = Number(obj.begintime.substring(5, 7)) - 1;
			var day = Number(obj.begintime.substring(8, 10));
			$scope.currentSubject.dealSubject.begintime.setFullYear(year);
			$scope.currentSubject.dealSubject.begintime.setMonth(month);
			$scope.currentSubject.dealSubject.begintime.setDate(day);
		}
		if (obj.targetid == "") {
			$scope.currentSubject.dealSubject.product = $scope.currentSubject.productList[0];
		}
		else {
			for (var i = 0; i < $scope.currentSubject.productList.length; i++) {
				if ($scope.currentSubject.productList[i].caid == obj.targetid) {
					$scope.currentSubject.dealSubject.product = $scope.currentSubject.productList[i];
					break;
				}
			}
		}
		$scope.unitlistShowSubjectModal($scope.subjectModalInfo.stateEnum.editSubject);
	}

	//修改外部资产产品
	$scope.unitlistSubjectChangeProduct = function () {
		if ($scope.currentSubject.dealSubject.product.caid == "0") {
			$scope.currentSubject.dealSubject.targetid = "";
			$scope.currentSubject.dealSubject.subjectname = "";
		}
		else {
			$scope.currentSubject.dealSubject.targetid = $scope.currentSubject.dealSubject.product.caid;
			$scope.currentSubject.dealSubject.subjectname = $scope.currentSubject.dealSubject.product.caname;
		}
	}

	//修改类别
	$scope.unitlistSubjectChangeType = function () {
		if ($scope.currentSubject.dealSubject.subjecttype == 1) {
			$scope.currentSubject.dealSubject.product = $scope.currentSubject.productList[0];
			$scope.currentSubject.dealSubject.targetid = "";
			$scope.currentSubject.dealSubject.subjectname = "";
		}
	}

	//保存外部资产
	$scope.unitlistSubjectSaveSubject = function () {
		var regid = /^[1-9][0-9]{0,19}$/;
		var regfloat = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		var regInt = /^(0|([1-9][0-9]{0,13}))$/;
		if ($scope.currentSubject.dealSubject.subjectname == "") {
			cms.message.error("资产名称不能为空.");
			return;
		}
		if ($scope.currentSubject.dealSubject.subjecttype == "") {
			cms.message.error("请选择资产类型.");
			return;
		}
		if ($scope.currentSubject.dealSubject.targetid != "" && !regid.test($scope.currentSubject.dealSubject.targetid)) {
			cms.message.error("标的编号只能为正整数或空.");
			return;
		}
		if ($scope.currentSubject.dealSubject.currencyid == "") {
			cms.message.error("请选择币种.");
			return;
		}
		if (!regfloat.test($scope.currentSubject.dealSubject.amt)) {
			cms.message.error("请正确填写金额.");
			return;
		}
		if ($scope.currentSubject.dealSubject.subjecttype == 1 && !regfloat.test($scope.currentSubject.dealSubject.parms1)) {
			cms.message.error("请正确填写参数.");
			return;
		}
		if ($scope.currentSubject.dealSubject.subjecttype == 2 && !regInt.test($scope.currentSubject.dealSubject.totalshare)) {
			cms.message.error("请正确填写参数.");
			return;
		}
		var reqData = { body: {} };
		reqData.body.caid = $scope.currentSubject.caid;
		reqData.body.subjectname = $scope.currentSubject.dealSubject.subjectname;
		reqData.body.subjecttype = $scope.currentSubject.dealSubject.subjecttype;
		if ($scope.currentSubject.dealSubject.targetid != "") {
			reqData.body.targetid = $scope.currentSubject.dealSubject.targetid;
		}
		reqData.body.currencyid = $scope.currentSubject.dealSubject.currencyid;
		reqData.body.amt = $scope.currentSubject.dealSubject.amt;
		if ($scope.currentSubject.dealSubject.subjecttype == 1) {
			reqData.body.parms1 = $scope.currentSubject.dealSubject.parms1;
			reqData.body.begintime = $scope.currentSubject.dealSubject.begintime.getFullYear() + "-" + ($scope.currentSubject.dealSubject.begintime.getMonth() + 1) + "-" + $scope.currentSubject.dealSubject.begintime.getDate();
		}
		else {
			reqData.body.totalshare = $scope.currentSubject.dealSubject.totalshare;
		}
		if ($scope.currentSubject.dealSubject.edit == true) {
			reqData.body.subjectid = $scope.currentSubject.dealSubject.subjectid;
			unitlistService.updateProductSubject(reqData, function (res) {
				if (res.msret.msgcode == "00") {
					cms.message.success("操作成功.", 5);
					$scope.unitlistClodeSubjectModal();
					$scope.unitlistSubjectRefresh();
				}
				else {
					cms.message.error("操作失败." + res.msret.msg);
					cms.log("修改产品资产失败：", JSON.stringify(res.msret));
				}
			})
		}
		else {
			unitlistService.addProductSubject(reqData, function (res) {
				if (res.msret.msgcode == "00") {
					cms.message.success("操作成功.", 5);
					$scope.unitlistClodeSubjectModal();
					$scope.unitlistSubjectRefresh();
				}
				else {
					cms.message.error("操作失败." + res.msret.msg);
					cms.log("修改产品资产失败：", JSON.stringify(res.msret));
				}
			})
		}

	}

	//删除外部资产
	$scope.unitlistSubjectDelete = function (obj) {
		$scope.currentSubject.dealSubject.subjectid = obj.subjectid;
		$scope.currentSubject.dealSubject.subjectname = obj.subjectname;
		$scope.unitlistShowSubjectModal($scope.subjectModalInfo.stateEnum.deleteSubject);
	}

	//确定删除
	$scope.unitlistSUbjectDeleteSure = function () {
		var reqData = { body: { subjectid: $scope.currentSubject.dealSubject.subjectid } };
		unitlistService.deleteProductSubject(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功.", 5);
				$scope.unitlistClodeSubjectModal();
				$scope.unitlistSubjectRefresh();
			}
			else {
				cms.message.error("操作失败." + res.msret.msg);
				cms.log("删除产品资产失败：", JSON.stringify(res.msret));
			}
		})
	}


	// 产品通道
	$scope.unitlistProductChannel = function (obj) {
		$scope.currentTacap.caid = obj.caid;
		$scope.currentTacap.risk_url = "";
		$scope.currentTacap.sds_url = "";

		//获取omsserviceid
		unitlistService.getOpsService({ body: { moduleid: cms.c_moduleid_oms } }, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.omsServices = res.body;
				$scope.$apply();
			}
			else {
				cms.message.error("获取交易服务失败." + res.msret.msg);
			}
		})

		//获取sds_serviceid
		unitlistService.getOpsService({ body: { moduleid: cms.c_moduleid_sds } }, function (res) {
			if (res.msret.msgcode == "00") {

				$scope.sdsServices = res.body;
				$scope.$apply();
			}
			else {
				cms.message.error("获取行情服务失败." + res.msret.msg);
			}
		});

		var reqData = {
			body: {
				caid: obj.caid
			}
		};
		unitlistService.getProductChannelInfo(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				if (res.body.length > 0) {
					// 已有信息，进行解析
					$scope.currentTacap.risk_url = res.body[0].risk_url;
					$scope.currentTacap.sds_url = res.body[0].sds_url;
				}
				$scope.unitlistShowModal($scope.modalInfo.stateEnum.productchannel);
				$scope.$apply();
			}
			else {
				cms.message.error("获取产品通道信息失败." + res.msret.msg);
				cms.log("获取产品通道信息失败：", JSON.stringify(res.msret));
			}
		})
	}


	// 保存通道信息
	$scope.unitlistSaveEditProductChannel = function () {
		if ($scope.currentTacap.risk_url == "" || $scope.currentTacap.sds_url == "") {
			cms.message.error("必须选择交易服务和行情服务");
			return;
		}
		var reqData = {
			body: {
				caid: $scope.currentTacap.caid,
				risk_url: $scope.currentTacap.risk_url,
				sds_url: $scope.currentTacap.sds_url
			}
		};
		unitlistService.updateProductChannel(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功", 5);
				$scope.unitlistHideModal();
			}
			else {
				cms.message.error("操作失败," + res.msret.msg);
				cms.log("保存产品通道信息失败.", JSON.stringify(res.msret));
			}
		})
	}


	//策略组合资金设置
	$scope.unitlistTatrdFundSet = function (index) {
		$scope.currentTatrdFund.refresh = false;
		$scope.currentTatrdFund.trid = $scope.unitList[index].trid;
		$scope.currentTatrdFund.maid = $scope.unitList[index].maid;
		$scope.currentTatrdFund.caid = $scope.unitList[index].caid;
		$scope.currentTatrdFund.tatrd_currencyid = $scope.unitList[index].currencyid;
		$scope.currentTatrdFund.tatrd_briefcode = $scope.unitList[index].briefcode;
		$scope.currentTatrdFund.tatrd_curencychname = $scope.unitList[index].curencychname;
		$scope.currentTatrdFund.tatrd_curencyenname = $scope.unitList[index].curencyenname;
		$scope.currentTatrdFund.tatrd_balance = $scope.unitList[index].tatrd_balance;
		$scope.currentTatrdFund.prenetvalue = $scope.unitList[index].prenetvalue;
		$scope.currentTatrdFund.totalshare = $scope.unitList[index].totalshare;
		$scope.currentTatrdFund.totalint = $scope.unitList[index].totalint;
		$scope.currentTatrdFund.fundList = [];
		$scope.currentTatrdFund.acidList = [];
		var reqData = {
			body: {
				trid: $scope.currentTatrdFund.trid
			}
		}
		unitlistService.getTatrdFund(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.currentTatrdFund.fundList = res.body;
				$scope.unitlistShowModal($scope.modalInfo.stateEnum.tatrdFund);
				$scope.$apply();
			}
			else {
				cms.message.error("获取策略组合资金信息失败，暂时无法进行该操作!");
			}
		})
	}

	//添加组合策略资金
	$scope.unitlistAddTatrdFund = function () {
		$scope.currentTatrdFund.currencyid = "";
		$scope.currentTatrdFund.acid = "";
		$scope.currentTatrdFund.totalamt = "0.00";
		$scope.currentTatrdFund.changeShare = false;
		$scope.currentTatrdFund.current_totalshare = Number($scope.currentTatrdFund.totalshare);
		if ($scope.currentTatrdFund.acidList.length == 0) {
			unitlistService.getTatrdTaact({ body: { trid: $scope.currentTatrdFund.trid } }, function (res) {
				if (res.msret.msgcode == "00") {
					$scope.currentTatrdFund.acidList = res.body;
					if ($scope.currentTatrdFund.acidList.length > 0) {
						$scope.currentTatrdFund.acid = String($scope.currentTatrdFund.acidList[0].acid);
					}
					if ($scope.unitCurrencyList.length == 0) {
						unitlistService.getCurrency({ body: {} }, function (gcres) {
							if (gcres.msret.msgcode == "00") {
								$scope.unitCurrencyList = gcres.body;
								if ($scope.unitCurrencyList.length > 0) {
									$scope.currentTatrdFund.currencyid = String($scope.unitCurrencyList[0].currencyid);
								}
								$scope.unitlistShowTatrdFundModal($scope.tatrdFundModalInfo.stateEnum.addTatrdFund);
								$scope.$apply();
							}
							else {
								cms.message.error("获取币种信息失败，无法进行该操作");
							}
						})
					}
					else {
						$scope.currentTatrdFund.currencyid = String($scope.unitCurrencyList[0].currencyid);
						$scope.unitlistShowTatrdFundModal($scope.tatrdFundModalInfo.stateEnum.addTatrdFund);
						$scope.$apply();
					}
				}
				else {
					cms.message.error("获取账户列表失败，无法进行该操作");
				}
			})
		}
		else {
			$scope.currentTatrdFund.acid = String($scope.currentTatrdFund.acidList[0].acid);
			if ($scope.unitCurrencyList.length == 0) {
				unitlistService.getCurrency({ body: {} }, function (gcres) {
					if (gcres.msret.msgcode == "00") {
						$scope.unitCurrencyList = gcres.body;
						if ($scope.unitCurrencyList.length > 0) {
							$scope.currentTatrdFund.currencyid = String($scope.unitCurrencyList[0].currencyid);
						}
						$scope.unitlistShowTatrdFundModal($scope.tatrdFundModalInfo.stateEnum.addTatrdFund);
						$scope.$apply();
					}
					else {
						cms.message.error("获取币种信息失败，无法进行该操作");
					}
				})
			}
			else {
				$scope.currentTatrdFund.currencyid = String($scope.unitCurrencyList[0].currencyid);
				$scope.unitlistShowTatrdFundModal($scope.tatrdFundModalInfo.stateEnum.addTatrdFund);
				//$scope.$apply();
			}
		}
	}

	//显示策略资金管理二级框
	$scope.unitlistShowTatrdFundModal = function (state) {
		$scope.tatrdFundModalInfo.state = state;
		switch (state) {
			case $scope.tatrdFundModalInfo.stateEnum.addTatrdFund:
				$scope.tatrdFundModalInfo.path = "../unit-manage/unitlistTatrdFundAdd.html"
				break;
			case $scope.tatrdFundModalInfo.stateEnum.changeTatrdFund:
				$scope.tatrdFundModalInfo.path = "../unit-manage/unitlistTatrdFundChange.html";
				break;
			case $scope.tatrdFundModalInfo.stateEnum.editTatrdFund:
				$scope.tatrdFundModalInfo.path = "../unit-manage/unitlistTatrdFundSetAmt.html";
				break;
			default:
				break;
		}
	}
	//策略资金管理二级弹框加载完成
	$scope.unitlistShowTatrdFundModalLoadReady = function () {
		switch ($scope.tatrdFundModalInfo.state) {
			case $scope.tatrdFundModalInfo.stateEnum.addTatrdFund:
				mainService.showModal("unitlist_tatrd_fund_add_back", "unitlist_tatrd_fund_add_modal", "unitlist_tatrd_fund_add_modal_title");
				break;
			case $scope.tatrdFundModalInfo.stateEnum.changeTatrdFund:
				mainService.showModal("unitlist_tatrd_fund_add_back", "unitlist_tatrd_fund_change_modal", "unitlist_tatrd_fund_change_modal_title");
				break;
			case $scope.tatrdFundModalInfo.stateEnum.editTatrdFund:
				mainService.showModal("unitlist_tatrd_fund_add_back", "unitlist_tatrd_fund_edit_modal", "unitlist_tatrd_fund_edit_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭添加框
	$scope.unitlistHideTatrdFundModal = function () {
		mainService.hideModal("unitlist_tatrd_fund_add_back");
		$scope.tatrdFundModalInfo.state = 0;
		$scope.tatrdFundModalInfo.path = "";
	}

	//保存添加策略组合资金
	$scope.unitlistAddTatrdFundSure = function () {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;   //验证（17，3）浮点数
		if ($scope.currentTatrdFund.acid == "") {
			cms.message.error("请选择一个资产账户");
			return;
		}
		if ($scope.currentTatrdFund.currencyid == "") {
			cms.message.error("请选择核算币种");
			return;
		}
		if (!fReg.test($scope.currentTatrdFund.totalamt)) {
			cms.message.error("请正确输入余额");
			return;
		}
		var reqData = {
			body: {
				trid: $scope.currentTatrdFund.trid,
				acid: $scope.currentTatrdFund.acid,
				currencyid: $scope.currentTatrdFund.currencyid,
				totalamt: $scope.currentTatrdFund.totalamt,
				changeShare: $scope.currentTatrdFund.changeShare ? 1 : 0
			}
		}
		unitlistService.addTatrdFund(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功", 5);
				$scope.currentTatrdFund.refresh = true;
				$scope.unitlistHideTatrdFundModal();
				$scope.unitlistRefreshTatrdFund();
				$scope.unitlistRefreshTatrdBalance();
			}
			else {
				cms.message.error("操作失败：" + res.msret.msg);
			}
		})
	}

	//刷新策略组合资金
	$scope.unitlistRefreshTatrdFund = function () {
		var reqData = {
			body: {
				trid: $scope.currentTatrdFund.trid
			}
		}
		unitlistService.getTatrdFund(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.currentTatrdFund.fundList.splice(0, $scope.currentTatrdFund.fundList.length);
				$scope.currentTatrdFund.fundList = res.body;
				$scope.$apply();
			}
			else {
				cms.message.error("数据刷新失败，请点击刷新按钮重新刷新");
			}
		})
	}

	//编辑组合策略资金
	$scope.unitlistTatrdFundEdit = function (index) {
		$scope.currentTatrdFund.acid = $scope.currentTatrdFund.fundList[index].acid;
		$scope.currentTatrdFund.currencyid = $scope.currentTatrdFund.fundList[index].currencyid;
		$scope.currentTatrdFund.briefcode = $scope.currentTatrdFund.fundList[index].briefcode;
		$scope.currentTatrdFund.curencychname = $scope.currentTatrdFund.fundList[index].curencychname;
		$scope.currentTatrdFund.curencyenname = $scope.currentTatrdFund.fundList[index].curencyenname;
		$scope.currentTatrdFund.show_currency = $scope.currentTatrdFund.curencychname + "(" + $scope.currentTatrdFund.briefcode + ")"
		$scope.currentTatrdFund.totalamt = $scope.currentTatrdFund.fundList[index].totalamt;
		$scope.currentTatrdFund.option = "1";
		$scope.currentTatrdFund.changeamt = "0.000";
		$scope.currentTatrdFund.result = $scope.currentTatrdFund.totalamt;
		$scope.currentTatrdFund.changeShare = false;
		$scope.currentTatrdFund.current_totalshare = Number($scope.currentTatrdFund.totalshare);
		$scope.unitlistShowTatrdFundModal($scope.tatrdFundModalInfo.stateEnum.editTatrdFund);
	}

	//选择调整操作
	$scope.unitlistTatrdFundEditOptionChange = function () {
		$scope.currentTatrdFund.changeamt = "0.000";
		$scope.currentTatrdFund.result = $scope.currentTatrdFund.totalamt;
	}

	//输入操作的值
	$scope.unitlistTatrdFundEditChangeInput = function () {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{0,15})?$/;
		if (!fReg.test($scope.currentTatrdFund.changeamt)) {
			$scope.currentTatrdFund.changeamt = "";
			$scope.currentTatrdFund.result = $scope.currentTatrdFund.totalamt;
			return;
		}
		if ($scope.currentTatrdFund.option == "1") {
			$scope.currentTatrdFund.result = Number($scope.currentTatrdFund.totalamt) + Number($scope.currentTatrdFund.changeamt);
		}
		else {
			if (Number($scope.currentTatrdFund.totalamt) < Number($scope.currentTatrdFund.changeamt)) {
				$scope.currentTatrdFund.changeamt = $scope.currentTatrdFund.totalamt;
			}
			$scope.currentTatrdFund.result = Number($scope.currentTatrdFund.totalamt) - Number($scope.currentTatrdFund.changeamt);
		}
		$scope.currentTatrdFund.result = Number($scope.currentTatrdFund.result).toFixed(3);
		$scope.unitlistRefreshShare(2);
	}

	//直接调整
	$scope.unitlistTatrdFundEditResult = function () {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{0,15})?$/;
		if (!fReg.test($scope.currentTatrdFund.result)) {
			$scope.currentTatrdFund.result = "";
			return;
		}
		var list = $scope.currentTatrdFund.result.split('.');
		if (list.length == 2 && list[1].length >= 3) {
			$scope.currentTatrdFund.result = list[0] + '.' + list[1].substring(0, 3);
		}
		$scope.unitlistRefreshShare(2);
	}

	//修改余额
	$scope.unitlistEditTatrdFundSure = function () {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;   //验证（17，3）浮点数
		if (!fReg.test($scope.currentTatrdFund.result)) {
			cms.message.error("请正确输入余额");
			return;
		}
		var reqData = {
			body: {
				trid: $scope.currentTatrdFund.trid,
				acid: $scope.currentTatrdFund.acid,
				currencyid: $scope.currentTatrdFund.currencyid,
				option: $scope.currentTatrdFund.option,
				pristineamt: $scope.currentTatrdFund.totalamt,
				totalamt: $scope.currentTatrdFund.result,
				changeShare: $scope.currentTatrdFund.changeShare ? 1 : 0
			}
		}
		unitlistService.updateTatrdFund(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功", 5);
				$scope.currentTatrdFund.refresh = true;
				$scope.unitlistHideTatrdFundModal();
				$scope.unitlistRefreshTatrdFund();
				$scope.unitlistRefreshTatrdBalance();
			}
			else {
				cms.message.error("操作失败：" + res.msret.msg);
			}
		})
	}

	$scope.unitlistRefreshShare = function (type) {
		if ($scope.currentTatrdFund.changeShare == false) {
			$scope.currentTatrdFund.current_totalshare = $scope.currentTatrdFund.totalshare;
		}
		else {
			if (type == 1) {
				$scope.currentTatrdFund.current_totalshare = Number($scope.currentTatrdFund.prenetvalue) == 0 ? 0 : Number((Number($scope.currentTatrdFund.totalint) + Number($scope.currentTatrdFund.totalamt)) / Number($scope.currentTatrdFund.prenetvalue)).toFixed(0);
			}
			else {
				if ($scope.currentTatrdFund.option == 1) {
					$scope.currentTatrdFund.current_totalshare = Number($scope.currentTatrdFund.prenetvalue) == 0 ? 0 : Number((Number($scope.currentTatrdFund.totalint) + Number($scope.currentTatrdFund.changeamt)) / Number($scope.currentTatrdFund.prenetvalue)).toFixed(0);
				}
				else if ($scope.currentTatrdFund.option == 2) {
					$scope.currentTatrdFund.current_totalshare = Number($scope.currentTatrdFund.prenetvalue) == 0 ? 0 : Number((Number($scope.currentTatrdFund.totalint) - Number($scope.currentTatrdFund.changeamt)) / Number($scope.currentTatrdFund.prenetvalue)).toFixed(0);
				}
				else {
					$scope.currentTatrdFund.current_totalshare = Number($scope.currentTatrdFund.prenetvalue) == 0 ? 0 : Number((Number($scope.currentTatrdFund.totalint) + Number($scope.currentTatrdFund.result) - Number($scope.currentTatrdFund.totalamt)) / Number($scope.currentTatrdFund.prenetvalue)).toFixed(0);
				}
			}
		}
	}

	//刷新策略组合汇总资金
	$scope.unitlistRefreshTatrdBalance = function () {
		var reqData = {
			body: {
				trid: $scope.currentTatrdFund.trid,
			}
		}
		unitlistService.getTatrdDetail(reqData, function (tridres) {
			if (tridres.msret.msgcode == "00") {
				if (tridres.body.length > 0) {
					$scope.currentTatrdFund.tatrd_balance = tridres.body[0].tatrd_balance;
					$scope.currentTatrdFund.prenetvalue = tridres.body[0].prenetvalue;
					$scope.currentTatrdFund.totalshare = tridres.body[0].totalshare;
					$scope.currentTatrdFund.totalint = tridres.body[0].totalint;
					$scope.$apply();
				}
				else {
					cms.message.error("刷新汇总资金失败." + tridres.msret.msg);
				}
			}
			else {
				cms.message.error("刷新汇总资金失败." + tridres.msret.msg);
			}
		})
	}

	//资金划转
	$scope.unitlistChangeTatrdFund = function (index, in_state) {
		var fund = $scope.currentTatrdFund.fundList[index];
		$scope.currentTatrdFund.in_state = in_state;
		$scope.currentTatrdFund.in_trday = in_state ? fund.trday : "";
		$scope.currentTatrdFund.out_trday = in_state ? "" : fund.trday;
		$scope.currentTatrdFund.in_acid = in_state ? fund.acid : "";
		$scope.currentTatrdFund.out_acid = in_state ? "" : fund.acid;
		$scope.currentTatrdFund.in_currencyid = in_state ? fund.currencyid : "";
		$scope.currentTatrdFund.out_currencyid = in_state ? "" : fund.currencyid;
		$scope.currentTatrdFund.in_totalamt = in_state ? fund.totalamt : "0.000";
		$scope.currentTatrdFund.out_totalamt = in_state ? "0.000" : fund.totalamt;
		$scope.currentTatrdFund.changeAmt = "0.000";
		$scope.currentTatrdFund.changeRate = "1.000";
		$scope.currentTatrdFund.result = in_state ? fund.totalamt : "0.000";

		//获取资产账户
		$scope.currentTatrdFund.acidList.splice(0, $scope.currentTatrdFund.acidList.length);
		$scope.unitCurrencyList.splice(0, $scope.unitCurrencyList.length);
		unitlistService.getTatrdTaact({ body: { trid: $scope.currentTatrdFund.trid } }, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.currentTatrdFund.acidList = res.body;
				if ($scope.currentTatrdFund.acidList.length > 0) {
					$scope.currentTatrdFund.out_acid = in_state ? String($scope.currentTatrdFund.acidList[0].acid) : $scope.currentTatrdFund.out_acid;
					$scope.currentTatrdFund.in_acid = in_state ? $scope.currentTatrdFund.in_acid : String($scope.currentTatrdFund.acidList[0].acid);
				}
				unitlistService.getCurrency({ body: {} }, function (gcres) {
					if (gcres.msret.msgcode == "00") {
						$scope.unitCurrencyList = gcres.body;
						if ($scope.unitCurrencyList.length > 0) {
							$scope.currentTatrdFund.out_currencyid = in_state ? String($scope.unitCurrencyList[0].currencyid) : $scope.currentTatrdFund.out_currencyid;
							$scope.currentTatrdFund.in_currencyid = in_state ? $scope.currentTatrdFund.in_currencyid : String($scope.unitCurrencyList[0].currencyid);
						}
						var reqData = {
							body: {
								trday: $scope.currentTatrdFund.trday,
								trid: $scope.currentTatrdFund.trid,
								acid: $scope.currentTatrdFund.acidList[0].acid,
								currencyid: $scope.unitCurrencyList[0].currencyid
							}
						}
						unitlistService.getTatrdFund(reqData, function (res1) {
							if (res1.msret.msgcode == "00") {
								if (res1.body.length > 0) {
									$scope.currentTatrdFund.in_totalamt = in_state ? $scope.currentTatrdFund.in_totalamt : res1.body[0].totalamt;
									$scope.currentTatrdFund.out_totalamt = in_state ? res1.body[0].totalamt : $scope.currentTatrdFund.out_totalamt;
									$scope.currentTatrdFund.result = in_state ? $scope.currentTatrdFund.result : res1.body[0].totalamt;
									$scope.currentTatrdFund.in_trday = in_state ? $scope.currentTatrdFund.in_trday : res1.body[0].trday;
									$scope.currentTatrdFund.out_trday = in_state ? res1.body[0].trday : $scope.currentTatrdFund.out_trday;
								}
								$scope.unitlistShowTatrdFundModal($scope.tatrdFundModalInfo.stateEnum.changeTatrdFund);
								$scope.$apply();
							}
							else {
								cms.message.error("初始化失败，请稍候重试");
							}
						})
					}
					else {
						cms.message.error("获取币种信息失败，无法进行该操作");
					}
				})
			}
			else {
				cms.message.error("获取产品列表失败，无法进行该操作");
			}
		})
	}

	//账户或者币种改变
	$scope.unitlistTatrdFundChangeInfo = function (type) {
		var reqData = {
			body: {
				trid: $scope.currentTatrdFund.trid
			}
		}
		if (type == "in_acid" || type == "in_currencyid") {
			reqData.body.acid = $scope.currentTatrdFund.in_acid;
			reqData.body.currencyid = $scope.currentTatrdFund.in_currencyid;
		}
		else {
			reqData.body.acid = $scope.currentTatrdFund.out_acid;
			reqData.body.currencyid = $scope.currentTatrdFund.out_currencyid;
		}
		unitlistService.getTatrdFund(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				var amt = "0.000";
				var date = new Date();
				var trday = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
				if (res.body.length > 0) {
					amt = res.body[0].totalamt;
					trday = res.body[0].trday;
				}
				if (type == "in_acid") {
					$scope.currentTatrdFund.in_totalamt = amt;
					$scope.currentTatrdFund.in_trday = String(trday);
					$scope.currentTatrdFund.result = $scope.currentTatrdFund.in_totalamt;
				}
				else if (type == "out_acid") {
					$scope.currentTatrdFund.out_totalamt = amt;
					$scope.currentTatrdFund.out_trday = String(trday);
				}
				else if (type == "in_currencyid") {
					$scope.currentTatrdFund.in_totalamt = amt;
					$scope.currentTatrdFund.in_trday = String(trday);
					$scope.currentTatrdFund.result = $scope.currentTatrdFund.in_totalamt;
					//获取汇率
				}
				else {
					$scope.currentTatrdFund.out_totalamt = amt;
					$scope.currentTatrdFund.out_trday = String(trday);
					//获取汇率
				}
				$scope.currentTatrdFund.changeAmt = "0.000";
				$scope.currentTatrdFund.result = $scope.currentTatrdFund.in_totalamt;
				$scope.$apply();
			}
			else {
				cms.message.error("获取资金余额失败");
			}
		})
	}

	//修改转入资金
	$scope.unitlistTatrdFundChangeAmt = function () {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{0,15})?$/;
		if (!fReg.test($scope.currentTatrdFund.changeAmt)) {
			$scope.currentTatrdFund.changeAmt = "";
			$scope.currentTatrdFund.result = $scope.currentTatrdFund.in_totalamt;
			return;
		}
		if (Number($scope.currentTatrdFund.changeAmt) > Number($scope.currentTatrdFund.out_totalamt)) {
			$scope.currentTatrdFund.changeAmt = $scope.currentTatrdFund.out_totalamt;
		}
		$scope.currentTatrdFund.result = Number(Number($scope.currentTatrdFund.in_totalamt) + $scope.currentTatrdFund.changeRate * $scope.currentTatrdFund.changeAmt).toFixed(3);
	}

	//确定划转
	$scope.unitlistTatrdFundChangeSure = function () {
		var fReg = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		if ($scope.currentTatrdFund.out_acid == "") {
			cms.message.error("请选择划出资产账户");
			return;
		}
		if ($scope.currentTatrdFund.out_currencyid == "") {
			cms.message.error("请选择划出资产账户币种");
			return;
		}
		if ($scope.currentTatrdFund.out_totalamt == "0.000") {
			cms.message.error("待划出的资产账户余额不足");
			return;
		}
		if ($scope.currentTatrdFund.in_acid == "") {
			cms.message.error("请选择划入资产账户");
			return;
		}
		if ($scope.currentTatrdFund.in_currencyid == "") {
			cms.message.error("请选择划入资产账户币种");
			return;
		}
		if (!fReg.test($scope.currentTatrdFund.changeAmt)) {
			cms.message.error("请输入划转金额");
			return;
		}
		if ($scope.currentTatrdFund.out_acid == $scope.currentTatrdFund.in_acid && $scope.currentTatrdFund.out_currencyid == $scope.currentTatrdFund.in_currencyid) {
			cms.message.error("请选择不同的账户或币种进行划转.");
			return;
		}
		var reqData = {
			body: {
				in_trday: $scope.currentTatrdFund.in_trday,
				out_trday: $scope.currentTatrdFund.out_trday,
				trid: $scope.currentTatrdFund.trid,
				out_acid: $scope.currentTatrdFund.out_acid,
				out_currencyid: $scope.currentTatrdFund.out_currencyid,
				in_acid: $scope.currentTatrdFund.in_acid,
				in_currencyid: $scope.currentTatrdFund.in_currencyid,
				changeamt: $scope.currentTatrdFund.changeAmt
			}
		};
		unitlistService.changeTatrdFundInAcids(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功", 5);
				$scope.unitlistHideTatrdFundModal();
				$scope.unitlistRefreshTatrdFund();
			}
			else {
				cms.message.error("操作失败：" + res.msret.msg);
			}
		})
	}

	//关联交易账户
	$scope.unitlistTatrdConnectTatract = function (unit) {
		$scope.currentTatrd.caid = unit.caid;
		$scope.currentTatrd.trid = unit.trid;
		$scope.currentTatrd.trname = unit.trname;
		$scope.currentTatrd.searchContent = "";
		$scope.currentTatrd.tatractArray = [];
		var reqData = { body: { caid: unit.caid } };
		var reqData2 = { body: { trid: unit.trid } }
		unitlistService.getTaact(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				unitlistService.getTatract(reqData, function (res1) {
					if (res1.msret.msgcode == "00") {
						unitlistService.getTrdTractMapping(reqData2, function (res2) {
							if (res2.msret.msgcode == "00") {
								$scope.currentTatrd.tatractArray = [];
								var actObj = {};
								for (var i = 0; i < res.body.length; i++) {
									actObj[res.body[i].acid] = res.body[i];
								}
								var mapObj = {};
								for (var i = 0; i < res2.body.length; i++) {
									mapObj[res2.body[i].tracid] = res2.body[i];
								}
								for (var i = 0; i < res1.body.length; i++) {
									var temp = {};
									temp.trid = unit.trid;
									temp.trname = unit.trname;
									temp.acid = res1.body[i].acid;
									temp.acname = !!actObj[res1.body[i].acid] ? actObj[res1.body[i].acid].acname : "-";
									temp.tracid = res1.body[i].tracid;
									temp.tracname = res1.body[i].tracname;
									temp.show = true;
									temp.mapping = !!mapObj[res1.body[i].tracid] ? true : false;
									console.log(temp.trid, temp.trname);
									$scope.currentTatrd.tatractArray.push(temp);
								}
								cms.log("currentTatrd.tatractArray length: " + $scope.currentTatrd.tatractArray.length);
								$scope.unitlistShowModal($scope.modalInfo.stateEnum.tatrdConnectTatract);
								$scope.$apply();
							}
							else {
								cms.message.error("获取数据失败，请稍候重试");
								cms.log("获取对应关系失败.", res2.msret.msgcode, res2.msret.msg);
							}
						})
					}
					else {
						cms.message.error("获取数据失败，请稍候重试");
						cms.log("获取交易账户失败.", res1.msret.msgcode, res1.msret.msg);
					}
				})
			}
			else {
				cms.message.error("获取数据失败，请稍候重试");
				cms.log("获取资产账户失败.", res.msret.msgcode, res.msret.msg);
			}
		});
	}

	//过滤
	$scope.unitlistTatrdConnectTatractFilter = function () {
		if ($scope.currentTatrd.searchContent == "") {
			angular.forEach($scope.currentTatrd.tatractArray, function (tatract) {
				tatract.show = true;
			})
			return;
		}
		angular.forEach($scope.currentTatrd.tatractArray, function (tatract) {
			if (tatract.tracid.indexOf($scope.currentTatrd.searchContent) != -1) {
				tatract.show = true;
			}
			else {
				tatract.show = false;
			}
		})
	}

	//保存关联
	$scope.unitlistConnectTatractSure = function () {
		var reqData = { body: { trid: $scope.currentTatrd.trid } };
		reqData.body.data = [];
		angular.forEach($scope.currentTatrd.tatractArray, function (tatract) {
			if (tatract.mapping == true) {
				var temp = {};
				temp.trid = tatract.trid;
				temp.acid = tatract.acid;
				temp.tracid = tatract.tracid;
				reqData.body.data.push(temp);
			}
		})
		unitlistService.updateTrdTatractMapping(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("操作成功.", 5);
				$scope.unitlistHideModal();
				$scope.unitlistGetUnit();
				$scope.$apply();
			}
			else {
				cms.message.error("操作失败." + res.msret.msg);
				cms.log('修改策略组合交易账户映射关系失败.', res.msret.msgcode, res.msret.msg);
			}
		})
	}

	//费率设置----------------------------------------
	$scope.unitlistTatrdRateSet = function (tatrd) {
		$scope.stockFeeRateInfo.currentMarketID = "-1";
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.tatrdRate);
		$scope.currentStockFeeTatrd = tatrd;

		$scope.getTatrdWithTradeMarket(tatrd.trid);
	}

	$scope.clickAddStockFeeRate = function () {
		$scope.stockFeeRateInfo.state = "addFee";
		$scope.resetCommandAndStockFeeRate();
	}

	$scope.getTatrdStockFeeRate = function (options) {
		var requestData = { body: options };
		unitlistService.getTatrdStockFeeRate(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.log("获取交易账户的股票费率失败.", res.msret.msg);
				return;
			}
			$scope.allStockFeeRate = res.body;
			$scope.resetCommandAndStockFeeRate();
			$scope.$apply();
		});
	}

	$scope.resetCommandAndStockFeeRate = function () {
		$scope.allCommand.forEach(function (obj) {
			obj.template = {};
			obj.cmdid = parseInt(obj.cmdid);
			obj.checked = false;
			obj.error = false;
			obj.hadStockFee = false;
			obj.changed = false;
			obj.celltype = 3;
			obj.cellid = $scope.currentStockFeeTatrd.trid;
			obj.valid = false;
			for (var i = 0; i < $scope.tatrdAccountType.length; i++) {
				if ($scope.tatrdAccountType[i].actype == obj.acttype) {
					if (obj.marketid == 0 || cms.binarySearch($scope.tatrdTradeMarket, "marketid", obj.marketid) != -1) {
						obj.valid = true;
						break;
					}
				}
			}


			obj.taxrate = "10";
			obj.commissionrate = "3";
			obj.min_commissionfee = "0";
			obj.max_commissionfee = "999999999.00";
			obj.transrate = "0.2";
			obj.min_transfee = "0";
			obj.max_transfee = "999999999.00";
			obj.handingrate = "0";
			obj.sec_mgt_rate = "0";

			obj.checked_original = false;
			obj.hadStockFee_original = false;
			obj.celltype_original = 6;
			obj.cellid_original = obj.cellid;

			obj.taxrate_original = obj.taxrate;
			obj.commissionrate_original = obj.commissionrate;
			obj.min_commissionfee_original = obj.min_commissionfee;
			obj.max_commissionfee_original = obj.max_commissionfee;
			obj.transrate_original = obj.transrate;
			obj.min_transfee_original = obj.min_transfee;
			obj.max_transfee_original = obj.max_transfee;
			obj.handingrate_original = obj.handingrate;
			obj.sec_mgt_rate_original = obj.sec_mgt_rate;
		});

		$scope.allStockFeeRate.forEach(function (obj) {
			obj.cmdidStr = obj.cmdid;
			obj.cmdid = parseInt(obj.cmdid);

			var commandIndex = cms.binarySearch($scope.allCommand, "cmdid", obj.cmdid);
			if (commandIndex != -1) {
				obj.cmdname = $scope.allCommand[commandIndex].cmdname;
				obj.marketid = $scope.allCommand[commandIndex].marketid;

				$scope.allCommand[commandIndex].checked = true;
				$scope.allCommand[commandIndex].checked_original = true;

				$scope.allCommand[commandIndex].hadStockFee = true;
				$scope.allCommand[commandIndex].celltype = obj.celltype;
				$scope.allCommand[commandIndex].cellid = obj.cellid;

				$scope.allCommand[commandIndex].taxrate = obj.taxrate;
				$scope.allCommand[commandIndex].commissionrate = obj.commissionrate;
				$scope.allCommand[commandIndex].min_commissionfee = obj.min_commissionfee;
				$scope.allCommand[commandIndex].max_commissionfee = obj.max_commissionfee;
				$scope.allCommand[commandIndex].transrate = obj.transrate;
				$scope.allCommand[commandIndex].min_transfee = obj.min_transfee;
				$scope.allCommand[commandIndex].max_transfee = obj.max_transfee;
				$scope.allCommand[commandIndex].handingrate = obj.handingrate;
				$scope.allCommand[commandIndex].sec_mgt_rate = obj.sec_mgt_rate;


				$scope.allCommand[commandIndex].hadStockFee_original = true;
				$scope.allCommand[commandIndex].celltype_original = obj.celltype;
				$scope.allCommand[commandIndex].cellid_original = obj.cellid;

				$scope.allCommand[commandIndex].taxrate_original = obj.taxrate;
				$scope.allCommand[commandIndex].commissionrate_original = obj.commissionrate;
				$scope.allCommand[commandIndex].min_commissionfee_original = obj.min_commissionfee;
				$scope.allCommand[commandIndex].max_commissionfee_original = obj.max_commissionfee;
				$scope.allCommand[commandIndex].transrate_original = obj.transrate;
				$scope.allCommand[commandIndex].min_transfee_original = obj.min_transfee;
				$scope.allCommand[commandIndex].max_transfee_original = obj.max_transfee;
				$scope.allCommand[commandIndex].handingrate_original = obj.handingrate;
				$scope.allCommand[commandIndex].sec_mgt_rate_original = obj.sec_mgt_rate;

			}
		});
	}

	$scope.getStockFeeRateTemplate = function () {
		var requestData = { body: {} };
		unitlistService.getStockFeeRateTemplate(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.log("获取股票费率模板失败.", res.msret.msg);
				return;
			}
			$scope.allStockFeeRateTemplate = res.body;
			$scope.$apply();
		});
	}

	$scope.getCommand = function () {
		var requestData = { body: {} };
		unitlistService.getCommand(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.log("获取所有指令失败.", res.msret.msg);
				return;
			}
			$scope.allCommand = res.body;
			console.log("command",$scope.allCommand )
			$scope.allCommand.forEach(function (command) {
				command.marketid = parseInt(command.marketid);
				command.acttype = parseInt(command.acttype);
			});
		});
	}


	$scope.cancelStockFee = function () {
		$scope.stockFeeRateInfo.state = "showFee";

	}

	$scope.changeFeeTemplate = function (command) {
		command.checked = true;
		command.changed = true;

		command.taxrate = command.template.taxrate;
		command.commissionrate = command.template.commissionrate;
		command.min_commissionfee = command.template.min_commissionfee;
		command.max_commissionfee = command.template.max_commissionfee;
		command.transrate = command.template.transrate;
		command.min_transfee = command.template.min_transfee;
		command.max_transfee = command.template.max_transfee;
		command.handingrate = command.template.handingrate;
		command.sec_mgt_rate = command.template.sec_mgt_rate;
	}

	$scope.clickCheckBox = function (command) {
		command.checked = !command.checked;

		if (!command.checked) {
			command.error = false;
			command.template = {};
			command.taxrate = command.taxrate_original;
			command.commissionrate = command.commissionrate_original;
			command.min_commissionfee = command.min_commissionfee_original;
			command.max_commissionfee = command.max_commissionfee_original;
			command.transrate = command.transrate_original;
			command.min_transfee = command.min_transfee_original;
			command.max_transfee = command.max_transfee_original;
			command.handingrate = command.handingrate_original;
			command.sec_mgt_rate = command.sec_mgt_rate_original;
		}
	}

	$scope.changeStockFeeRate = function (command) {
		command.checked = true;
		command.changed = true;
		command.template = {};

	}

	$scope.refreshStockFee = function () {
		$scope.getTatrdStockFeeRate({ celltype: 3, cellid: $scope.currentStockFeeTatrd.trid });
	}

	$scope.clickEditStockFeeTable = function (index) {
		$scope.stockFeeRateInfo.editStockFeeIndex = index;
	}

	$scope.clickShowStockFeeTable = function (index) {
		$scope.stockFeeRateInfo.showStockFeeIndex = index;
	}

	$scope.checkStockFeeRate = function (stockFeeRate, index) {
		var fReg12_8 = /^(0|([1-9][0-9]{0,3}))(\.[0-9]{1,8})?$/;   //验证（12，8）浮点数
		var fReg17_2 = /^(0|([1-9][0-9]{0,14}))(\.[0-9]{1,2})?$/;   //验证（17，2）浮点数
		stockFeeRate.error = true;
		if (!fReg17_2.test(stockFeeRate.taxrate)) {
			cms.message.error("印花税率不正确");
			return false;
		}
		if (!fReg17_2.test(stockFeeRate.commissionrate)) {
			cms.message.error("交易佣金费率不正确");
			return false;
		}
		if (!fReg17_2.test(stockFeeRate.min_commissionfee)) {
			cms.message.error("最小交易佣金费不正确");
			return false;
		}


		if (!fReg17_2.test(stockFeeRate.max_commissionfee)) {
			cms.message.error("最大交易佣金不正确");
			return false;
		}

		if (!fReg17_2.test(stockFeeRate.transrate)) {
			cms.message.error("买过户费率不正确");
			return false;
		}

		if (!fReg17_2.test(stockFeeRate.min_transfee)) {
			cms.message.error("最小过户费不正确");
			return false;
		}

		if (!fReg17_2.test(stockFeeRate.max_transfee)) {
			cms.message.error("最大过户费不正确");
			return false;
		}

		if (!fReg17_2.test(stockFeeRate.handingrate)) {
			cms.message.error("经手费率值不正确");
			return false;
		}

		if (!fReg17_2.test(stockFeeRate.sec_mgt_rate)) {
			cms.message.error("证管费率不正确");
			return false;
		}
		stockFeeRate.error = false;
		return true;
	}

	$scope.filterCommand = function (obj) {
		for (var i = 0; i < $scope.tatrdAccountType.length; i++) {
			if ($scope.tatrdAccountType[i].actype == obj.acttype) {
				return true;
			}
		}
		return false;
	}


	// $scope.getTradeUnitMarket = function(trid) {
	//     var requestData={body:{trid:trid}};
	//     $scope.tatrdTradeMarket=[];
	//     tradeAccountService.getTradeAccountMarket(requestData,function(res){
	//         if(res.msret.msgcode != '00') {
	//             cms.message.error("获取交易账户的交易市场失败."+res.msret.msg);
	//             return;
	//         }
	//         $scope.tradeUnitMarkets=res.body;
	//         var i = 0,j = 0;
	//         for (; i < $scope.allMarket.length; i++) {
	//             $scope.allMarket[i].checked=false;
	//
	//             for (; j < $scope.tradeUnitMarkets.length; j++) {
	//                 if ($scope.allMarket[i].marketid == $scope.tradeUnitMarkets[j].marketid) {
	//                     $scope.allMarket[i].checked=true;
	//                     ++j;
	//                     break;
	//                 } else if ($scope.allMarket[i].marketid > $scope.tradeUnitMarkets[j].marketid) {
	//                     continue;
	//                 } else  {
	//                     break;
	//                 }
	//
	//             }
	//
	//         }
	//         $scope.$apply();
	//     });
	// }

	$scope.getTatrdWithAccountType = function (trid) {
		var requestData = { body: { trid: trid } };
		unitlistService.getTatrdWithAccountType(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取交易账户所属账户类型失败!", res.msret.msg);
				return;
			}
			$scope.tatrdAccountType = res.body;
			$scope.getTatrdStockFeeRate({ celltype: 3, cellid: trid });
			$scope.$apply();
		});

	}

	$scope.getTatrdWithTradeMarket = function (trid) {
		var requestData = { body: { trid: trid, actypes: [1, 2] } };
		unitlistService.getTatrdWithTradeMarket(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取策略组合的交易市场失败!", res.msret.msg);
				return;
			}
			$scope.tatrdTradeMarket = res.body;
			$scope.tatrdTradeMarket.forEach(function (market) {
				market.marketid = parseInt(market.marketid);
			});
			var i = 0, j = 0;
			for (; i < $scope.allMarket.length; i++) {
				$scope.allMarket[i].checked = false;

				for (; j < $scope.tatrdTradeMarket.length; j++) {
					if ($scope.allMarket[i].marketid == $scope.tatrdTradeMarket[j].marketid) {
						$scope.allMarket[i].checked = true;
						++j;
						break;
					} else if ($scope.allMarket[i].marketid > $scope.tatrdTradeMarket[j].marketid) {
						continue;
					} else {
						break;
					}

				}

			}


			$scope.getTatrdWithAccountType(trid);
		});

	}


	$scope.hideFuturesModal = function () {
		$scope.unitlistHideModal();
	}

	//设置期货费率
	$scope.setFuturesFeerate = function (obj) {
		$scope.currentFuturesFeerate.celltype = 3;
		$scope.currentFuturesFeerate.cellid = obj.trid;
		$scope.currentFuturesFeerate.loadFileAble = false;
		$scope.currentFuturesFeerate.feerateList = [];
		$scope.currentFuturesFeerate.amt_index = -1;
		$scope.currentFuturesFeerate.qty_index = -1;
		$scope.currentFuturesFeerate.userClick = false;
		$scope.currentFuturesFeerate.showtips = false;
		$scope.currentFuturesFeerate.editFeerate = {};
		$scope.getFuturesFeerate();
		$scope.unitlistShowModal($scope.modalInfo.stateEnum.futuresRate);
	}

	//获取期货费率
	$scope.getFuturesFeerate = function () {
		$scope.currentFuturesFeerate.feerateList.splice(0, $scope.currentFuturesFeerate.feerateList.length);
		var reqData = { body: { celltype: $scope.currentFuturesFeerate.celltype, cellid: $scope.currentFuturesFeerate.cellid } };
		unitlistService.getFuturesFeerate(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				$scope.currentFuturesFeerate.feerateList = res.body;
				angular.forEach($scope.currentFuturesFeerate.feerateList, function (feerate) {
					feerate.feerate_by_amt = parseFloat(feerate.feerate_by_amt);
					feerate.feerate_by_qty = parseFloat(feerate.feerate_by_qty);
					if (feerate.offset_flag == 1) {
						feerate.show_offset_flag = "开仓";
					}
					if (feerate.offset_flag == 2) {
						feerate.show_offset_flag = "平仓";
					}
					if (feerate.offset_flag == 3) {
						feerate.show_offset_flag = "平今";
					}
					if (feerate.offset_flag == 4) {
						feerate.show_offset_flag = "平昨";
					}
				});
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.", JSON.stringify(res.msret));
			}
		})
	}

	//导入期货费率
	$scope.loadFuturesFeerateSelectFile = function () {
		// document.getElementById("futures_feerate_form").reset();
		// document.getElementById("futures_feerate_file").click();
		unitlistService.importExcelFile(function (err, res) {
			if (err) return;
			if (res.result == true) {
				$scope.analyseFuturesFeerateLoadData(res.data);
				$scope.$apply();
			}
			else {
				cms.message.error(res.reason);
				cms.log("解析文件失败.", res.reason);
			}
		})
	}

	//解析导入的文件
	$scope.analyseFuturesFeerateLoadData = function (data) {
		if (data.length < 2) {
			cms.message.error("选择的文件无数据，请重新选择.");
			return;
		}
		var iReg = /^(0|([1-9][0-9]*))$/;
		var fReg = /^(0|([1-9][0-9]{0,8}))(\.[0-9]{1,8})?$/;
		var array = [];
		for (var i = 1; i < data.length; i++) {
			if (data[i].length < 6) {
				cms.message.error("第" + (i + 1) + "行存在空数据，请修改后重试.");
				return;
			}
			var temp = {};
			if (!iReg.test(data[i][0])) {
				cms.message.error("第" + (i + 1) + "行合约ID错误，请修改后重试.");
				return;
			}
			temp.contractid = data[i][0];
			temp.contractcode = data[i][1];
			temp.contractchname = data[i][2];
			temp.show_offset_flag = data[i][3];
			if (data[i][3] == "开仓") {
				temp.offset_flag = 1;
			}
			else if (data[i][3] == "平仓") {
				temp.offset_flag = 2;
			}
			else if (data[i][3] == "平昨") {
				temp.offset_flag = 3;
			}
			else if (data[i][3] == "平今") {
				temp.offset_flag = 4;
			}
			else {
				cms.message.error("第" + (i + 1) + "行开平方向错误，请修改后重试.");
				return;
			}
			if (!fReg.test(data[i][4])) {
				cms.message.error("第" + (i + 1) + "行成交额费率错误，请修改后重试.");
				return;
			}
			temp.feerate_by_amt = data[i][4];
			if (!fReg.test(data[i][5])) {
				cms.message.error("第" + (i + 1) + "行每手费率值错误，请修改后重试.");
				return;
			}
			temp.feerate_by_qty = data[i][5];
			temp.celltype = $scope.currentFuturesFeerate.celltype;
			temp.cellid = $scope.currentFuturesFeerate.cellid;
			array.push(temp);
		}
		$scope.currentFuturesFeerate.feerateList.splice(0, $scope.currentFuturesFeerate.feerateList.length);
		angular.forEach(array, function (feerate) {
			$scope.currentFuturesFeerate.feerateList.push(feerate)
		})
		$scope.currentFuturesFeerate.loadFileAble = true;
	}

	//编辑期货费率取消编辑
	$scope.editFuturesFeerateClickBody = function (e) {
		if ($scope.currentFuturesFeerate.userClick == true) {
			$scope.currentFuturesFeerate.userClick = false;
			return;
		}
		$scope.currentFuturesFeerate.amt_index = -1;
		$scope.currentFuturesFeerate.qty_index = -1;
		$scope.$apply();
		document.body.removeEventListener('click', $scope.editFuturesFeerateClickBody, false);
		e.preventDefault();
	}

	//编辑期货费率
	$scope.editFuturesFeerate = function (index, type) {
		if (type == 1) {
			$scope.currentFuturesFeerate.amt_index = index;
			$scope.currentFuturesFeerate.qty_index = -1;
			$scope.currentFuturesFeerate.editFeerate.celltype = $scope.currentFuturesFeerate.celltype;
			$scope.currentFuturesFeerate.editFeerate.cellid = $scope.currentFuturesFeerate.cellid;
			$scope.currentFuturesFeerate.editFeerate.contractid = $scope.currentFuturesFeerate.feerateList[index].contractid;
			$scope.currentFuturesFeerate.editFeerate.offset_flag = $scope.currentFuturesFeerate.feerateList[index].offset_flag;
			$scope.currentFuturesFeerate.editFeerate.feerate_by_amt = $scope.currentFuturesFeerate.feerateList[index].feerate_by_amt;
		}
		else {
			$scope.currentFuturesFeerate.amt_index = -1;
			$scope.currentFuturesFeerate.qty_index = index;
			$scope.currentFuturesFeerate.editFeerate.celltype = $scope.currentFuturesFeerate.celltype;
			$scope.currentFuturesFeerate.editFeerate.cellid = $scope.currentFuturesFeerate.cellid;
			$scope.currentFuturesFeerate.editFeerate.contractid = $scope.currentFuturesFeerate.feerateList[index].contractid;
			$scope.currentFuturesFeerate.editFeerate.offset_flag = $scope.currentFuturesFeerate.feerateList[index].offset_flag;
			$scope.currentFuturesFeerate.editFeerate.feerate_by_qty = $scope.currentFuturesFeerate.feerateList[index].feerate_by_qty;
		}
		$scope.currentFuturesFeerate.userClick = true;
		document.body.addEventListener('click', $scope.editFuturesFeerateClickBody, false);
	}

	//判断期货费率输入--检测Esc,回车
	$scope.futuresFeerateEditKeyup = function (event, type) {
		var fReg = /^(0|([1-9][0-9]{0,8}))(\.[0-9]{1,8})?$/;
		if (event.keyCode == 27) {
			$scope.currentFuturesFeerate.amt_index = -1;
			$scope.currentFuturesFeerate.qty_index = -1;
			document.body.addEventListener('click', $scope.editFuturesFeerateClickBody, false);
		}
		if (event.keyCode == 13) {
			if (type == 1) {
				if (!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_amt)) {
					cms.message.error("请正确输入成交额费率");
					return;
				}
				else {
					if ($scope.currentFuturesFeerate.loadFileAble == true) {
						$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.amt_index].feerate_by_amt = $scope.currentFuturesFeerate.editFeerate.feerate_by_amt;
						$scope.currentFuturesFeerate.amt_index = -1;
						document.body.addEventListener('click', $scope.editFuturesFeerateClickBody, false);
					}
					else {
						var reqData = {
							body: {
								cellid: $scope.currentFuturesFeerate.editFeerate.cellid,
								celltype: $scope.currentFuturesFeerate.editFeerate.celltype,
								contractid: $scope.currentFuturesFeerate.editFeerate.contractid,
								offset_flag: $scope.currentFuturesFeerate.editFeerate.offset_flag,
								feerate_by_amt: $scope.currentFuturesFeerate.editFeerate.feerate_by_amt
							}
						};
						unitlistService.updateFuturesFeerate(reqData, function (res) {
							if (res.msret.msgcode == "00") {
								cms.message.success("修改成功.");
								$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.amt_index].feerate_by_amt = $scope.currentFuturesFeerate.editFeerate.feerate_by_amt;
								$scope.currentFuturesFeerate.amt_index = -1;
								document.body.addEventListener('click', $scope.editFuturesFeerateClickBody, false);
								$scope.$apply();
							}
							else {
								cms.message.error("修改成交额费率失败." + res.msret.msgcode);
								cms.log("修改成交额费率失败.", JSON.stringify(res.msret));
							}
						})
					}
				}
			}
			else {
				if (!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_qty)) {
					cms.message.error("请正确输入每手费率值");
					return;
				}
				else {
					if ($scope.currentFuturesFeerate.loadFileAble == true) {
						$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.qty_index].feerate_by_qty = $scope.currentFuturesFeerate.editFeerate.feerate_by_qty;
						$scope.currentFuturesFeerate.qty_index = -1;
						document.body.addEventListener('click', $scope.editFuturesFeerateClickBody, false);
					}
					else {
						var reqData = {
							body: {
								cellid: $scope.currentFuturesFeerate.editFeerate.cellid,
								celltype: $scope.currentFuturesFeerate.editFeerate.celltype,
								contractid: $scope.currentFuturesFeerate.editFeerate.contractid,
								offset_flag: $scope.currentFuturesFeerate.editFeerate.offset_flag,
								feerate_by_qty: $scope.currentFuturesFeerate.editFeerate.feerate_by_qty
							}
						};
						unitlistService.updateFuturesFeerate(reqData, function (res) {
							if (res.msret.msgcode == "00") {
								cms.message.success("修改成功.");
								$scope.currentFuturesFeerate.feerateList[$scope.currentFuturesFeerate.qty_index].feerate_by_qty = $scope.currentFuturesFeerate.editFeerate.feerate_by_qty;
								$scope.currentFuturesFeerate.qty_index = -1;
								document.body.addEventListener('click', $scope.editFuturesFeerateClickBody, false);
								$scope.$apply();
							}
							else {
								cms.message.error("修改每手费率值." + res.msret.msgcode);
								cms.log("修改每手费率值.", JSON.stringify(res.msret));
							}
						})
					}
				}
			}
		}
	}

	//编辑期货费率获得输入
	$scope.futuresFeerateEditInput = function (type) {
		var fReg = /^((0|([1-9][0-9]{0,8}))(\.[0-9]{0,17})?)?$/;
		if (type == 1) {
			if (!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_amt)) {
				$scope.currentFuturesFeerate.editFeerate.feerate_by_amt = "0";
			}
		}
		else {
			if (!fReg.test($scope.currentFuturesFeerate.editFeerate.feerate_by_qty)) {
				$scope.currentFuturesFeerate.editFeerate.feerate_by_qty = "0";
			}
		}
	}

	//确定导入
	$scope.futuresLoadFeerate = function () {
		var reqData = { body: {} };
		reqData.body.celltype = $scope.currentFuturesFeerate.celltype;
		reqData.body.cellid = $scope.currentFuturesFeerate.cellid;
		reqData.body.data = [];
		angular.forEach($scope.currentFuturesFeerate.feerateList, function (feerate) {
			var temp = {};
			temp.cellid = feerate.cellid;
			temp.celltype = feerate.celltype;
			temp.contractid = feerate.contractid;
			temp.offset_flag = feerate.offset_flag;
			temp.feerate_by_amt = feerate.feerate_by_amt;
			temp.feerate_by_qty = feerate.feerate_by_qty;
			reqData.body.data.push(temp);
		})
		unitlistService.loadFuturesFeerate(reqData, function (res) {
			if (res.msret.msgcode == "00") {
				cms.message.success("导入成功.", 5);
				$scope.currentFuturesFeerate.loadFileAble = false;
				$scope.getFuturesFeerate();
			}
			else {
				cms.message.error("导入失败." + res.msret.msg);
				cms.log("导入失败.", JSON.stringify(res.msret));
			}
		})
	}

	//取消导入
	$scope.futuresLoadFeerateCancel = function () {
		$scope.currentFuturesFeerate.loadFileAble = false;
		$scope.getFuturesFeerate();
	}

	$scope.saveMultipleStockFeeRate = function () {

		var i = 0, j = 0, delCommand = [], addCommand = [], editCommand = [];
		for (; i < $scope.allCommand.length; i++) {

			if (j >= $scope.allStockFeeRate.length && $scope.allCommand[i].checked) {
				if (!$scope.checkStockFeeRate($scope.allCommand[i], i)) { //校验数据正确性
					return;
				}
				if ($scope.allCommand[i].changed && $scope.allCommand[i].checked_original) {
					addCommand.push({
						cmdid: $scope.allCommand[i].cmdid, taxrate: $scope.allCommand[i].taxrate, commissionrate: $scope.allCommand[i].commissionrate, min_commissionfee: $scope.allCommand[i].min_commissionfee,
						max_commissionfee: $scope.allCommand[i].max_commissionfee, transrate: $scope.allCommand[i].transrate, min_transfee: $scope.allCommand[i].min_transfee,
						max_transfee: $scope.allCommand[i].max_transfee, handingrate: $scope.allCommand[i].handingrate, sec_mgt_rate: $scope.allCommand[i].sec_mgt_rate
					});
				} else {
					addCommand.push({
						cmdid: $scope.allCommand[i].cmdid, taxrate: $scope.allCommand[i].taxrate, commissionrate: $scope.allCommand[i].commissionrate, min_commissionfee: $scope.allCommand[i].min_commissionfee,
						max_commissionfee: $scope.allCommand[i].max_commissionfee, transrate: $scope.allCommand[i].transrate, min_transfee: $scope.allCommand[i].min_transfee,
						max_transfee: $scope.allCommand[i].max_transfee, handingrate: $scope.allCommand[i].handingrate, sec_mgt_rate: $scope.allCommand[i].sec_mgt_rate
					});
				}
				continue;
			}

			for (; j < $scope.allStockFeeRate.length; j++) {
				if ($scope.allCommand[i].cmdid == $scope.allStockFeeRate[j].cmdid) {
					if ($scope.allCommand[i].checked) {
						if ($scope.allCommand[i].changed && $scope.allCommand[i].checked_original) {

							if (!$scope.checkStockFeeRate($scope.allCommand[i], i)) { //校验数据正确性
								return;
							}

							editCommand.push({
								cmdid: $scope.allCommand[i].cmdid, taxrate: $scope.allCommand[i].taxrate, commissionrate: $scope.allCommand[i].commissionrate, min_commissionfee: $scope.allCommand[i].min_commissionfee,
								max_commissionfee: $scope.allCommand[i].max_commissionfee, transrate: $scope.allCommand[i].transrate, min_transfee: $scope.allCommand[i].min_transfee,
								max_transfee: $scope.allCommand[i].max_transfee, handingrate: $scope.allCommand[i].handingrate, sec_mgt_rate: $scope.allCommand[i].sec_mgt_rate
							});
						}
					} else {
						delCommand.push({ cmdid: $scope.allCommand[i].cmdid });
					}

					++j;
					break;
				} else if ($scope.allCommand[i].cmdid > $scope.allStockFeeRate[j].cmdid) { //实际这种情况不存在
					continue;
				} else {
					if ($scope.allCommand[i].checked) {
						if (!$scope.checkStockFeeRate($scope.allCommand[i], i)) { //校验数据正确性
							return;
						}

						addCommand.push({
							cmdid: $scope.allCommand[i].cmdid, taxrate: $scope.allCommand[i].taxrate, commissionrate: $scope.allCommand[i].commissionrate, min_commissionfee: $scope.allCommand[i].min_commissionfee,
							max_commissionfee: $scope.allCommand[i].max_commissionfee, transrate: $scope.allCommand[i].transrate, min_transfee: $scope.allCommand[i].min_transfee,
							max_transfee: $scope.allCommand[i].max_transfee, handingrate: $scope.allCommand[i].handingrate, sec_mgt_rate: $scope.allCommand[i].sec_mgt_rate
						});
					}
					break;
				}

			}
		}
		while (j < $scope.allStockFeeRate.length) {
			delCommand.push({ cmdid: $scope.allStockFeeRate[j].cmdid });
			++j
		}

		if (delCommand.length == 0 && addCommand.length == 0 && editCommand.length == 0) {
			cms.message.success("没有修改任何股票费率");
			$scope.stockFeeRateInfo.state = "showFee";
			return;
		}

		var requestData = { body: { celltype: 3, cellid: $scope.currentStockFeeTatrd.trid, delCommand: delCommand, addCommand: addCommand, editCommand: editCommand } };
		unitlistService.saveMultipleStockFeeRate(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("设置策略组合的指令失败." + res.msret.msg);
				return;
			}
			$scope.stockFeeRateInfo.state = "showFee";
			cms.message.success("设置策略组合的指令成功!");
			$scope.getTatrdStockFeeRate({ celltype: 3, cellid: $scope.currentStockFeeTatrd.trid });
			$scope.$apply();
		});
	}


});
