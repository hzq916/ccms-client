/*
	使用directive cmsBoard
	在页面引入 <cms-board></cms-board>
	可传入属性：必传dest-value,表示输入框显示的值
	响应函数： 无
	说明：
		select-options: 下拉菜单的选项
	例子:<cms-board style="position:fixed; left: 26px; top: 405px;" ng-show="showKeyBoard" dest-value="loginInfo.pass"></cms-board>

*/
angular.module('cmsDirective').directive('cmsBoard',function() {
	return {
		restrict: 'E',
 		templateUrl: '../directive/onBoard/onBoard.html',
 		replace: false,
		scope : {
            destValue: "="
		},
		link : function (scope, elem, attrs) {
			scope.shiftState = 0;
			scope.capsLock = false;

			scope.letterKeys = [{id:0, normal:"a", shift:"A"},{id:1, normal:"b", shift:"B"},{id:2, normal:"c", shift:"C"},{id:3, normal:"d", shift:"D"},{id:4, normal:"e", shift:"E"},
			{id:5, normal:"f", shift:"F"},{id:6, normal:"g", shift:"G"},{id:7, normal:"h", shift:"H"},{id:8, normal:"i", shift:"I"},{id:9, normal:"j", shift:"J"},
			{id:10, normal:"k", shift:"K"},{id:11, normal:"l", shift:"L"},{id:12, normal:"m", shift:"M"},{id:13, normal:"n", shift:"N"},{id:14, normal:"o", shift:"O"},
			{id:15, normal:"p", shift:"P"},{id:16, normal:"q", shift:"Q"},{id:17, normal:"r", shift:"R"},{id:18, normal:"s", shift:"S"},{id:19, normal:"t", shift:"T"},
			{id:20, normal:"u", shift:"U"},{id:21, normal:"v", shift:"V"},{id:22, normal:"w", shift:"W"},{id:23, normal:"x", shift:"X"},{id:24, normal:"y", shift:"Y"},
			{id:25, normal:"z", shift:"Z"}];

			scope.numberKeys = [{id:0, normal:"0", shift:")"},{id:1, normal:"1", shift:"!"},{id:2, normal:"2", shift:"@"},{id:3, normal:"3", shift:"#"},{id:4, normal:"4", shift:"$"},
				{id:5, normal:"5", shift:"%"},{id:6, normal:"6", shift:"^"},{id:7, normal:"7", shift:"&"},{id:8, normal:"8", shift:"*"},{id:9, normal:"9", shift:"("},
				{id:10, normal:"`", shift:"~"}];

			scope.charKeys = [{id:0, normal:"-", shift:"_"},{id:1, normal:"=", shift:"+"},{id:2, normal:"[", shift:"{"},{id:3, normal:"]", shift:"}"},{id:4, normal:"\\", shift:"|"},
			{id:5, normal:";", shift:":"},{id:6, normal:"'", shift:"\""},{id:7, normal:",", shift:"<"},{id:8, normal:".", shift:">"},{id:9, normal:"/", shift:"?"}];

			function randomsort(a, b) {
			    return Math.random()>.5 ? -1 : 1;
			    //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
			}
			scope.letterKeys.sort(randomsort);
			scope.numberKeys.sort(randomsort);
			scope.charKeys.sort(randomsort);

			scope.addLetter = function (letterKey) {
				if (scope.capsLock ^ scope.shiftState) {
					scope.destValue += letterKey.shift;
				} else {
					scope.destValue += letterKey.normal;
				}
				if (scope.shiftState ==1) {
					scope.shiftState = 0;
				}
			}

			scope.addChar = function (charKey) {
				if (scope.tempShift || scope.shiftState) {
					scope.destValue += charKey.shift;
				} else {
					scope.destValue += charKey.normal;
				}

				if (scope.shiftState ==1) {
					scope.shiftState = 0;
				}
			}

			scope.deleteLastCode=function() {
				scope.destValue = scope.destValue.substring(0,scope.destValue.length-1);
				// console.log("scope.destValue ",scope.destValue );
			}

			scope.changeShiftState=function() {
				++scope.shiftState;
				if (scope.shiftState > 2) {
					scope.shiftState = 0;
				}
			}

			scope.changeCapsLock=function() {
				scope.capsLock = !scope.capsLock ;
			}
		}
	};
});
