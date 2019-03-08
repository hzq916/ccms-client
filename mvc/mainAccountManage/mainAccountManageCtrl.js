angular.module('cmsController').controller('mainAccountManageCtrl',function($scope,$timeout,$rootScope,$ocLazyLoad,mainService,mainAccountManageService) {
	$scope.mainAccountManageMenuList = [];
	$scope.mainAccountManageOpenMenuList = [];

	$scope.mainAccountManageInit = function() {
		$scope.mainAccountManageMenuList.splice(0,$scope.mainAccountManageMenuList.length);
		$scope.mainAccountManageOpenMenuList.splice(0,$scope.mainAccountManageOpenMenuList.length);
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
		$scope.mainAccountManageMenuList.push({id:2002001001,title:"资产账户管理",select:false,show:true,pagePath:"../account-manage/accountManage.html",controllerPath:"../account-manage/accountManageCtrl.js",servicePath:"../account-manage/accountManageService.js",cssPath:"../account-manage/accountManage.css"});
		$scope.mainAccountManageMenuList.push({id:2002001002,title:"账户登录管理",select:false,show:true,pagePath:"../accountLoginManageMent/accountLoginManageMent.html",controllerPath:"../accountLoginManageMent/accountLoginManageMentCtrl.js",servicePath:"../accountLoginManageMent/accountLoginManageMentService.js",cssPath:"../accountLoginManageMent/accountLoginManageMent.css"});

		for(var i = 0; i < $scope.mainAccountManageMenuList.length ; i ++) {
			if($rootScope.menuRight.indexOf($scope.mainAccountManageMenuList[i].id) != -1) {
				$scope.mainAccountManageClickMenu(i);
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
	$scope.mainAccountManageClickMenu = function(index) {
		if($scope.mainAccountManageMenuList[index].select == true) {
			return ;
		}
		angular.forEach($scope.mainAccountManageMenuList,function(menu) {
			menu.select = false;
		})
		$scope.mainAccountManageMenuList[index].select = true;
		angular.forEach($scope.mainAccountManageOpenMenuList,function(menu) {
			menu.active = false;
		});
		for(var i = 0; i < $scope.mainAccountManageOpenMenuList.length; i ++) {
			if($scope.mainAccountManageOpenMenuList[i].id == $scope.mainAccountManageMenuList[index].id) {
				$scope.mainAccountManageOpenMenuList[i].active = true;
				return ;
			}
		}
		var newMenu = {};
		newMenu.id = $scope.mainAccountManageMenuList[index].id;
		newMenu.pagePath = $scope.mainAccountManageMenuList[index].pagePath;
		newMenu.active = true;
		var nowMenu = $scope.mainAccountManageMenuList[index];
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
				$scope.mainAccountManageOpenMenuList.push(newMenu);
			})
		}
		else {
			$scope.mainAccountManageOpenMenuList.push(newMenu);
		}
	}

});
