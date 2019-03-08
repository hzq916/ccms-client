angular.module('cmsController').controller('lrTraderCtrl',function($scope,mainService,laterRiskService,lrTraderService) {
	$scope.showOptions = false;
	$scope.options = {};
	$scope.tamgrList = [];
	$scope.tatrdList = [];
	$scope.traderList = [];
	$scope.rangeOptions = [];
	$scope.traderHolds = [];

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.$on("changedManager_broadcast", function(event, message) {
		$scope.lrTraderGetTamgr();
	});

	$scope.$on("changedTradeUnit_broadcast", function(event, message) {
	 	$scope.lrTraderGetTatrd();
	});

	$scope.$on("changedTrader_broadcast", function(event, message) {
	 	$scope.lrTraderGetTrader();
	});


	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	$scope.lrTraderInit = function() {
		$scope.options.maid = "";
		$scope.options.trid = "";
		$scope.options.marketcode = "";
		$scope.options.cname = "";
		$scope.options.totalvolOption = ">";
		$scope.options.totalvol = "";
		$scope.options.tradevolOption = ">";
		$scope.options.tradevol = "";
		$scope.options.overnight_plOption = ">";
		$scope.options.overnight_pl = "";
		$scope.options.closeplOption = ">";
		$scope.options.closepl = "";
		$scope.rangeOptions.push({option:">"});
		$scope.rangeOptions.push({option:">="});
		$scope.rangeOptions.push({option:"<"});
		$scope.rangeOptions.push({option:"<="});
		$scope.rangeOptions.push({option:"!="});
		$scope.tamgrList.splice(0,$scope.tamgrList.length);
		$scope.tatrdList.splice(0,$scope.tatrdList.length);
		$scope.traderList.splice(0,$scope.traderList.length);
		$scope.traderHolds.splice(0,$scope.traderHolds.length);
		$scope.lrTraderGetTamgr();
	}

	//获取资产管理人
	$scope.lrTraderGetTamgr = function() {
		var reqData = {body:{}};
		laterRiskService.getTamgr(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tamgrList = res.body;
				if($scope.tamgrList.length > 0) {
					$scope.options.maid = String($scope.tamgrList[0].maid);
					$scope.$apply();
					$scope.lrTraderGetTatrd($scope.options.maid);
				}
			}
			else {
				cms.message.error("获取资产管理人列表失败.");
				cms.log("获取资产管理人列表失败：",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//获取策略组合
	$scope.lrTraderGetTatrd = function(maid) {
		var reqData = {body:{maid:maid}};
		laterRiskService.getTatrd(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.tatrdList = res.body;
				if($scope.tatrdList.length > 0) {
					$scope.options.trid = String($scope.tatrdList[0].trid);
					$scope.$apply();
					//获取交易员
					$scope.lrTraderGetTrader($scope.options.trid);
				}
			}
			else {
				cms.message.error("获取策略组合列表失败.");
				cms.log("获取策略组合列表失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//获取交易员列表
	$scope.lrTraderGetTrader = function(trid) {
		var reqData = {body:{trid:trid}};
		laterRiskService.getTrader(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.traderList = res.body;
				angular.forEach($scope.traderList,function(trader) {
					trader.select  = false;
				})
				$scope.$apply();
			}
			else {
				cms.message.error("获取交易员列表失败.");
				cms.log("获取交易员列表失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//切换资产管理人
	$scope.lrTraderChangeMaid = function() {
		$scope.tatrdList.splice(0,$scope.tatrdList.length);
		$scope.traderList.splice(0,$scope.traderList.length);
		$scope.options.trid = "";
		$scope.lrTraderGetTatrd($scope.options.maid);
		$scope.lrTraderGetTacap($scope.options.maid);
	}

	//切换策略组合
	$scope.lrTraderChangeTrid = function() {
		$scope.traderList.splice(0,$scope.traderList.length);
		$scope.lrTraderGetTrader($scope.options.trid);
	}

	//点击查询
	$scope.lrTraderGetHold = function() {
		var iReg = /^(0|([1-9][0-9]*))?$/;
		var fReg = /^((0|([1-9][0-9]*))(\.[0-9][0-9]*)?)?$/
		if(!iReg.test($scope.options.totalvol)) {
			cms.message.error("请正确输入今仓数量条件.");
			return ;
		}
		if(!iReg.test($scope.options.tradevol)) {
			cms.message.error("请正确输入交易股数条件.");
			return ;
		}
		if(!fReg.test($scope.options.overnight_pl)) {
			cms.message.error("请正确输入平隔夜仓盈亏条件.");
			return ;
		}
		if(!fReg.test($scope.options.closepl)) {
			cms.message.error("请正确输入平仓盈亏条件.");
			return ;
		}
		var reqData = {body:{}};
		var traderidArray = [];
		angular.forEach($scope.traderList,function(trader) {
			if(trader.select == true) {
				traderidArray.push(trader.traderid);
			}
		})
		if(traderidArray.length > 0) {
			reqData.body.traderidArray = traderidArray;
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
		if($scope.options.tradevol != "") {
			reqData.body.tradevolOption = $scope.options.tradevolOption;
			reqData.body.tradevol = $scope.options.tradevol;
		}
		if($scope.options.overnight_pl != "") {
			reqData.body.overnight_plOption = $scope.options.overnight_plOption;
			reqData.body.overnight_pl = $scope.options.overnight_pl;
		}
		if($scope.options.closepl != "") {
			reqData.body.closeplOption = $scope.options.closeplOption;
			reqData.body.closepl = $scope.options.closepl;
		}
		lrTraderService.getTraderHold(reqData,function(res) {
			if(res.msret.msgcode == "00") {
				$scope.traderHolds = res.body;
				$scope.$apply();
				if(res.body.length == 0) {
					cms.message.error("当前查询结果为空.");
				}
			}
			else {
				$scope.traderHolds.splice(0,$scope.traderHolds.length);
				$scope.$apply();
				cms.message.error("查询交易员持仓失败.");
				cms.log("查询交易员持仓失败.",res.msret.msgcode,res.msret.msg);
			}
		})
	}

	//重置查询条件
	$scope.lrTraderResetOptions = function() {
		$scope.options.maid = "";
		$scope.options.trid = "";
		$scope.options.marketcode = "";
		$scope.options.cname = "";
		$scope.options.totalvolOption = ">";
		$scope.options.totalvol = "";
		$scope.options.tradevolOption = ">";
		$scope.options.tradevol = "";
		$scope.options.overnight_plOption = ">";
		$scope.options.overnight_pl = "";
		$scope.options.closeplOption = ">";
		$scope.options.closepl = "";
		$scope.tamgrList.splice(0,$scope.tamgrList.length);
		$scope.tatrdList.splice(0,$scope.tatrdList.length);
		$scope.traderList.splice(0,$scope.traderList.length);
		$scope.lrTraderGetTamgr();
	}
})
