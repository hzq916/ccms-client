/*
	使用directive cmsDropDownMenu
	在页面引入 <cms-drop-down-menu></cms-drop-down-menu>
	可传入属性：必传placeholder-text,select-options,click-menu-item
	响应函数： 无
	说明：
		按钮的长度取决于placeholderText的长度,高度是固定的
		select-options: 下拉菜单的选项
		click-menu-item: 下拉菜单选项的点击响应函数
		placeholder-text: 单项绑定传入的属性值
		页面赋值：<cms-drop-down-menu placeholder-text="导入持仓" select-options="{{importTypes}}" click-menu-item="clickMenuItem(option)" ng-show="currentUnit.maid"></cms-drop-down-menu>
*/
angular.module('cmsDirective').directive('cmsDataPager', function () {
	return {
		restrict: 'E',
		templateUrl: '../commonui/directive/dataPager/dataPager.html',
		replace: false,
		scope: {
			clickMenuItem: "&",
			allPage: "@",
			currentPage: "="
		},
		link: function (scope, elem, attrs) {
			// scope.allPage = 12;
			// scope.allPage = scope.allPage < 1 ? 1 : scope.allPage;
			scope.goToPage = function (page) {
				scope.allPage = Number(scope.allPage);
				page = Number(page);
				page = page > scope.allPage ? scope.allPage : page;
				page = page < 1 ? 1 : page;

				scope.currentPage = page;
				scope.clickMenuItem({ page: page });
			}

			scope.pageToolsKeyUp = function (keyevent) {
				if (keyevent.keyCode === 13) { //回车
					if (isNaN(parseInt(scope.currentPage))) {
						scope.currentPage = 1;
						return;
					}
					scope.goToPage(scope.currentPage);

				} else if (keyevent.keyCode === 27) {  //escape
					scope.currentPage = 1;
				}
			}
		}
	};
})
