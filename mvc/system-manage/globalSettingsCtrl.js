angular.module('cmsController').controller('globalSettingsCtrl',function($scope,$timeout,$rootScope,$ocLazyLoad,mainService,globalSettingsServeice) {
	$scope.globalMenuList = [];
	$scope.globalOpenMenuList = [];

	$scope.globalSettingsInit = function() {
		$scope.globalMenuList.splice(0,$scope.globalMenuList.length);
		$scope.globalOpenMenuList.splice(0,$scope.globalOpenMenuList.length);
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
		$scope.globalMenuList.push({id:2005004001,title:"经纪商管理",select:false,show:true,pagePath:"../system-manage/brokerManage.html",controllerPath:"../system-manage/brokerManageCtrl.js",servicePath:"../system-manage/brokerManageService.js",cssPath:"../system-manage/brokerManage.css"});
		$scope.globalMenuList.push({id:2005004002,title:"币种管理",select:false,show:true,pagePath:"../system-manage/currencyManage.html",controllerPath:"../system-manage/currencyManageCtrl.js",servicePath:"../system-manage/currencyManageService.js",cssPath:"../system-manage/currencyManage.css"});
		$scope.globalMenuList.push({id:2005004003,title:"通道管理",select:false,show:true,pagePath:"../system-manage/channel.html",controllerPath:"../system-manage/channelCtrl.js",servicePath:"../system-manage/channelService.js",cssPath:"../system-manage/channel.css"});
		$scope.globalMenuList.push({id:2005004004,title:"参数设置",select:false,show:true,pagePath:"../system-manage/paraSettings.html",controllerPath:"../system-manage/paraSettingsCtrl.js",servicePath:"../system-manage/paraSettingsService.js",cssPath:"../system-manage/paraSettings.css"});
		$scope.globalMenuList.push({id:2005004005,title:"UKEY管理",select:false,show:true,pagePath:"../system-manage/ukcodeManage/ukcodeManage.html",controllerPath:"../system-manage/ukcodeManage/ukcodeManageCtrl.js",servicePath:"../system-manage/ukcodeManage/ukcodeManageService.js",cssPath:"../system-manage/ukcodeManage/ukcodeManage.css"});
		$scope.globalMenuList.push({id:2005004006,title:"日历管理",select:false,show:true,pagePath:"../system-manage/calendar.html",controllerPath:"../system-manage/calendarCtrl.js",servicePath:"../system-manage/calendarService.js",cssPath:"../system-manage/calendar.css"});
		$scope.globalMenuList.push({id:2005004007,title:"算法配置",select:false,show:true,pagePath:"../system-manage/algorithmConfig.html",controllerPath:"../system-manage/algorithmConfigCtrl.js",servicePath:"../system-manage/algorithmConfigService.js",cssPath:"../system-manage/algorithmConfig.css"});

		for(var i = 0; i < $scope.globalMenuList.length ; i ++) {
			if($rootScope.menuRight.indexOf($scope.globalMenuList[i].id) != -1) {
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
		if($scope.globalMenuList[index].select == true) {
			return ;
		}
		angular.forEach($scope.globalMenuList,function(menu) {
			menu.select = false;
		})
		$scope.globalMenuList[index].select = true;
		angular.forEach($scope.globalOpenMenuList,function(menu) {
			menu.active = false;
		});
		for(var i = 0; i < $scope.globalOpenMenuList.length; i ++) {
			if($scope.globalOpenMenuList[i].id == $scope.globalMenuList[index].id) {
				$scope.globalOpenMenuList[i].active = true;
				return ;
			}
		}
		var newMenu = {};
		newMenu.id = $scope.globalMenuList[index].id;
		newMenu.pagePath = $scope.globalMenuList[index].pagePath;
		newMenu.active = true;
		var nowMenu = $scope.globalMenuList[index];
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
				$scope.globalOpenMenuList.push(newMenu);
			})
		}
		else {
			$scope.globalOpenMenuList.push(newMenu);
		}
	}

});
