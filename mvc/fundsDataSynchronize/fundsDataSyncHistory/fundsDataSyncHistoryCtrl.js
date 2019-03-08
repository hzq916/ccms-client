angular.module('cmsController').controller('fundsDataSyncHistoryCtrl', function ($scope, $timeout, mainService, fundsDataSyncHIstoryService) {

	$scope.modalInfo = {};
	$scope.modalInfo2 = {}; //二级弹框

	$scope.curClickedIndex = -1;


	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.searchContent = ""; //搜索框内容

	$scope.begin_date = new Date();
	$scope.end_date = new Date();



	$scope.allAssetManager = [];
	$scope.currentTamgr = {};


	//资金数据同步同步记录中账户类型和同步状态
	$scope.currentAccountType = {};

	$scope.fundsDataAccountType = [
		{
			id: "0",
			name: "请选择账户类型"
		},
		{
			id: "1",
			name: "普通股票"
		},
		{
			id: "2",
			name: "信用股票"
		},
		{
			id: "3",
			name: "期货"
		},
		{
			id: "4",
			name: "股票期权"
		}
	];
	$scope.currentAccountType.id = "0";


	$scope.operatorLogDataList = [];//操作日志信息列表

	$scope.curClickedIndex = -1;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;
	$scope.currentPage = 1;
	$scope.allPage = 1;
	$scope.prePage = 1;



	$scope.fundsDataDetailList = [];



	$scope.fundsDataSyncHistoryInit = function () {
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.fundsDataSyncHistoryDetail = 1;           //详情

		$scope.getAllTaMgr();

	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {

	});
	//页面关闭
	$scope.$on("$destroy", function () {

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

	$scope.changeStartDate = function () {
		if ($scope.begin_date > $scope.end_date) {
			$scope.begin_date = new Date(cms.formatDate($scope.end_date));
		}
	}

	$scope.changeEndDate = function () {
		if ($scope.begin_date > $scope.end_date) {
			$scope.end_date = new Date(cms.formatDate($scope.begin_date));
		}
	}


	//刷新界面
	$scope.refreshOperatorLogDataTable = function () {

		$scope.filterContent = "";
		$scope.currentPage = 1;
		$scope.getOperatorLogDataInfo();
	}

	//获取操作日志信息
	$scope.getOperatorLogDataInfo = function () {
		var beginDate = $scope.formatdate($scope.begin_date);
		var endDate = $scope.formatdate($scope.end_date);
		var requestData = { body: { begin_date: beginDate, end_date: endDate, page: $scope.currentPage, pageSize: 32, oper_type: "同步资金数据" } };
		console.log("仓位操作日志");
		console.log(requestData);
		fundsDataSyncHIstoryService.getOperatorLogData(requestData, function (retData) {
			console.log(retData);
			if (retData.msret.msgcode == '00') {
				if (retData.body.data.length > 0) {
					var tmpData = retData.body.data;
					$scope.allPage = Math.ceil(retData.body.totalCount / 32);
					$scope.operatorLogDataList = [];
					for (var i = 0; i < tmpData.length; i++) {
						var dataCell = {};
						dataCell = tmpData[i];
						dataCell.show = true;//默认此行数据显示
						$scope.operatorLogDataList.push(dataCell);
					}
					$scope.$apply();
				} else {
				cms.message.error("成功提示, 暂时没有同步记录");
				}
			}
			else {
				$scope.operatorLogDataList.splice(0, $scope.operatorLogDataList.length);
				$scope.$apply();
				cms.message.error("获取操作日志数据出错:" + retData.msret.msg);
			}
		})
	}

	//操作日志表过滤显示
	$scope.operLogFilter = function () {
		console.log($scope.filterContent);

		for (var i = 0; i < $scope.operatorLogDataList.length; ++i) {
			if (String($scope.operatorLogDataList[i].sno).indexOf($scope.filterContent) != -1 || String($scope.operatorLogDataList[i].opertime).indexOf($scope.filterContent) != -1 ||
				$scope.operatorLogDataList[i].ip.indexOf($scope.filterContent) != -1 || $scope.operatorLogDataList[i].mac.indexOf($scope.filterContent) != -1 ||
				$scope.operatorLogDataList[i].oper_type.indexOf($scope.filterContent) != -1 || String($scope.operatorLogDataList[i].oid).indexOf($scope.filterContent) != -1 ||
				$scope.operatorLogDataList[i].oper_obj.indexOf($scope.filterContent) != -1) {
				$scope.operatorLogDataList[i].show = true;
			}
			else {
				$scope.operatorLogDataList[i].show = false;
			}
		}
	}

	$scope.formatdate = function (date) {
		return Number(date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2));
	}

	$scope.goToPage = function (page) {
		page = page > $scope.allPage ? $scope.allPage : page;
		page = page < 1 ? 1 : page;
		$scope.currentPage = page;
		$scope.prePage = page;

		$scope.getOperatorLogDataInfo();

	}

	$scope.pageToolsKeyUp = function (keyevent) {
		if (keyevent.keyCode === 13) { //回车
			if (isNaN(parseInt($scope.currentPage))) {
				$scope.currentPage = $scope.prePage;
				return;
			}
			$scope.goToPage($scope.currentPage);

		} else if (keyevent.keyCode === 27) {  //escape
			$scope.currentPage = $scope.prePage;
		}
	}




	//关闭一级弹框
	$scope.closeSyncHistoryData = function () {
		mainService.hideModal("fundsDataSyncHistory_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}

	$scope.clickCheckDetail = function (id, time) {
		//查询对应的详情
		let requestData = {
			body:{
				sno:id,
				operdate:cms.formatDate_ex(new Date(time))
			}
		}
		console.log("查看详情");
		console.log(requestData);
		fundsDataSyncHIstoryService.getTsoperLogDetail(requestData,function(res){
			console.log(res);
			if (res.msret.msgcode != '00') {
				cms.message.error("获取持仓数据同步失败." + res.msret.msg);
				return;
			}
			if (res.body.data.length > 0) {
				//代表数据有变化
				$scope.fundsDataDetailList = res.body.data;
				$scope.fundsDataSyncHistoryShowModal($scope.modalInfo.stateEnum.fundsDataSyncHistoryDetail);
			} else {
				//数据没有变化
				cms.message.error("成功提示, 暂时没有数据变化");
			}
		})
	}




	//打开一级弹框
	$scope.fundsDataSyncHistoryShowModal = function (state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.fundsDataSyncHistoryDetail:
				$scope.modalInfo.path = "../fundsDataSynchronize/fundsDataSyncHistory/fundsDataSyncHistoryDetail.html";
				break;
			default:
				break;
		}
	}

	//一级弹框加载完成
	$scope.fundsDataSyncHistoryLoadModalReady = function () {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.fundsDataSyncHistoryDetail:
				mainService.showModal("fundsDataSyncHistory_modal_back", "fundsDataSyncHistoryDetail_modal", "fundsDataSyncHistoryDetail_modal_title");
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
		fundsDataSyncHIstoryService.getAllTaMgr(requestData, function (res) {
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


});
