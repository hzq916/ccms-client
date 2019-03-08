/*
	使用directive cmsPasswordInput说明
	在页面引入 <cms-password-input></cms-password-input>
	可传入属性：必传password-text,可传input-disabled
	响应函数： 无
	说明：
		输入框的长度取决于父元素的长度,高度是固定的

		password-text: 双向绑定传入的属性值
		  页面赋值：<cms-password-input password-text="marketCfg.station_psw_copy"></cms-guide>
		input-disabled: 是否设置input为disbaled
		  页面赋值：<cms-password-input input-disabled="{{!marketCfg.edit}}" password-text="marketCfg.station_psw_copy"></cms-password-input>
		 placeholder-text: 如果存在,则是placeholder
		 maxLength:存在则限制可以输入的最大长度,默认128
		 input-blur: 输入框失去焦点触发的事件
*/
angular.module('cmsDirective').directive('cmsPasswordInput',function() {
	return {
		restrict: 'E',
 		templateUrl: '../commonui/directive/passwordInput/passwordInput.html',
 		replace: true,
		scope : {
			passwordText: "=",
            inputDisabled: "@",
			placeholderText: "@",
			maxLength: "@",
			inputBlur: "&",
		},
		link : function (scope, elem, attrs) {
			if(!scope.maxLength) {
				scope.maxLength=128;
			}
			scope.blurPwd= function() {
                scope.inputBlur();
            }
            scope.changeInputType =function (clickEvent){
        		for (var i = 0; i < clickEvent.path.length; i++) {
        			var inputDiv=clickEvent.path[i];
        			if (inputDiv.className.indexOf("common_tail_input") != -1) {
        				for (var i = 0; i < inputDiv.children.length; i++) {
        					if (inputDiv.children[i].tagName.toLowerCase() == "input") {
        						if (inputDiv.children[i].type == "text") {
        							inputDiv.children[i].type = "password";
        							cms.removeClass(clickEvent.target,"icon-yanjing");
        							cms.addClass(clickEvent.target,"icon-yanjing1");
        							clickEvent.target.title="显示密码";
        						} else {
        							inputDiv.children[i].type = "text";
        							cms.removeClass(clickEvent.target,"icon-yanjing1");
        							cms.addClass(clickEvent.target,"icon-yanjing");
        							clickEvent.target.title="隐藏密码";
        						}

        						break;
        					}
        				}
        				break;
        			}
        		}
        	}
		}
	};
})
