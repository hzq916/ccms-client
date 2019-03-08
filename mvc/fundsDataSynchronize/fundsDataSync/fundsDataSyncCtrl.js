angular.module('cmsController').controller('fundsDataSyncCtrl', function ($scope, $timeout, mainService, fundsDataSyncService) {

	$scope.filterContent = "";

	$scope.modalInfo = {};
	$scope.modalInfo2 = {}; //二级弹框

	$scope.curClickedIndex = -1;


	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.searchContent = ""; //搜索框内容

	$scope.isShowDifferenceData = true; //是否存在差异数据


	$scope.allAssetManager = [];
	$scope.currentTamgr = {};

	//资金数据同步中账户类型和同步状态
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

	$scope.currentAccountState = {};
	$scope.fundsDataAccountState = [
		{
			id: "0",
			name: "请选择同步状态"
		},
		{
			id: "1",
			name: "未同步"
		},
		{
			id: "2",
			name: "已同步"
		}
	]
	$scope.currentAccountState.id = "0";


	$scope.isCheckedAll = false;


	$scope.fundsDataLists = []; //保存整个数组
	$scope.fundsDataLists_save = []; //保存本地
	$scope.fundsDataCheckList = [];//保存被选中的项

	$scope.myInterval = {}; //定时器

	$scope.currentPage = 1;
    $scope.allPage = 1;
    $scope.pageSize = 23;



	//保存当前的资金同步数据详情
	$scope.fundsSyncDetail = {};






	$scope.fundsDataSyncInit = function () {
		$scope.searchContent = "";
		$scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
		$scope.modalInfo.path = "";
		$scope.modalInfo.stateEnum.synchronizeData = 1;           //同步数据
		$scope.modalInfo.stateEnum.recoveryData = 2;     //恢复数据
		$scope.modalInfo.stateEnum.differenceData = 3;   //差异数据


		$scope.modalInfo2.state = 0;
		$scope.modalInfo2.stateEnum = {};
		$scope.modalInfo2.path = "";
		$scope.getAllTaMgr();
		$scope.getTaacctSyncStatFirst();
		$scope.myInterval = setInterval(function(){
			$scope.getTaacctSyncStat();
		},5000)
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function () {

	});
	//页面关闭
	$scope.$on("$destroy", function () {
		clearInterval($scope.myInterval);
	});


	//查询资金数据同步
	$scope.getTaacctSyncStatFirst = function () {
		var requestData = { body: {
			page_size: $scope.pageSize,
			page_num: $scope.currentPage

		} };
		if ($scope.currentTamgr.maid && $scope.currentTamgr.maid != -1) {
			requestData.body.maid = $scope.currentTamgr.maid;
		}
		if ( $scope.currentAccountType.id && $scope.currentAccountType.id != 0) {
			requestData.body.actype = $scope.currentAccountType.id;
		}
		console.log(requestData);
		fundsDataSyncService.getTaacctSyncStat(requestData, function (res) {
			// console.log(res);
			if (res.msret.msgcode != '00') {
				cms.message.error("获取资金数据同步失败." + res.msret.msg);
				return;
			}
			$scope.fundsDataLists = res.body.data;
			$scope.allPage = Math.ceil(parseInt(res.body.totalCount) / $scope.pageSize);
            $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;
			for (let i = 0; i < $scope.fundsDataLists.length; i++) {
				$scope.fundsDataLists[i]["isCheck"] = false;
			}
			$scope.$apply();

		});
	}


	//查询资金数据同步
	$scope.getTaacctSyncStat = function () {
		var requestData = { body: {
			page_size: $scope.pageSize,
			page_num: $scope.currentPage

		} };
		if ($scope.currentTamgr.maid && $scope.currentTamgr.maid != -1) {
			requestData.body.maid = $scope.currentTamgr.maid;
		}
		if ($scope.currentAccountType.id && $scope.currentAccountType.id != 0) {
			requestData.body.actype = $scope.currentAccountType.id;
		}
		console.log(requestData);
		fundsDataSyncService.getTaacctSyncStat(requestData, function (res) {
			console.log(res);
			if (res.msret.msgcode != '00') {
				cms.message.error("获取资金数据同步失败." + res.msret.msg);
				return;
			}
			$scope.fundsDataLists_save = res.body.data;
			$scope.allPage = Math.ceil(parseInt(res.body.totalCount) / $scope.pageSize);
            $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;
			for(let i = 0; i< $scope.fundsDataLists_save.length; i++) {
				$scope.fundsDataLists[i]["fund_last_time"] = $scope.fundsDataLists_save[i]["fund_last_time"];
				$scope.fundsDataLists[i]["fund_stat_info"] = $scope.fundsDataLists_save[i]["fund_stat_info"];
				$scope.fundsDataLists[i]["fund_step"] = $scope.fundsDataLists_save[i]["fund_step"];
				$scope.fundsDataLists[i]["hold_last_time"] = $scope.fundsDataLists_save[i]["hold_last_time"];
				$scope.fundsDataLists[i]["hold_step"] = $scope.fundsDataLists_save[i]["hold_step"];
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
			for (let i = 0; i < $scope.fundsDataLists.length; i++) {
				$scope.fundsDataLists[i]["isCheck"] = false;
			}
		} else {
			$scope.isCheckedAll = true;
			for (let i = 0; i < $scope.fundsDataLists.length; i++) {
				$scope.fundsDataLists[i]["isCheck"] = true;
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
		$scope.fundsDataCheckList = [];
		for (let i = 0; i < $scope.fundsDataLists.length; i++) {
			if ($scope.fundsDataLists[i]["isCheck"] === true) {
				console.log("选中了");
				temp++;
				$scope.fundsDataCheckList.push($scope.fundsDataLists[i]);
				if ($scope.fundsDataLists[i]["fund_step"] === "1" || $scope.fundsDataLists[i]["fund_step"] === "3" || $scope.fundsDataLists[i]["fund_step"] === "4" || $scope.fundsDataLists[i]["fund_step"] === "5") {
					$scope.closeSynchronousData();
					cms.message.error("错误提示, 有账户不可同步，且不影响可同步账户的同步工作");
				} else {
					//可以同步的话在这里同步数据
					//1代表同步持仓数据同步 2代表同步资金数据同步
					console.log($scope.fundsDataLists[i]);
					let reqData = {
						body:{
							sync_type: 2,
							acid: $scope.fundsDataLists[i]["acid"]
						}
					}
					console.log(reqData);
					fundsDataSyncService.getSyncTaacctData(reqData, function(res) {
						console.log(res);
						$scope.fundsDataLists[i]["isCheck"] = false;
						$scope.isCheckedAll = false;
						if (res.msret.msgcode != '00') {
							cms.message.error("资金数据同步" + res.msret.msg);
							$scope.closeSynchronousData();
							return;
						}
						$scope.closeSynchronousData();
						cms.message.success("成功提示, 资金数据同步" + res.msret.msg);
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
		console.log($scope.fundsDataLists[index]);
			if ($scope.fundsDataLists[index]["isCheck"] === true) {
				$scope.fundsDataLists[index]["isCheck"] = false;
				$scope.isCheckedAll = false;
		} else {
			$scope.fundsDataLists[index]["isCheck"] = true;
			var tempData = $scope.fundsDataLists.every(function(value, index, arr) {
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
		$scope.fundsDataCheckList = [];
		for (let i = 0; i < $scope.fundsDataLists.length; i++) {
			if ($scope.fundsDataLists[i]["isCheck"] === true) {
				console.log("选中了");
				temp++;
				$scope.fundsDataCheckList.push($scope.fundsDataLists[i]);
				if ($scope.fundsDataLists[i]["fund_step"] === "1" || $scope.fundsDataLists[i]["fund_step"] === "2" || $scope.fundsDataLists[i]["fund_step"] === "3" || $scope.fundsDataLists[i]["fund_step"] === "4") {
					$scope.closeSynchronousData();
					cms.message.error("错误提示, 有账户不可恢复，恢复只能回退一次至上一步");
				} else {
					//在这里恢复已经同步的数据
					let reqData = {
						body:{
							sync_type: 2,
							acid: $scope.fundsDataLists[i]["acid"]
						}
					}
					fundsDataSyncService.RevertSyncTaacctData(reqData, function(res){
						console.log(res);
						console.log(res);
						$scope.fundsDataLists[i]["isCheck"] = false;
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


	//点击导出资金数据同步的列表数据
	$scope.exportFundsDataSyncData = function () {

		if ($scope.fundsDataLists.length <= 0) {
			cms.message.error("表中没有可导出的数据");
			return;
		}
		var exportData = {};
		var headers = ["账户类型", "资产账户", "资金账户", "同步状态", "同步时间"];
		exportData.headers = headers;
		exportData.fileType = "csv";
		exportData.fileName = "资金数据";
		exportData.data = [];

		angular.forEach($scope.fundsDataLists, function (dataCell) {
			var tempCell = [];
			tempCell.push(dataCell.actype);
			tempCell.push(dataCell.acname + "(" + dataCell.acid + ")");
			tempCell.push(dataCell.acid);
			tempCell.push(dataCell.fund_stat_info);
			tempCell.push(dataCell.fund_last_time);
			exportData.data.push(tempCell);
		})

		fundsDataSyncService.exportDataToExcelFile(exportData, function (err, res) {
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

	//过滤
	$scope.myFilter = function (obj) {
		return obj.content.indexOf($scope.filterContent) !== -1;
	}


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
	//点击同步数据按钮
	$scope.clickSynchronizeData = function () {
		$scope.fundsDataSynchronizeShowModal($scope.modalInfo.stateEnum.synchronizeData);
	}

	//点击了恢复按钮
	$scope.clickRecoveryData = function () {
		console.log("点击了恢复按钮");
		//$scope.fundsDataSynchronizeShowModal($scope.modalInfo.stateEnum.recoveryData);
	}

	//点击差异数据按钮
	$scope.clickDifferenceData = function (acid) {
		let reqData = {
			body:{
				acid: acid
			}
		}
		fundsDataSyncService.getTatractFundsSyncDetail(reqData,function(res) {
			console.log(res);
			if (res.msret.msgcode != '00') {
				cms.message.error("错误提示, " + res.msret.msg);
				return;
			}
			if(res.body.data.length > 0) {
				$scope.fundsSyncDetail = res.body.data[0];
				$scope.isShowDifferenceData = true;
				cms.message.success("成功提示, " + res.msret.msg);
			} else {
				$scope.isShowDifferenceData = false;
				cms.message.success("成功提示, 暂无同步数据");
			}
			
		})
		$scope.fundsDataSynchronizeShowModal($scope.modalInfo.stateEnum.differenceData);
		console.log(acid);
	}


	//关闭一级弹框
	$scope.closeSynchronousData = function () {
		mainService.hideModal("fundsDataSynchronize_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
	}




	//打开一级弹框
	$scope.fundsDataSynchronizeShowModal = function (state) {
		$scope.modalInfo.state = state;
		console.log(state);
		switch (state) {
			case $scope.modalInfo.stateEnum.synchronizeData:
				$scope.modalInfo.path = "../fundsDataSynchronize/fundsDataSync/synchronousData.html";
				break;
			case $scope.modalInfo.stateEnum.recoveryData:
				$scope.modalInfo.path = "../fundsDataSynchronize/fundsDataSync/recoveryData.html";
				break;
			case $scope.modalInfo.stateEnum.differenceData:
				$scope.modalInfo.path = "../fundsDataSynchronize/fundsDataSync/differenceData.html";
				break;
			default:
				break;
		}
	}

	//一级弹框加载完成
	$scope.fundsDataSynchronizeLoadModalReady = function () {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.synchronizeData:
				mainService.showModal("fundsDataSynchronize_modal_back", "fundsDataSynchronize_modal", "fundsDataSynchronize_modal_title");
				break;
			case $scope.modalInfo.stateEnum.recoveryData:
				mainService.showModal("fundsDataSynchronize_modal_back", "recoveryDataSynchronize_modal", "recoveryDataSynchronize_modal_title");
				break;
			case $scope.modalInfo.stateEnum.differenceData:
				mainService.showModal("fundsDataSynchronize_modal_back", "differenceData_modal", "differenceData_modal_title");
				break;
			default:
				break;
		}
	}

	//显示二级弹框
	$scope.fundsDataSynchronizeShowModal2 = function (state) {
		$scope.modalInfo2.state = state;
		switch (state) {
			case $scope.modalInfo2.stateEnum.confirmChangeTemplate:
				$scope.modalInfo2.path = "../system-manage/templateSetting/transactionRate/confirmChangeTemplate.html";
				break;
			default:
				break;
		}
	}

	//二级弹框加载完成
	$scope.fundsDataSynchronizeLoadModalReady2 = function () {
		switch ($scope.modalInfo2.state) {
			case $scope.modalInfo2.stateEnum.confirmChangeTemplate:
				mainService.showModal("transactionRate_modal_back2", "confirmChangeTemplate_modal", "confirmChangeTemplate_modal_title");
				break;
			default:
				break;
		}
	}

	//关闭二级弹框
	$scope.closeSecondTemplateSetting = function () {
		mainService.hideModal("transactionRate_modal_back2");
		$scope.modalInfo2.state = 0;
		$scope.modalInfo2.path = "";
	}

	//加载资产管理人下拉列表
	$scope.getAllTaMgr = function () {
		//首先清空已有数据
		$scope.allAssetManager = [];
		$scope.currentTamgr = {};

		var requestData = { body: {} };
		fundsDataSyncService.getAllTaMgr(requestData, function (res) {
			console.log(res);
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
			if (obj.acname.indexOf(param) !== -1 || obj.acid.indexOf(param) !== -1 || obj.actype.indexOf(param) !== -1) {
				arr.push(obj);
			}
		});

		return arr;
	}
});
