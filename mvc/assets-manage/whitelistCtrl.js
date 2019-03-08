angular.module('cmsController').controller('whitelistCtrl',function($scope,$ocLazyLoad,$rootScope,whitelistService,mainService) {
	$scope.showSubguide = true;						//是否显示导航列表
	$scope.unitList = [];							// 导航树
	$scope.maidList = [];							// 资产管理人
	$scope.caidList = [];							// 产品
	$scope.tridList = [];							// 策略组合（暂时没用）
	$scope.acidList = [];							// 资产账户
	$scope.pageType = 0;							// 当前页面 1、账户白名单 2、策略组合白名单 3、交易员白名单
	$scope.loadedTraderpage = false;				// 是否加载过交易员白名单页面
	$scope.traderPagePath = "";						// 交易员界面

	//账户管理页面选项
	$scope.security_type = 10;                         // 账户白名单类型：10底仓 20预约券
	$scope.security_showFirstMenu = false;             // 账户白名单是否显示可配券菜单
	$scope.security_showFirstMenu_auto = false;
	$scope.security_showFirstMenu_func = false;
	$scope.security_showFirstTip = false;				// 账户白名单是否显示可配券提示
	$scope.security_showSecondMenu = false;				// 账户白名单是否显示计划券菜单
	$scope.security_showSecondMenu_auto = false;
	$scope.security_showSecondMenu_func = false;
	$scope.security_showSecondTip = false;				// 账户白名单是否显示计划券提示
	$scope.security_loadtype = 0;
	$scope.security_searchContent = "";
	$scope.currentSecurity = {};
	$scope.tatractSaList = [];
	$scope.tatractLoadAble = false;

	//策略组合管理页面选项
	$scope.tatrd_type = 10;                         // 账户白名单类型：10底仓 20预约券
	$scope.tatrd_showFirstMenu = false;             // 账户白名单是否显示可配券菜单
	$scope.tatrd_showFirstMenu_auto = false;
	$scope.tatrd_showFirstMenu_func = false;
	$scope.tatrd_showFirstTip = false;				// 账户白名单是否显示可配券提示
	$scope.tatrd_showSecondMenu = false;				// 账户白名单是否显示计划券菜单
	$scope.tatrd_showSecondMenu_auto = false;
	$scope.tatrd_showSecondMenu_func = false;
	$scope.tatrd_showSecondTip = false;				// 账户白名单是否显示计划券提示
	$scope.tatrd_loadtype = 0;
	$scope.tatrd_searchContent = "";
	$scope.currentTatrdSa = {};
	$scope.tatrdSaList = [];
	$scope.tatrdLoadAble = false;

	$scope.tatractList = [];
	$scope.marketList = [];

	$scope.currentCaid = "";
	$scope.currentAcid = "";
	$scope.currentAcname = "";
	$scope.modalInfo = {};

	$scope.currentEditTatract = null;   //当前编辑的账户白名单
	$scope.currentEditTatrd = null;		//当前编辑的单元白名单
	$scope.editUserClick = false;

	//账户选中行
	$scope.security_click_tr = -1;
	//单元选中行
	$scope.tatrd_click_tr = -1;

	$scope.tatrd_keyName = "";
	$scope.tatrd_reverse = false;
	$scope.tatrdSortFunction = null;

	$scope.tatract_keyName = "";
	$scope.tatract_reverse = false;
	$scope.tatractSortFunction = null;

	//单元点击表头
	$scope.tatrdClickTableHeader = function(keyName,isNumber) {
		$scope.tatrd_reverse = $scope.tatrd_keyName == keyName ? !$scope.tatrd_reverse : false;
		$scope.tatrd_keyName = keyName;
		$scope.tatrdSortFunction = mainService.getSortFunc($scope.tatrd_reverse,isNumber);
	}

	//账户点击表头
	$scope.tatractClickTableHeader = function(keyName,isNumber) {
		$scope.tatract_reverse = $scope.tatract_keyName == keyName ? !$scope.tatract_reverse : false;
		$scope.tatract_keyName = keyName;
		$scope.tatractSortFunction = mainService.getSortFunc($scope.tatract_reverse,isNumber);
	}


	$scope.$on("changedManager_broadcast", function(event, message) {
		$scope.whitelistGetUnitList();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
		$scope.whitelistGetUnitList();

	});

	$scope.$on("changedAssetAccount_broadcast", function(event, message) {
		$scope.whitelistGetUnitList();
	});

	$scope.whitelistInit = function() {
		$scope.showSubguide = true;
		if($rootScope.menuRight.indexOf(2002004001) != -1) {
			$scope.pageType = 1;
		}
		else {
			if($rootScope.menuRight.indexOf(2002004002) != -1) {
				$scope.pageType = 2;
			}
			else {
				if($rootScope.menuRight.indexOf(2002004003) != -1) {
					$scope.pageType = 3;
				}
			}
		}
		$scope.security_type = 10;
		$scope.loadedTraderpage = false;				// 是否加载过交易员白名单页面
		$scope.traderPagePath = "";						// 交易员界面

		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.addSecurityValid = 1;
		$scope.security_searchContent = "";
		$scope.security_click_tr = -1;
		$scope.tatrd_click_tr = -1;
		$scope.whitelistGetUnitList();
	}

	//账户页面点击行
	$scope.whitelistTatractClickTr = function(index) {
		$scope.security_click_tr = index;
	}

	//单元页面点击行
	$scope.whitelistTatrdClickTr = function(index) {
		$scope.tatrd_click_tr = index;
	}

	//账户页面加载完成
	$scope.whitelistAssetsLoad = function() {
		if(document.getElementById("whitelist_security_file")) {
			document.getElementById("whitelist_security_file").onchange = function() {
				var path = document.getElementById("whitelist_security_file").value;
				var list = path.split(".");
				var fileType = list[list.length - 1].toUpperCase();
				if(fileType == "XLS" || fileType == "XLSX" || fileType == "CSV") {
					whitelistService.parseExcelFile(document.getElementById("whitelist_security_file"),function(res) {
						if(res.result == true) {
							$scope.whitelistSecurityAnlazyData(res.data);
						}
						else {
							cms.log(res.reason);
							cms.message.error("解析文件失败，请修改文件后重试.");
						}
					})
				}
				else {
					cms.message.error("当前仅支持.xls/.xlsx/.csv格式的文件");
				}
			}
		}
	}

	//单元页面加载完成
	$scope.whitelistTatrdLoad =function() {
		if(document.getElementById("whitelist_tatrd_file")) {
			document.getElementById("whitelist_tatrd_file").onchange = function() {
				var path = document.getElementById("whitelist_tatrd_file").value;
				var list = path.split(".");
				var fileType = list[list.length - 1].toUpperCase();
				if(fileType == "XLS" || fileType == "XLSX" || fileType == "CSV") {
					whitelistService.parseExcelFile(document.getElementById("whitelist_tatrd_file"),function(res) {
						if(res.result == true) {
							$scope.whitelistTatrdAnlazyData(res.data);
						}
						else {
							cms.log(res.reason);
							cms.message.error("解析文件失败，请修改文件后重试.");
						}
					})
				}
				else {
					cms.message.error("当前仅支持.xls/.xlsx/.csv格式的文件");
				}
			}
		}
	}

	//获取单元列表
	$scope.whitelistGetUnitList = function() {
		$scope.unitList.splice(0,$scope.unitList.length);
		//获取资产管理人
		whitelistService.getTamgr({body:{}},function(maidres) {
			if(maidres.msret.msgcode == "00") {
				$scope.maidList.splice(0,$scope.maidList.length);
				$scope.maidList = maidres.body;
				// 开始 -- 获取产品
				whitelistService.getTacap({body:{}},function(caidres) {
					if(caidres.msret.msgcode == "00") {
						$scope.caidList.splice(0,$scope.caidList.length);
						$scope.caidList = caidres.body;
						//开始 -- 获取产品
						whitelistService.getTaact({body:{}},function(acidres) {
							if(acidres.msret.msgcode == "00") {
								$scope.acidList.splice(0,$scope.acidList.length);
								$scope.acidList = acidres.body;
								//构造树
								$scope.whitelistMakeUnitTree();
								$scope.$apply();
							}
							else {
								cms.message.error("获取资产账户失败."+acidres.msret.msg)
							}
						})
						//结束 -- 获取产品
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
	$scope.whitelistMakeUnitTree = function() {
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

		$scope.unitList.splice(0,$scope.unitList.length);
		$scope.makeNewTree($scope.maidList,$scope.unitList);

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

	//点击菜单
	$scope.whitelistClickMenu = function(obj) {
		$scope.currentCaid = obj.caid;
		$scope.currentAcid = obj.acid;
		$scope.currentAcname = obj.acname;
		//获取数据
		if($scope.pageType == 1) {
			$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
		}
		else if($scope.pageType == 2) {
			$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
		}
		else {

		}
	}

	//打开弹框
	$scope.whitelistShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.addSecurityValid:
				$scope.modalInfo.path = "../assets-manage/whitelist-addSecurityValid.html";
				break;
			default:
				break;
		}
	}

	//弹框加载完成
	$scope.whitelistModalLoadReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addSecurityValid:
				mainService.showModal("whitelist_modal_back","whitelist_add_security_valid_modal","whitelist_add_security_valid_modal_title");
				break;
			default:

		}
	}

	//关闭弹框
	$scope.whitelistHideModal = function() {
		mainService.hideModal("whitelist_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	//获取数据
	$scope.whitelistGetTatractSa = function(acid,satype) {
		$scope.tatractLoadAble = false;
		var reqData = {
			body: {
				acid: acid,
				satype: satype
			}
		};
		whitelistService.getTatractSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tatractSaList = res.body;
				angular.forEach($scope.tatractSaList,function(tatractsa) {
					tatractsa.show = true;
					if(tatractsa.satype == 10) {
						tatractsa.show_type = "底仓";
					}
					else  if(tatractsa.satype == 20) {
						tatractsa.show_type = "预约券";
					}
					else {
						tatractsa.show_type = "无定义";
					}
					tatractsa.plansa = parseFloat(tatractsa.plansa);
					tatractsa.validsa = parseFloat(tatractsa.validsa);
					tatractsa.usedsa = parseFloat(tatractsa.usedsa);
				})
				if($scope.tatractSaList.length == 0) {
					cms.message.error("当前查询结果为空.")
				}
				$scope.whitelistFilterTatractSa();
				$scope.$apply();
			}
			else {
				$scope.tatractSaList.splice(0,$scope.tatractSaList.length);
				$scope.$apply();
				cms.message.error("获取资产账户券表失败."+res.msret.msg);
				cms.log("获取资产账户券表失败：",res.msret.msgcode,res.msret.msg)
			}
		})
	}

	//过滤数据
	$scope.whitelistFilterTatractSa = function() {
		if($scope.tatractSaList.length == 0) {
			return ;
		}
		if($scope.security_searchContent == "") {
			angular.forEach($scope.tatractSaList,function(tatractsa) {
				tatractsa.show = true;
			})
			return ;
		}
		angular.forEach($scope.tatractSaList,function(tatractsa) {
			if(tatractsa.marketcode.indexOf($scope.security_searchContent) != -1 || tatractsa.chabbr.indexOf($scope.security_searchContent) != -1) {
				tatractsa.show = true;
			}
			else {
				tatractsa.show = false;
			}
		})
	}

	//点击tab
	$scope.whitelistPageTypeChange = function(type) {
		if($scope.pageType == type) {
			return ;
		}
		$scope.pageType = type;
		if($scope.pageType == 1) {
			if($scope.currentAcid == "") {
				return ;
			}
			$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
		}
		else if($scope.pageType == 2) {
			if($scope.currentAcid == "") {
				return ;
			}
			$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
		}
		else {
			if($scope.loadedTraderpage == false) {
				$scope.loadedTraderpage = true;
				$ocLazyLoad.load(["../assets-manage/whitelist-traderCtrl.js","../assets-manage/whitelist-traderService.js","../assets-manage/whitelist-trader.css"]).then(function() {
					$scope.traderPagePath = "../assets-manage/whitelist-trader.html";
				})
			}
			else {
				//发送消息
				$scope.$broadcast("whitelist-changepage");
			}
		}
	}

	$scope.whitelistClickBody1 = function(e) {
		if($scope.security_showFirstMenu == true && $scope.security_showFirstMenu_auto == false) {
			$scope.security_showFirstMenu = false;
			$scope.$apply();
			document.body.removeEventListener('click',$scope.whitelistClickBody1,false);
		}
		$scope.security_showFirstMenu_auto = false;
		e.preventDefault();
	}

	$scope.whitelistClickBody2 = function(e) {
		if($scope.security_showSecondMenu == true && $scope.security_showSecondMenu_auto == false) {
			$scope.security_showSecondMenu = false;
			$scope.$apply();
			document.body.removeEventListener('click',$scope.whitelistClickBody2,false);
		}
		$scope.security_showSecondMenu_auto = false;
		e.preventDefault();
	}

	//显示提示
	$scope.whitelistShowLoadTip = function(state,type) {
		switch (type) {
			case 1:
				if($rootScope.menuRight.indexOf(2002004001001) == -1) {
					break;
				}
				$scope.security_showFirstTip = state;
				break;
			case 2:
				if($rootScope.menuRight.indexOf(2002004001002) == -1) {
					break;
				}
				$scope.security_showSecondTip = state;
			case 3:
				if($rootScope.menuRight.indexOf(2002004002001) == -1) {
					break;
				}
				$scope.tatrd_showFirstTip = state;
				break;
			case 4:
				if($rootScope.menuRight.indexOf(2002004002002) == -1) {
					break;
				}
				$scope.tatrd_showSecondTip = state;
				break;
			default:
				break;
		}
	}

	//点击账户导入可配券
	$scope.whitelistSecurityClickFirst = function(ev) {
		if($scope.security_showFirstMenu == true) {
			$scope.security_showFirstMenu = false;
			document.body.removeEventListener('click',$scope.whitelistClickBody1,false);
			return ;
		}
		$scope.security_showFirstMenu_auto = true;
		$scope.security_showFirstMenu = true;
		ev.preventDefault();
		document.body.addEventListener('click',$scope.whitelistClickBody1,false);
	}

	//点击账户导入计划券
	$scope.whitelistSecurityClickSecond = function(ev) {
		if($scope.security_showSecondMenu == true) {
			$scope.security_showSecondMenu = false;
			document.body.removeEventListener('click',$scope.whitelistClickBody2,false);
			return ;
		}
		$scope.security_showSecondMenu = true;
		$scope.security_showSecondMenu_auto = true;
		ev.preventDefault();
		document.body.addEventListener('click',$scope.whitelistClickBody2,false);
	}

	//选择导入方式
	$scope.whitelistSecurityClickSelect = function(type) {
 		if($scope.currentAcid == "") {
			cms.message.error("请选择一个资产账户");
			return ;
		}
		if(type == 1 || type == 2) {
			document.body.removeEventListener('click',$scope.whitelistClickBody1,false);
			$scope.security_showFirstMenu = false;
		}
		if(type == 3 || type == 4) {
			document.body.removeEventListener('click',$scope.whitelistClickBody2,false);
			$scope.security_showSecondMenu = false;
		}
		$scope.security_loadtype = type;
		if($scope.tatractLoadAble == true) {
			$scope.whitelistTatractCancelLoad();
		}
		// document.getElementById("whitelist_security_form").reset();
		// document.getElementById("whitelist_security_file").click();
		whitelistService.importExcelFile(function(err,res) {
			if(err) return ;
			if(res.result == true) {
				$scope.whitelistSecurityAnlazyData(res.data);
			}
			else {
				cms.log(res.reason);
				cms.message.error(res.reason);
			}
		})
	}

	//分析导入的数据
	$scope.whitelistSecurityAnlazyData = function(data) {
		if(data.length <= 1) {
			cms.message.error("选择的文件无数据，请重新选择.")
			return ;
		}
		else {
			//获取交易账户
			whitelistService.getTatract({body:{acid:$scope.currentAcid}},function(acres) {
				if(acres.msret.msgcode == "00") {
					whitelistService.getMarket({body:{}},function(gmres) {
						if(gmres.msret.msgcode == "00") {
							var temp = [];
							for(var i = 1; i < data.length; i ++) {
								if(data[i].length < 6) {
									cms.message.error("第"+(i+1)+"行数据有空项，请修改后重试.");
									return ;
								}
								//设置市场
								var k = 0;
								var tmpObj = {};
								for(k = 0; k < gmres.body.length ; k ++) {
									if(gmres.body[k].marketid == data[i][2]) {
										tmpObj.tracid = data[i][0];
										tmpObj.tracname = "-";
										tmpObj.ukcode = data[i][1];
										tmpObj.marketid = data[i][2];
										tmpObj.marketchname = gmres.body[k].marketchname;
										tmpObj.briefcode = gmres.body[k].briefcode;
										tmpObj.marketcode = data[i][3];
										tmpObj.chabbr = data[i][4];
										tmpObj.satype = $scope.security_type;
										tmpObj.show_type = $scope.security_type == 10 ? "底仓" : "预约券";
										tmpObj.plansa = ($scope.security_loadtype == 1 || $scope.security_loadtype == 2) ? 0 : data[i][5];
										tmpObj.validsa = ($scope.security_loadtype == 1 || $scope.security_loadtype == 2) ? data[i][5] : 0;
										tmpObj.usedsa = 0;
										tmpObj.volume = data[i][5];
										break;
									}
								}
								if(k >= gmres.body.length) {
									cms.message.error("第"+(i+1)+"行无法匹配市场，请修改后重试.");
									return ;
								}
								var m = 0;
								for(m = 0; m < acres.body.length; m++) {
									if(acres.body[m].tracid == tmpObj.tracid) {
										tmpObj.tracname = acres.body[m].tracname;
										break;
									}
								}
								if(m >= acres.body.length) {
									cms.message.error("第"+(i+1)+"行无法匹配交易账户，请修改后重试.");
									return ;
								}
								tmpObj.trindex = i + 1;
								temp.push(tmpObj);
							}
							$scope.tatractSaList.splice(0,$scope.tatractSaList.length);
							$scope.security_searchContent = "";
							$scope.tatractLoadAble = true;
							angular.forEach(temp,function(tatractsa) {
								tatractsa.show = true;
								$scope.tatractSaList.push(tatractsa);
							})
							$scope.tatractSaList.sort($scope.whitelistTatractSort);
							$scope.$apply();
						}
						else {
							cms.message.error("查询市场信息失败，请稍候重试.");
							cms.log("查询市场信息失败：",gmres.msret.msgcode,gmres.msret.msg);
						}
					});
				}
				else {
					cms.message.error("查询交易账户失败.");
					cms.log("查询交易账户失败.",acres.msret.msgcode,acres.msret.msg);
				}
			})
		}
	}

	//点击账户添加券
	$scope.whitelistSecurityAddValidsa = function() {
		if($scope.currentAcid == "") {
			cms.message.error("请选择一个资产账户");
			return ;
		}
		$scope.tatractList.splice(0,$scope.tatractList.length);
		$scope.currentSecurity.acid = $scope.currentAcid;
		$scope.currentSecurity.satype = $scope.security_type;
		$scope.currentSecurity.show_acid = $scope.currentAcname + "("+$scope.currentAcid+")";
		$scope.currentSecurity.tracid = "";
		$scope.currentSecurity.ukcode = "";
		$scope.currentSecurity.marketid = "";
		$scope.currentSecurity.marketcode = "";
		$scope.currentSecurity.chabbr = "";
		$scope.currentSecurity.validsa = "";
		$scope.currentSecurity.plansa = "";
		$scope.marketList.splice(0,$scope.marketList.length);
		whitelistService.getMarket({body:{}},function(gmres) {
			if(gmres.msret.msgcode == "00") {
				$scope.marketList = gmres.body;
				if($scope.marketList.length > 0) {
					$scope.currentSecurity.marketid = String(gmres.body[0].marketid);
				}
				var reqData = {
					body: {
						acid:$scope.currentAcid
					}
				};
				whitelistService.getTatract(reqData,function(res) {
					if(res.msret.msgcode == "00") {
						$scope.tatractList = res.body;
						if(res.body.length > 0) {
							$scope.currentSecurity.tracid = String(res.body[0].tracid);
						}
						$scope.whitelistShowModal($scope.modalInfo.stateEnum.addSecurityValid);
						$scope.$apply();
					}
					else {
						cms.message.error("获取交易账户失败,无法进行此操作.");
						cms.log("getTatract",res.msret.msg);
					}
				})
			}
			else {
				cms.message.error("获取市场失败,无法进行此操作.");
				cms.log("getTatract",gmres.msret.msg);
			}
		})
	}

	//账户添加数据输入证券代码
	$scope.whitelistAddTatractSaWincodeChange = function() {
		if($scope.currentSecurity.marketcode == "" || $scope.currentSecurity.marketid == "") {
			$scope.currentSecurity.ukcode = "";
			$scope.currentSecurity.chabbr = "";
			return ;
		}
		var reqData = {
			body: {
				marketid: $scope.currentSecurity.marketid,
				marketcode: $scope.currentSecurity.marketcode.toUpperCase()
			}
		};
		whitelistService.getUkeyInfo(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				if(res.body.length > 0) {
					$scope.currentSecurity.ukcode = res.body[0].ukcode;
					$scope.currentSecurity.chabbr = res.body[0].chabbr;
				}
				else {
					$scope.currentSecurity.ukcode = "";
					$scope.currentSecurity.chabbr = "";
				}
				$scope.$apply();
			}
			else {
				$scope.currentSecurity.ukcode = "";
				$scope.currentSecurity.chabbr = "";
				$scope.$apply();
				cms.message.error("查询证券失败。");
				cms.log("查询证券失败：",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//改变可配券
	$scope.whitelistTatractValidSaChange = function() {
		$scope.currentSecurity.plansa = $scope.currentSecurity.validsa;
	}

	//保存添加
	$scope.whitelistTatractAddSaSure = function() {
		var reg = /^(0|([1-9][0-9]{0,14})(\.[0-9]{1-2})?)$/;
		if($scope.currentSecurity.tracid == "") {
			cms.message.error("请选择交易账户.");
			return ;
		}
		if($scope.currentSecurity.ukcode == "") {
			cms.message.error("请选择市场并输入正确的市场代码.");
			return ;
		}
		if(!reg.test($scope.currentSecurity.validsa)) {
			cms.message.error("请正确输入可配券数量");
			return ;
		}
		if(!reg.test($scope.currentSecurity.plansa)) {
			cms.message.error("请正确输入计划券数量");
			return ;
		}
		var reqData = {
			body: {
				acid:$scope.currentSecurity.acid,
				tracid:$scope.currentSecurity.tracid,
				ukcode:$scope.currentSecurity.ukcode,
				marketid:$scope.currentSecurity.marketid,
				marketcode:$scope.currentSecurity.marketcode.toUpperCase(),
				satype:$scope.currentSecurity.satype,
				plansa:$scope.currentSecurity.plansa,
				validsa:$scope.currentSecurity.validsa
			}
		}
		whitelistService.addTatractSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				cms.message.success("操作成功.",5);
				$scope.whitelistHideModal();
				$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
			}
			else {
				cms.message.error('添加数据失败.'+res.msret.msg);
				cms.log("添加数据失败:",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//点击券类型
	$scope.whitelistClickType = function(type) {
		switch (type) {
			case 1:
				if($scope.security_type == 10) {
					return ;
				}
				$scope.security_type = 10;
				if($scope.currentAcid == "") {
					cms.message.error("请选择一个资产账户.");
					return ;
				}
				$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
				break;
			case 2:
				if($scope.security_type == 20) {
					return ;
				}
				$scope.security_type = 20;
				if($scope.currentAcid == "") {
					cms.message.error("请选择一个资产账户.");
					return ;
				}
				$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
				break;
			case 3:
				if($scope.tatrd_type == 10) {
					return ;
				}
				$scope.tatrd_type = 10;
				if($scope.currentAcid == "") {
					cms.message.error("请选择一个资产账户.");
					return ;
				}
				$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
				break;
			case 4:
				if($scope.tatrd_type == 20) {
					return ;
				}
				$scope.tatrd_type = 20;
				if($scope.currentAcid == "") {
					cms.message.error("请选择一个资产账户.");
					return ;
				}
				$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
				break;
			default:
				break;
		}
	}

	//点击刷新
	$scope.whitelistRefreshTatractSa = function(type) {
		if($scope.currentAcid == "") {
			cms.message.error("请选择一个资产账户.");
			return ;
		}
		if(type == 1) {
			$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
			return ;
		}
		else if(type == 2) {
			$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
			return ;
		}
		else {

		}

	}

	//账户点击取消保存
	$scope.whitelistTatractCancelLoad = function() {
		$scope.tatractLoadAble = false;
		$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
	}

	//账户排序
	$scope.whitelistTatractSort = function(a,b) {
		if(parseInt(a.tracid) > parseInt(b.tracid)) {
			return 1;
		}
		else {
			if(parseInt(a.ukcode) > parseInt(b.ukcode)) {
				return 1;
			}
			return 0;
		}
	}

	//账户点击保存数据库
	$scope.whitelistTatractLoadSure = function() {
		if($scope.tatractSaList.length > 1) {
			for(var i = 0; i < $scope.tatractSaList.length -1 ; i ++) {
				if($scope.tatractSaList[i].tracid == $scope.tatractSaList[i+1].tracid && $scope.tatractSaList[i].ukcode == $scope.tatractSaList[i+1].ukcode) {
					cms.message.error("第"+$scope.tatractSaList[i].trindex+"行数据与第"+$scope.tatractSaList[i+1].trindex+"行数据重复，请修改后重新导入.");
					return ;
				}
			}
			// for(var j = 0; j < $scope.tatractSaList.length; j ++) {
			// 	//判断格式
			//
			// }
		}
		//保存数据库
		var reqData = {body:{data:[],acid:$scope.currentAcid,satype:$scope.security_type}};
		angular.forEach($scope.tatractSaList,function(tatractsa) {
			var tmp = {};
			tmp.acid = $scope.currentAcid;
			tmp.tracid = tatractsa.tracid;
			tmp.ukcode = tatractsa.ukcode;
			tmp.marketid = tatractsa.marketid;
			tmp.marketcode = tatractsa.marketcode;
			tmp.satype = tatractsa.satype;
			tmp.volume = tatractsa.volume;
			reqData.body.data.push(tmp);
		})
		if($scope.security_loadtype == 1) {
			whitelistService.loadTatractValidsaReset(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatractLoadAble = false;
					$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
		else if($scope.security_loadtype == 2) {
			whitelistService.loadTatractValidsaAdd(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatractLoadAble = false;
					$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
		else if($scope.security_loadtype == 3) {
			whitelistService.loadTatractPlansaReset(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatractLoadAble = false;
					$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
		else {
			whitelistService.loadTatractPlansaAdd(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatractLoadAble = false;
					$scope.whitelistGetTatractSa($scope.currentAcid,$scope.security_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
	}

	//导出券表
	$scope.whitelistExports = function(cmd) {
		//cmd : 1 导出资产账户可配券，2导出资产账户计划券,3导出策略组合可配券,4导出策略组合计划券
		var exportData = {};
		if(cmd == 1 || cmd == 2) {
			if($scope.tatractSaList.length == 0) {
				cms.message.error("表格中无数据可导出.")
				return ;
			}
			var headers = ["交易账户编号","ukcode","市场编号","证券代码","证券名称","数量"];
			exportData.headers = headers;
			exportData.fileType = "xlsx";
			exportData.fileName = $scope.security_type == 10 ? "资产账户"+$scope.currentAcid+"-交易账户底仓-" : "资产账户"+$scope.currentAcid+"-交易账户预约券-";
			exportData.fileName += cmd == 1 ? "可配券" : "计划券";
			exportData.data = [];
			angular.forEach($scope.tatractSaList,function(tatractsa) {
				var temp = [];
				temp.push(tatractsa.tracid);
				temp.push(tatractsa.ukcode);
				temp.push(tatractsa.marketid);
				temp.push(tatractsa.marketcode);
				temp.push(tatractsa.chabbr);
				if(cmd == 1) {
					temp.push(tatractsa.validsa);
				}
				else {
					temp.push(tatractsa.plansa);
				}
				exportData.data.push(temp);
			})
		}
		if(cmd == 3 || cmd == 4) {
			if($scope.tatrdSaList.length == 0) {
				cms.message.error("表格中无数据可导出.")
				return ;
			}
			var headers = ["交易账户编号","策略组合编号","ukcode","市场编号","证券代码","证券名称","数量"];
			exportData.headers = headers;
			exportData.fileType = "xlsx";
			exportData.fileName = $scope.tatrd_type == 10 ? "资产账户"+$scope.currentAcid+"-策略组合底仓-" : "资产账户"+$scope.currentAcid+"-策略组合预约券-";
			exportData.fileName += cmd == 3 ? "可配券" : "计划券";
			exportData.data = [];
			angular.forEach($scope.tatrdSaList,function(tatrdsa) {
				var temp = [];
				temp.push(tatrdsa.tracid);
				temp.push(tatrdsa.trid);
				temp.push(tatrdsa.ukcode);
				temp.push(tatrdsa.marketid);
				temp.push(tatrdsa.marketcode);
				temp.push(tatrdsa.chabbr);
				if(cmd == 3) {
					temp.push(tatrdsa.validsa);
				}
				else {
					temp.push(tatrdsa.plansa);
				}
				exportData.data.push(temp);
			})
		}
		whitelistService.exportExcelFile(exportData,function(err,res) {
			if(err) return ;
			if(res.result == true) {
				cms.message.success("导出成功.",5);
			}
			else {
				cms.message.error("导出文件失败，"+res.reason);
				cms.log("导出文件失败：",res.reason);
			}
		})
	}

	//获取策略组合白名单
	$scope.whitelistGetTatrdSa = function(acid,satype) {
		$scope.tatrdLoadAble = false;
		var reqData = {
			body: {
				acid: acid,
				satype: satype
			}
		};
		whitelistService.getTatrdSa(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tatrdSaList = res.body;
				angular.forEach($scope.tatrdSaList,function(tatrdsa) {
					tatrdsa.show = true;
					if(tatrdsa.satype == 10) {
						tatrdsa.show_type = "底仓";
					}
					else  if(tatrdsa.satype == 20) {
						tatrdsa.show_type = "预约券";
					}
					else {
						tatrdsa.show_type = "无定义";
					}
					tatrdsa.plansa = parseFloat(tatrdsa.plansa);
					tatrdsa.validsa = parseFloat(tatrdsa.validsa);
					tatrdsa.usedsa = parseFloat(tatrdsa.usedsa);
				})
				if($scope.tatrdSaList.length == 0) {
					cms.message.error("当前查询结果为空.")
				}
				$scope.whitelistFilterTatrdSa();
				$scope.$apply();
			}
			else {
				$scope.tatrdSaList.splice(0,$scope.tatrdSaList.length);
				$scope.$apply();
				cms.message.error("获取资产账户券表失败."+res.msret.msg);
				cms.log("获取资产账户券表失败：",res.msret.msgcode,res.msret.msg)
			}
		})
	}

	//策略组合券表过滤数据
	$scope.whitelistFilterTatrdSa = function() {
		if($scope.tatrdSaList.length == 0) {
			return ;
		}
		if($scope.tatrd_searchContent == "") {
			angular.forEach($scope.tatrdSaList,function(tatrdsa) {
				tatrdsa.show = true;
			})
			return ;
		}
		angular.forEach($scope.tatractSaList,function(tatrdsa) {
			if(tatrdsa.marketcode.indexOf($scope.tatrd_searchContent) != -1 || tatrdsa.chabbr.indexOf($scope.tatrd_searchContent) != -1) {
				tatrdsa.show = true;
			}
			else {
				tatrdsa.show = false;
			}
		})
	}

	$scope.whitelistClickBody3 = function(e) {
		if($scope.tatrd_showFirstMenu == true && $scope.tatrd_showFirstMenu_auto == false) {
			$scope.tatrd_showFirstMenu = false;
			$scope.$apply();
			document.body.removeEventListener('click',$scope.whitelistClickBody3,false);
		}
		$scope.tatrd_showFirstMenu_auto = false;
		e.preventDefault();
	}

	$scope.whitelistClickBody4 = function(e) {
		if($scope.tatrd_showSecondMenu == true && $scope.tatrd_showSecondMenu_auto == false) {
			$scope.tatrd_showSecondMenu = false;
			$scope.$apply();
			document.body.removeEventListener('click',$scope.whitelistClickBody4,false);
		}
		$scope.tatrd_showSecondMenu_auto = false;
		e.preventDefault();
	}

	//策略组合点击导入可配券
	$scope.whitelistTatrdClickFirst = function(ev) {
		if($scope.tatrd_showFirstMenu == true) {
			$scope.tatrd_showFirstMenu = false;
			document.body.removeEventListener('click',$scope.whitelistClickBody3,false);
			return ;
		}
		$scope.tatrd_showFirstMenu_auto = true;
		$scope.tatrd_showFirstMenu = true;
		ev.preventDefault();
		document.body.addEventListener('click',$scope.whitelistClickBody3,false);
	}

	//策略组合点击导入计划券
	$scope.whitelistTatrdClickSecond = function(ev) {
		if($scope.tatrd_showSecondMenu == true) {
			$scope.tatrd_showSecondMenu = false;
			document.body.removeEventListener('click',$scope.whitelistClickBody4,false);
			return ;
		}
		$scope.tatrd_showSecondMenu = true;
		$scope.tatrd_showSecondMenu_auto = true;
		ev.preventDefault();
		document.body.addEventListener('click',$scope.whitelistClickBody4,false);
	}

	//策略组合选择导入方式
	$scope.whitelistTatrdClickSelect = function(type) {
		if($scope.currentAcid == "") {
			cms.message.error("请选择一个资产账户");
			return ;
		}
		if(type == 1 || type == 2) {
			document.body.removeEventListener('click',$scope.whitelistClickBody3,false);
			$scope.tatrd_showFirstMenu = false;
		}
		if(type == 3 || type == 4) {
			document.body.removeEventListener('click',$scope.whitelistClickBody4,false);
			$scope.tatrd_showSecondMenu = false;
		}
		$scope.tatrd_loadtype = type;
		if($scope.tatrdLoadAble == true) {
			$scope.whitelistTatrdCancelLoad();
		}
		// document.getElementById("whitelist_tatrd_form").reset();
		// document.getElementById("whitelist_tatrd_file").click();
		whitelistService.importExcelFile(function(err,res) {
			if(err) return ;
			if(res.result == true) {
				$scope.whitelistTatrdAnlazyData(res.data);
			}
			else {
				cms.log(res.reason);
				cms.message.error(res.reason);
			}
		})
	}

	//分析导入的数据
	$scope.whitelistTatrdAnlazyData = function(data) {
		if(data.length <= 1) {
			cms.message.error("选择的文件无数据，请重新选择.")
			return ;
		}
		else {
			//获取交易账户
			whitelistService.getTatract({body:{acid:$scope.currentAcid}},function(acres) {
				if(acres.msret.msgcode == "00") {
					whitelistService.getTatrd({body:{caid:$scope.currentCaid}},function(tres) {
						if(tres.msret.msgcode == "00") {
							whitelistService.getMarket({body:{}},function(gmres) {
								if(gmres.msret.msgcode == "00") {
									var temp = [];
									for(var i = 1; i < data.length; i ++) {
										if(data[i].length < 7) {
											cms.message.error("第"+(i+1)+"行数据有空项，请修改后重试.");
											return ;
										}
										//设置市场
										var k = 0;
										var tmpObj = {};
										for(k = 0; k < gmres.body.length ; k ++) {
											if(gmres.body[k].marketid == data[i][3]) {
												tmpObj.tracid = data[i][0];
												tmpObj.tracname = "-";
												tmpObj.trid = data[i][1];
												tmpObj.trname = "-";
												tmpObj.ukcode = data[i][2];
												tmpObj.marketid = data[i][3];
												tmpObj.marketchname = gmres.body[k].marketchname;
												tmpObj.briefcode = gmres.body[k].briefcode;
												tmpObj.marketcode = data[i][4];
												tmpObj.chabbr = data[i][5];
												tmpObj.satype = $scope.tatrd_type;
												tmpObj.show_type = $scope.tatrd_type == 10 ? "底仓" : "预约券";
												tmpObj.plansa = ($scope.tatrd_loadtype == 1 || $scope.tatrd_loadtype == 2) ? 0 : data[i][6];
												tmpObj.validsa = ($scope.tatrd_loadtype == 1 || $scope.tatrd_loadtype == 2) ? data[i][6] : 0;
												tmpObj.usedsa = 0;
												tmpObj.volume = data[i][6];
												break;
											}
										}
										if(k >= gmres.body.length) {
											cms.message.error("第"+(i+1)+"行无法匹配市场，请修改后重试.");
											return ;
										}
										var m = 0;
										for(m = 0; m < acres.body.length; m++) {
											if(acres.body[m].tracid == tmpObj.tracid) {
												tmpObj.tracname = acres.body[m].tracname;
												break;
											}
										}
										if(m >= acres.body.length) {
											cms.message.error("第"+(i+1)+"行无法匹配交易账户，请修改后重试.");
											return ;
										}
										var n = 0;
										for(n = 0 ; n < tres.body.length; n ++) {
											if(tres.body[n].trid == tmpObj.trid) {
												tmpObj.trname = tres.body[n].trname;
												break;
											}
										}
										if(n >= tres.body.length) {
											cms.message.error("第"+(i+1)+"行无法匹配策略组合，请修改后重试.");
											return ;
										}
										tmpObj.trindex = i + 1;
										temp.push(tmpObj);
									}
									$scope.tatrdSaList.splice(0,$scope.tatrdSaList.length);
									$scope.tatrd_searchContent = "";
									$scope.tatrdLoadAble = true;
									angular.forEach(temp,function(tatrdsa) {
										tatrdsa.show = true;
										$scope.tatrdSaList.push(tatrdsa);
									})
									$scope.tatrdSaList.sort($scope.whitelistTatrdSort);
									$scope.$apply();
								}
								else {
									cms.message.error("查询市场信息失败，请稍候重试.");
									cms.log("查询市场信息失败：",gmres.msret.msgcode,gmres.msret.msg);
								}
							});
						}
						else {
							cms.message.error("查询策略组合失败.");
							cms.log("查询策略组合失败.",tres.msret.msgcode,tres.msret.msg);
						}
					})
				}
				else {
					cms.message.error("查询交易账户失败.");
					cms.log("查询交易账户失败.",acres.msret.msgcode,acres.msret.msg);
				}
			})
		}
	}

	//策略组合券单排序
	$scope.whitelistTatrdSort = function(a,b) {
		if(parseInt(a.trid) > parseInt(b.trid)) {
			return 1;
		}
		else {
			if(parseInt(a.tracid) > parseInt(b.tracid)) {
				return 1;
			}
			else {
				if(parseInt(a.ukcode) > parseInt(b.ukcode)) {
					return 1;
				}
				return 0;
			}
		}
	}

	//策略组合导入点击保存数据库
	$scope.whitelistTatrdLoadSure = function() {
		if($scope.tatrdSaList.length > 1) {
			for(var i = 0; i < $scope.tatrdSaList.length -1 ; i ++) {
				if($scope.tatrdSaList[i].tracid == $scope.tatrdSaList[i+1].tracid && $scope.tatrdSaList[i].trid == $scope.tatrdSaList[i+1].trid  && $scope.tatrdSaList[i].ukcode == $scope.tatrdSaList[i+1].ukcode) {
					cms.message.error("第"+$scope.tatrdSaList[i].trindex+"行数据与第"+$scope.tatrdSaList[i+1].trindex+"行数据重复，请修改后重新导入.");
					return ;
				}
			}
			// for(var j = 0; j < $scope.tatrdSaList.length; j ++) {
			// 	//判断格式
			//
			// }
		}
		//保存数据库
		var reqData = {body:{data:[],acid:$scope.currentAcid,satype:$scope.tatrd_type}};
		angular.forEach($scope.tatrdSaList,function(tatrdsa) {
			var tmp = {};
			tmp.acid = $scope.currentAcid;
			tmp.tracid = tatrdsa.tracid;
			tmp.trid = tatrdsa.trid;
			tmp.ukcode = tatrdsa.ukcode;
			tmp.marketid = tatrdsa.marketid;
			tmp.marketcode = tatrdsa.marketcode;
			tmp.satype = tatrdsa.satype;
			tmp.volume = tatrdsa.volume;
			reqData.body.data.push(tmp);
		})
		if($scope.tatrd_loadtype == 1) {
			whitelistService.loadTatrdValidsaReset(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatrdLoadAble = false;
					$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
		else if($scope.tatrd_loadtype == 2) {
			whitelistService.loadTatrdValidsaAdd(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatrdLoadAble = false;
					$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
		else if($scope.tatrd_loadtype == 3) {
			whitelistService.loadTatrdPlansaReset(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatrdLoadAble = false;
					$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
		else {
			whitelistService.loadTatrdPlansaAdd(reqData,function(res) {
				if(res.msret.msgcode == "00" ) {
					cms.message.success("数据导入成功",5);
					$scope.tatrdLoadAble = false;
					$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
				}
				else {
					cms.message.error("导入数据失败." + res.msret.msg);
					cms.log("导入数据失败：",res.msret.msgcode,res.msret.msg);
				}
			})
		}
	}

	//策略组合导入点击取消保存
	$scope.whitelistTatrdCancelLoad = function() {
		$scope.tatrdLoadAble = false;
		$scope.whitelistGetTatrdSa($scope.currentAcid,$scope.tatrd_type);
	}

	$scope.whitelistClickBodyEdit = function(e) {
		if($scope.editUserClick == true) {
			$scope.editUserClick = false;
			return ;
		}
		//账户编辑的行数
		if($scope.currentEditTatract != null) {
			$scope.currentEditTatract.editPlan = false;
			$scope.currentEditTatract.editValid = false;
			$scope.currentEditTatract = null;
		}
		//策略组合编辑的行数
		if($scope.currentEditTatrd != null) {
			$scope.currentEditTatrd.editPlan = false;
			$scope.currentEditTatrd.editValid = false;
			$scope.currentEditTatrd = null;
		}
		$scope.$apply();
		document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
		e.preventDefault();
	}

	//阻止事件传递
	$scope.whitelistStopEvent = function(e) {
		e.stopPropagation();
	}

	//交易账户编辑计划券
	$scope.whitelistSecurityEditPlan = function(tatract) {
		if($scope.tatractLoadAble == true && $scope.security_loadtype != 3 &&  $scope.security_loadtype != 4) {
			return ;
		}
		if($scope.tatractLoadAble == false && $rootScope.menuRight.indexOf(2002004001006) == -1) {
			return ;
		}
		$scope.editUserClick = true;
		if($scope.currentEditTatract != null) {
			$scope.currentEditTatract.editPlan = false;
			$scope.currentEditTatract.editValid = false;
		}
		if($scope.tatractLoadAble == false) {
			$scope.currentSecurity.sano = tatract.sano;
		}
		$scope.currentSecurity.editPlansa = tatract.plansa;
		$scope.currentSecurity.editPlansa_check = tatract.plansa;
		tatract.editPlan = true;
		$scope.currentEditTatract = tatract;
		document.body.addEventListener('click',$scope.whitelistClickBodyEdit,false);
	}

	//交易账户编辑可配券
	$scope.whitelistSecurityEditValid = function(tatract) {
		if($scope.tatractLoadAble == true && $scope.security_loadtype != 1 &&  $scope.security_loadtype != 2) {
			return ;
		}
		if($scope.tatractLoadAble == false && $rootScope.menuRight.indexOf(2002004001006) == -1) {
			return ;
		}
		$scope.editUserClick = true;
		if($scope.currentEditTatract != null) {
			$scope.currentEditTatract.editPlan = false;
			$scope.currentEditTatract.editValid = false;
		}
		if($scope.tatractLoadAble == false) {
			$scope.currentSecurity.sano = tatract.sano;
		}
		$scope.currentSecurity.tracid = tatract.tracid;
		$scope.currentSecurity.ukcode = tatract.ukcode;
		$scope.currentSecurity.satype = tatract.satype;
		$scope.currentSecurity.editValidsa = tatract.validsa;
		$scope.currentSecurity.editValidsa_check = tatract.validsa;
		tatract.editValid = true;
		$scope.currentEditTatract = tatract;
		document.body.addEventListener('click',$scope.whitelistClickBodyEdit,false);
	}

	//交易账户计划券按下键
	$scope.whitelistSecurityPlanKeyup = function(e) {
		var reg = /^(0|([1-9][0-9]{0,15}))$/;
		if(e.keyCode == 27) {
			$scope.currentEditTatract.editPlan = false;
			$scope.currentEditTatract = null;
			document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
		}
		if(e.keyCode == 13) {
			if(!reg.test($scope.currentSecurity.editPlansa)) {
				cms.message.error("请正确填写可配券数量");
				return ;
			}
			if($scope.tatractLoadAble == true) {
				$scope.currentEditTatract.plansa = $scope.currentSecurity.editPlansa;
				$scope.currentEditTatract.volume = $scope.currentSecurity.editPlansa;
				$scope.currentEditTatract.editPlan = false;
				$scope.currentEditTatract = null;
				document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
			}
			else {
				var reqData = {body:{sano:$scope.currentSecurity.sano,plansa:$scope.currentSecurity.editPlansa}};
				whitelistService.updateTatractPlansa(reqData,function(res) {
					if(res.msret.msgcode == "00") {
						cms.message.success("修改成功.",5);
						$scope.currentEditTatract.plansa = Number($scope.currentSecurity.editPlansa);
						$scope.currentEditTatract.editPlan = false;
						$scope.currentEditTatract = null;
						document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
						$scope.$apply();
					}
					else {
						cms.message.error("修改计划券数量失败."+res.msret.msg);
						cms.log("修改计划券数量失败：",res.msret.msgcode,res.msret.msg)
					}
				})
			}
		}
	}

	//交易账户可配券按下键
	$scope.whitelistSecurityValidKeyup = function(e) {
		var reg = /^(0|([1-9][0-9]{0,15}))$/;
		if(e.keyCode == 27) {
			$scope.currentEditTatract.editValid = false;
			$scope.currentEditTatract = null;
			document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
		}
		if(e.keyCode == 13) {
			if(!reg.test($scope.currentSecurity.editValidsa)) {
				cms.message.error("请正确填写可配券数量");
				return ;
			}
			if($scope.tatractLoadAble == true) {
				$scope.currentEditTatract.validsa = $scope.currentSecurity.editValidsa;
				$scope.currentEditTatract.volume = $scope.currentSecurity.editValidsa;
				$scope.currentEditTatract.editValid = false;
				$scope.currentEditTatract = null;
				document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
			}
			else {
				var reqData = {body:{
					sano:$scope.currentSecurity.sano,
					validsa:$scope.currentSecurity.editValidsa,
					tracid: $scope.currentSecurity.tracid,
					ukcode: $scope.currentSecurity.ukcode,
					satype: $scope.currentSecurity.satype
				}};
				whitelistService.updateTatractValidsa(reqData,function(res) {
					if(res.msret.msgcode == "00") {
						cms.message.success("修改成功.",5);
						$scope.currentEditTatract.validsa = $scope.currentSecurity.editValidsa;
						$scope.currentEditTatract.usedsa = "0";
						$scope.currentEditTatract.editValid = false;
						$scope.currentEditTatract = null;
						document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
						$scope.$apply();
					}
					else {
						cms.message.error("修改可配券数量失败."+res.msret.msg);
						cms.log("修改可配券数量失败：",res.msret.msgcode,res.msret.msg)
					}
				})
			}
		}
	}

	//交易账户编辑获得输入
	$scope.whitelistSecurityInput = function(cmd) {
		var reg = /^((0|([1-9][0-9]{0,15})))?$/;
		if(cmd == 1) {
			if(!reg.test($scope.currentSecurity.editPlansa)) {
				$scope.currentSecurity.editPlansa = $scope.currentSecurity.editPlansa_check;
				return ;
			}
			$scope.currentSecurity.editPlansa_check = $scope.currentSecurity.editPlansa;
			return ;
		}
		if(cmd == 2) {
			if(!reg.test($scope.currentSecurity.editValidsa)) {
				$scope.currentSecurity.editValidsa = $scope.currentSecurity.editValidsa_check;
				return ;
			}
			$scope.currentSecurity.editValidsa_check = $scope.currentSecurity.editValidsa;
			return ;
		}
	}

	//策略组合编辑计划券
	$scope.whitelistTatrdEditPlan = function(tatrd) {
		if($scope.tatrdLoadAble == true && $scope.tatrd_loadtype != 3 && $scope.tatrd_loadtype != 4) {
			return ;
		}
		if($scope.tatrdLoadAble == false && $rootScope.menuRight.indexOf(2002004002005) == -1) {
			return ;
		}
		$scope.editUserClick = true;
		if($scope.currentEditTatrd != null) {
			$scope.currentEditTatrd.editPlan = false;
			$scope.currentEditTatrd.editValid = false;
		}
		if($scope.tatrdLoadAble == false) {
			$scope.currentTatrdSa.sano = tatrd.sano;
		}
		$scope.currentTatrdSa.editPlansa = tatrd.plansa;
		$scope.currentTatrdSa.editPlansa_check = tatrd.plansa;
		tatrd.editPlan = true;
		$scope.currentEditTatrd = tatrd;
		document.body.addEventListener('click',$scope.whitelistClickBodyEdit,false);
	}

	//策略组合编辑可配券
	$scope.whitelistTatrdEditValid = function(tatrd) {
		if($scope.tatrdLoadAble == true && $scope.tatrd_loadtype != 1 && $scope.tatrd_loadtype != 2) {
			return ;
		}
		if($scope.tatrdLoadAble == false && $rootScope.menuRight.indexOf(2002004002005) == -1) {
			return ;
		}
		$scope.editUserClick = true;
		if($scope.currentEditTatrd != null) {
			$scope.currentEditTatrd.editPlan = false;
			$scope.currentEditTatrd.editValid = false;
		}
		if($scope.tatrdLoadAble == false) {
			$scope.currentTatrdSa.sano = tatrd.sano;
		}
		$scope.currentTatrdSa.tracid = tatrd.tracid;
		$scope.currentTatrdSa.trid = tatrd.trid;
		$scope.currentTatrdSa.ukcode = tatrd.ukcode;
		$scope.currentTatrdSa.satype = tatrd.satype;
		$scope.currentTatrdSa.editValidsa = tatrd.validsa;
		$scope.currentTatrdSa.editValidsa_check = tatrd.validsa;
		tatrd.editValid = true;
		$scope.currentEditTatrd = tatrd;
		document.body.addEventListener('click',$scope.whitelistClickBodyEdit,false);
	}

	//策略组合计划券按下键
	$scope.whitelistTatrdPlanKeyup = function(e) {
		var reg = /^(0|([1-9][0-9]{0,15}))$/;
		if(e.keyCode == 27) {
			$scope.currentEditTatrd.editPlan = false;
			$scope.currentEditTatrd = null;
			document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
		}
		if(e.keyCode == 13) {
			if(!reg.test($scope.currentTatrdSa.editPlansa)) {
				cms.message.error("请正确填写可配券数量");
				return ;
			}
			if($scope.tatrdLoadAble == true) {
				$scope.currentEditTatrd.plansa = $scope.currentTatrdSa.editPlansa;
				$scope.currentEditTatrd.volume = $scope.currentTatrdSa.editPlansa;
				$scope.currentEditTatrd.editPlan = false;
				$scope.currentEditTatrd = null;
				document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
			}
			else {
				var reqData = {body:{sano:$scope.currentTatrdSa.sano,plansa:$scope.currentTatrdSa.editPlansa}};
				whitelistService.updateTatrdPlansa(reqData,function(res) {
					if(res.msret.msgcode == "00") {
						cms.message.success("修改成功.",5);
						$scope.currentEditTatrd.plansa = Number($scope.currentTatrdSa.editPlansa).toFixed(2);
						$scope.currentEditTatrd.editPlan = false;
						$scope.currentEditTatrd = null;
						document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
						$scope.$apply();
					}
					else {
						cms.message.error("修改计划券数量失败."+res.msret.msg);
						cms.log("修改计划券数量失败：",res.msret.msgcode,res.msret.msg)
					}
				})
			}
		}
	}

	//策略组合可配券按下键
	$scope.whitelistTatrdValidKeyup = function(e) {
		var reg = /^(0|([1-9][0-9]{0,15}))$/;
		if(e.keyCode == 27) {
			$scope.currentEditTatrd.editValid = false;
			$scope.currentEditTatrd = null;
			document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
		}
		if(e.keyCode == 13) {
			if(!reg.test($scope.currentTatrdSa.editValidsa)) {
				cms.message.error("请正确填写可配券数量");
				return ;
			}
			if($scope.tatrdLoadAble == true) {
				$scope.currentEditTatrd.validsa = $scope.currentTatrdSa.editValidsa;
				$scope.currentEditTatrd.volume = $scope.currentTatrdSa.editValidsa;
				$scope.currentEditTatrd.editValid = false;
				$scope.currentEditTatrd = null;
				document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
			}
			else {
				var reqData = {body:{
					sano:$scope.currentTatrdSa.sano,
					validsa:$scope.currentTatrdSa.editValidsa,
					tracid:$scope.currentTatrdSa.tracid,
					trid:$scope.currentTatrdSa.trid,
					ukcode:$scope.currentTatrdSa.ukcode,
					satype:$scope.currentTatrdSa.satype
				}};
				whitelistService.updateTatrdValidsa(reqData,function(res) {
					if(res.msret.msgcode == "00") {
						cms.message.success("修改成功.",5);
						$scope.currentEditTatrd.validsa = $scope.currentTatrdSa.editValidsa;
						$scope.currentEditTatrd.usedsa = "0";
						$scope.currentEditTatrd.editValid = false;
						$scope.currentEditTatrd = null;
						document.body.removeEventListener('click',$scope.whitelistClickBodyEdit,false);
						$scope.$apply();
					}
					else {
						cms.message.error("修改可配券数量失败."+res.msret.msg);
						cms.log("修改可配券数量失败：",res.msret.msgcode,res.msret.msg)
					}
				})
			}
		}
	}

	//策略组合编辑获得输入
	$scope.whitelistTatrdInput = function(cmd) {
		var reg = /^((0|([1-9][0-9]{0,15})))?$/;
		if(cmd == 1) {
			if(!reg.test($scope.currentTatrdSa.editPlansa)) {
				$scope.currentTatrdSa.editPlansa = $scope.currentTatrdSa.editPlansa_check;
				return ;
			}
			$scope.currentTatrdSa.editPlansa_check = $scope.currentTatrdSa.editPlansa;
			return ;
		}
		if(cmd == 2) {
			if(!reg.test($scope.currentTatrdSa.editValidsa)) {
				$scope.currentTatrdSa.editValidsa = $scope.currentTatrdSa.editValidsa_check;
				return ;
			}
			$scope.currentTatrdSa.editValidsa_check = $scope.currentTatrdSa.editValidsa;
			return ;
			return ;
		}
	}

});
