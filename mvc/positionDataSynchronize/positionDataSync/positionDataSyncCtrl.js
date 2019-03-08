angular.module('cmsController').controller('positionDataSyncCtrl', function ($scope, $timeout, mainService, positionDataSyncService) {

	$scope.filterContent = "";

	$scope.modalInfo = {};
	$scope.modalInfo2 = {}; //二级弹框

	$scope.curClickedIndex = -1;


	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.searchContent = ""; //搜索框内容




	// $scope.isShowPositiondifferenceData = true; //是否有差异数据


	$scope.allAssetManager = [];
	$scope.currentTamgr = {};

	//资金数据同步中账户类型和同步状态
	$scope.currentAccountType = {};
	
	$scope.fundsDataAccountType = [
		{
			id:"0",
			name:"请选择账户类型"
		},
		{
			id:"1",
			name:"普通股票"
		},
		{
			id:"2",
			name:"信用股票"
		},
		{
			id:"3",
			name:"期货"
		},
		{
			id:"4",
			name:"股票期权"
		}
	];
	$scope.currentAccountType.id = "0";

	//持仓数据同步状态
	$scope.positionDataSyncStateList = [
		{
			id:"0",
			name:"请选择同步状态"
		},
		{
			id:"1",
			name:"已同步"
		},
		{
			id:"2",
			name:"未同步"
		}]; 

		$scope.currentPositionState = "0";

	//持仓状态
	$scope.holdPositionTypeList = [
		{
			id:"0",
			name:"请选择持仓类型"
		},
		{
			id:"1",
			name:"底仓"
		},
		{
			id:"2",
			name:"预约券"
		},
		{
			id:"3",
			name:"外部底仓"
		},
		{
			id:"4",
			name:"市场券"
		},
	];
	$scope.currentHoldPositionType = "0";
	 
	//仓位方向
	$scope.positionDirectionList = [
		{
			id:"0",
			name:"请选择仓位方向"
		},
		{
			id:"1",
			name:"多仓"
		},
		{
			id:"2",
			name:"空仓"
		}
	]; 

	$scope.currentPositionDirection = "0";

	$scope.positionDataLists = []; //持仓数据同步数据列表
	$scope.positionDataLists_save = [];
	$scope.positionDataCheckList = []; //持仓数据同步选中数据
	$scope.isCheckedAll = false;


	$scope.myInterval = {}; //定时器

	$scope.currentPage = 1;
    $scope.allPage = 1;
    $scope.pageSize = 23;



	//保存仓位详情数据
	$scope.positionSyncDetail = [];




	$scope.positionDataSyncInit = function () {
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.positionsynchronizeData = 1;           //同步数据
		$scope.modalInfo.stateEnum.positionrecoveryData = 2;     //恢复数据
		$scope.modalInfo.stateEnum.positiondifferenceData = 3;   //差异数据
		

		$scope.getAllTaMgr();
		$scope.getTaacctSyncStatFirst();
		$scope.myInterval = setInterval(function(){
			$scope.getTaacctSyncStat();
		},5000);
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {

	});
	//页面关闭
	$scope.$on("$destroy", function () {
		clearInterval($scope.myInterval);
	});

	//表格行点击
	$scope.itemClicked = function (index) {
		$scope.curClickedIndex = index;
	}
	//点击表头
	$scope.clickTableHeader = function (keyName, isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
	}

	//点击表头
	$scope.clickTableHeader2 = function (keyName, isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
	}

	//过滤
	$scope.myFilter = function (obj) {
		console.log(obj);
		return obj.content.indexOf($scope.filterContent) !== -1;
	}

	$scope.filterContentList = function(content) {
		var arr = [];
		console.log(content);
		for (let i = 0; i< $scope.positionSyncDetail.length; i++) {
			if ($scope.positionSyncDetail[i]["marketcode"].indexOf(content) === -1 ) {
				//
			} else {
				arr.push($scope.positionSyncDetail[i]);
			}
		}

		$scope.positionSyncDetail = arr;
		console.log(arr);
		// $scope.$apply();
	}
	

	//查询持仓数据同步
	$scope.getTaacctSyncStatFirst = function () {
		var requestData = { body: {
			page_size: $scope.pageSize,
			page_num: $scope.currentPage

		} };
		if ($scope.currentTamgr.maid != -1) {
			requestData.body.maid = $scope.currentTamgr.maid;
		}
		if ($scope.currentAccountType.id != 0) {
			requestData.body.actype = $scope.currentAccountType.id;
		}
		console.log(requestData);
		positionDataSyncService.getTaacctSyncStat(requestData, function (res) {
			console.log(res);
			if (res.msret.msgcode != '00') {
				cms.message.error("获取持仓数据同步失败." + res.msret.msg);
				return;
			}
			$scope.positionDataLists = res.body.data;
			for (let i = 0; i < $scope.positionDataLists.length; i++) {
				$scope.positionDataLists[i]["isCheck"] = false;
			}
			$scope.$apply();

		});
	}


	//查询持仓数据同步
	$scope.getTaacctSyncStat = function () {
		var requestData = { body: {
			page_size: $scope.pageSize,
			page_num: $scope.currentPage

		} };
		if ($scope.currentTamgr.maid != -1) {
			requestData.body.maid = $scope.currentTamgr.maid;
		}
		if ($scope.currentAccountType.id != 0) {
			requestData.body.actype = $scope.currentAccountType.id;
		}
		console.log(requestData);
		positionDataSyncService.getTaacctSyncStat(requestData, function (res) {
			console.log(res);
			if (res.msret.msgcode != '00') {
				cms.message.error("获取持仓数据同步失败." + res.msret.msg);
				return;
			}
			$scope.positionDataLists_save = res.body.data;
			for (let i = 0; i < $scope.positionDataLists_save.length; i++) {
				$scope.positionDataLists[i]["fund_last_time"] = $scope.positionDataLists_save[i]["fund_last_time"];
				$scope.positionDataLists[i]["fund_stat_info"] = $scope.positionDataLists_save[i]["fund_stat_info"];
				$scope.positionDataLists[i]["fund_step"] = $scope.positionDataLists_save[i]["fund_step"];
				$scope.positionDataLists[i]["hold_last_time"] = $scope.positionDataLists_save[i]["hold_last_time"];
				$scope.positionDataLists[i]["hold_step"] = $scope.positionDataLists_save[i]["hold_step"];
				$scope.positionDataLists[i]["hold_stat_info"] = $scope.positionDataLists_save[i]["hold_stat_info"];
				console.log("*************");
			}
			$scope.$apply();

		});
	}


		//键盘输入页码
		$scope.pageToolsKeyUp = function (keyevent) {
			if (keyevent.keyCode === 13) { //回车
				if (isNaN(parseInt($scope.currentPage))) {
					$scope.currentPage = 1;
					return;
				}
				$scope.goToPage($scope.currentPage);
	
			} else if (keyevent.keyCode === 27) {  //escape
				$scope.currentPage = 1;
			}
		}
		
		//翻页
		$scope.goToPage = function (page) {
			page = page > $scope.allPage ? $scope.allPage : page;
			page = page < 1 ? 1 : page;
			$scope.currentPage = page;
	
			$scope.getTaacctSyncStatFirst();
	
		}

	//点击全选
	$scope.clickCheckAll = function () {
		if ($scope.isCheckedAll === true) {
			//取消全选
			$scope.isCheckedAll = false;
			for (let i = 0; i < $scope.positionDataLists.length; i++) {
				$scope.positionDataLists[i]["isCheck"] = false;
			}
		} else {
			$scope.isCheckedAll = true;
			for (let i = 0; i < $scope.positionDataLists.length; i++) {
				$scope.positionDataLists[i]["isCheck"] = true;
			}
		}
	}

	//点击同步确认框的确认按钮
	// 0 同步完成 可同步可恢复
	//1 数据同步中  不可同步不可恢复
	//2数据同步失败  可同步不可恢复 
	//3数据同步成功   不可同步不可恢复
	//4数据处理中   不可同步不可恢复
	//5数据处理失败  不可同步可恢复
	$scope.confirmSyncData = function () {
		var temp = 0;
		$scope.positionDataCheckList = [];
		for (let i = 0; i < $scope.positionDataLists.length; i++) {
			if ($scope.positionDataLists[i]["isCheck"] === true) {
				console.log("选中了");
				temp++;
				$scope.positionDataCheckList.push($scope.positionDataLists[i]);
				if ($scope.positionDataLists[i]["fund_step"] === "1" || $scope.positionDataLists[i]["fund_step"] === "3" || $scope.positionDataLists[i]["fund_step"] === "4" || $scope.positionDataLists[i]["fund_step"] === "5") {
					$scope.closeSynchronousData();
					cms.message.error("错误提示, 有账户不可同步，且不影响可同步账户的同步工作");
				} else {
					//在这里做持仓数据同步
					//可以同步的话在这里同步数据
					//1代表同步持仓数据同步 2代表同步资金数据同步
					let reqData = {
						body:{
							sync_type: 1,
							acid: $scope.positionDataLists[i]["acid"]
						}
					}
					console.log(reqData);
					positionDataSyncService.getSyncTaacctData(reqData, function(res) {
						console.log(res);
						$scope.positionDataLists[i]["isCheck"] = false;
						$scope.isCheckedAll = false;
						if (res.msret.msgcode != '00') {
							cms.message.error("错误提示, 持仓数据同步" + res.msret.msg);
							$scope.closeSynchronousData();
							return;
						}
						$scope.closeSynchronousData();
						cms.message.success("成功提示, 持仓数据同步" + res.msret.msg);
					})
				}
			}
		}
		if (temp === 0) {
			//表示没有选中的
			$scope.closeSynchronousData();
			cms.message.error("错误提示, 请选择需要同步的账户");
		}
	}



	//点击选择某一个账户信息
	$scope.clickChooseOne=function(index) {
		console.log(index);
		console.log($scope.positionDataLists[index]);
			if ($scope.positionDataLists[index]["isCheck"] === true) {
				$scope.positionDataLists[index]["isCheck"] = false;
				$scope.isCheckedAll = false;
		} else {
			$scope.positionDataLists[index]["isCheck"] = true;
			var tempData = $scope.positionDataLists.every(function(value, index, arr) {
				return value["isCheck"] === true;
			})
			if (tempData === true) {
				$scope.isCheckedAll = true;
			} else {
				$scope.isCheckedAll = false;
			}
			console.log(tempData);
		}
	}

	//点击恢复按钮
	$scope.recoverFundsDataSync = function() {
		//点击恢复资金数据同步
		var temp = 0;
		$scope.positionDataCheckList = [];
		for (let i = 0; i < $scope.positionDataLists.length; i++) {
			if ($scope.positionDataLists[i]["isCheck"] === true) {
				console.log("选中了");
				temp++;
				$scope.positionDataCheckList.push($scope.positionDataLists[i]);
				if ($scope.positionDataLists[i]["fund_step"] === "1" || $scope.positionDataLists[i]["fund_step"] === "2" || $scope.positionDataLists[i]["fund_step"] === "3" || $scope.positionDataLists[i]["fund_step"] === "4") {
					$scope.closeSynchronousData();
					cms.message.error("错误提示, 有账户不可恢复，恢复只能回退一次至上一步");
				} else {
					//在这里恢复已经同步的数据
					//在这里恢复已经同步的数据
					let reqData = {
						body:{
							sync_type: 1,
							acid: $scope.positionDataLists[i]["acid"]
						}
					}
					positionDataSyncService.RevertSyncTaacctData(reqData, function(res){
						console.log(res);
						$scope.positionDataLists[i]["isCheck"] = false;
						$scope.isCheckedAll = false;
						if (res.msret.msgcode != '00') {
							cms.message.error("错误提示, " + res.msret.msg);
							return;
						}
						cms.message.success("成功提示, " + res.msret.msg);
					})
				}
			}
		}
		if (temp === 0) {
			//表示没有选中的
			$scope.closeSynchronousData();
			cms.message.error("错误提示, 请选择需要恢复的账户");
		}
	}





	//点击同步数据按钮
	$scope.clickPositionSynchronizeData = function() {
		console.log("同步数据");
		$scope.positionDataSynchronizeShowModal($scope.modalInfo.stateEnum.positionsynchronizeData);
	}

	//点击恢复数据按钮
	$scope.clickPositionRecoveryData = function() {
		console.log("同步数据");
		$scope.positionDataSynchronizeShowModal($scope.modalInfo.stateEnum.positionrecoveryData);
	}


	//点击查看差异按钮
	$scope.clickPositionDifferenceData = function(acid) {
		//仓位数据详情
		let reqData = {
			body: {
				acid: acid
			}
		}
		positionDataSyncService.getTatractHoldSyncDetail(reqData, function(res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("错误提示, " + res.msret.msg);
				return;
			}
			if(res.body.data.length > 0) {
				$scope.positionSyncDetail = res.body.data;
				cms.message.success("成功提示, " + res.msret.msg);
				$scope.positionDataSynchronizeShowModal($scope.modalInfo.stateEnum.positiondifferenceData);
				
			} else {
				$scope.isShowDifferenceData = false;
				cms.message.success("成功提示, 暂无同步数据");
			}
		})
	}


	//导出数据
	//点击导出持仓数据同步的列表数据
	$scope.exportPositionDataSyncData = function () {

		if ($scope.positionSyncDetail.length <= 0) {
			cms.message.error("表中没有可导出的数据");
			return;
		}
		var exportData = {};
		var headers = ["交易账户", "市场", "证券代码", "证券名称", "昨仓数量", "持仓数量(CMS)", "持仓数量(柜台)", "可用数量(CMS)", "可用数量(柜台)","持仓成本(CMS)", "持仓成本(柜台)"];
		exportData.headers = headers;
		exportData.fileType = "csv";
		exportData.fileName = "仓位详情数据";
		exportData.data = [];

		angular.forEach($scope.positionSyncDetail, function (dataCell) {
			var tempCell = [];
			tempCell.push(dataCell.tracid);
			tempCell.push(dataCell.broker_marketStr);
			tempCell.push(dataCell.marketcode);
			tempCell.push(dataCell.market_name);
			tempCell.push(dataCell.pretotalvol);
			tempCell.push(dataCell.totalvol);
			tempCell.push(dataCell.broker_totalvol);
			tempCell.push(dataCell.validvol);
			tempCell.push(dataCell.broker_validvol);
			tempCell.push(dataCell.holdcost);
			tempCell.push(dataCell.broker_holdcost);
			exportData.data.push(tempCell);
		})

		positionDataSyncService.exportDataToExcelFile(exportData, function (err, res) {
			if (err) return;
			if (res.result == true) {
				cms.message.success("导出数据成功.");
			}
			else {
				cms.message.error("导出数据失败." + res.reason);
				cms.log("导出数据失败：", res.reason);
			}
		})
	}



	//关闭一级弹框
	$scope.closeSynchronousData = function() {
		mainService.hideModal("positionDataSynchronize_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}




	//打开一级弹框
	$scope.positionDataSynchronizeShowModal = function (state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.positionsynchronizeData:
				$scope.modalInfo.path = "../positionDataSynchronize/positionDataSync/positionSyncData.html";
				break;
				case $scope.modalInfo.stateEnum.positionrecoveryData:
				$scope.modalInfo.path = "../positionDataSynchronize/positionDataSync/positionRecoveryData.html";
				break;
				case $scope.modalInfo.stateEnum.positiondifferenceData:
				$scope.modalInfo.path = "../positionDataSynchronize/positionDataSync/positionDifferenceData.html";
				break;
			default:
				break;
		}
	}

	//一级弹框加载完成
	$scope.positionDataSynchronizeLoadModalReady = function () {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.positiondifferenceData:
				mainService.showModal("positionDataSynchronize_modal_back", "positionDifferenceData_modal", "positionDifferenceData_modal_title");
				break;
				case $scope.modalInfo.stateEnum.positionrecoveryData:
				mainService.showModal("positionDataSynchronize_modal_back", "positionRecoveryDataSynchronize_modal", "positionRecoveryDataSynchronize_modal_title");
				break;
				case $scope.modalInfo.stateEnum.positionsynchronizeData:
				mainService.showModal("positionDataSynchronize_modal_back", "positionDataSynchronize_modal", "positionDataSynchronize_modal_title");
				break;
			default:
				break;
		}
	}

	//加载资产管理人下拉列表
	$scope.getAllTaMgr = function () {
		//首先清空已有数据
		$scope.allAssetManager = [];
		$scope.currentTamgr = {};

		var requestData = { body: {} };
		positionDataSyncService.getAllTaMgr(requestData, function (res) {
			if (res.msret.msgcode != '00') {
				cms.message.error("获取所有资产管理人失败." + res.msret.msg);
				return;
			}
			$scope.allAssetManager = res.body;
			$scope.allAssetManager.unshift({ maid: -1, maname: "全部" });
			$scope.allAssetManager.forEach(function (manager) {
				manager.maid = parseInt(manager.maid);
				if (manager.maid == -1) {
					manager.fullName = manager.maname;
				} else {
					manager.fullName = manager.maname + '(' + manager.maid + ')';
				}
			})
			if ($scope.allAssetManager.length) {
				$scope.currentTamgr = $scope.allAssetManager[0];
			}

			$scope.$apply();

		});
	}


}).filter("myfilter", function () {
	return function (inputArray, param) {
		var arr = [];
		inputArray.forEach(function (obj) {
			if (obj.acid.indexOf(param) !== -1 || obj.acname.indexOf(param) !== -1 || obj.actype.indexOf(param) !== -1 || obj.marketcode.indexOf(param) !== -1 ) {
				arr.push(obj);
			}
		});

		return arr;
	}
});
