angular.module('cmsController').controller("optionManageCtrl", function($scope,mainService,optionManageService) {
	$scope.showSubguide = true;
	$scope.guideTree = [];

	$scope.currentPage = 1;
	$scope.allPage = 1;
	$scope.currentAuditPage = 1;
	$scope.allAuditPage = 1;
	$scope.pageSize = 20;

	$scope.currentTrid = "";
	$scope.currentStatus = "0";
	$scope.currentAuditStat = "0";
	$scope.currentAuditType = "0";

	$scope.tatrdOptionHolds = [];
	$scope.tatrdOptionHoldAudits = [];

	$scope.modalInfo = {};
	$scope.currentOption = {};

	$scope.$on("changedManager_broadcast", function(event, message) {
		$scope.getGuideData();
	});

	$scope.$on("changedProduct_broadcast", function(event, message) {
        $scope.getGuideData();
	});

    $scope.$on("changedTradeUnit_broadcast", function(event, message) {
		$scope.getGuideData();
	});

	// 页面初始化
	$scope.controllerInit = function() {
		$scope.currentTrid = "";
		$scope.currentStatus = "0";
		$scope.currentAuditStat = "0";
		$scope.currentAuditType = "0";
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.stateEnum.addOption = 1;
		$scope.modalInfo.stateEnum.auditOption = 2;
		$scope.modalInfo.stateEnum.stopOption = 3;
		$scope.getGuideData();
	}

	// 获取导航数据
	$scope.getGuideData = function() {
		var tamgrKey = 0;
		var tacapKey = 0;
		var tatrdKey = 0;
		var maidList = [];
		var caidList = [];
		var tridList = [];
		optionManageService.getTamgr({body:{}}, function(maidres) {
			if (maidres.msret.msgcode !== "00") {
				cms.message.error("获取数据失败.");
				cms.log("获取资产管理人失败: ", JSON.stringify(maidres.msret));
				return ;
			}
			maidList = maidres.body;
			tamgrKey = 1;
			if (tacapKey == 1 && tatrdKey == 1) {
				$scope.makeGuideTree(maidList, caidList, tridList);
				$scope.$apply();
			}
		});
		optionManageService.getTacap({body:{}}, function(caidres) {
			if (caidres.msret.msgcode !== "00") {
				cms.message.error("获取数据失败.");
				cms.log("获取产品失败: ", JSON.stringify(caidres.msret));
				return ;
			}
			caidList = caidres.body;
			tacapKey = 1;
			if (tamgrKey == 1 && tatrdKey == 1) {
				$scope.makeGuideTree(maidList, caidList, tridList);
				$scope.$apply();
			}
		});
		optionManageService.getTatrd({body:{}},function(tridres) {
			if(tridres.msret.msgcode !== "00") {
				cms.message.error("获取数据失败.");
				cms.log("获取策略组合失败: ", JSON.stringify(tridres.msret));
				return ;
			}
			tridList = tridres.body;
			tatrdKey = 1;
			if (tacapKey == 1 && tacapKey == 1) {
				$scope.makeGuideTree(maidList, caidList, tridList);
				$scope.$apply();
			}
		})
	}

	// 将三个数组构造成树
	$scope.makeGuideTree = function(maidList, caidList, tridList) {
		$scope.guideTree = [];
		var tatrdChildren = {};
		for (var i = 0; i < tridList.length; i ++) {
			if (typeof tatrdChildren[tridList[i].caid] == "undefined") {
				var existMaid = false;
				for (var j = 0; j < maidList.length; ++j) {
					if (maidList[j].maid == tridList[i].maid) {
						existMaid = true;
						break;
					}
				}
				if (!existMaid) {
					maidList.push({maid: tridList[i].maid, noRight: true});
				}
				var existCaid = false;
				for (var k = 0; k < caidList.length; ++k) {
					if (caidList[k].caid == tridList[i].caid) {
						existCaid = true;
						break;
					}
				}
				if (!existCaid) {;
					caidList.push({maid: tridList[i].maid, caid: tridList[i].caid, noRight: true});
				}
			}
			tatrdChildren[tridList[i].caid] = tatrdChildren[tridList[i].caid] || [];
			tatrdChildren[tridList[i].caid].push(tridList[i]);
		}
		var tacapChildren = {};
		for (var i = 0; i < caidList.length; i ++) {
			if (typeof tacapChildren[caidList[i].maid] == "undefined") {
				var existMaid = false;
				for (var j = 0; j < maidList.length; ++j) {
					if (maidList[j].maid == caidList[i].maid) {
						existMaid = true;
						break;
					}
				}
				if (!existMaid) {
					maidList.push({maid: caidList[i].maid, noRight: true});
				}
			}
			tacapChildren[caidList[i].maid] = tacapChildren[caidList[i].maid] || [];
			tacapChildren[caidList[i].maid].push(caidList[i]);
		}
		for (var i = 0; i < maidList.length; i ++) {
			var temp = maidList[i];
			temp.menuId = temp.maid;
			temp.menuName = temp.maname;
			temp.type = 'maid';
			temp.children = [];
			if (tacapChildren[temp.maid]) {
				var data = tacapChildren[temp.maid];
				for (var j = 0; j < data.length; j ++) {
					var temp1 = data[j];
					temp1.menuId = temp1.caid;
					temp1.menuName = temp1.caname;
					temp1.type = 'caid';
					temp1.children = [];
					if (tatrdChildren[temp1.caid]) {
						var data1 = tatrdChildren[temp1.caid];
						for (var k = 0; k < data1.length; k ++) {
							var temp2 = data1[k];
							temp2.menuId = temp2.trid;
							temp2.menuName = temp2.trname;
							temp2.type = 'trid';
							temp1.children.push(temp2);
						}
					}
					temp.children.push(temp1);
				}
			}
			$scope.guideTree.push(temp);
		}
	}

	// 点击菜单
	$scope.clickGuideMenu = function(tatrd) {
		$scope.currentTrid = tatrd.trid;
		$scope.getTatrdOptionHold(1);
		$scope.getTatrdOptionHoldAudit(1);
	}

	// 获取期权持仓
	$scope.getTatrdOptionHold = function(page) {
		if ($scope.currentTrid === "") {
			cms.message.error("请选择交易单元");
			return ;
		}
		var reqData = {body: {
			trid: $scope.currentTrid,
			status: $scope.currentStatus,
			page: page,
			pageSize: $scope.pageSize
		}};
		optionManageService.getTatrdOptionHold(reqData, function(res) {
			if (res.msret.msgcode !== "00") {
				cms.message.error("获取期权持仓失败.");
				cms.log("获取期权持仓失败: ", JSON.stringify(res.msret));
				return ;
			}
			$scope.currentPage = res.body.page;
			$scope.allPage = Math.ceil(res.body.totalCount / $scope.pageSize) == 0 ? 1 : Math.ceil(res.body.totalCount / $scope.pageSize);
			$scope.tatrdOptionHolds = res.body.data;
			$scope.$apply();
		})
	}

	// 获取审核表
	$scope.getTatrdOptionHoldAudit = function(page) {
		if ($scope.currentTrid === "") {
			cms.message.error("请选择交易单元");
			return ;
		}
		var reqData = {body: {
			trid: $scope.currentTrid,
			audit_stat: $scope.currentAuditStat,
			audit_type: $scope.currentAuditType,
			page: page,
			pageSize: $scope.pageSize
		}};
		optionManageService.getTatrdOptionHoldAudit(reqData, function(res) {
			if (res.msret.msgcode !== "00") {
				cms.message.error("获取期权持仓审核列表失败.");
				cms.log("获取期权持仓审核列表失败: ", JSON.stringify(res.msret));
				return ;
			}
			$scope.currentAuditPage = res.body.page;
			$scope.allAuditPage = Math.ceil(res.body.totalCount / $scope.pageSize) == 0 ? 1 : Math.ceil(res.body.totalCount / $scope.pageSize);
			$scope.tatrdOptionHoldAudits = res.body.data;
			$scope.$apply();
		})
	}

	// 打开弹框
	$scope.openModal = function(state) {
		$scope.modalInfo.state = state;
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addOption:
				$scope.modalInfo.path = "../option-manage/add-option.html";
				break;
			case $scope.modalInfo.stateEnum.auditOption:
				$scope.modalInfo.path = "../option-manage/audit-option.html";
				break;
			case $scope.modalInfo.stateEnum.stopOption:
				$scope.modalInfo.path = "../option-manage/stop-option.html";
				break;
			default:
				$scope.modalInfo.path = "";
				break;
		}
	}
	// 弹框加载完成
	$scope.modalLoadReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addOption:
				mainService.showModal("option_modal_back", "option_add_modal", "option_add_modal_title");
				break;
			case $scope.modalInfo.stateEnum.auditOption:
				mainService.showModal("option_modal_back", "option_audit_modal", "option_audit_modal_title");
				break;
			case $scope.modalInfo.stateEnum.stopOption:
				mainService.showModal("option_modal_back", "option_stop_modal", "option_stop_modal_title");
				break;
			default:
				break;
		}
	}
	// 关闭弹框
	$scope.closeModal = function() {
		mainService.hideModal("option_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = ""
	}

	// 录入期权
	$scope.addOption = function() {
		if ($scope.currentTrid == "") {
			cms.message.error("请先选择策略组合.");
			return ;
		}

		$scope.currentOption.opreateType = 1;
		$scope.currentOption.ukright = false;
		$scope.currentOption.trid = $scope.currentTrid;
		$scope.currentOption.contract_no = "";
		$scope.currentOption.counter_party = "";
		$scope.currentOption.ukcode = "";
		$scope.currentOption.direction = "1";
		$scope.currentOption.option_type = "1";
		$scope.currentOption.interest_rate = "";
		$scope.currentOption.begin_date = new Date();
		$scope.currentOption.expire_date = new Date();
		$scope.currentOption.initial_price = "";
		$scope.currentOption.final_price = "";
		$scope.currentOption.validvol = "";
		$scope.currentOption.notional = "";
		$scope.currentOption.fixed_yield = "";
		$scope.currentOption.premium_ratio = "";
		$scope.currentOption.premium = "";
		$scope.currentOption.margin_ratio = "";
		$scope.currentOption.margin = "";
		$scope.currentOption.margin_call_ratio = "";
		$scope.currentOption.margin_close_ratio = "";
		$scope.currentOption.hedging_vol = "";
		$scope.currentOption.market_vol = "";
		$scope.currentOption.strike_price = "";
		$scope.currentOption.strike_price_ratio = "";
		$scope.currentOption.strike_float_ratio = "";
		$scope.openModal($scope.modalInfo.stateEnum.addOption);
	}

	$scope.editOptionAudit = function(audit) {
		if (audit.audit_stat != 0) return ;
		$scope.currentOption.opreateType = 2;
		$scope.currentOption.ukright = true;
		$scope.currentOption.id = audit.id;
		$scope.currentOption.trid = audit.trid;
		$scope.currentOption.contract_no = audit.contract_no;
		$scope.currentOption.counter_party = audit.counter_party;
		$scope.currentOption.ukcode = audit.ukcode;
		$scope.currentOption.direction = audit.direction;
		$scope.currentOption.option_type = audit.option_type;
		$scope.currentOption.interest_rate = Number(audit.interest_rate);
		$scope.currentOption.begin_date = cms.getDateFromString(audit.begin_date);
		$scope.currentOption.expire_date = cms.getDateFromString(audit.expire_date);
		$scope.currentOption.initial_price = Number(audit.initial_price);
		$scope.currentOption.final_price = Number(audit.final_price);
		$scope.currentOption.validvol = Number(audit.validvol).toFixed(2);
		$scope.currentOption.notional = Number(audit.notional).toFixed(2);
		$scope.currentOption.fixed_yield = Number(audit.fixed_yield);
		$scope.currentOption.premium_ratio = Number(audit.premium_ratio);
		$scope.currentOption.premium = Number(audit.premium);
		$scope.currentOption.margin_ratio = Number(audit.margin_ratio);
		$scope.currentOption.margin = Number(audit.margin);
		$scope.currentOption.margin_call_ratio = Number(audit.margin_call_ratio);
		$scope.currentOption.margin_close_ratio = Number(audit.margin_close_ratio);
		$scope.currentOption.hedging_vol = Number(audit.hedging_vol);
		$scope.currentOption.market_vol = Number(audit.market_vol);
		$scope.currentOption.strike_price = Number(audit.strike_price);
		$scope.currentOption.strike_price_ratio = Number(audit.strike_price_ratio);
		$scope.currentOption.strike_float_ratio = Number(audit.strike_float_ratio);
		$scope.openModal($scope.modalInfo.stateEnum.addOption);
	}

	$scope.editOption = function(option) {
		if (option.status != "0") {
			cms.message.error("非法操作");
			return ;
		}
		$scope.currentOption.opreateType = 3;
		$scope.currentOption.ukright = true;
		$scope.currentOption.holdid = option.holdid;
		$scope.currentOption.trid = option.trid;
		$scope.currentOption.contract_no = option.contract_no;
		$scope.currentOption.counter_party = option.counter_party;
		$scope.currentOption.ukcode = option.ukcode;
		$scope.currentOption.direction = option.direction;
		$scope.currentOption.option_type = option.option_type;
		$scope.currentOption.interest_rate = Number(option.interest_rate);
		$scope.currentOption.begin_date = cms.getDateFromString(option.begin_date);
		$scope.currentOption.expire_date = cms.getDateFromString(option.expire_date);
		$scope.currentOption.initial_price = Number(option.initial_price);
		$scope.currentOption.final_price = Number(option.final_price);
		$scope.currentOption.validvol = Number(option.validvol).toFixed(2);
		$scope.currentOption.notional = Number(option.notional).toFixed(2);
		$scope.currentOption.fixed_yield = Number(option.fixed_yield);
		$scope.currentOption.premium_ratio = Number(option.premium_ratio);
		$scope.currentOption.premium = Number(option.premium);
		$scope.currentOption.margin_ratio = Number(option.margin_ratio);
		$scope.currentOption.margin = Number(option.margin);
		$scope.currentOption.margin_call_ratio = Number(option.margin_call_ratio);
		$scope.currentOption.margin_close_ratio = Number(option.margin_close_ratio);
		$scope.currentOption.hedging_vol = Number(option.hedging_vol);
		$scope.currentOption.market_vol = Number(option.market_vol);
		$scope.currentOption.strike_price = Number(option.strike_price);
		$scope.currentOption.strike_price_ratio = Number(option.strike_price_ratio);
		$scope.currentOption.strike_float_ratio = Number(option.strike_float_ratio);
		$scope.openModal($scope.modalInfo.stateEnum.addOption);
	}
	// 终止期权
	$scope.stopOption = function(option) {
		if (option.status != "0") {
			cms.message.error("非法操作");
			return ;
		}
		$scope.currentOption.opreateType = 4;
		$scope.currentOption.ukright = true;
		$scope.currentOption.holdid = option.holdid;
		$scope.currentOption.trid = option.trid;
		$scope.currentOption.contract_no = option.contract_no;
		$scope.currentOption.counter_party = option.counter_party;
		$scope.currentOption.ukcode = option.ukcode;
		$scope.currentOption.direction = option.direction;
		$scope.currentOption.option_type = option.option_type;
		$scope.currentOption.interest_rate = Number(option.interest_rate);
		$scope.currentOption.begin_date = cms.getDateFromString(option.begin_date);
		$scope.currentOption.expire_date = cms.getDateFromString(option.expire_date);
		$scope.currentOption.initial_price = Number(option.initial_price);
		$scope.currentOption.final_price = Number(option.final_price);
		$scope.currentOption.validvol = Number(option.validvol).toFixed(2);
		$scope.currentOption.notional = Number(option.notional).toFixed(2);
		$scope.currentOption.fixed_yield = Number(option.fixed_yield);
		$scope.currentOption.premium_ratio = Number(option.premium_ratio);
		$scope.currentOption.premium = Number(option.premium);
		$scope.currentOption.margin_ratio = Number(option.margin_ratio);
		$scope.currentOption.margin = Number(option.margin);
		$scope.currentOption.margin_call_ratio = Number(option.margin_call_ratio);
		$scope.currentOption.margin_close_ratio = Number(option.margin_close_ratio);
		$scope.currentOption.hedging_vol = Number(option.hedging_vol);
		$scope.currentOption.market_vol = Number(option.market_vol);
		$scope.currentOption.strike_price = Number(option.strike_price);
		$scope.currentOption.strike_price_ratio = Number(option.strike_price_ratio);
		$scope.currentOption.strike_float_ratio = Number(option.strike_float_ratio);
		$scope.openModal($scope.modalInfo.stateEnum.stopOption)
	}

	$scope.checkUkcode = function() {
		$scope.currentOption.ukright = false;
		var regUk = /^(0|([1-9][0-9]{0,31}))$/;
		if (regUk.test($scope.currentOption.ukcode)) {
			optionManageService.getUkeyInfo({body:{ukcode: $scope.currentOption.ukcode}}, function(res) {
				if (res.msret.msgcode == "00" && res.body.length == 1 && res.body[0].ukcode == $scope.currentOption.ukcode) {
					$scope.currentOption.ukright = true;
				}
			})
		}
	}

	// 输入期初价格
	$scope.initialPriceChange = function() {
		if (parseFloat($scope.currentOption.initial_price) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.validvol = parseFloat($scope.currentOption.initial_price) == 0 ? 0 : Number(Number(parseFloat($scope.currentOption.notional) / parseFloat($scope.currentOption.initial_price)).toFixed(2));
		}
		if (parseFloat($scope.currentOption.strike_price_ratio) != NaN && parseFloat($scope.currentOption.initial_price) != NaN) {
			$scope.currentOption.strike_price = Number(Number(parseFloat($scope.currentOption.strike_price_ratio) * parseFloat($scope.currentOption.initial_price)).toFixed(3));
		}
		if (parseFloat($scope.currentOption.premium_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.premium = Number(Number(parseFloat($scope.currentOption.premium_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
		if (parseFloat($scope.currentOption.margin_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.margin = Number(Number(parseFloat($scope.currentOption.margin_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
	}

	// 输入持仓数量
	$scope.validvolChange = function() {
		if (parseFloat($scope.currentOption.initial_price) != NaN && parseFloat($scope.currentOption.validvol) != NaN) {
			$scope.currentOption.notional = Number(Number(parseFloat($scope.currentOption.initial_price) * parseFloat($scope.currentOption.validvol)).toFixed(2));
		}
		if (parseFloat($scope.currentOption.premium_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.premium = Number(Number(parseFloat($scope.currentOption.premium_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
		if (parseFloat($scope.currentOption.margin_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.margin = Number(Number(parseFloat($scope.currentOption.margin_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
	}

	// 输入名义本金
	$scope.notionalChange = function() {
		if (parseFloat($scope.currentOption.initial_price) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.validvol = parseFloat($scope.currentOption.initial_price) == 0 ? 0 : Number(Number(parseFloat($scope.currentOption.notional) / parseFloat($scope.currentOption.initial_price)).toFixed(2));
		}
		if (parseFloat($scope.currentOption.premium_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.premium = Number(Number(parseFloat($scope.currentOption.premium_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
		if (parseFloat($scope.currentOption.margin_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.margin = Number(Number(parseFloat($scope.currentOption.margin_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
	}

	// 输入权利金比例
	$scope.premiumRatioChange = function() {
		if (parseFloat($scope.currentOption.premium_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.premium = Number(Number(parseFloat($scope.currentOption.premium_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
	}
	// 输入权利金
	$scope.premiumChange = function() {
		if (parseFloat($scope.currentOption.premium) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.premium_ratio = Number(Number(parseFloat($scope.currentOption.premium) / parseFloat($scope.currentOption.notional)).toFixed(4));
		}
	}

	// 输入保证金比例
	$scope.marginRatioChange = function() {
		if (parseFloat($scope.currentOption.margin_ratio) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.margin = Number(Number(parseFloat($scope.currentOption.margin_ratio) * parseFloat($scope.currentOption.notional)).toFixed(3));
		}
	}

	// 输入保证金
	$scope.marginChange = function() {
		if (parseFloat($scope.currentOption.margin) != NaN && parseFloat($scope.currentOption.notional) != NaN) {
			$scope.currentOption.margin_ratio = Number(Number(parseFloat($scope.currentOption.margin) / parseFloat($scope.currentOption.notional)).toFixed(4));
		}
	}

	// 输入执行价比例
	$scope.strikePriceRatioChange = function() {
		if (parseFloat($scope.currentOption.strike_price_ratio) != NaN && parseFloat($scope.currentOption.initial_price) != NaN) {
			$scope.currentOption.strike_price = Number(Number(parseFloat($scope.currentOption.strike_price_ratio) * parseFloat($scope.currentOption.initial_price)).toFixed(3));
		}
	}

	// 输入执行价
	$scope.strikePriceChange = function() {
		if (parseFloat($scope.currentOption.strike_price) != NaN && parseFloat($scope.currentOption.initial_price) != NaN) {
			$scope.currentOption.strike_price_ratio = Number(Number(parseFloat($scope.currentOption.strike_price) / parseFloat($scope.currentOption.initial_price)).toFixed(4));
		}
	}

	// 确定
	$scope.editOptionSure = function() {
		/*(17,3)*/
		var regfloat1 = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,3})?$/;
		/*(16,2)*/
		var regfloat = /^(0|([1-9][0-9]{0,13}))(\.[0-9]{1,2})?$/;
		/*(17,4)*/
		var regRate = /^(0|([1-9][0-9]{0,12}))(\.[0-9]{1,4})?$/;
		/*(32,0)*/
		var regUk = /^(0|([1-9][0-9]{0,31}))$/;
		if ($scope.currentOption.contract_no === "") {
			cms.message.error("请输入合约编码");
			return ;
		}
		if ($scope.currentOption.counter_party === "") {
			cms.message.error("请输入对手方");
			return ;
		}
		if ($scope.currentOption.ukright == false) {
			cms.message.error("请正确输入UK编码");
			return ;
		}
		if (typeof $scope.currentOption.begin_date == "undefined") {
			cms.message.error("请设置开始日期");
			return ;
		}
		if (typeof $scope.currentOption.expire_date == "undefined") {
			cms.message.error("请设置到期日期");
			return ;
		}
		if (parseInt(cms.formatDate_ex($scope.currentOption.begin_date)) >= parseInt(cms.formatDate_ex($scope.currentOption.expire_date))) {
			cms.message.error("开始日期必须早于到期日期");
			return ;
		}
		if (parseInt(cms.formatDate_ex(new Date())) < parseInt(cms.formatDate_ex($scope.currentOption.begin_date))) {
			cms.message.error("开始日期不能晚于当天");
			return ;
		}
		if (parseInt(cms.formatDate_ex(new Date())) >= parseInt(cms.formatDate_ex($scope.currentOption.expire_date))) {
			cms.message.error("到期日期必须晚于当天");
			return ;
		}
		if (!regRate.test($scope.currentOption.interest_rate)) {
			cms.message.error("利率为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if (!regfloat1.test($scope.currentOption.initial_price)) {
			cms.message.error("期初价格为小于 100,000,000,000,000 的三位浮点数");
			return ;
		}
		if (!regfloat1.test($scope.currentOption.final_price)) {
			cms.message.error("期末价格为小于 100,000,000,000,000 的三位浮点数");
			return ;
		}
		if (!regfloat.test($scope.currentOption.validvol)) {
			cms.message.error("持仓数量为小于 100,000,000,000,000 的两位浮点数");
			return ;
		}
		if (!regfloat.test($scope.currentOption.notional)) {
			cms.message.error("名义本金为小于 100,000,000,000,000 的两位浮点数");
			return ;
		}
		if (!regRate.test($scope.currentOption.strike_price_ratio)) {
			cms.message.error("执行价比例为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if (!regfloat1.test($scope.currentOption.strike_price)) {
			cms.message.error("执行价为小于 100,000,000,000,000 的三位浮点数");
			return ;
		}
		if ($scope.currentOption.option_type == "3" && !regRate.test($scope.currentOption.strike_float_ratio)) {
			cms.message.error("执行价浮动比例为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if ($scope.currentOption.option_type == "3" && !regRate.test($scope.currentOption.fixed_yield)) {
			cms.message.error("固定收益率为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if ($scope.currentOption.option_type != "3" && !regRate.test($scope.currentOption.premium_ratio)) {
			cms.message.error("权利金比例为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if ($scope.currentOption.option_type != "3" && !regfloat1.test($scope.currentOption.premium)) {
			cms.message.error("权利金为小于 100,000,000,000,000 的三位浮点数");
			return ;
		}
		if ( $scope.currentOption.direction == "1" && !regRate.test($scope.currentOption.margin_ratio)) {
			cms.message.error("保证金比例为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if ( $scope.currentOption.direction == "1" && !regfloat1.test($scope.currentOption.margin)) {
			cms.message.error("保证金为小于 100,000,000,000,000 的三位浮点数");
			return ;
		}
		if ($scope.currentOption.direction == "1" && !regRate.test($scope.currentOption.margin_call_ratio)) {
			cms.message.error("追保线比例为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if ($scope.currentOption.direction == "1" && !regRate.test($scope.currentOption.margin_close_ratio)) {
			cms.message.error("平仓线比例为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if (!regRate.test($scope.currentOption.hedging_vol)) {
			cms.message.error("对冲波动率为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		if (!regRate.test($scope.currentOption.market_vol)) {
			cms.message.error("盯市波动率为小于 10,000,000,000,000 的四位浮点数");
			return ;
		}
		var reqData = {body: {
			trid: $scope.currentOption.trid,
			contract_no: $scope.currentOption.contract_no,
			counter_party: $scope.currentOption.counter_party,
			ukcode: $scope.currentOption.ukcode,
			direction: $scope.currentOption.direction,
			option_type: $scope.currentOption.option_type,
			interest_rate: $scope.currentOption.interest_rate,
			begin_date: cms.formatDate_ex($scope.currentOption.begin_date),
			expire_date: cms.formatDate_ex($scope.currentOption.expire_date),
			initial_price: $scope.currentOption.initial_price,
			final_price: $scope.currentOption.final_price,
			validvol: $scope.currentOption.validvol,
			notional: $scope.currentOption.notional,
			fixed_yield: $scope.currentOption.option_type == "3" ?  $scope.currentOption.fixed_yield : "0",
			premium_ratio: $scope.currentOption.option_type != "3" ? $scope.currentOption.premium_ratio : "0",
			premium: $scope.currentOption.option_type != "3" ? $scope.currentOption.premium : "0",
			margin_ratio: $scope.currentOption.direction == "1" ? $scope.currentOption.margin_ratio : "0",
			margin: $scope.currentOption.direction == "1" ? $scope.currentOption.margin : "0",
			margin_call_ratio: $scope.currentOption.direction == "1" ? $scope.currentOption.margin_call_ratio : "0",
			margin_close_ratio: $scope.currentOption.direction == "1" ? $scope.currentOption.margin_close_ratio : "0",
			hedging_vol: $scope.currentOption.hedging_vol,
			market_vol: $scope.currentOption.market_vol,
			strike_price: $scope.currentOption.strike_price,
			strike_price_ratio: $scope.currentOption.strike_price_ratio,
			strike_float_ratio: $scope.currentOption.option_type == "3" ? $scope.currentOption.strike_float_ratio : "0"
		}}
		if ($scope.currentOption.opreateType === 3) {
			reqData.body.holdid = $scope.currentOption.holdid;
			reqData.body.audit_type = 1;
		} else if ($scope.currentOption.opreateType === 4) {
			reqData.body.holdid = $scope.currentOption.holdid;
			reqData.body.audit_type = 2;
		} else {
			reqData.body.audit_type = 0;
		}
		$scope.addOptionSure(reqData, $scope.currentOption.opreateType);
	}

	// 录入期权写入数据库
	$scope.addOptionSure = function(reqData, type) {
		optionManageService.addTatrdOptionHoldAudit(reqData, function(res) {
			if (res.msret.msgcode !== "00") {
				if (type == 3) {
					cms.message.error("修改期权失败." + res.msret.msg);
					cms.log("修改期权失败: ", JSON.stringify(res.msret));
				} else if ( type == 4) {
					cms.message.error("终止期权失败." + res.msret.msg);
					cms.log("终止期权失败: ", JSON.stringify(res.msret));
				} else {
					cms.message.error("录入期权失败." + res.msret.msg);
					cms.log("添加期权失败: ", JSON.stringify(res.msret));
				}
				return ;
			}
			if (type == 3) {
				cms.message.success("修改成功");
			} else if (type == 4) {
				cms.message.success("终止成功");
			} else {
				cms.message.success("录入成功");
			}
			$scope.closeModal();
			$scope.getTatrdOptionHoldAudit($scope.currentAuditPage);
		})
	}

	// 修改未审核的写入数据
	$scope.updateOptionAuditSure = function(reqData) {
		optionManageService.updateTatrdOptionHoldAudit(reqData, function(res) {
			if (res.msret.msgcode !== "00") {
				cms.message.error("修改失败." + res.msret.msg);
				cms.log("修改期权失败: ", JSON.stringify(res.msret));
				return ;
			}
			cms.message.success("修改成功");
			$scope.closeModal();
			$scope.getTatrdOptionHoldAudit($scope.currentAuditPage);
		})
	}

	// 审核
	$scope.auditOption = function(audit, audit_stat) {
		$scope.currentOption.id = audit.id;
		$scope.currentOption.audit_type = audit.audit_type;
		$scope.currentOption.audit_stat = audit_stat;
		$scope.openModal($scope.modalInfo.stateEnum.auditOption)
	}

	// 确定审核
	$scope.auditOptionSure = function() {
		var reqData = {body: {
			id: $scope.currentOption.id,
			audit_type: $scope.currentOption.audit_type,
			audit_stat: $scope.currentOption.audit_stat
		}}
		optionManageService.auditTatrdOptionHold(reqData, function(res) {
			if (res.msret.msgcode != "00") {
				cms.message.error("操作失败." + res.msret.msg);
				cms.log("审核期权失败: ", JSON.stringify(res.msret));
				return ;
			}
			cms.message.success("操作成功");
			$scope.closeModal();
			if ($scope.tatrdOptionHoldAudits.length <= 1) {
				$scope.getTatrdOptionHoldAudit(1);
			} else {
				$scope.getTatrdOptionHoldAudit($scope.currentAuditPage);
			}
			$scope.getTatrdOptionHold($scope.currentPage);
		})
	}
});
