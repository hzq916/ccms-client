angular.module('cmsController').controller('alarmMessageCtrl', function ($scope, mainService, alarmMessageService) {
    $scope.filterContent = "";

    $scope.keyName = "";
    $scope.reverse = false;
    $scope.sortFunction = null;

    $scope.allAlarmMessage = [];

    $scope.begin_date = new Date();
    $scope.end_date = new Date();

    $scope.currentPage = 1;
    $scope.allPage = 1;
    $scope.pageSize = 20;
    $scope.filterOption = { begin_date: cms.formatDate($scope.begin_date), end_date: cms.formatDate($scope.end_date), pageSize: 20, pageNum: 1 };


    $scope.applicationsNameList = [
        {id:"0",name:"请选择应用名"},
        {id:"1",name:"coms"},
        {id:"2",name:"ogs"},
        {id:"3",name:"cms"}
    ]
    $scope.applicationCheckList = "0"; 

    $scope.severityLevelList = [
        {id:"-1",name:"请选择严重级别"},
        {id:"0",name:">=一般"},
        {id:"1",name:">=警告"},
        {id:"2",name:">=危险"},
        {id:"3",name:"=致命"}
    ]

    $scope.severityCheckList = "-1";

    $scope.isSearchNow = true;
    $scope.isSearchHistory = false;


    $scope.messageContent = ""; //消息内容模糊查询




    //点击表头
    $scope.clickTableHeader = function (keyName, isNumber) {
        $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
        $scope.keyName = keyName;
        $scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
    }

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function () {
        // $scope.getMessageNew();
        $scope.subAlarmMessageList();
    });

    $scope.getAlarmMessage = function (option) {
        var reqData = {
            body: {
                begin_alarmtime: option.body.begin_date + " 00:00:00",
                end_alarmtime: option.body.end_date + " 23:59:59",
                page_size: option.body.pageSize,
                page_num: option.body.pageNum,
                appname:$scope.applicationCheckList,
                alarmtype: 2,
                sort_rule: 1,
                alarmlv:0
            }
        };
        console.log(reqData);
        alarmMessageService.getAlarmMessage(reqData, function (res) {
            console.log(res);
            if (res.msret.msgcode != "00") {
                cms.message.error("获取告警消息数据失败." + res.msret.msg);
                return;
            }
            $scope.allAlarmMessage = res.body.data;

            $scope.allPage = Math.ceil(parseInt(res.body.totalCount) / $scope.pageSize);
            $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;
            $scope.allAlarmMessage.forEach(function (obj) {
                switch (obj.stat) {
                    case "0":
                        obj.alarmStateDesc = "未处理";
                        break;
                    case "1":
                        obj.alarmStateDesc = "处理中";
                        break;
                    case "2":
                        obj.alarmStateDesc = "已处理";
                        break;
                    case "3":
                        obj.alarmStateDesc = "自动清除";
                        break;
                    case "9":
                        obj.alarmStateDesc = "已忽略";
                        break;
                    default:
                }

                switch (obj.alarmlv) {
                    case "0":
                        obj.alarmlvDesc = "一般";
                        break;
                    case "1":
                        obj.alarmlvDesc = "警告";
                        break;
                    case "2":
                        obj.alarmlvDesc = "危险";
                        break;
                    case "3":
                        obj.alarmlvDesc = "致命";
                        break;
                    default:
                }

            });
            $scope.$apply();
        })
    }

    $scope.changeCheckState = function() {
        if ($scope.isSearchNow === true) {
            $scope.isSearchNow = false;
            $scope.isSearchHistory = true;
            $scope.unSubAlarmMessageList();
        } else {
            $scope.isSearchNow = true;
            $scope.isSearchHistory = false;
            $scope.subAlarmMessageList();
        }
    }


    $scope.getMessageNew = function() {
        if ($scope.isSearchNow === true) {
            //表示查询当前的数据
            //$scope.subAlarmMessageList();
            $scope.searchNowMessages();
        }

        if ($scope.isSearchHistory === true) {
            var reqData = {
                body: {
                    begin_alarmtime: cms.formatDateTime($scope.begin_date),
                    end_alarmtime:cms.formatDateTime($scope.end_date),
                    page_size: $scope.filterOption.pageSize,
                    page_num: $scope.filterOption.pageNum,
                    alarmtype: 2,
                    sort_rule: 1
                }
            };
            if ($scope.messageContent != "") {
                reqData.body.content = $scope.messageContent;
            }

            if ($scope.severityCheckList === "-1"){
                reqData.body.alarmlv = ""
            } else {
                reqData.body.alarmlv = $scope.severityCheckList;
            }

            if ($scope.applicationCheckList === "0"){
                reqData.body.appname = ""
            } else if ($scope.applicationCheckList === "1")  {
                reqData.body.appname = "coms";
            } else if ($scope.applicationCheckList === "2")  {
                reqData.body.appname = "ogs";
            } else if ($scope.applicationCheckList === "3")  {
                reqData.body.appname = "cms";
            } else {
                //
            }

            console.log(reqData);
            alarmMessageService.getAlarmMessage(reqData, function (res) {
                console.log(res);
                if (res.msret.msgcode != "00") {
                    cms.message.error("获取告警消息数据失败." + res.msret.msg);
                    return;
                }
                $scope.allAlarmMessage = res.body.data;
    
                $scope.allPage = Math.ceil(parseInt(res.body.totalCount) / $scope.pageSize);
                $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;
                $scope.allAlarmMessage.forEach(function (obj) {
                    switch (obj.stat) {
                        case "0":
                            obj.alarmStateDesc = "未处理";
                            break;
                        case "1":
                            obj.alarmStateDesc = "处理中";
                            break;
                        case "2":
                            obj.alarmStateDesc = "已处理";
                            break;
                        case "3":
                            obj.alarmStateDesc = "自动清除";
                            break;
                        case "9":
                            obj.alarmStateDesc = "已忽略";
                            break;
                        default:
                    }
    
                    switch (obj.alarmlv) {
                        case "0":
                            obj.alarmlvDesc = "一般";
                            break;
                        case "1":
                            obj.alarmlvDesc = "警告";
                            break;
                        case "2":
                            obj.alarmlvDesc = "危险";
                            break;
                        case "3":
                            obj.alarmlvDesc = "致命";
                            break;
                        default:
                    }
    
                });
                $scope.$apply();
            })
        }
    }



    //当选中的时间是当前的时候，点击查询按钮
    $scope.searchNowMessages = function() {
        console.log("当前查询");
        var reqData = {
            body: {
                begin_alarmtime: cms.formatDate($scope.begin_date) + " 00:00:00",
                end_alarmtime:cms.formatDateTime($scope.end_date),
                page_size: $scope.filterOption.pageSize,
                page_num: $scope.filterOption.pageNum,
                alarmtype: 2,
                sort_rule: 1
            }
        };
        if ($scope.messageContent != "") {
            reqData.body.content = $scope.messageContent;
        }
        if ($scope.severityCheckList === "-1"){
            reqData.body.alarmlv = ""
        } else {
            reqData.body.alarmlv = $scope.severityCheckList;
        }

        if ($scope.applicationCheckList === "0"){
            reqData.body.appname = ""
        } else if ($scope.applicationCheckList === "1")  {
            reqData.body.appname = "coms";
        } else if ($scope.applicationCheckList === "2")  {
            reqData.body.appname = "ogs";
        } else if ($scope.applicationCheckList === "3")  {
            reqData.body.appname = "cms";
        } else {
            //
        }

        console.log(reqData);
        alarmMessageService.getAlarmMessage(reqData, function (res) {
            console.log(res);
            if (res.msret.msgcode != "00") {
                cms.message.error("获取告警消息数据失败." + res.msret.msg);
                return;
            }
            $scope.allAlarmMessage = res.body.data;

            $scope.allPage = Math.ceil(parseInt(res.body.totalCount) / $scope.pageSize);
            $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;
            $scope.allAlarmMessage.forEach(function (obj) {
                switch (obj.stat) {
                    case "0":
                        obj.alarmStateDesc = "未处理";
                        break;
                    case "1":
                        obj.alarmStateDesc = "处理中";
                        break;
                    case "2":
                        obj.alarmStateDesc = "已处理";
                        break;
                    case "3":
                        obj.alarmStateDesc = "自动清除";
                        break;
                    case "9":
                        obj.alarmStateDesc = "已忽略";
                        break;
                    default:
                }

                switch (obj.alarmlv) {
                    case "0":
                        obj.alarmlvDesc = "一般";
                        break;
                    case "1":
                        obj.alarmlvDesc = "警告";
                        break;
                    case "2":
                        obj.alarmlvDesc = "危险";
                        break;
                    case "3":
                        obj.alarmlvDesc = "致命";
                        break;
                    default:
                }

            });
            $scope.$apply();
        })
    }

    $scope.goToPage = function (page) {
        page = page > $scope.allPage ? $scope.allPage : page;
        page = page < 1 ? 1 : page;
        $scope.currentPage = page;

        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.filterOption.pageSize = $scope.pageSize;

        $scope.getMessageNew();

    }

    $scope.pageToolsKeyUp = function (keyevent) {
        if (keyevent.keyCode === 13) { //回车
            console.log("回车按钮");
            if (isNaN(parseInt($scope.currentPage))) {
                $scope.currentPage = 1;
                return;
            }
            $scope.goToPage($scope.currentPage);

        } else if (keyevent.keyCode === 27) {  //escape
            $scope.currentPage = 1;
        }
    }


    $scope.editAlarmMessage = function (alarmMessage, stat) {
        var reqData = {
            body: {
                appname: alarmMessage.appname,
                alarmid: alarmMessage.alarmid,
                stat: stat
            }
        };
        alarmMessageService.editAlarmMessage(reqData, function (res) {
            if (res.msret.msgcode != "00") {
                cms.message.error("设置风控消息状态失败." + res.msret.msg);
                return;
            }
            cms.message.success("设置风控消息状态成功.");
            alarmMessage.stat = stat;
            switch (alarmMessage.stat) {
                case "0":
                    alarmMessage.alarmStateDesc = "未处理";
                    break;
                case "1":
                    alarmMessage.alarmStateDesc = "处理中";
                    break;
                case "2":
                    alarmMessage.alarmStateDesc = "已处理";
                    break;
                case "9":
                    alarmMessage.alarmStateDesc = "已忽略";
                    break;
                default:
            }

            if ($scope.keyName == "stat") {
                $scope.sortFunction = mainService.getSortFunc($scope.reverse, true);
            }
            $scope.$apply();
        })
    }

    $scope.changeStartDate = function (temp) {
        $scope.begin_date = temp;
        if ($scope.begin_date > $scope.end_date) {
            $scope.begin_date = new Date(cms.formatDateTime($scope.end_date));
        }
        $scope.currentPage = 1;
        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.filterOption.begin_date = cms.formatDateTime(temp);

        // $scope.getAlarmMessage({ body: $scope.filterOption });
           $scope.getMessageNew();
    }

    $scope.changeEndDate = function (temp) {
        $scope.end_date = temp;
        if ($scope.begin_date > $scope.end_date) {
            $scope.end_date = new Date(cms.formatDateTime(temp));
        }
        $scope.currentPage = 1;
        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.filterOption.end_date = cms.formatDateTime(temp);

        // $scope.getAlarmMessage({ body: $scope.filterOption });
           $scope.getMessageNew();
    }

    $scope.myFilter = function (obj) {
        return obj.content.indexOf($scope.filterContent) !== -1;
    }


    //订阅告警消息
    $scope.subAlarmMessageList = function() {
        console.log("订阅消息");
        var reqData = {
            body: {
                
            }
        };
        mainService.kMtFgsSubscribe(reqData);
        cmsNet.subscribeMarket_back(function(res) {
            console.log(res);
            if (res.msret.msgcode != "00") {
                cms.message.error("获取告警消息数据失败." + res.msret.msg);
                return;
            }
            $scope.allAlarmMessage = res.body.data;

            $scope.allPage = Math.ceil(parseInt(res.body.totalCount) / $scope.pageSize);
            $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;
            $scope.allAlarmMessage.forEach(function (obj) {
                switch (obj.stat) {
                    case "0":
                        obj.alarmStateDesc = "未处理";
                        break;
                    case "1":
                        obj.alarmStateDesc = "处理中";
                        break;
                    case "2":
                        obj.alarmStateDesc = "已处理";
                        break;
                    case "3":
                        obj.alarmStateDesc = "自动清除";
                        break;
                    case "9":
                        obj.alarmStateDesc = "已忽略";
                        break;
                    default:
                }

                switch (obj.alarmlv) {
                    case "0":
                        obj.alarmlvDesc = "一般";
                        break;
                    case "1":
                        obj.alarmlvDesc = "警告";
                        break;
                    case "2":
                        obj.alarmlvDesc = "危险";
                        break;
                    case "3":
                        obj.alarmlvDesc = "致命";
                        break;
                    default:
                }

            });
            $scope.$apply();
        })
    }

    //取消订阅
    $scope.unSubAlarmMessageList = function() {
        console.log("取消订阅");
        var reqData = {
            body: {
                
            }
        };
        mainService.unkMtFgsSubscribe(reqData);
    }

    //导出告警消息数据
	$scope.exportAlarmMessageDataClick = function(){
		console.log($scope.unitList);

		if($scope.allAlarmMessage.length<=0){
			cms.message.error("表中没有可导出的数据");
			return;
		}
		var exportData = {};
		var headers = ["告警时间","应用ID","应用名","应用消息ID","严重级别","消息内容"];
		exportData.headers = headers;
		exportData.fileType = "xlsx";
		exportData.fileName = "告警消息";
		exportData.data = [];

		console.log($scope.personalUserInfo); // 这里只有maid和oid

		angular.forEach($scope.allAlarmMessage,function(dataCell) {
			var tempCell = [];
				
				tempCell.push(dataCell.alarmtime);
				tempCell.push(dataCell.appid);
				tempCell.push(dataCell.appname);
				tempCell.push(dataCell.alarmid);
				tempCell.push(dataCell.alarmlvDesc);
				tempCell.push(dataCell.content);

				exportData.data.push(tempCell);
		})

		alarmMessageService.exportDataToExcelFile(exportData,function(err,res) {
			if(err) return ;
			if(res.result == true) {
				cms.message.success("导出数据成功.");
			}
			else {
				cms.message.error("导出数据失败."+res.reason);
				cms.log("导出数据失败：",res.reason);
			}
		})
	}

}).filter("myfilter", function () {
    return function (inputArray, param) {
        var arr = [];
        inputArray.forEach(function (obj) {
            if (obj.content.indexOf(param) !== -1) {
                arr.push(obj);
            }
        });

        return arr;
    }
});
