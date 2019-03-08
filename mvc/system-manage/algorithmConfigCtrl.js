angular.module('cmsController').controller('algorithmConfigCtrl',function($scope,$timeout,$rootScope,$ocLazyLoad,mainService,algorithmConfigService) {
    
    $scope.modalInfo = {};


    $scope.checkList = [];

    $scope.allcheckedItem = {
        id: -1, desc: "allchecked", checked: false
    };

    $scope.addAlgorithmName = {
        "name": ""
    };

    $scope.addAlogrithmInit = function() {
        $scope.checkList = [];
        $scope.getAlgorithmData();
        $scope.modalInfo.state = 0;                      //默认值，无定义
		$scope.modalInfo.stateEnum = {};
        $scope.modalInfo.path = "";
    }


 	//页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){

    });


	//页面关闭
	$scope.$on("$destroy", function() {

    });

    $scope.getAlgorithmData = function() {
        algorithmConfigService.getAlgoConfig({},function(retData) {
            console.log("getAlgoConfig>>>>>>>>>>>>",JSON.stringify(retData));
            console.log(retData);
			if(retData.msret.msgcode=='00'){
                $scope.checkList = retData.body;
                // cms.message.success("获取算法配置成功.");
                $scope.allcheckedItem["checked"] = $scope.checkList.every(function(item) {
                    return item["stat"] === "1";
                })
			}
			else{
				cms.message.error("获取算法配置出错."+retData.msret.msg);
			}
		})
    }

    // 单选框选项绑定
    $scope.checkItem = function(temp) {
        if (temp['stat'] === "1") {
            return true
        }
        return false;
    };

    // 点击单选框的时候
    $scope.clickItem = function(temp, id) {
        if (temp['stat'] === "1") {
            temp["stat"] = "0";
        } else {
            temp["stat"] = "1";
        }
        $scope.checkList[(Number(id)-1)]["stat"] = temp["stat"];
        console.log(temp["stat"]);
        var count = 0;
        for(var i = 0; i<$scope.checkList.length; i++) {
            if ($scope.checkList[i]["stat"] === "1") {
                count++;
            } 
        }
        console.log(count);
        console.log($scope.checkList);
        if (count === $scope.checkList.length) {
            $scope.allcheckedItem["checked"] = true;
        } else {
            $scope.allcheckedItem["checked"] = false;
        }
        console.log($scope.allcheckedItem["checked"]);
    }

    //点击全选的时候
    $scope.clickAllChecked = function(temp) {
        console.log(temp);
        $scope.allcheckedItem.checked = !temp;
        if ($scope.allcheckedItem.checked) {
            for (var i = 0; i< $scope.checkList.length; i++) {
                $scope.checkList[i]["stat"] = "1";
            }
        } else {
            for (var i = 0; i< $scope.checkList.length; i++) {
                $scope.checkList[i]["stat"] = "0";
            }
        }
        
    };

    //弹框加载完成
	$scope.addAlgorithmLoadModalReady = function() {
		switch ($scope.modalInfo.state) {
			case $scope.modalInfo.stateEnum.addAlogrithm:
				mainService.showModal("addAlgorithm_modal_back","addAlgorithm_change_modal","addAlgorithm_change_modal_title");
				break;
			default:
				break;
		}
    }
    
    $scope.showAddAlogrithm = function() {

        $scope.addAlogrithmShowModal($scope.modalInfo.stateEnum.addAlogrithm);

    }
    
    //打开弹框
	$scope.addAlogrithmShowModal = function(state) {
		$scope.modalInfo.state = state;
		switch (state) {
			case $scope.modalInfo.stateEnum.addAlogrithm:
				$scope.modalInfo.path = "../system-manage/addAlgorithm.html";
				break;
			default:
				break;
		}
    }
    
    //关闭添加算法信息弹窗
    $scope.addAlgorithmChange_HideModal = function() {
		mainService.hideModal("addAlgorithm_modal_back");
		$scope.modalInfo.state = 0;
		$scope.modalInfo.path = "";
    }

    //点击添加算法信息确定按钮
    $scope.confirmAddAlgorithm = function() {
        console.log($scope.addAlgorithmName.name)
        //对算法ID和算法名称进行校验非空
        if ($scope.addAlgorithmName.name === "") {
            cms.message.error("请完整填写信息");
            return;
        }
        console.log('点击了确定按钮');
        var requestData = {
            body:{
                "algo_code": $scope.addAlgorithmName.name,
                "algo_engin": 1,
                "algo_engin_code": 1,
                "stat": 0
            }
        };
        algorithmConfigService.addAlgoConfig(requestData,function(retData) {
            console.log("addAlgoConfig>>>>>>>>>>>>",JSON.stringify(retData));
            console.log(retData);
			if(retData.msret.msgcode=='00'){
                cms.message.success("添加算法配置成功.");
                $scope.addAlgorithmChange_HideModal();
                $scope.getAlgorithmData();
			}
			else{
				cms.message.error("添加算法配置出错."+retData.msret.msg);
			}
		})
    }

    //点击保存生效按钮
    $scope.saveAlgorithmEffect = function() {
        console.log("保存并生效");
        var requestData = {
            body: {
                data_list: $scope.checkList
            }
        };
        console.log($scope.checkList);
        algorithmConfigService.altAlgoConfig(requestData,function(retData) {
            console.log("altAlgoConfig>>>>>>>>>>>>",JSON.stringify(retData));
            console.log(retData);
			if(retData.msret.msgcode=='00'){
                cms.message.success("保存并生效成功.");
                $scope.getAlgorithmData();
			}
			else{
				cms.message.error("保存并生效出错."+retData.msret.msg);
			}
		})
    }

	
});
