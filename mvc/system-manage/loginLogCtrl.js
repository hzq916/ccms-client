angular.module('cmsController').controller('loginLogCtrl',function($scope,$timeout,mainService,loginLogService) {

	$scope.loginLogDataList=[];//登录日志信息列表

	$scope.curClickedIndex = -1;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.loginLogInit = function() {
		$scope.begin_date=new Date();//查询开始日期，默认为当天
		$scope.end_date=new Date();//查询结束日期，默认为当天

		$scope.searchContent = "";
		//$scope.getLoginLogDataInfo();
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function(){

	});
	//页面关闭
	$scope.$on("$destroy", function() {

    });

	//表格行点击
	$scope.itemClicked = function(index) {
		$scope.curClickedIndex = index;
	}

	//点击表头
	$scope.clickTableHeader = function(keyName,isNumber) {
		$scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
		$scope.keyName = keyName;
		$scope.sortFunction = mainService.getSortFunc($scope.reverse,isNumber);
	}

	//刷新界面
	$scope.refreshLoginLogDataTable = function() {

		$scope.filterContent="";
		$scope.getLoginLogDataInfo();
	}

	//获取经纪商信息
	$scope.getLoginLogDataInfo = function() {

		var beginDate=cms.formatDate($scope.begin_date);
		var endDate = cms.formatDate($scope.end_date);
		var requestData={body:{begin_date:beginDate,end_date:endDate}};

		loginLogService.getLoginLogData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				var tmpDataList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.idx=i+1;
					dataCell.login_result_ch=dataCell.login_result==1?'成功':'失败';
					dataCell.login_msg_info=JSON.parse(dataCell.login_msg).msg;
					dataCell.show=true;//默认此行数据显示
					tmpDataList.push(dataCell);
				}
				$scope.loginLogDataList=tmpDataList;
				$scope.$apply();
			}
			else{
				$scope.loginLogDataList.splice(0,$scope.loginLogDataList.length);
				$scope.$apply();
				cms.message.error("获取登录日志数据出错."+retData.msret.msg);
			}
		})
	}

	//错误日志表过滤显示
	$scope.loginLogFilter = function() {

		angular.forEach($scope.loginLogDataList,function(cellObj) {
			if(cellObj.oname.toString().match($scope.filterContent) || cellObj.oid.toString().match($scope.filterContent) ||
				 cellObj.login_result_ch.toString().match($scope.filterContent) || cellObj.login_msg_info.toString().match($scope.filterContent) ){
				cellObj.show=true;
			}
			else{
				cellObj.show=false;
			}
		});
	}
});
