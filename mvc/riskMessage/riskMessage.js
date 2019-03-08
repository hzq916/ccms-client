angular.module('cmsController').controller('riskMessageCtrl', function($scope, mainService, riskMessageService) {
    $scope.filterContent = "";

    $scope.keyName = "";
    $scope.reverse = false;
    $scope.sortFunction = null;

    $scope.allRiskMessage = [];
    $scope.allRiskType = [];

    $scope.startDate = new Date();
    $scope.endDate = new Date();

    $scope.currentPage = 1;
    $scope.allPage = 1;
    $scope.pageSize = 20;
    $scope.filterOption = { pageSize: 20, pageNum: 1 };

    //点击表头
    $scope.clickTableHeader = function(keyName, isNumber) {
        $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
        $scope.keyName = keyName;
        $scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
    }

    //页面加载完毕
    $scope.$watch('$viewContentLoaded', function() {
        riskMessageService.getRiskType({ body: {} }, function(res) {
            if (res.msret.msgcode != "00") {
                cms.message.error("获取风控消息类型失败." + res.msret.msg);
                return;
            }
            // if (res.body.length == 0) {
            //     cms.message.success("获取风控消息类型成功,但数量为0.");
            // }
            $scope.allRiskType = res.body;
            $scope.refreshRiskMessage();
            $scope.$apply();
        })



    });

    $scope.getRiskMessage = function(option) {
        var requestData = {
            body: {
                startDate: cms.formatDate($scope.startDate) + " 00:00:00",
                endDate: cms.formatDate($scope.endDate) + " 23:59:59",
                pageSize: option.pageSize,
                pageNum: option.pageNum
            }
        };
        riskMessageService.getRiskMessage(requestData, function(res) {
            if (res.msret.msgcode != "00") {
                cms.message.error("获取风控消息数据失败." + res.msret.msg);
                return;
            }
            if (res.body.length == 0) {
                cms.message.success("获取风控消息数据成功,但数量为0.");
            }
            $scope.allRiskMessage = res.body;
            $scope.allPage = Math.ceil(parseInt(res.recordNumber) / $scope.pageSize);
            $scope.allPage = isNaN($scope.allPage) ? 1 : $scope.allPage;

            $scope.allRiskMessage.forEach(function(obj) {
                switch (obj.riskstat) {
                    case "0":
                        obj.riskStateDesc = "未处理";
                        break;
                    case "1":
                        obj.riskStateDesc = "已忽略";
                        break;
                    case "2":
                        obj.riskStateDesc = "已处理";
                        break;
                    default:
                }

                switch (obj.risklv) {
                    case "0":
                        obj.risklvDesc = "一般";
                        break;
                    case "1":
                        obj.risklvDesc = "警告";
                        break;
                    case "2":
                        obj.risklvDesc = "严重";
                        break;
                    case "3":
                        obj.risklvDesc = "致命";
                        break;
                    default:

                }
                var typeIndex = cms.binarySearch($scope.allRiskType, "risktype", obj.risktype);
                if (typeIndex != -1) {
                    obj.risktypeDesc = $scope.allRiskType[typeIndex].typename;
                } else {
                    obj.risktypeDesc = "未知类型";
                }
            });
            $scope.$apply();
        })
    }

    $scope.goToPage = function(page) {
        page = page > $scope.allPage ? $scope.allPage : page;
        page = page < 1 ? 1 : page;
        $scope.currentPage = page;

        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.filterOption.pageSize = $scope.pageSize;

        $scope.getRiskMessage($scope.filterOption);

    }

    $scope.pageToolsKeyUp = function(keyevent) {
        if (keyevent.keyCode === 13) { //回车
            if (isNaN(parseInt($scope.currentPage))) {

                $scope.currentPage = 1;
                return;
            }
            $scope.goToPage($scope.currentPage);

        } else if (keyevent.keyCode === 27) {  //escape
            $scope.currentPage = 1;
        }
    }

    $scope.refreshRiskMessage = function() {
        $scope.currentPage = 1;
        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.getRiskMessage($scope.filterOption);
    }

    $scope.handleRiskMesage = function(riskMessage) {
        riskMessage.setRiskState = "2";
        $scope.setRiskMessageState(riskMessage);

    }

    $scope.ignoreRiskMesage = function(riskMessage) {
        riskMessage.setRiskState = "1";
        $scope.setRiskMessageState(riskMessage);

    }

    $scope.setRiskMessageState = function(riskMessage) {
        riskMessageService.setRiskMessageState({ body: { id: riskMessage.id, riskstat: riskMessage.setRiskState } }, function(res) {
            if (res.msret.msgcode != "00") {
                cms.message.error("设置风控消息状态失败." + res.msret.msg);
                $scope.$apply();
                return;
            }
            cms.message.success("设置风控消息状态成功.");
            riskMessage.riskstat = riskMessage.setRiskState;
            switch (riskMessage.riskstat) {
                case "0":
                    riskMessage.riskStateDesc = "未处理";
                    break;
                case "1":
                    riskMessage.riskStateDesc = "已忽略";
                    break;
                case "2":
                    riskMessage.riskStateDesc = "已处理";
                    break;
                default:
            }

            if ($scope.keyName == "riskstat") {
                $scope.sortFunction = mainService.getSortFunc($scope.reverse, true);
            }
            $scope.$apply();
        })
    }

    $scope.changeStartDate = function() {
        if ($scope.startDate > $scope.endDate) {
            $scope.startDate = new Date(cms.formatDate($scope.endDate));
        }
        $scope.currentPage = 1;
        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.getRiskMessage($scope.filterOption);
    }

    $scope.changeEndDate = function() {
        if ($scope.startDate > $scope.endDate) {
            $scope.endDate = new Date(cms.formatDate($scope.startDate));
        }
        $scope.currentPage = 1;
        $scope.filterOption.pageNum = $scope.currentPage;
        $scope.getRiskMessage($scope.filterOption);
    }

    $scope.myFilter = function(obj) {
        return obj.riskmsg.indexOf($scope.filterContent) !== -1;
    }
});
