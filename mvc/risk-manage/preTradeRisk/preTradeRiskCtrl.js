angular.module('cmsController').controller('preTradeRiskCtrl',function($scope,mainService,preriskService) {
    $scope.showSubguide = true;
    $scope.maidList = [];
	$scope.caidList =[];
	$scope.tridList = [];
	$scope.acidList = [];
    $scope.guideTree = [];
    $scope.modalInfo = {};
    $scope.currAccount={};
    $scope.currentMenu = {};
    $scope.currentRiskInfo = {};

    $scope.riskIndexs = [];
    $scope.riskCatgs = [];
    $scope.riskCfgvalues = [];

    $scope.filterContent = "";
    //$scope.userRightLevel = 0;

    $scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

    $scope.$on("changedManager_broadcast", function(event, message) {
		$scope.preriskGetUnit();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.preriskGetUnit();
	});

	$scope.$on("changedAssetAccount_broadcast", function(event, message) {
		$scope.preriskGetUnit();
	});

    $scope.$on("changedTradeUnit_broadcast", function(event, message) {
		$scope.preriskGetUnit();
	});

    //点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

    //初始化
    $scope.preriskInit = function() {
        $scope.showSubguide = true;
        $scope.modalInfo.state = 0;
        $scope.modalInfo.path = "";
        $scope.modalInfo.stateEnum = {};
        $scope.modalInfo.stateEnum.edit = 1;
        $scope.modalInfo.stateEnum.delete = 2;
        $scope.currentMenu.type = "";
        $scope.currentMenu.id = "";
        $scope.currentMenu.name = "";
        $scope.filterContent = "";
        //$scope.userRightLevel = mainService.currentOperator.rightlv;
        $scope.preriskGetRiskIndex(1);
        $scope.preriskGetUnit();
        //构造分类
        $scope.preriskGetRiskCatg();
    }

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){
    });

    //获取单元列表
	$scope.preriskGetUnit = function() {
		//获取资产管理人
		preriskService.getTamgr({body:{}},function(maidres) {
			if(maidres.msret.msgcode == "00") {
                $scope.maidList.splice(0,$scope.maidList.length);
				$scope.maidList = maidres.body;
				// 开始 -- 获取产品
				preriskService.getTacap({body:{}},function(caidres) {
					if(caidres.msret.msgcode == "00") {
						// 开始 -- 获取策略组合
						$scope.caidList.splice(0,$scope.caidList.length);
						$scope.caidList = caidres.body;
						preriskService.getTatrd({body:{}},function(tridres) {
							if(tridres.msret.msgcode == "00") {
								$scope.tridList.splice(0,$scope.tridList.length);
								$scope.tridList = tridres.body;
                                //开始--获取资产账户
                                preriskService.getTaact({body:{}},function(acidres) {
                                    if(acidres.msret.msgcode == "00") {
                                        $scope.acidList.splice(0,$scope.acidList.length);
                                        $scope.acidList = acidres.body;
                                        //构造树形结构
        								$scope.preriskMakeTreeFromList();
        								$scope.$apply();

                                    }
                                    else {
                                        cms.message.error("获取资产账户失败."+acidres.msret.msg);
                                    }
                                })
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
	$scope.preriskMakeTreeFromList = function() {
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

		for (var i = 0; i < $scope.tridList.length; i++) {
			$scope.tridList[i].maid=parseInt($scope.tridList[i].maid);
			$scope.tridList[i].caid=parseInt($scope.tridList[i].caid);
			$scope.tridList[i].trid=parseInt($scope.tridList[i].trid);

			var maIndex=cms.accurateSearch($scope.maidList,"maid",($scope.tridList[i].maid));
			if (maIndex != -1) {
				var caIndex=cms.accurateSearch($scope.maidList[maIndex].products,"caid",($scope.tridList[i].caid));
				if (caIndex != -1) {
					$scope.maidList[maIndex].products[caIndex].combs.push($scope.tridList[i]);
				} else {
					var newProduct = {maid: $scope.tridList[i].maid, caid: $scope.tridList[i].caid, showChildren: true, combs: [], accounts: []};
					newProduct.combs.push($scope.tridList[i]);
					$scope.maidList[maIndex].products.push(newProduct);
				}
			} else {
				var newManager = {maid: $scope.tridList[i].maid, products: [], showChildren: true};
				var newProduct = {maid: $scope.tridList[i].maid, caid: $scope.tridList[i].caid, showChildren: true, combs: [], accounts: []};
				newProduct.combs.push($scope.tridList[i]);
				newManager.products.push(newProduct);
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

        $scope.guideTree.splice(0,$scope.guideTree.length);
		$scope.makeNewTree($scope.maidList,$scope.guideTree);

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
    $scope.preriskClickMenu = function(obj) {
        $scope.currentMenu.type = obj.type;
        $scope.currentMenu.id = obj.menuId;
        $scope.currentMenu.name = obj.menuName;
        $scope.preriskGetRiskCfg(obj.type,obj.menuId);
    }

    //获取数据
    $scope.preriskGetRiskCfg = function(type,id) {
        var reqData = {body:{
            selectType: type,
            cellid: id
            //rightlv: $scope.userRightLevel
        }};
        if(type == 'maid') {
            //reqData.body.maid = id;
            reqData.body.risktype = "1,2,3";
        }
        if(type == 'caid') {
            // reqData.body.celltype = 2;
            // reqData.body.cellid = id;
               reqData.body.risktype = 1;
        }
        if(type == 'acid') {
            // reqData.body.celltype = 5;
            // reqData.body.cellid = id;
               reqData.body.risktype = 3;
        }
        if(type == 'trid') {
            // reqData.body.celltype = 3;
            // reqData.body.cellid = id;
               reqData.body.risktype = 2;
        }
        preriskService.getRiskCfgValue(reqData,function(res) {
            if(res.msret.msgcode == "00") {
                $scope.riskCfgvalues = res.body;
                angular.forEach($scope.riskCfgvalues,function(cfg) {
                    cfg.show_celltype = cfg.celltype == 2 ? "产品" : (cfg.celltype == 3 ? "策略组合" : "资金账户")
                    cfg.show_catglv1 = $scope.preriskGetRiskCatgName(cfg.catg_lv1);
                    cfg.show_catglv2 = $scope.preriskGetRiskCatgName(cfg.catg_lv1,cfg.catg_lv2);
                    cfg.show_value1 = cfg.operate + "" + parseFloat(cfg.value1);
                    cfg.show_value2 = cfg.operate + "" + parseFloat(cfg.value2);
                    cfg.show_value3 = cfg.operate + "" + parseFloat(cfg.value3);
                });
                $scope.preriskFilterRisk();
                $scope.$apply();
            }
            else {
                $scope.riskCfgvalues.splice(0,$scope.riskCfgvalues.length);
                $scope.$apply();
                cms.message.error("获取数据失败.");
                cms.log("获取数据失败失败.",JSON.stringify(res.msret))
            }
        })
    }

    //获取风控指标
    $scope.preriskGetRiskIndex = function(tempParams) {
        $scope.riskIndexs.splice(0,$scope.riskIndexs.length);
        preriskService.getRiskIndex({body:{risktype: tempParams}},function(res) {
            if(res.msret.msgcode == "00") {
                $scope.riskIndexs = res.body;
            }
            else {
                cms.message.error("获取风控规则失败.");
                cms.log("获取风控规则失败.",JSON.stringify(res.msret));
            }
            $scope.currentRiskInfo.riskid = $scope.riskIndexs.length > 0 ? $scope.riskIndexs[0].riskid : "";
        })
    }

    //构造分类
    $scope.preriskGetRiskCatg = function() {
        $scope.riskCatgs.splice(0,$scope.riskCatgs.length);
        $scope.riskCatgs.push({
            value: "0",
            name: "无",
            children: [{value: "0",name: "无"}]
        });
        $scope.riskCatgs.push({
            value: "1",
            name: "市场",
            children: [{value:"1",name:"深圳"},{value:"2",name:"上海"},{value:"3",name:"全部"}]
        });
        $scope.riskCatgs.push({
            value: "2",
            name: "版块",
            children: [{value:"1",name:"主板"},{value:"2",name:"中小板"},{value:"3",name:"创业板"},{value:"4",name:"三板"},{value:"5",name:"全部"}]
        });
        $scope.riskCatgs.push({
            value: "3",
            name: "品种",
            children: [{value:"1",name:"股票"},{value:"2",name:"债券"},{value:"3",name:"基金"},{value:"4",name:"现货"},{value:"5",name:"货币市场工具"},{value:"6",name:"指数"},{value:"10",name:"期货"},{value:"11",name:"期权"},{value:"12",name:"权证"},{value:"15",name:"个股期权"},{value:"16",name:"全部"}]
        });
    }

    //通过id,获取名称
    $scope.preriskGetRiskCatgName = function(catglv1,catg_lv2) {
        var name = '-';
        if(typeof catglv1 == "undefined") {
            return name;
        }
        for(var i = 0; i < $scope.riskCatgs.length; i ++) {
            if($scope.riskCatgs[i].value == catglv1) {
                if(typeof catg_lv2 == "undefined") {
                    name = $scope.riskCatgs[i].name == "无" ? "-" : $scope.riskCatgs[i].name;
                    return name;
                }
                for(var j = 0; j < $scope.riskCatgs[i].children.length; j ++ ) {
                    if($scope.riskCatgs[i].children[j].value == catg_lv2) {
                        name = $scope.riskCatgs[i].children[j].name == "无" ? "-" : $scope.riskCatgs[i].children[j].name;
                        return name;
                    }
                }
            }
        }
        return name;
    }

    //显示弹框
    $scope.preriskShowModal = function(state) {
        $scope.modalInfo.state = state;
        switch (state) {
            case $scope.modalInfo.stateEnum.edit:
                console.log("打开编辑增加弹框");
                $scope.modalInfo.path = "../risk-manage/preTradeRisk/preTradeRiskDetail.html";
                break;
            case $scope.modalInfo.stateEnum.delete:
                $scope.modalInfo.path = "../risk-manage/preTradeRisk/prerisk-delete.html";
                break;
            default:
                break;
        }
    }

    //弹框加载完成
    $scope.preriskModalLoadReady = function() {
        switch ($scope.modalInfo.state) {
            case $scope.modalInfo.stateEnum.edit:
                mainService.showModal("prerisk_modal_back","prerisk_edit_modal","prerisk_edit_modal_title");
                break;
            case $scope.modalInfo.stateEnum.delete:
                mainService.showModal("prerisk_modal_back","prerisk_delete_modal","prerisk_delete_modal_title")
                break;
            default:
                break;
        }
    }

    //关闭弹框
    $scope.preriskCloseModal = function() {
        mainService.hideModal("prerisk_modal_back");
        $scope.modalInfo.state = 0;
        $scope.modalInfo.path = "";
    }

    //过滤风控
    $scope.preriskFilterRisk = function() {
        if($scope.filterContent == "") {
            angular.forEach($scope.riskCfgvalues,function(cfg) {
                cfg.show = true;
            })
            return ;
        }
        angular.forEach($scope.riskCfgvalues,function(cfg) {
            if(cfg.riskname.indexOf($scope.filterContent) != -1) {
                cfg.show = true;
            }
            else {
                cfg.show = false;
            }
        })
    }

    //刷新
    $scope.preriskRefreshRisk = function() {
        if($scope.currentMenu.type == "") {
            return ;
        }
        else {
            $scope.preriskGetRiskCfg($scope.currentMenu.type,$scope.currentMenu.id);
        }
    }

    //添加风控
    $scope.preriskAddRisk = function() {
        if($scope.currentMenu.type == "" || $scope.currentMenu.type == "maid") {
            cms.message.error("请选择一个产品、资产账户或策略组合");
            return ;
        }
        switch ($scope.currentMenu.type) {
            case 'caid':
                $scope.preriskGetRiskIndex(1);
                $scope.currentRiskInfo.title = "新建产品风控配置";
                $scope.currentRiskInfo.header = "产品编号：";
                $scope.currentRiskInfo.celltype = "2";
                break;
            case 'acid':
                $scope.preriskGetRiskIndex(3);
                $scope.currentRiskInfo.title = "新建账户风控配置";
                $scope.currentRiskInfo.header = "资产账户编号：";
                $scope.currentRiskInfo.celltype = "5";
                break;
            case 'trid':
                $scope.preriskGetRiskIndex(2);
                $scope.currentRiskInfo.title = "新建策略组合风控配置";
                $scope.currentRiskInfo.header = "策略组合编号：";
                $scope.currentRiskInfo.celltype = "3";
                break;
            default:
                break;
        }
        $scope.currentRiskInfo.edit = false;
        $scope.currentRiskInfo.cellid = $scope.currentMenu.id;
        $scope.currentRiskInfo.ukcode = "";
        // $scope.currentRiskInfo.riskid = $scope.riskIndexs.length > 0 ? $scope.riskIndexs[0].riskid : "";
        $scope.currentRiskInfo.catglv1 = $scope.riskCatgs[0];
        $scope.currentRiskInfo.catg_lv2 = $scope.currentRiskInfo.catglv1.children[0].value;
        $scope.currentRiskInfo.operate = ">";
        $scope.currentRiskInfo.value1 = "";
        $scope.currentRiskInfo.value2 = "";
        $scope.currentRiskInfo.value3 = "";
        $scope.currentRiskInfo.num_check = "0";
        $scope.currentRiskInfo.riskstat = "1";
        $scope.preriskShowModal($scope.modalInfo.stateEnum.edit);
    }

    //切换主要分类
    $scope.preriskChangeCatglv1 = function() {
        $scope.currentRiskInfo.catg_lv2 = $scope.currentRiskInfo.catglv1.children[0].value;
    }

    //编辑风控
    $scope.preriskEditRisk = function(obj) {
        switch (String(obj.celltype)) {
            case "2":
                $scope.currentRiskInfo.title = "编辑产品风控配置";
                $scope.currentRiskInfo.header = "产品编号：";
                break;
            case "5":
                $scope.currentRiskInfo.title = "编辑账户风控配置";
                $scope.currentRiskInfo.header = "资产账户编号：";
                break;
            case "3":
                $scope.currentRiskInfo.title = "编辑策略组合风控配置";
                $scope.currentRiskInfo.header = "策略组合编号：";
                break;
            default:
                break;
        }
        $scope.currentRiskInfo.edit = true;
        $scope.currentRiskInfo.cfgid = obj.cfgid;
        $scope.currentRiskInfo.riskid = obj.riskid;
        $scope.currentRiskInfo.celltype = obj.celltype;
        $scope.currentRiskInfo.cellid = obj.cellid;
        $scope.currentRiskInfo.ukcode = obj.ukcode;
        angular.forEach($scope.riskCatgs,function(catg) {
            if(catg.value == obj.catg_lv1) {
                $scope.currentRiskInfo.catglv1 = catg;
            }
        })
        $scope.currentRiskInfo.catg_lv2 = obj.catg_lv2;
        $scope.currentRiskInfo.operate = obj.operate;
        $scope.currentRiskInfo.value1 = parseFloat(obj.value1);
        $scope.currentRiskInfo.value2 = parseFloat(obj.value2);
        $scope.currentRiskInfo.value3 = parseFloat(obj.value3);
        $scope.currentRiskInfo.num_check = obj.num_check;
        $scope.currentRiskInfo.riskstat = obj.riskstat;
        $scope.preriskShowModal($scope.modalInfo.stateEnum.edit);
    }

    //保存
    $scope.preriskEditRiskSure = function() {
        if($scope.currentRiskInfo.edit == false && $scope.currentRiskInfo.riskid == "") {
            cms.message.error("请选择风控规则.");
            return ;
        }
        var iReg = /^(0|([1-9][0-9]*))$/;
        var fReg = /^(0|([1-9][0-9]{0,16}))(\.[0-9]{1,8})?$/;
        if(!iReg.test($scope.currentRiskInfo.ukcode)) {
            cms.message.error("请输入ukcode.");
            return ;
        }
        if(!fReg.test($scope.currentRiskInfo.value1)) {
            cms.message.error("请设置风控触发值.");
            return ;
        }
        if(!fReg.test($scope.currentRiskInfo.value2)) {
            cms.message.error("请设置风控预警值.");
            return ;
        }
        if(!fReg.test($scope.currentRiskInfo.value3)) {
            cms.message.error("请设置风控备用值.");
            return ;
        }
        var reqData = {body:{}};
        if($scope.currentRiskInfo.edit == false) {
            reqData.body.riskid = $scope.currentRiskInfo.riskid;
            reqData.body.celltype = $scope.currentRiskInfo.celltype;
            reqData.body.cellid = $scope.currentRiskInfo.cellid;
            if ($scope.currentMenu.type === "caid") {
                reqData.body.risktype = 1;
            } else if ($scope.currentMenu.type === "trid"){
                reqData.body.risktype = 2;
            } else {
                reqData.body.risktype = 3;
            }
            console.log($scope.currentMenu);
        }
        else {
            reqData.body.cfgid = $scope.currentRiskInfo.cfgid;
        }
        reqData.body.ukcode = $scope.currentRiskInfo.ukcode;
        reqData.body.catg_lv1 = $scope.currentRiskInfo.catglv1.value;
        reqData.body.catg_lv2 = $scope.currentRiskInfo.catg_lv2;
        reqData.body.operate = $scope.currentRiskInfo.operate;
        reqData.body.value1 = $scope.currentRiskInfo.value1;
        reqData.body.value2 = $scope.currentRiskInfo.value2;
        reqData.body.value3 = $scope.currentRiskInfo.value3;
        reqData.body.num_check = $scope.currentRiskInfo.num_check;
        reqData.body.riskstat = $scope.currentRiskInfo.riskstat;
        if($scope.currentRiskInfo.edit == false) {
            console.log("事前风控-----");
            console.log(reqData.body);
            preriskService.addRiskCfgValue(reqData,function(res) {
                if(res.msret.msgcode == "00") {
                    cms.message.success("添加风控配置成功.",5);
                    $scope.preriskCloseModal();
                    $scope.preriskGetRiskCfg($scope.currentMenu.type,$scope.currentMenu.id);
                }
                else {
                    cms.message.error("添加风控配置失败."+res.msret.msg);
                    cms.log("添加风控配置失败.",JSON.stringify(res.msret))
                }
            })
        }
        else {
            preriskService.updateRiskCfgValue(reqData,function(res) {
                if(res.msret.msgcode == "00") {
                    cms.message.success("修改风控配置成功.",5);
                    $scope.preriskCloseModal();
                    $scope.preriskGetRiskCfg($scope.currentMenu.type,$scope.currentMenu.id);
                }
                else {
                    cms.message.error("修改风控配置失败."+res.msret.msg);
                    cms.log("修改风控配置失败.",JSON.stringify(res.msret))
                }
            })
        }
    }

    //删除风控
    $scope.preriskDeleteRisk = function(obj) {
        $scope.currentRiskInfo.cfgid = obj.cfgid;
        $scope.preriskShowModal( $scope.modalInfo.stateEnum.delete);
    }

    //确定删除
    $scope.preriskDeleteRiskSure = function() {
        var reqData = {body:{cfgid:$scope.currentRiskInfo.cfgid}};
        preriskService.deleteRiskCfgValue(reqData,function(res) {
            if(res.msret.msgcode == "00") {
                cms.message.success("删除风控配置成功.",5);
                $scope.preriskCloseModal();
                $scope.preriskGetRiskCfg($scope.currentMenu.type,$scope.currentMenu.id);
            }
            else {
                cms.message.error("删除风控配置失败."+res.msret.msg);
                cms.log("删除风控配置失败.",JSON.stringify(res.msret))
            }
        })
    }

});
