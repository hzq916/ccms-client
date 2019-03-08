angular.module('cmsController').controller('currencyManageCtrl',function($scope,$timeout,mainService,currencyManageService) {

	$scope.currencyDataList=[];//币种信息列表

	$scope.curClickedIndex = -1;

	$scope.keyName = "";
	$scope.reverse = false;
	$scope.sortFunction = null;

	$scope.currencyManageInit = function() {

		$scope.getCurrencyDataInfo();
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
	$scope.refreshCurrencyDataTable = function() {

		$scope.filterContent="";
		$scope.getCurrencyDataInfo();
	}

	//获取币种信息
	$scope.getCurrencyDataInfo = function() {

		var requestData={body:{}};

		currencyManageService.getCurrencyData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;

				var tmpDataList=[]
				for(var i=0;i<tmpData.length;i++){
					var dataCell ={};
					dataCell=tmpData[i];
					dataCell.show=true;//默认此行数据显示
					tmpDataList.push(dataCell);
				}
				$scope.currencyDataList=tmpDataList;
				$scope.$apply();
			}
			else{
				$scope.currencyDataList.splice(0,$scope.currencyDataList.length);
				$scope.$apply();
				cms.message.error("获取币种数据出错."+retData.msret.msg);
			}
		})
	}
});
