angular.module('cmsController').controller('profitReportCtrl',function($scope,mainService,profitReportService) {
	$scope.showSubguide = true;
    $scope.maidList = [];
	$scope.caidList =[];
	$scope.tridList = [];
    $scope.guideTree = [];

	$scope.datums = [];
	$scope.datumObj = {};
	$scope.currentDatum = "";
	$scope.currentTrids = "";
	$scope.profitData = [];

	$scope.$on("changedManager_broadcast", function(event, message) {
		$scope.getUnits();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.getUnits();
	});

    $scope.$on("changedTradeUnit_broadcast", function(event, message) {
		$scope.getUnits();
	});

	$scope.profitReportInit = function() {
		$scope.datums = [
			{ ukcode: 2490389, chabbr: "中证500"},
			{ ukcode: 2490383, chabbr: "沪深300"}
		];
		$scope.currentDatum = String($scope.datums[0].ukcode);
		for (var i = 0; i < $scope.datums.length; i ++) {
			$scope.datumObj[$scope.datums[i].ukcode] = $scope.datums[i];
		}
		var date = new Date();
		$scope.startDate = new Date(date.getTime()  - 24*60*60*1000*2);
		$scope.endDate = new Date(date.getTime()  - 24*60*60*1000);
		$scope.getUnits();
	}

	//获取单元列表
	$scope.getUnits = function() {
		//获取资产管理人
		profitReportService.getTamgr({body:{}},function(maidres) {
			if(maidres.msret.msgcode == "00") {
				$scope.maidList.splice(0,$scope.maidList.length);
				$scope.maidList = maidres.body;
				// 开始 -- 获取产品
				profitReportService.getTacap({body:{}},function(caidres) {
					if(caidres.msret.msgcode == "00") {
						// 开始 -- 获取策略组合
						$scope.caidList.splice(0,$scope.caidList.length);
						$scope.caidList = caidres.body;
						profitReportService.getTatrd({body:{}},function(tridres) {
							if(tridres.msret.msgcode == "00") {
								$scope.tridList.splice(0,$scope.tridList.length);
								$scope.tridList = tridres.body;
								$scope.mekeTreeFromUnitList();
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
	$scope.mekeTreeFromUnitList = function() {
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

			var maIndex=cms.accurateSearch($scope.maidList,"maid",($scope.tridList[i].maid));
			if (maIndex != -1) {
				var caIndex=cms.accurateSearch($scope.maidList[maIndex].products,"caid",($scope.tridList[i].caid));
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
                    temp.children.push(temp1);
                }
            }
            destArray.push(temp);
        }
    }

	// 点击菜单
	$scope.clickGuideMenu = function(menu) {
		$scope.currentTrids = "";
		$scope.getTrids(menu);
		$scope.getProfitReport();
	}

	$scope.getTrids = function(node) {
		if (node.type == "trid") {
			$scope.currentTrids += node.trid + ",";
		}
		if (node.children) {
			node.children.forEach( item => {
				$scope.getTrids(item);
			})
		}
	}

	// 获取绩效报表
	$scope.getProfitReport = function() {
		if ($scope.currentTrids == "") {
			cms.message.error("请选择查询的策略组合");
			return ;
		}
		if (typeof $scope.startDate == "undefined" || typeof $scope.endDate == "undefined") {
			cms.message.error("请设置查询开始和结束日期");
			return ;
		}
		var date = new Date();
		var lastDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
		var startDate = $scope.startDate.getFullYear() * 10000 + ($scope.startDate.getMonth() + 1) * 100 + $scope.startDate.getDate();
		var endDate = $scope.endDate.getFullYear() * 10000 + ($scope.endDate.getMonth() + 1) * 100 + $scope.endDate.getDate();
		var lastDateV = lastDate.getFullYear() * 10000 + (lastDate.getMonth() + 1) * 100 + lastDate.getDate();

		if (endDate > lastDateV) {
			cms.message.error("结束日期必须早于当天");
			return ;
		}
		if (startDate >= endDate) {
			cms.message.error("开始日期必须早于结束日期");
			return ;
		}
		var reqData = {body: {
			trids: $scope.currentTrids,
			ukcode: $scope.currentDatum,
			startDate: String(startDate),
			endDate: String(endDate)
		}};
		profitReportService.getProfitReport(reqData, function(res) {
			 if (res.msret.msgcode != "00") {
				 cms.message.error("获取数据失败."+res.msret.msg)
				 $scope.profitData = [];
				 return ;
			 }
			 $scope.profitData = res.body;
			 $scope.$apply();
		});
	}

	// 改变日期
	$scope.changeDate = function() {
		if (typeof $scope.endDate !== "undefined" && typeof $scope.startDate !== "undefined") {
			$scope.getProfitReport();
		}
	}

	// 导出报表
	$scope.exportProfitReport = function() {
		if ($scope.profitData.length === 0) {
			cms.message.error("无数据可导出");
			return ;
		}
		var exportData = {};
		var headers = ["策略号","期初净值","期末净值","本期收益率","年化夏普率",
		"Beta值","年化Alpha值","年化波动率","索提诺比率","最大回撤率","信息比率"];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "绩效报表-数据导出";
		exportData.data = [];
		angular.forEach($scope.profitData,function(item) {
			var temp = [];
			temp.push(item.datatype == 0 ? ( !!$scope.datumObj[item.trid] ?  $scope.datumObj[item.trid].chabbr : item.trid ) : item.trid);
			temp.push(Number(item.begin_net).toFixed(4));
			temp.push(Number(item.end_net).toFixed(4));
			temp.push(Number(item.rate_return * 100).toFixed(4) + "%");
			temp.push(Number(item.sharpe).toFixed(4));
			temp.push(Number(item.beta).toFixed(4));
			temp.push(Number(item.alpha * 100).toFixed(4) + "%");
			temp.push(Number(item.volatility).toFixed(4));
			temp.push(item.datatype == 0 ? "" : Number(item.sortino).toFixed(4));
			temp.push(Number(item.maxdrawdown * 100).toFixed(4) + "%");
			temp.push(Number(item.information).toFixed(4));
			exportData.data.push(temp);
		})
		profitReportService.exportExcelFile(exportData,function(err,res) {
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

})
