angular.module("cmsController").controller("traderWhiteListCtrl",function($scope,mainService,$rootScope,traderWhiteListService) {
	$scope.showSubguide = true;
	$scope.tamgrList = [];
	$scope.tacapList = [];
	$scope.tatrdList = [];
	$scope.traderList = [];
	$scope.guideTree = [];
	$scope.marketList = [];
	$scope.currentMenu = {};
	$scope.tatrd_showTip = false;
	$scope.trader_showTip = false;
	$scope.tatrd_showMenu = false;
	$scope.tatrd_showMenu_auto = false;
	$scope.trader_showMenu = false;
	$scope.trader_showMenu_auto = false;
	$scope.currentLoadType = 0;

	$scope.tatrdsaList = [];
	$scope.tradersaList = [];
	$scope.codeTraders = [];

	$scope.tatrdClickTr = -1;
	$scope.traderClickTr = -1;
	$scope.codeClickTr = -1;

	$scope.codeEditItem = null;
	$scope.traderEditItem = null;
	$scope.editUserClick = false;

	$scope.currentCodeTrader = {};
	$scope.currentTradersa = {};

	$scope.tatrdFilterContent = "";
	$scope.traderFilterContent = "";
	$scope.codeFilterContent = "";

	//交易单元券表
	$scope.tc_keyName = "";
	$scope.tc_reverse = false;
	$scope.tcSortFunction = null;
	//单只券明细
	$scope.c_keyName = "";
	$scope.c_reverse = false;
	$scope.cSortFunction = null;
	//交易员券表
	$scope.td_keyName = "";
	$scope.td_reverse = false;
	$scope.tdSortFunction = null;

	//交易单元点击表头
	$scope.tcClickTableHeader = function(keyName,isNumber) {
		$scope.tc_reverse = $scope.tc_keyName == keyName ? !$scope.tc_reverse : false;
		$scope.tc_keyName = keyName;
		$scope.tcSortFunction = mainService.getSortFunc($scope.tc_reverse,isNumber);
	}

	//单只券点击表头
	$scope.cClickTableHeader = function(keyName,isNumber) {
		$scope.c_reverse = $scope.c_keyName == keyName ? !$scope.c_reverse : false;
		$scope.c_keyName = keyName;
		$scope.cSortFunction = mainService.getSortFunc($scope.c_reverse,isNumber);
	}

	//交易员点击表头
	$scope.tdClickTableHeader = function(keyName,isNumber) {
		$scope.td_reverse = $scope.td_keyName == keyName ? !$scope.td_reverse : false;
		$scope.td_keyName = keyName;
		$scope.tdSortFunction = mainService.getSortFunc($scope.td_reverse,isNumber);
	}

	$scope.$on("changedManager_broadcast", function(event, message) {
        $scope.twlGetUnit();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.twlGetUnit();

	});

    $scope.$on("changedTradeUnit_broadcast", function(event, message) {
        $scope.twlGetUnit();
    });

	$scope.$on("changedTrader_broadcast", function(event, message) {
        $scope.twlGetUnit();
    });


	$scope.twlInit = function() {
		$scope.currentMenu.type = "";
		$scope.currentMenu.id = "";
		$scope.currentMenu.name = "";
		$scope.currentMenu.maid = "";
		$scope.currentMenu.caid = "";
		$scope.currentMenu.trid = "";
		$scope.tatrd_showTip = false;
		$scope.trader_showTip = false;
		$scope.tatrd_showMenu = false;
		$scope.tatrd_showMenu_auto = false;
		$scope.trader_showMenu = false;
		$scope.trader_showMenu_auto = false;
		$scope.currentLoadType = 0;
		$scope.editUserClick = false;
		$scope.tatrdFilterContent = "";
		$scope.traderFilterContent = "";
		$scope.codeFilterContent = "";
		$scope.codeEditItem = null;
		$scope.traderEditItem = null;
		$scope.twlGetMarket();
		$scope.twlGetUnit();
	}
	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function(){
		if(document.getElementById("traderwhite_file")) {
			document.getElementById("traderwhite_file").onchange = function() {
				//解析文件
				traderWhiteListService.parseExcelFile(document.getElementById("traderwhite_file"),function(res) {
					if(res.result == true) {
						$scope.twlAnlazyData(res.data);
					}
					else {
						cms.log(res.reason);
						cms.message.error("解析文件失败，请修改文件后重试.");
					}
				})
			}
		}
	});
	//切换菜单
	$scope.$on("whitelist-changepage",function() {
		if($scope.currentMenu.type == "trid") {
			$scope.tatrdClickTr = -1;
			$scope.codeTraders.splice(0,$scope.codeTraders.length);
			$scope.twlGetTatrdSa($scope.currentMenu.id);
		}
		else {
			$scope.traderClickTr = -1;
			$scope.twlGetTradersa($scope.currentMenu.id);
		}
	})
	//获取市场信息
	$scope.twlGetMarket = function() {
		$scope.marketList.splice(0,$scope.marketList.length);
		traderWhiteListService.getMarket({body:{}},function(res) {
			if(res.msret.msgcode == "00") {
				//$scope.marketList = res.body;
				angular.forEach(res.body,function(market) {
					$scope.marketList.push(market.marketid);
				})
			}
			else {
				cms.message.error("获取市场失败，无法进行导入操作.");
				cms.log("获取市场失败.",JSON.stringify(res.msret));
			}
		})
	}
	//获取列表
	$scope.twlGetUnit = function() {
		$scope.tamgrList.splice(0,$scope.tamgrList.length);
		$scope.tacapList.splice(0,$scope.tacapList.length);
		$scope.tatrdList.splice(0,$scope.tatrdList.length);
		$scope.traderList.splice(0,$scope.traderList.length);
		traderWhiteListService.getTamgr({body:{}},function(mares) {
			if(mares.msret.msgcode == "00") {
				traderWhiteListService.getTacap({body:{}},function(cares) {
					if(cares.msret.msgcode == "00") {
						traderWhiteListService.getTatrd({body:{}},function(trres) {
							if(trres.msret.msgcode == "00") {
								traderWhiteListService.getTrader({body:{}},function(trares) {
									if(trares.msret.msgcode == "00") {
										$scope.tamgrList = mares.body;
										$scope.tacapList = cares.body;
										$scope.tatrdList = trres.body;
										$scope.traderList = trares.body;
										//构造树
										$scope.twlMakeGuideTree();
										$scope.$apply();
									}
									else {
										cms.message.error("获取单元列表失败.");
										cms.log("获取交易员失败.",JSON.stringify(trares.msret));
									}
								})
							}
							else {
								cms.message.error("获取单元列表失败.");
								cms.log("获取策略组合失败.",JSON.stringify(trres.msret));
							}
						})
					}
					else {
						cms.message.error("获取单元列表失败.");
						cms.log("获取产品失败.",JSON.stringify(cares.msret));
					}
				})
			}
			else {
				cms.message.error("获取单元列表失败.");
				cms.log("获取资产管理人失败.",JSON.stringify(mares.msret));
			}
		})
	}

    //将单元列表构造成树
	$scope.twlMakeGuideTree = function() {
		$scope.tatrdList.forEach(function(obj){
			obj.traders = [];
		});

		for (var i = 0; i < $scope.traderList.length; i++) {
			$scope.traderList[i].trid=parseInt($scope.traderList[i].trid);
			$scope.traderList[i].traderid=parseInt($scope.traderList[i].traderid);

			for (var j = 0; j < $scope.tatrdList.length; ++j) {
				if ($scope.tatrdList[j].trid == $scope.traderList[i].trid) {
					$scope.tatrdList[j].traders.push($scope.traderList[i]);
				}
			}
		}

		$scope.tamgrList.forEach(function(obj){
			obj.maid=parseInt(obj.maid);
			obj.products=[];
			obj.showChildren=true;
		});

		for (var i = 0; i < $scope.tacapList.length; i++) {
			$scope.tacapList[i].showChildren=true;
			$scope.tacapList[i].maid=parseInt($scope.tacapList[i].maid);
			$scope.tacapList[i].caid=parseInt($scope.tacapList[i].caid);

			var maIndex=cms.binarySearch($scope.tamgrList,"maid",($scope.tacapList[i].maid));
			if (maIndex != -1) {
				$scope.tamgrList[maIndex].products.push($scope.tacapList[i]);
				$scope.tacapList[i].combs=[];
				$scope.tacapList[i].accounts=[];
			} else {
				var newManager = {maid: $scope.tacapList[i].maid, products: [], showChildren: true};
				newManager.products.push($scope.tacapList[i]);
				$scope.tacapList[i].combs=[];
				$scope.tacapList[i].accounts=[];
				$scope.tamgrList.push(newManager);
			}
		}

		for (var i = 0; i < $scope.tatrdList.length; i++) {
			$scope.tatrdList[i].maid=parseInt($scope.tatrdList[i].maid);
			$scope.tatrdList[i].caid=parseInt($scope.tatrdList[i].caid);
			$scope.tatrdList[i].trid=parseInt($scope.tatrdList[i].trid);
			$scope.tatrdList[i].showChildren=true;

			var maIndex=cms.binarySearch($scope.tamgrList,"maid",($scope.tatrdList[i].maid));
			if (maIndex != -1) {
				var caIndex=cms.binarySearch($scope.tamgrList[maIndex].products,"caid",($scope.tatrdList[i].caid));
				if (caIndex != -1) {
					$scope.tamgrList[maIndex].products[caIndex].combs.push($scope.tatrdList[i]);
				} else {
					var newProduct = {maid: $scope.tatrdList[i].maid, caid: $scope.tatrdList[i].caid, showChildren: true, combs: [], accounts: []};
					newProduct.combs.push($scope.tatrdList[i]);
					$scope.tamgrList[maIndex].products.push(newProduct);
				}
			} else {
				var newManager = {maid: $scope.tatrdList[i].maid, products: [], showChildren: true};
				var newProduct = {maid: $scope.tatrdList[i].maid, caid: $scope.tatrdList[i].caid, showChildren: true, combs: [], accounts: []};
				newProduct.combs.push($scope.tatrdList[i]);
				newManager.products.push(newProduct);
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
                    temp1.children = [];
                    if(typeof temp1.combs != "undefined") {
                        for(var k = 0; k < temp1.combs.length; k ++) {
                            var temp2 = temp1.combs[k];
                            temp2.menuId = temp2.trid;
                            temp2.menuName = temp2.trname;
                            temp2.type = 'trid';
							temp2.children = [];
							if(typeof temp2.traders != "undefined") {
								for(var l = 0; l < temp2.traders.length; l ++) {
									var temp3 = temp2.traders[l];
									temp3.menuId = temp3.traderid;
									temp3.menuName = temp3.oname;
									temp3.type = 'trader';
									temp2.children.push(temp3);
								}
							}
                            temp1.children.push(temp2);
                        }
                    }
                    temp.children.push(temp1);
                }
            }
            destArray.push(temp);
        }
    }

	//通过maid,caid,trid获取交易员列表
	$scope.twlGetTradersFromGuideTree = function(maid,caid,trid,array) {
		for(var i = 0; i < $scope.guideTree.length ; i ++) {
			if($scope.guideTree[i].maid == maid ) {
				for(var j = 0; j < $scope.guideTree[i].children.length;j ++) {
					if($scope.guideTree[i].children[j].caid == caid) {
						for(var k = 0; k < $scope.guideTree[i].children[j].children.length; k ++) {
							if($scope.guideTree[i].children[j].children[k].trid == trid) {
								angular.forEach($scope.guideTree[i].children[j].children[k].children,function(trader) {
									array.push(trader.traderid);
								})
								return ;
							}
						}
						return ;
					}
				}
				return ;
			}
		}
	}

	//点击菜单
	$scope.twlClickMenu = function(obj) {
		$scope.currentMenu.type = obj.type;
		$scope.currentMenu.id = obj.menuId;
		$scope.currentMenu.name = obj.menuName;
		$scope.currentMenu.maid = obj.maid;
		$scope.currentMenu.caid = obj.caid;
		$scope.currentMenu.trid = obj.trid;
		if(obj.type == 'trid') {
			$scope.tatrdClickTr = -1;
			$scope.codeTraders.splice(0,$scope.codeTraders.length);
			$scope.twlGetTatrdSa(obj.menuId);
		}
		else {
			$scope.traderClickTr = -1;
			$scope.twlGetTradersa(obj.menuId);
		}
	}

	//获取单元券表
	$scope.twlGetTatrdSa = function(trid) {
		var reqData = {body:{trid:trid}};
		$scope.tatrdsaList.splice(0,$scope.tatrdsaList.length);
		traderWhiteListService.getTatrdSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tatrdsaList = res.body;
				angular.forEach($scope.tatrdsaList,function(sa) {
					sa.validsa = parseFloat(sa.validsa);
					sa.usedsa = parseFloat(sa.usedsa);
					sa.nextsa = sa.validsa - sa.usedsa;
					sa.show = true;
				})
				$scope.twlFilterTatrdsa();
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//过滤单元券表
	$scope.twlFilterTatrdsa = function() {
		if($scope.tatrdFilterContent == "") {
			angular.forEach($scope.tatrdsaList,function(sa) {
				sa.show = true;
			})
		}
		else {
			angular.forEach($scope.tatrdsaList,function(sa) {
				if(sa.marketcode.indexOf($scope.tatrdFilterContent) != -1 || sa.chabbr.indexOf($scope.tatrdFilterContent) != -1 || sa.tracid.indexOf($scope.tatrdFilterContent) != -1 || sa.tracname.indexOf($scope.tatrdFilterContent) != -1) {
					sa.show = true;
				}
				else {
					sa.show = false;
				}
			})
		}
	}

	//获取交易员券表
	$scope.twlGetTradersa = function(traderid) {
		var reqData = {body:{traderid:traderid}};
		$scope.tradersaList.splice(0,$scope.tradersaList.length);
		traderWhiteListService.getTraderSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tradersaList = res.body;
				angular.forEach($scope.tradersaList,function(sa) {
					sa.validsa = parseFloat(sa.validsa);
					sa.usedsa = parseFloat(sa.usedsa);
					sa.nextsa = sa.validsa - sa.usedsa;
					sa.show = true;
				})
				$scope.twlFilterTradersa();
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//过滤交易员券表
	$scope.twlFilterTradersa = function() {
		if($scope.traderFilterContent == "") {
			angular.forEach($scope.tradersaList,function(sa) {
				sa.show = true;
			})
		}
		else {
			angular.forEach($scope.tradersaList,function(sa) {
				if(sa.marketcode.indexOf($scope.traderFilterContent) != -1 || sa.chabbr.indexOf($scope.traderFilterContent) != -1 || sa.tracid.indexOf($scope.traderFilterContent) != -1 || sa.tracname.indexOf($scope.traderFilterContent) != -1) {
					sa.show = true;
				}
				else {
					sa.show = false;
				}
			})
		}
	}

	//获取交易员明细
	$scope.twlGetCodeTraders = function(obj) {
		var reqData = {body:{trid:obj.trid,tracid:obj.tracid,ukcode:obj.ukcode,satype:obj.satype}};
		$scope.codeTraders.splice(0,$scope.codeTraders.length);
		traderWhiteListService.getCodeTraderSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.codeTraders = res.body;
				angular.forEach($scope.codeTraders,function(sa) {
					sa.trid = obj.trid;
					sa.acid = obj.acid;
					sa.tracid = obj.tracid;
					sa.tracname = obj.tracname;
					sa.satype = obj.satype;
					sa.ukcode = obj.ukcode;
					sa.chabbr = obj.chabbr;
					sa.marketid = obj.marketid;
					sa.marketcode = obj.marketcode;
					sa.marketchname = obj.marketchname;
					sa.briefcode = obj.briefcode;
					sa.validsa = parseFloat(sa.validsa);
					sa.usedsa = parseFloat(sa.usedsa);
					sa.nextsa = sa.validsa - sa.usedsa;
					sa.show = true;
				})
				$scope.twlFilterCodeTrader();
				$scope.$apply();
			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//过滤交易员明细
	$scope.twlFilterCodeTrader = function() {
		if($scope.codeFilterContent == "") {
			angular.forEach($scope.codeTraders,function(trader) {
				trader.show = true;
			})
		}
		else {
			angular.forEach($scope.codeTraders,function(trader) {
				if(trader.traderid.indexOf($scope.codeFilterContent) != -1 || trader.oname.indexOf($scope.codeFilterContent) != -1) {
					trader.show = true;
				}
				else {
					trader.show = false;
				}
			})
		}
	}

	//关闭选择
	$scope.twlClickBody1 = function(e) {
		if($scope.tatrd_showMenu == true && $scope.tatrd_showMenu_auto == false) {
			$scope.tatrd_showMenu = false;
			$scope.$apply();
			document.body.removeEventListener('click',$scope.twlClickBody1,false);
		}
		$scope.tatrd_showMenu_auto = false;
		e.preventDefault();
	}
	$scope.twlClickBody2 = function(e) {
		if($scope.trader_showMenu == true && $scope.trader_showMenu_auto == false) {
			$scope.trader_showMenu = false;
			$scope.$apply();
			document.body.removeEventListener('click',$scope.twlClickBody2,false);
		}
		$scope.trader_showMenu_auto = false;
		e.preventDefault();
	}

	//显示提示
	$scope.twlShowLoadTip = function(state,type) {
		switch (type) {
			case 1:
				if($rootScope.menuRight.indexOf(2002004003001) == -1) {
					break;
				}
				$scope.tatrd_showTip = state;
				break;
			case 2:
				if($rootScope.menuRight.indexOf(2002004003001) == -1) {
					break;
				}
				$scope.trader_showTip = state;
				break;
			default:
				break;
		}
	}
	//点击导入
	$scope.twlTatrdClickLoad = function(ev) {
		if($scope.currentMenu.type == "") {
			cms.message.error("请先选择策略组合或交易员.");
			return ;
		}
		$scope.tatrd_showTip = false;
		if($scope.tatrd_showMenu == true) {
			$scope.tatrd_showMenu = false;
			document.body.removeEventListener('click',$scope.twlClickBody1,false);
			return ;
		}
		$scope.tatrd_showMenu_auto = true;
		$scope.tatrd_showMenu = true;
		ev.preventDefault();
		document.body.addEventListener('click',$scope.twlClickBody1,false);
	}
	$scope.twlTraderClickLoad = function(ev) {
		$scope.trader_showTip = false;
		if($scope.trader_showMenu == true) {
			$scope.trader_showMenu = false;
			document.body.removeEventListener('click',$scope.twlClickBody2,false);
			return ;
		}
		$scope.trader_showMenu_auto = true;
		$scope.trader_showMenu = true;
		ev.preventDefault();
		document.body.addEventListener('click',$scope.twlClickBody2,false);
	}

	//点击菜单
	$scope.twlClickBtnMenu = function(type) {
		$scope.currentLoadType = type;
		if(type == 1 || type == 2) {
			document.body.removeEventListener('click',$scope.twlClickBody1,false);
			$scope.tatrd_showMenu = false;
		}
		else {
			document.body.removeEventListener('click',$scope.twlClickBody2,false);
			$scope.trader_showMenu = false;
		}
		// document.getElementById("traderwhite_file_form").reset();
		// document.getElementById("traderwhite_file").click();
		traderWhiteListService.importExcelFile(function(err,res) {
			if(err) return ;
			if(res.result == true) {
				$scope.twlAnlazyData(res.data);
			}
			else {
				cms.log(res.reason);
				cms.message.error(res.reason);
			}
		})
	}

	//判断元素是否在数组中
	$scope.twlObjIsInArray = function(array,obj) {
		for(var i = 0; i < array.length; i ++) {
			if(array[i] == obj) {
				return true;
			}
		}
		return false;
	}

	//解析文件
	$scope.twlAnlazyData = function(data) {
		var traders = [];
		//先做本地数据校验，格式，内容等
		if(data.length < 2) {
			cms.message.error("选择的文件无数据，请重新选择.");
			return ;
		}
		$scope.twlGetTradersFromGuideTree($scope.currentMenu.maid,$scope.currentMenu.caid,$scope.currentMenu.trid,traders);
		var codeReg = /^[0-9]{6}$/;
		var ukReg = /^[1-9][0-9]*$/;
		var saReg = /^(0|([1-9][0-9]*))$/;
		var loadData = [];
		for(var i = 1 ; i < data.length; i ++) {
			if(data[i].length < 9) {
				cms.message.error("第"+(i+1)+"行存在空数据，请修改后重试.");
				return ;
			}
			var temp = {};
			if(!codeReg.test(data[i][0])) {

				cms.message.error("第"+(i+1)+"行证券代码错误.");
				return ;
			}
			temp.marketcode = data[i][0];
			temp.chabbr = data[i][1];
			if(!ukReg.test(data[i][2])) {
				cms.message.error("第"+(i+1)+"行ukcode错误.");
				return ;
			}
			temp.ukcode = data[i][2];
			if($scope.twlObjIsInArray($scope.marketList,data[i][3]) == false) {
				cms.message.error("第"+(i+1)+"行无法匹配市场.");
				return ;
			}
			temp.marketid = data[i][3];
			if($scope.twlObjIsInArray(traders,data[i][4]) == false) {
				cms.message.error("第"+(i+1)+"行无法匹配交易员.");
				return ;
			}
			temp.traderid = data[i][4];
			temp.acid = data[i][5];
			temp.tracid = data[i][6];
			if(data[i][7] == "底仓") {
				temp.satype = 10;
			}
			else if(data[i][7] == "预约券") {
				temp.satype = 20;
			}
			else {
				cms.message.error("第"+(i+1)+"行券类型错误.");
				return ;
			}
			if(!saReg.test(data[i][8])) {
				cms.message.error("第"+(i+1)+"行数量值错误.");
				return ;
			}
			temp.validsa = data[i][8];
			temp.trid = $scope.currentMenu.trid;
			loadData.push(temp);
		}
		//获取交易账户
		traderWhiteListService.getTatract({body:{caid:$scope.currentMenu.caid}},function(tracres) {
			if(tracres.msret.msgcode == "00") {
				for(var m = 0; m < loadData.length; m ++) {
					var n = 0;
					for(n = 0; n < tracres.body.length;n++) {
						if(tracres.body[n].acid == loadData[m].acid && tracres.body[n].tracid == loadData[m].tracid) {
							break;
						}
					}
					if(n >= tracres.body.length) {
						cms.message.error("第"+(m+2)+"行无法匹配资产账户和交易账户.");
						return ;
					}
				}
				//导入数据库
				var reqData = {body:{}};
				reqData.body.trid  = $scope.currentMenu.trid;
				reqData.body.data = loadData;
				//写入
				if($scope.currentLoadType == 1 || $scope.currentLoadType == 3) {
					traderWhiteListService.loadTstradersaReset(reqData,function(res) {
						if(res.msret.msgcode == "00") {
							cms.message.success("导入成功.",5);
							if($scope.currentMenu.type == 'trid') {
								$scope.tatrdClickTr = -1;
								$scope.codeTraders.splice(0,$scope.codeTraders.length);
								$scope.twlGetTatrdSa($scope.currentMenu.id);
							}
							else {
								$scope.traderClickTr = -1;
								$scope.twlGetTradersa($scope.currentMenu.id);
							}
						}
						else {
							cms.message.error("导入失败."+res.msret.msg);
							cms.log("导入数据失败.",JSON.stringify(res.msret));
						}
					})
				}
				else {
					traderWhiteListService.loadTstradersaAdd(reqData,function(res1) {
						if(res1.msret.msgcode == "00") {
							cms.message.success("导入成功.",5);
							if($scope.currentMenu.type == 'trid') {
								$scope.tatrdClickTr = -1;
								$scope.codeTraders.splice(0,$scope.codeTraders.length);
								$scope.twlGetTatrdSa($scope.currentMenu.id);
							}
							else {
								$scope.traderClickTr = -1;
								$scope.twlGetTradersa($scope.currentMenu.id);
							}
						}
						else {
							cms.message.error("导入失败."+res1.msret.msg);
							cms.log("导入数据失败.",JSON.stringify(res1.msret));
						}
					})
				}
			}
			else {
				cms.message.error("无法校验资产账户,请重试.");
				cms.log("获取资产账户失败.",JSON.stringify(tracres.msret));
			}
		})
	}

	//点击策略组合券表表格
	$scope.twlClickTatrdTr = function(index) {
		$scope.tatrdClickTr = index;
		$scope.codeClickTr = -1;
		var temp = {};
		temp.trid = $scope.tatrdsaList[index].trid;
		temp.acid = $scope.tatrdsaList[index].acid;
		temp.tracid = $scope.tatrdsaList[index].tracid;
		temp.tracname = $scope.tatrdsaList[index].tracname;
		temp.satype = $scope.tatrdsaList[index].satype;
		temp.ukcode = $scope.tatrdsaList[index].ukcode;
		temp.chabbr = $scope.tatrdsaList[index].chabbr;
		temp.marketid = $scope.tatrdsaList[index].marketid;
		temp.marketcode = $scope.tatrdsaList[index].marketcode;
		temp.marketchname = $scope.tatrdsaList[index].marketchname;
		temp.briefcode = $scope.tatrdsaList[index].briefcode;
		$scope.twlGetCodeTraders(temp);
	}

	//点击交易员券表
	$scope.twlClickTraderTr = function(index) {
		$scope.traderClickTr = index;
	}

	//点击明细
	$scope.twlClickCodeTr = function(index) {
		$scope.codeClickTr = index;
	}

	//取消编辑
	$scope.twlClickBodyEdit = function(e) {
		if($scope.editUserClick == true) {
			$scope.editUserClick = false;
			return ;
		}
		if($scope.codeEditItem != null) {
			$scope.codeEditItem.editVol = false;
			$scope.codeEditItem = null;
		}
		if( $scope.traderEditItem != null ) {
			$scope.traderEditItem.editVol = false;
			$scope.traderEditItem = null;
		}
		$scope.$apply();
		document.body.removeEventListener('click',$scope.twlClickBodyEdit,false);
		e.preventDefault();
	}

	//编辑交易员可用数量
	$scope.twlEditCodeTraders = function(trader) {
		if($rootScope.menuRight.indexOf(2002004003003) == -1) {
			return ;
		}
		if($scope.codeEditItem != null) {
			$scope.codeEditItem.editVol = false;
		}
		$scope.currentCodeTrader.trid = trader.trid;
		$scope.currentCodeTrader.acid = trader.acid;
		$scope.currentCodeTrader.tracid = trader.tracid;
		$scope.currentCodeTrader.ukcode = trader.ukcode;
		$scope.currentCodeTrader.marketid = trader.marketid;
		$scope.currentCodeTrader.marketcode = trader.marketcode;
		$scope.currentCodeTrader.traderid = trader.traderid;
		$scope.currentCodeTrader.satype = trader.satype;
		$scope.currentCodeTrader.validsa = trader.validsa;
		trader.editVol = true;
		$scope.editUserClick = true;
		$scope.codeEditItem = trader;
		document.body.addEventListener('click',$scope.twlClickBodyEdit,false);
	}
	//编辑交易员可用数量
	$scope.twlEditTradersa = function(tradersa) {
		if($rootScope.menuRight.indexOf(2002004003003) == -1) {
			return ;
		}
		if( $scope.traderEditItem != null ) {
			$scope.traderEditItem.editVol = false;
		}
		$scope.currentTradersa.trid = tradersa.trid;
		$scope.currentTradersa.acid = tradersa.acid;
		$scope.currentTradersa.tracid = tradersa.tracid;
		$scope.currentTradersa.ukcode = tradersa.ukcode;
		$scope.currentTradersa.marketid = tradersa.marketid;
		$scope.currentTradersa.marketcode = tradersa.marketcode;
		$scope.currentTradersa.traderid = tradersa.traderid;
		$scope.currentTradersa.satype = tradersa.satype;
		$scope.currentTradersa.validsa = tradersa.validsa;
		tradersa.editVol = true;
		$scope.traderEditItem = tradersa;
		$scope.editUserClick = true;
		document.body.addEventListener('click',$scope.twlClickBodyEdit,false);
	}

	//重新获取
	$scope.twlEditGetTatrdsa = function(sano) {
		$scope.tatrdClickTr = -1;
		var reqData = {body:{trid:$scope.currentMenu.trid}};
		$scope.tatrdsaList.splice(0,$scope.tatrdsaList.length);
		traderWhiteListService.getTatrdSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tatrdsaList = res.body;
				angular.forEach($scope.tatrdsaList,function(sa,index) {
					if(sa.sano == sano) {
						$scope.tatrdClickTr = index;
					}
					sa.validsa = parseFloat(sa.validsa);
					sa.usedsa = parseFloat(sa.usedsa);
					sa.nextsa = sa.validsa - sa.usedsa;
					sa.show = true;
				})
				$scope.twlFilterTatrdsa();
				if($scope.tatrdClickTr != -1) {
					$scope.twlGetCodeTraders($scope.tatrdsaList[$scope.tatrdClickTr]);
				}
				else {
					$scope.codeTraders.splice(0,$scope.codeTraders.length);
					$scope.$apply();
				}

			}
			else {
				cms.message.error("获取数据失败.");
				cms.log("获取数据失败.",JSON.stringify(res.msret));
			}
		})
	}

	//编辑按下键
	$scope.twlEditValidKeyup = function(e,type) {
		var reg = /^(0|([1-9][0-9]*))$/;
		if(e.keyCode == 27) {
			if($scope.codeEditItem != null) {
				$scope.codeEditItem.editVol = false;
				$scope.codeEditItem = null;
			}
			if( $scope.traderEditItem != null ) {
				$scope.traderEditItem.editVol = false;
				$scope.traderEditItem = null;
			}
			document.body.removeEventListener('click',$scope.twlClickBodyEdit,false);
		}
		if(e.keyCode == 13) {
			if(type == 1) {
				if(!reg.test($scope.currentCodeTrader.validsa)) {
					cms.message.error("请正确输入数量");
					return;
				}
				else {
					var reqData = {body:$scope.currentCodeTrader};
					traderWhiteListService.updateTstraderValidsa(reqData,function(res) {
						if(res.msret.msgcode == "00") {
							cms.message.success("修改成功.",5);
							$scope.codeEditItem.editVol = false;
							$scope.codeEditItem = null;
							document.body.removeEventListener('click',$scope.twlClickBodyEdit,false);
							$scope.twlEditGetTatrdsa($scope.tatrdsaList[$scope.tatrdClickTr].sano);
						}
						else {
							cms.message.error("修改失败."+res.msret.msg);
							cms.log("修改失败.",JSON.stringify(res.msret));
						}
					})
				}
			}
			else {
				if(!reg.test($scope.currentTradersa.validsa)) {
					cms.message.error("请正确输入数量");
					return;
				}
				else {
					var reqData1 = {body:$scope.currentTradersa};
					traderWhiteListService.updateTstraderValidsa(reqData1,function(res1) {
						if(res1.msret.msgcode == "00") {
							cms.message.success("修改成功.",5);
							$scope.traderEditItem.editVol = false;
							$scope.traderEditItem = null;
							document.body.removeEventListener('click',$scope.twlClickBodyEdit,false);
							$scope.twlGetTradersa($scope.currentMenu.id);
						}
						else {
							cms.message.error("修改失败."+res1.msret.msg);
							cms.log("修改失败.",JSON.stringify(res1.msret));
						}
					})
				}
			}
		}
	}

	//编辑获得输入
	$scope.twlEditValidInput = function(type) {
		var reg = /^(0|([1-9][0-9]*))?$/;
		if(type == 1) {
			if(!reg.test($scope.currentCodeTrader.validsa)) {
				$scope.currentCodeTrader.validsa = "0";
			}
		}
		else {
			if(!reg.test($scope.currentTradersa.validsa)) {
				$scope.currentTradersa.validsa = "0";
			}
		}
	}

	//导出单元
	$scope.twlTatrdExports = function() {
		if($scope.currentMenu.type == "") {
			cms.message.error("请先选择策略组合或交易员.");
			return ;
		}
		var date = new Date();
		var time = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
		var title = $scope.currentMenu.trid + " 交易单元交易员券表" + time ;
		$scope.twlExportsFile(title,$scope.currentMenu.trid);
	}
	//导出交易员
	$scope.twlTraderExports = function() {
		if($scope.currentMenu.type == "") {
			cms.message.error("请先选择策略组合或交易员.");
			return ;
		}
		var date = new Date();
		var time = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
		var title = $scope.currentMenu.id + " 交易员券表" + time ;
		$scope.twlExportsFile(title,$scope.currentMenu.trid,$scope.currentMenu.id);
	}

	//导出
	$scope.twlExportsFile = function(title,trid,traderid) {
		var reqData = {body:{trid:trid}};
		if(typeof traderid != "undefined") {
			reqData.body.traderid = traderid;
		}
		traderWhiteListService.getTraderSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				if(res.body.length == 0) {
					cms.message.error("无可导出的数据.");
					return ;
				}
				else {
					var exportData = {};
					var headers = ["证券代码","证券名称","ukcode","市场编码","交易员编号","交易账户编号","券类型","数量"];
					exportData.headers = headers;
					exportData.fileType = "xlsx";
					exportData.fileName = title;
					exportData.data = [];
					angular.forEach(res.body,function(sa) {
						var temp = [];
						temp.push(sa.marketcode);
						temp.push(sa.chabbr);
						temp.push(sa.ukcode);
						temp.push(sa.marketid);
						temp.push(sa.traderid);
						temp.push(sa.tracid);
						temp.push(sa.satype == 10 ? "底仓" : "预约券");
						temp.push(parseFloat(sa.validsa));
						exportData.data.push(temp);
					})
					traderWhiteListService.exportExcelFile(exportData,function(err1,res1) {
						if(err1) return ;
						if(res1.result == true) {
							cms.message.success("导出成功.",5);
						}
						else {
							cms.message.error("导出文件失败，"+res1.reason);
							cms.log("导出文件失败：",res1.reason);
						}
					})
				}
			}
			else {
				cms.message.error("导出失败，无法获取导出数据.");
				cms.log("获取交易员券表失败.",JSON.stringify(res.msret));
			}
		})
	}

})
