angular.module('cmsController').controller('operatorLogCtrl',function($scope,$timeout,mainService,operatorLogService) {

	$scope.operatorLogDataList=[];//操作日志信息列表

	$scope.curClickedIndex=-1;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;
	$scope.currentPage = 1;
	$scope.allPage = 1; 
	$scope.prePage = 1;

	$scope.operatorLogInit = function() {
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
	$scope.refreshOperatorLogDataTable = function() {

		$scope.filterContent="";
		$scope.currentPage = 1;
		$scope.getOperatorLogDataInfo();
	}

	//获取操作日志信息
	$scope.getOperatorLogDataInfo = function() {
		var beginDate = $scope.formatdate($scope.begin_date);
		var endDate = $scope.formatdate($scope.end_date);
		var requestData={body:{begin_date: beginDate, end_date: endDate, page: $scope.currentPage, pageSize: 32}};
		operatorLogService.getOperatorLogData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body.data;
                $scope.allPage = Math.ceil(retData.body.totalCount / 32);
				$scope.operatorLogDataList=[];
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.show=true;//默认此行数据显示
					$scope.operatorLogDataList.push(dataCell);
				}
				$scope.$apply();
			}
			else{
				$scope.operatorLogDataList.splice(0,$scope.operatorLogDataList.length);
				$scope.$apply();
				cms.message.error("获取操作日志数据出错:"+retData.msret.msg);
			}
		})
	}

	//操作日志表过滤显示
	$scope.operLogFilter = function() {
		console.log($scope.filterContent);

		for(var i = 0; i < $scope.operatorLogDataList.length; ++i) {
			if(String($scope.operatorLogDataList[i].sno).indexOf($scope.filterContent) != -1 || String($scope.operatorLogDataList[i].opertime).indexOf($scope.filterContent) != -1 ||
				 $scope.operatorLogDataList[i].ip.indexOf($scope.filterContent) != -1 || $scope.operatorLogDataList[i].mac.indexOf($scope.filterContent) != -1 ||
				 $scope.operatorLogDataList[i].oper_type.indexOf($scope.filterContent) != -1 || String($scope.operatorLogDataList[i].oid).indexOf($scope.filterContent) != -1 ||
				 $scope.operatorLogDataList[i].oper_obj.indexOf($scope.filterContent) != -1){
				$scope.operatorLogDataList[i].show=true;
			}
			else{
				$scope.operatorLogDataList[i].show=false;
			}
		}
	}

	$scope.formatdate = function(date) {
		return Number(date.getFullYear() + ("0" + (date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2));
	}

	$scope.goToPage=function (page) {
        page=page > $scope.allPage ? $scope.allPage : page;
        page=page < 1 ? 1 : page;
        $scope.currentPage=page;
		$scope.prePage=page;

        $scope.getOperatorLogDataInfo();

    }

	$scope.pageToolsKeyUp=function(keyevent) {
        if (keyevent.keyCode === 13) { //回车
            if (isNaN( parseInt($scope.currentPage) )) {
                $scope.currentPage=$scope.prePage;
                return ;
            }
            $scope.goToPage($scope.currentPage);

        } else if (keyevent.keyCode === 27) {  //escape
            $scope.currentPage=$scope.prePage;
        }
    }
});
