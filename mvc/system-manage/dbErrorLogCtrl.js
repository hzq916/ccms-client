angular.module('cmsController').controller('dbErrorLogCtrl',function($scope,$timeout,mainService,dbErrorLogService) {

	$scope.errorLogDataList=[];//错误日志信息列表
	$scope.curClickedIndex=-1;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.dbErrorLogInit = function() {

		$scope.begin_date=new Date();//查询开始日期，默认为当天
		$scope.end_date=new Date();//查询结束日期，默认为当天

		$scope.searchContent = "";
		//$scope.getErrorLogDataInfo();
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
	$scope.refreshErrorLogDataTable = function() {

		$scope.filterContent="";
		$scope.getErrorLogDataInfo();
	}

	//获取经纪商信息
	$scope.getErrorLogDataInfo = function() {

		var beginDate=cms.formatDate($scope.begin_date);
		var endDate = cms.formatDate($scope.end_date);
		var requestData={body:{begin_date:beginDate,end_date:endDate}};

		dbErrorLogService.getErrorLogData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				var tmpDataList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.idx=i+1;
					dataCell.show=true;//默认此行数据显示
					tmpDataList.push(dataCell);
				}
				$scope.errorLogDataList=tmpDataList;
				$scope.$apply();
			}
			else{
				$scope.errorLogDataList.splice(0,$scope.errorLogDataList.length);
				$scope.$apply();
				cms.message.error("获取数据库错误日志数据出错."+retData.msret.msg);
			}
		})
	}

	//错误日志表过滤显示
	$scope.errorLogFilter = function() {

		angular.forEach($scope.errorLogDataList,function(cellObj) {
			if(cellObj.errdate.toString().match($scope.filterContent) || cellObj.errno.toString().match($scope.filterContent) ||
				 cellObj.errsql.toString().match($scope.filterContent) || cellObj.errmsg.toString().match($scope.filterContent) ){
				cellObj.show=true;
			}
			else{
				cellObj.show=false;
			}
		});
	}
});
