angular.module('cmsController').controller('positionDataSynchronizeCtrl',function($scope,$timeout,$rootScope,$ocLazyLoad,mainService,positionDataSynchronizeServeice) {
	$scope.templateMenuList = [];
	$scope.templateSettingOpenMenuList = [];

	$scope.positionDataSynchronizeInit = function() {
		$scope.templateMenuList.splice(0,$scope.templateMenuList.length);
		$scope.templateSettingOpenMenuList.splice(0,$scope.templateSettingOpenMenuList.length);
		/* 菜单格式
		* id：菜单唯一标识
		* title: 菜单显示名称
		* select: 菜单是否选中
		* show: 菜单是否显示
		* pagePath: 页面路径
		* controllerPath: controller路径
		* servicePath：service路径
		* cssPath: css路径
		*/
		$scope.templateMenuList.push({id:2005004001,title:"数据同步",select:false,show:true,pagePath:"../positionDataSynchronize/positionDataSync/positionDataSync.html",controllerPath:"../positionDataSynchronize/positionDataSync/positionDataSyncCtrl.js",servicePath:"../positionDataSynchronize/positionDataSync/positionDataSyncService.js",cssPath:"../positionDataSynchronize/positionDataSync/positionDataSync.css"});
        $scope.templateMenuList.push({id:2005004002,title:"同步记录",select:false,show:true,pagePath:"../positionDataSynchronize/positionDataSyncHistory/positionDataSyncHistory.html",controllerPath:"../positionDataSynchronize/positionDataSyncHistory/positionDataSyncHistoryCtrl.js",servicePath:"../positionDataSynchronize/positionDataSyncHistory/positionDataSyncHistoryService.js",cssPath:"../positionDataSynchronize/positionDataSyncHistory/positionDataSyncHistory.css"});
        
		for(var i = 0; i < $scope.templateMenuList.length ; i ++) {
			if($rootScope.menuRight.indexOf($scope.templateMenuList[i].id) != -1) {
                $scope.globalClickMenu(i);
				break;
			}
		}
	}

 	//页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){

    });


	//页面关闭
	$scope.$on("$destroy", function() {

    });

	//点击菜单
	$scope.globalClickMenu = function(index) {
		if($scope.templateMenuList[index].select == true) {
			return ;
		}
		angular.forEach($scope.templateMenuList,function(menu) {
			menu.select = false;
		})
		$scope.templateMenuList[index].select = true;
		angular.forEach($scope.templateSettingOpenMenuList,function(menu) {
			menu.active = false;
		});
		for(var i = 0; i < $scope.templateSettingOpenMenuList.length; i ++) {
			if($scope.templateSettingOpenMenuList[i].id == $scope.templateMenuList[index].id) {
				$scope.templateSettingOpenMenuList[i].active = true;
				return ;
			}
		}
		var newMenu = {};
		newMenu.id = $scope.templateMenuList[index].id;
		newMenu.pagePath = $scope.templateMenuList[index].pagePath;
		newMenu.active = true;
		var nowMenu = $scope.templateMenuList[index];
		var loadList = [];
		if(nowMenu.servicePath && nowMenu.servicePath != "") {
			loadList.push(nowMenu.servicePath);
		}
		if(nowMenu.controllerPath && nowMenu.controllerPath != "") {
			loadList.push(nowMenu.controllerPath);
		}
		if(nowMenu.cssPath && nowMenu.cssPath != "") {
			loadList.push(nowMenu.cssPath);
		}
		if(loadList.length > 0) {
			$ocLazyLoad.load(loadList).then(function() {
				$scope.templateSettingOpenMenuList.push(newMenu);
			})
		}
		else {
			$scope.templateSettingOpenMenuList.push(newMenu);
        }
	}

});
