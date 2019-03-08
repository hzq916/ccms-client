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
angular.module('cmsDirective').directive('cmsDropDownMenu',function() {
	return {
		restrict: 'E',
 		templateUrl: '../commonui/directive/dropDownMenu/dropDownMenu.html',
 		replace: false,
		scope : {
            clickMenuItem: "&",
            selectOptions: "@",
			placeholderText: "@",
			clickDisabled:"@"
		},
		link : function (scope, elem, attrs) {
            scope.showSelect=false;
			scope.options =[];

			scope.watch = scope.$watch(function() {
				return attrs.selectOptions;
			},function(value) {
				scope.options = JSON.parse(value);
			},true);

			scope.$on("$destroy", function() {
				scope.watch();
		    });

            scope.showOrHideMySelect=function () {
                scope.showSelect=!scope.showSelect;
            }

            scope.hideMySelect=function () {
                scope.showSelect=false;
            }

			scope.showMySelect=function () {
                scope.showSelect=true;
            }
            scope.clickItem= function(option) {
                scope.clickMenuItem({option:option});
            }
		}
	};
})
