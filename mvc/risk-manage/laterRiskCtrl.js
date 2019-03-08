angular.module('cmsController').controller('laterRiskCtrl',function($scope,$rootScope,$ocLazyLoad) {
	$scope.laterRiskMenuList = [];
	$scope.laterRiskOpenMenuList = [];
	$scope.currentMenuId = "";

	$scope.laterRiskInit = function() {
		$scope.laterRiskMenuList.splice(0,$scope.laterRiskMenuList.length);
		$scope.laterRiskOpenMenuList.splice(0,$scope.laterRiskOpenMenuList.length);
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
		$scope.laterRiskMenuList.push({id:2003002001,title:"订单查询",select:false,show:true,pagePath:"../risk-manage/laterRisk-order.html",controllerPath:"../risk-manage/laterRisk-orderCtrl.js",servicePath:"../risk-manage/laterRisk-orderService.js",cssPath:"../risk-manage/laterRisk-order.css"});
		$scope.laterRiskMenuList.push({id:2003002002,title:"账户仓位查询",select:false,show:true,pagePath:"../risk-manage/laterRisk-tatract.html",controllerPath:"../risk-manage/laterRisk-tatractCtrl.js",servicePath:"../risk-manage/laterRisk-tatractService.js",cssPath:"../risk-manage/laterRisk-tatract.css"});
		// $scope.laterRiskMenuList.push({id:2003002003,title:"交易员仓位",select:false,show:true,pagePath:"../risk-manage/laterRisk-trader.html",controllerPath:"../risk-manage/laterRisk-traderCtrl.js",servicePath:"../risk-manage/laterRisk-traderService.js",cssPath:"../risk-manage/laterRisk-trader.css"});
	
		for(var i = 0; i < $scope.laterRiskMenuList.length ; i ++) {
			if($rootScope.menuRight.indexOf($scope.laterRiskMenuList[i].id) != -1) {
				$scope.laterRiskClickMenu(i);
				break;
			}
		}
	}

	//菜单改变
	$scope.$on("mainMenuChange",function(event,menu) {
		if(menu.menuId == "2003002" ) {
			$scope.$broadcast("laterRiskMenuChange",{menuId: $scope.currentMenuId});
		}
		else {
			$scope.$broadcast("laterRiskMenuChange",{menuId: ""});
		}
	})

 	//页面加载完毕
    $scope.$watch('$viewContentLoaded', function(){

    });


	//页面关闭
	$scope.$on("$destroy", function() {

    });

	//点击菜单
	$scope.laterRiskClickMenu = function(index) {
		if($scope.laterRiskMenuList[index].select == true) {
			return ;
		}
		$scope.currentMenuId = $scope.laterRiskMenuList[index].id;
		$scope.$broadcast("laterRiskMenuChange",{menuId: $scope.currentMenuId});
		angular.forEach($scope.laterRiskMenuList,function(menu) {
			menu.select = false;
		})
		$scope.laterRiskMenuList[index].select = true;
		angular.forEach($scope.laterRiskOpenMenuList,function(menu) {
			menu.active = false;
		});
		for(var i = 0; i < $scope.laterRiskOpenMenuList.length; i ++) {
			if($scope.laterRiskOpenMenuList[i].id == $scope.laterRiskMenuList[index].id) {
				$scope.laterRiskOpenMenuList[i].active = true;
				return ;
			}
		}
		var newMenu = {};
		newMenu.id = $scope.laterRiskMenuList[index].id;
		newMenu.pagePath = $scope.laterRiskMenuList[index].pagePath;
		newMenu.active = true;
		var nowMenu = $scope.laterRiskMenuList[index];
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
				$scope.laterRiskOpenMenuList.push(newMenu);
			})
		}
		else {
			$scope.laterRiskOpenMenuList.push(newMenu);
		}
	}
})
