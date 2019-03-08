angular.module('cmsController').controller('lrTatractCtrl',function($scope,$interval,mainService,laterRiskService,lrTatractService) {
	$scope.showOptions = false;
	$scope.options = {};
	$scope.tamgrList = [];
	$scope.taactList = [];
	$scope.rangeOptions = [];
	$scope.tatractHolds = [];

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	//设置定时拉取数据
	$scope.timeRuning = false;
	$scope.timer = null;

	$scope.$on("changedManager_broadcast", function(event, message) {
		$scope.lrTatractGetTamgr();
	});

	$scope.$on("changedAssetAccount_broadcast", function(event, message) {
		$scope.lrTatractGetTacap();
	});

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	$scope.lrTatractInit = function() {
		$scope.options.maid = "";
		$scope.options.marketcode = "";
		$scope.options.cname = "";
		$scope.options.totalvolOption = ">";
		$scope.options.totalvol = "";
		$scope.options.pretotalvolOption = ">";
		$scope.options.pretotalvol = "";
		$scope.rangeOptions.push({option:">"});
		$scope.rangeOptions.push({option:">="});
		$scope.rangeOptions.push({option:"<"});
		$scope.rangeOptions.push({option:"<="});
		$scope.rangeOptions.push({option:"!="});
		$scope.tamgrList.splice(0,$scope.tamgrList.length);
		$scope.taactList.splice(0,$scope.taactList.length);
		$scope.tatractHolds.splice(0,$scope.tatractHolds.length);
		$scope.lrTatractGetTamgr();

	}

	//菜单改变
	$scope.$on("laterRiskMenuChange",function(event,menu) {
		if(menu.menuId == "2003002002" ) {
			$scope.timeRuning = true;
			$scope.lrTatractAddLevel();
			$scope.timer = $interval(function () {
				$scope.lrTatractGetLastPrice();
			}, 5000);
		}
		else {
			if($scope.timeRuning == true) {
				$scope.lrTatractRemovelLevel();
				$scope.timeRuning = false;
				$interval.cancel($scope.timer);
				$scope.timer = null;
			}
		}
	})

	//页面关闭
	$scope.$on("$destroy", function() {
		if($scope.timeRuning == true) {
			$scope.lrTatractRemovelLevel();
			$scope.timeRuning = false;
			$interval.cancel($scope.timer);
			$scope.timer = null;
		}
    });

	//订阅股票
	$scope.lrTatractAddLevel = function() {
		// var level2 = 0;
		// var ctp = 0;
		// var addCode =[];
		// angular.forEach($scope.tatractHolds,function(hold) {
		// 	if(hold.majortype == 1) {
		// 		level2 =1;
		// 	}
		// 	if(hold.majortype == 10) {
		// 		ctp = 1;
		// 	}
		// 	lrTatractService.addConjuncture(hold.marketcode,hold.majortype);
		// });
		// lrTatractService.sendConjuncture(level2,ctp);

		mainService.subscribeMarket($scope.tatractHolds);
	}

	//取消订阅
	$scope.lrTatractRemovelLevel = function() {
		// var level2 = 0;
		// var ctp = 0;
		// angular.forEach($scope.tatractHolds,function(hold) {
		// 	if(hold.majortype == 1) level2 =1;
		// 	if(hold.majortype == 10) ctp = 1;
		// 	lrTatractService.removeConjuncture(hold.marketcode,hold.majortype);
		// })
		// lrTatractService.sendConjuncture(level2,ctp);
		mainService.unsubscribeMarket($scope.tatractHolds);
	}

	//获取新的最新价格
	$scope.lrTatractGetLastPrice = function() {
		//获取股票数组
		// var level2 = [];
		// var ctp = [];
		// angular.forEach($scope.tatractHolds,function(hold) {
		// 	if(hold.majortype == 1) {
		// 		level2.push(hold.marketcode);
		// 	}
		// 	if(hold.majortype == 10) {
		// 		ctp.push(hold.marketcode);
		// 	}
		// })
		// var level2Price = mainService.getSubscribedStockInfo(level2);
		// var ctpPrice = mainService.getSubscribedFuturesInfo(ctp);
		// angular.forEach($scope.tatractHolds,function(hold) {
		// 	if(hold.majortype == 1) {
		// 		hold.lastprice = level2Price[hold.marketcode] ? (level2Price[hold.marketcode].LastPrice || "0") : "0";
		// 	}
		// 	if(hold.majortype == 10) {
		// 		hold.lastprice = ctpPrice[hold.marketcode] ? (ctpPrice[hold.marketcode].LastPrice || "0") : "0";
		// 	}
		// })

		$scope.tatractHolds.forEach(function(position) {
			if (cmsNet.ukeyMarketInfo.hasOwnProperty(position.ukcode)) {
				position.lastprice = cmsNet.ukeyMarketInfo[position.ukcode].last;
			}
			position.value = position.totalvol * position.lastprice;
		});
	}

	//获取资产管理人
	$scope.lrTatractGetTamgr = function() {
		var reqData = {body:{}};
		laterRiskService.getTamgr(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tamgrList = res.body;
				if($scope.tamgrList.length > 0) {
					$scope.options.maid = String($scope.tamgrList[0].maid);
					$scope.$apply();
					$scope.lrTatractGetTacap($scope.options.maid);
				}
			}
			else {
				cms.message.error("获取资产管理人列表失败.");
				cms.log("获取资产管理人列表失败：",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//获取产品
	$scope.lrTatractGetTacap = function(maid) {
		var reqData = {body:{maid:maid}};
		laterRiskService.getTacap(reqData,function(res1) {
			if(res1.msret.msgcode == "00") {
				laterRiskService.getTaact(reqData,function(res) {
					if(res.msret.msgcode == "00") {
						$scope.lrTatractMakeTaactTree(res1.body,res.body);
					}
					else {
						cms.message.error("获取资产账户列表失败.");
						cms.log("获取资产账户列表失败.",res.msret.msgcode,res.msret.msg);
					}
				})
			}
			else {
				cms.message.error("获取产品列表失败.");
				cms.log("获取产品列表失败.",res1.msret.msgcode,res1.msret.msg);
			}
		})
	}

	//构造账户树
	$scope.lrTatractMakeTaactTree = function(tacapArr,taactArr) {
		//去掉未绑定产品的账户
		for(var i = 0; i < taactArr.length ; ) {
			if(taactArr[i].caid == -1) {
				taactArr.splice(i,1);
			}
			else {
				i ++;
			}
		}
		for(var j = 0; j < tacapArr.length ; j++) {
			var product = {};
			product.maid = tacapArr[j].maid;
			product.caid = tacapArr[j].caid;
			product.caname = tacapArr[j].caname;
			product.leaf = false;
			product.select = false;
			product.fold = false;
			product.show = true;
			$scope.taactList.push(product);
			for(var k = 0; k < taactArr.length;) {
				if(taactArr[k].caid == product.caid) {
					var taact = {};
					taact.maid = taactArr[k].maid;
					taact.caid = taactArr[k].caid;
					taact.acid = taactArr[k].acid;
					taact.acname = taactArr[k].acname;
					taact.leaf = true;
					taact.select = false;
					taact.show = true;
					$scope.taactList.push(taact);
					taactArr.splice(k,1);
				}
				else {
					k ++;
				}
			}
			if($scope.taactList[$scope.taactList.length - 1].leaf == false) {
				$scope.taactList.splice($scope.taactList.length - 1 ,1);
			}
		}
		$scope.$apply();
	}

	//展开或收起账户列表
	$scope.lrTatractFoldTaactList = function(index) {
		$scope.taactList[index].fold = !$scope.taactList[index].fold;
		angular.forEach($scope.taactList,function(taact) {
			if(taact.caid == $scope.taactList[index].caid && taact.leaf == true) {
				taact.show = !$scope.taactList[index].fold;
			}
		})
	}

	//选择账户或者取消
	$scope.lrTatractSelectTaact = function(index) {
		if($scope.taactList[index].leaf == false) {
			angular.forEach($scope.taactList,function(taact) {
				if(taact.caid == $scope.taactList[index].caid && taact.leaf == true) {
					taact.select = $scope.taactList[index].select ;
				}
			})
		}
		else {
			var caid = $scope.taactList[index].caid ;
			var key = true;
			for(var i = 0; i < $scope.taactList.length; i++) {
				if($scope.taactList[i].caid == caid && $scope.taactList[i].leaf == true && $scope.taactList[i].select == false) {
					key = false;
					break;
				}
			}
			for(var j = 0; j < $scope.taactList.length ; j ++) {
				if($scope.taactList[j].caid == caid && $scope.taactList[j].leaf == false) {
					$scope.taactList[j].select = key;
					break;
				}
			}
		}
	}

	//切换资产管理人
	$scope.lrTatractChangeMaid = function() {
		$scope.taactList.splice(0,$scope.taactList.length);
		$scope.lrTatractGetTacap($scope.options.maid);
	}

	//查询持仓
	$scope.lrTatractGetHold = function() {
		var iReg = /^(0|([1-9][0-9]*))?$/;
		if(!iReg.test($scope.options.totalvol)) {
			cms.message.error("请正确输入持仓数量条件.");
			return ;
		}
		if(!iReg.test($scope.options.pretotalvol)) {
			cms.message.error("请正确输入昨仓条件.");
			return ;
		}
		var reqData = {body:{}};
		var acidArray = [];
		angular.forEach($scope.taactList,function(taact) {
			if(taact.select == true && taact.leaf == true) {
				acidArray.push(taact.acid);
			}
		})
		if(acidArray.length > 0) {
			reqData.body.acidArray = acidArray;
		}
		if($scope.options.marketcode != "") {
			reqData.body.marketcode = $scope.options.marketcode;
		}
		if($scope.options.cname != "") {
			reqData.body.cname = $scope.options.cname;
		}
		if($scope.options.totalvol != "") {
			reqData.body.totalvolOption = $scope.options.totalvolOption;
			reqData.body.totalvol = $scope.options.totalvol;
		}
		if($scope.options.pretotalvol != "") {
			reqData.body.pretotalvolOption = $scope.options.pretotalvolOption;
			reqData.body.pretotalvol = $scope.options.pretotalvol;
		}
		$scope.lrTatractRemovelLevel();
		lrTatractService.getTatractHold(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tatractHolds = res.body;
				angular.forEach($scope.tatractHolds,function(hold) {
					hold.holdprice = hold.totalvol == 0 ? 0 : hold.holdcost / hold.totalvol;
					hold.pre_holdprice = hold.pretotalvol == 0 ? 0 : hold.preholdcost / hold.pretotalvol;
					hold.lastprice = "0";
				})
				$scope.timeRuning = true;
				$scope.lrTatractAddLevel();
				$scope.timer = $interval(function () {
					$scope.lrTatractGetLastPrice();
				}, 5000);
				$scope.$apply();
				if(res.body.length == 0) {
					cms.message.error("当前查询结果为空.");
				}
			}
			else {
				$scope.tatractHolds.splice(0,$scope.tatractHolds.length);
				$scope.$apply();
				cms.message.error("查询账户持仓失败.");
				cms.log("查询账户持仓失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//重置查询条件
	$scope.lrTatractResetOptions = function() {
		$scope.options.maid = "";
		$scope.options.marketcode = "";
		$scope.options.cname = "";
		$scope.options.totalvolOption = ">";
		$scope.options.totalvol = "";
		$scope.options.pretotalvolOption = ">";
		$scope.options.pretotalvol = "";
		$scope.tamgrList.splice(0,$scope.tamgrList.length);
		$scope.taactList.splice(0,$scope.taactList.length);
		$scope.lrTatractGetTamgr();
	}

})
