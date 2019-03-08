angular.module('cmsController').controller('paraSettingsCtrl',function($scope,$timeout,mainService,paraSettingsService) {

	$scope.t0cfgDataInfo={};

	$scope.passwordType = [{id: 0, msg: "简单(8-20位，任意字母、数字或者特殊字符均可)"}, {id: 1, msg: "复杂(8-20位，需同时包含数字、字母、特殊字符)"}];
	$scope.selectPasswordType = {};

	$scope.paraSettingsInit = function() {

		$scope.getParaSettingsDataInfo();
	}

	//页面加载完毕
	$scope.$watch('$viewContentLoaded', function(){

	});
	//页面关闭
	$scope.$on("$destroy", function() {

	});

	//刷新界面
	$scope.refreshParaSettingsData = function() {

		$scope.getParaSettingsDataInfo();
	}

	//获取参数配置信息
	$scope.getParaSettingsDataInfo = function() {

		var requestData={body:{}};

		paraSettingsService.getGlobalParaData(requestData,function(retData) {
			console.log(retData);
			console.log('**************************');
			if(retData.msret.msgcode=='00'){
				var tmpData=retData.body;
				for(var i=0;i<tmpData.length;i++){
					if(tmpData[i].cfgid=="cancel_checknum" || tmpData[i].cfgid=="cancel_checkamt" || tmpData[i].cfgid=="act_loginfailcount"
					    || tmpData[i].cfgid=="cap_trd_qty_limit"|| tmpData[i].cfgid=="cap_trader_qty_limit" || tmpData[i].cfgid=="passwd_complexity"){

							$scope.t0cfgDataInfo[tmpData[i].cfgid]=parseInt(tmpData[i].cfgvalue);
						}
						else{
							//将ON、OFF转换成true,false
							if(tmpData[i].cfgvalue=='ON'){
								$scope.t0cfgDataInfo[tmpData[i].cfgid]=true;
							}
							else if(tmpData[i].cfgvalue=='OFF'){
								$scope.t0cfgDataInfo[tmpData[i].cfgid]=false;
							} else if (tmpData[i].cfgvalue=='0'){
								$scope.t0cfgDataInfo[tmpData[i].cfgid]=false;
							} else if (tmpData[i].cfgvalue=='1'){
								$scope.t0cfgDataInfo[tmpData[i].cfgid]=true;
							}
							else{
								$scope.t0cfgDataInfo[tmpData[i].cfgid]=tmpData[i].cfgvalue;
							}

						}
				}

				if (typeof $scope.t0cfgDataInfo["passwd_complexity"] != "undefined") {
					var index = $scope.t0cfgDataInfo["passwd_complexity"];
					$scope.selectPasswordType = $scope.passwordType[index];
					console.log($scope.selectPasswordType,index)
				}
				$scope.$apply();
			}
			else{
				cms.message.error("获取全局参数配置出错."+retData.msret.msg);
			}
		})
	}

	//修改参数配置信息
	$scope.setParaSettingsDataInfo = function() {
		$scope.t0cfgDataInfo["passwd_complexity"] = $scope.selectPasswordType.id;

		//需要进行配置的参数cfgid
		var paraList=['md5_check','cap_trader_qty_limit','cap_trd_qty_limit',
					 'clear_move_hedgeposi','clear_move_piece','mgr_auto_clear','cross_mgr_auth',
					 'oper_chg_default_pass', 'oper_mac','term_check','main_ip',
					 'sub_ip','act_loginfailcount','cancel_checkamt','cancel_checknum','passwd_complexity'];
					 
		var dataList=[];

		for(var obj in $scope.t0cfgDataInfo){

			if(paraList.indexOf(obj)==-1)
			{
				continue;
			}

			var dataCell={};
			dataCell.cfgid=obj;

			if(obj=="clear_move_piece" ||obj=="mgr_auto_clear"
				||obj=="oper_chg_default_pass" || obj=="oper_mac" || obj=="term_check" || obj=="clear_move_hedgeposi")
			{
				dataCell.cfgvalue=$scope.t0cfgDataInfo[obj]==true?'ON':'OFF';
			} else if (obj=="md5_check" || obj=="cross_mgr_auth") {
				dataCell.cfgvalue = $scope.t0cfgDataInfo[obj]==true?'1':'0';
			}
			else{
				dataCell.cfgvalue=$scope.t0cfgDataInfo[obj];
			}

			dataList.push(dataCell);
		}

		var requestData={body:{data_list:dataList}};

		paraSettingsService.setGlobalParaData(requestData,function(retData) {

			if(retData.msret.msgcode=='00'){
				cms.message.success("修改全局参数配置成功.");
				$scope.refreshParaSettingsData();
			}
			else{
				cms.message.error("修改全局参数配置出错."+retData.msret.msg);
			}
		})
	}
});
