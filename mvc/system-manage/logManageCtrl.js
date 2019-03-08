angular.module('cmsController').controller('logManageCtrl',function($scope,$timeout,$rootScope,$ocLazyLoad,mainService,logManageServeice) {
	$scope.logManageMenuList = [];
	$scope.logManageOpenMenuList = [];

	$scope.logManageInit = function() {
		$scope.logManageMenuList.splice(0,$scope.logManageMenuList.length);
		$scope.logManageOpenMenuList.splice(0,$scope.logManageOpenMenuList.length);
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

		$scope.logManageMenuList.push({id:2005005001,title:"登录日志",select:false,show:true,pagePath:"../system-manage/loginLog.html",controllerPath:"../system-manage/loginLogCtrl.js",servicePath:"../system-manage/loginLogService.js",cssPath:"../system-manage/loginLog.css"});
		$scope.logManageMenuList.push({id:2005005002,title:"操作日志",select:false,show:true,pagePath:"../system-manage/operatorLog.html",controllerPath:"../system-manage/operatorLogCtrl.js",servicePath:"../system-manage/operatorLogService.js",cssPath:"../system-manage/operatorLog.css"});
		$scope.logManageMenuList.push({id:2005005003,title:"数据库错误日志",select:false,show:true,pagePath:"../system-manage/dbErrorLog.html",controllerPath:"../system-manage/dbErrorLogCtrl.js",servicePath:"../system-manage/dbErrorLogService.js",cssPath:"../system-manage/dbErrorLog.css"});

		for(var i = 0; i < $scope.logManageMenuList.length ; i ++) {
			if($rootScope.menuRight.indexOf($scope.logManageMenuList[i].id) != -1) {
				$scope.logManageClickMenu(i);
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
	$scope.logManageClickMenu = function(index) {
		if($scope.logManageMenuList[index].select == true) {
			return ;
		}
		angular.forEach($scope.logManageMenuList,function(menu) {
			menu.select = false;
		})
		$scope.logManageMenuList[index].select = true;
		angular.forEach($scope.logManageOpenMenuList,function(menu) {
			menu.active = false;
		});
		for(var i = 0; i < $scope.logManageOpenMenuList.length; i ++) {
			if($scope.logManageOpenMenuList[i].id == $scope.logManageMenuList[index].id) {
				$scope.logManageOpenMenuList[i].active = true;
				return ;
			}
		}
		var newMenu = {};
		newMenu.id = $scope.logManageMenuList[index].id;
		newMenu.pagePath = $scope.logManageMenuList[index].pagePath;
		newMenu.active = true;
		var nowMenu = $scope.logManageMenuList[index];
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
				$scope.logManageOpenMenuList.push(newMenu);
			})
		}
		else {
			$scope.logManageOpenMenuList.push(newMenu);
		}
	}

});
