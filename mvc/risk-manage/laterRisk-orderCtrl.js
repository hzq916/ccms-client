angular.module('cmsController').controller('lrOrderCtrl', function ($scope, mainService, laterRiskService, lrOrderService) {
    $scope.showOptions = false;
    $scope.options = {};
    $scope.tamgrList = [];
    $scope.tatrdList = [];
    $scope.taactList = [];
    $scope.traderList = [];
    $scope.sideList = [];
    $scope.cmdList = [];
    $scope.dict_orderstat = [];
    $scope.orderList = [];

    $scope.orderstats = [];
    $scope.modifyOrderStats = [];
    $scope.stateLevel = {
        "0": 2,
        "1": 3,
        "2": 4,
        "3": 5,
        "4": 7,
        "5": 8,
        "6": 8,
        "7": 6,
        "8": 8,
        "9": 8

    }
    $scope.modalInfo = {};
    $scope.currentOrder = {};

    $scope.keyName = "";
    $scope.reverse = false;
    $scope.sortFunction = null;

    $scope.currentPage = 1;
    $scope.allPage = 1;
    $scope.pageCount = 20;

    $scope.selectHis = false;

    $scope.$on("changedManager_broadcast", function (event, message) {
        $scope.lrOrderGetTamgr();
    });

    $scope.$on("changedAssetAccount_broadcast", function (event, message) {
        $scope.lrOrderGetTacap();
    });

    $scope.$on("changedTradeUnit_broadcast", function (event, message) {
        $scope.lrOrderGetTatrd();
    });

    $scope.$on("changedTrader_broadcast", function (event, message) {
        $scope.lrOrderGetTrader();
    });

    //点击表头
    $scope.clickTableHeader = function (keyName, isNumber) {
        $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
        $scope.keyName = keyName;
        $scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
    }

    $scope.lrOrderInit = function () {
        $scope.options.startDate = new Date();
        $scope.options.endDate = new Date();
        $scope.options.maid = "";
        $scope.options.trid = "";
        $scope.options.marketcode = "";
        $scope.options.cname = "";
        $scope.options.side = "0";
        $scope.options.sysorderid = "";
        $scope.options.borderid = "";
        $scope.options.startTradeprice = "";
        $scope.options.endTradeprice = "";
        $scope.options.startTradevol = "";
        $scope.options.endTradevol = "";
        $scope.sideList.push({ side: "0", desc: "全部" });
        $scope.sideList.push({ side: "1", desc: "买" });
        $scope.sideList.push({ side: "2", desc: "卖" });
        $scope.dict_orderstat.push({ orderstat: "8", desc: "全部成交", select: false });
        $scope.dict_orderstat.push({ orderstat: "7", desc: "部分成交", select: false });
        $scope.dict_orderstat.push({ orderstat: "9", desc: "废单", select: false });
        $scope.tamgrList.splice(0, $scope.tamgrList.length);
        $scope.tatrdList.splice(0, $scope.tatrdList.length);
        $scope.taactList.splice(0, $scope.taactList.length);
        $scope.traderList.splice(0, $scope.traderList.length);
        $scope.cmdList.splice(0, $scope.cmdList.length);
        $scope.orderList.splice(0, $scope.orderList.length);
        $scope.modalInfo.state = 0;
        $scope.modalInfo.path = "";
        $scope.modalInfo.stateEnum = {};
        $scope.modalInfo.stateEnum.modify = 1;
        $scope.lrOrderGetTamgr();
        $scope.lrOrderGetCommand();
        $scope.lrOrderGetOrderStats();
    }

    //获取资产管理人
    $scope.lrOrderGetTamgr = function () {
        var reqData = { body: {} };
        laterRiskService.getTamgr(reqData, function (res) {
            if (res.msret.msgcode == "00") {
                $scope.tamgrList = res.body;
                if ($scope.tamgrList.length > 0) {
                    $scope.options.maid = String($scope.tamgrList[0].maid);
                    $scope.$apply();
                    $scope.lrOrderGetTatrd($scope.options.maid);
                    $scope.lrOrderGetTacap($scope.options.maid);
                }
            }
            else {
                cms.message.error("获取资产管理人列表失败.");
                cms.log("获取资产管理人列表失败：", res.msret.msgcode, res.msret.msg);
            }
        })
    }

    //获取策略组合
    $scope.lrOrderGetTatrd = function (maid) {
        var reqData = { body: { maid: maid } };
        laterRiskService.getTatrd(reqData, function (res) {
            if (res.msret.msgcode == "00") {
                $scope.tatrdList = res.body;
                if ($scope.tatrdList.length > 0) {
                    $scope.options.trid = String($scope.tatrdList[0].trid);
                    $scope.$apply();
                    //获取交易员
                    $scope.lrOrderGetTrader($scope.options.trid);
                }
            }
            else {
                cms.message.error("获取策略组合列表失败.");
                cms.log("获取策略组合列表失败.", res.msret.msgcode, res.msret.msg);
            }
        })
    }

    //获取交易员列表
    $scope.lrOrderGetTrader = function (trid) {
        var reqData = { body: { trid: trid } };
        laterRiskService.getTrader(reqData, function (res) {
            if (res.msret.msgcode == "00") {
                $scope.traderList = res.body;
                angular.forEach($scope.traderList, function (trader) {
                    trader.select = false;
                })
                $scope.$apply();
            }
            else {
                cms.message.error("获取交易员列表失败.");
                cms.log("获取交易员列表失败.", res.msret.msgcode, res.msret.msg);
            }
        })
    }

    //获取产品
    $scope.lrOrderGetTacap = function (maid) {
        var reqData = { body: { maid: maid } };
        laterRiskService.getTacap(reqData, function (res1) {
            if (res1.msret.msgcode == "00") {
                laterRiskService.getTaact(reqData, function (res) {
                    if (res.msret.msgcode == "00") {
                        $scope.lrOrderMakeTaactTree(res1.body, res.body);
                    }
                    else {
                        cms.message.error("获取资产账户列表失败.");
                        cms.log("获取资产账户列表失败.", res.msret.msgcode, res.msret.msg);
                    }
                })
            }
            else {
                cms.message.error("获取产品列表失败.");
                cms.log("获取产品列表失败.", res1.msret.msgcode, res1.msret.msg);
            }
        })
    }

    //构造账户树
    $scope.lrOrderMakeTaactTree = function (tacapArr, taactArr) {
        //去掉未绑定产品的账户
        for (var i = 0; i < taactArr.length;) {
            if (taactArr[i].caid == -1) {
                taactArr.splice(i, 1);
            }
            else {
                i++;
            }
        }
        for (var j = 0; j < tacapArr.length; j++) {
            var product = {};
            product.maid = tacapArr[j].maid;
            product.caid = tacapArr[j].caid;
            product.caname = tacapArr[j].caname;
            product.leaf = false;
            product.select = false;
            product.fold = false;
            product.show = true;
            $scope.taactList.push(product);
            for (var k = 0; k < taactArr.length;) {
                if (taactArr[k].caid == product.caid) {
                    var taact = {};
                    taact.maid = taactArr[k].maid;
                    taact.caid = taactArr[k].caid;
                    taact.acid = taactArr[k].acid;
                    taact.acname = taactArr[k].acname;
                    taact.leaf = true;
                    taact.select = false;
                    taact.show = true;
                    $scope.taactList.push(taact);
                    taactArr.splice(k, 1);
                }
                else {
                    k++;
                }
            }
            if ($scope.taactList[$scope.taactList.length - 1].leaf == false) {
                $scope.taactList.splice($scope.taactList.length - 1, 1);
            }
        }
        $scope.$apply();
    }

    //展开或收起账户列表
    $scope.lrOrderFoldTaactList = function (index) {
        $scope.taactList[index].fold = !$scope.taactList[index].fold;
        angular.forEach($scope.taactList, function (taact) {
            if (taact.caid == $scope.taactList[index].caid && taact.leaf == true) {
                taact.show = !$scope.taactList[index].fold;
            }
        })
    }

    //选择账户或者取消
    $scope.lrOrderSelectTaact = function (index) {
        if ($scope.taactList[index].leaf == false) {
            angular.forEach($scope.taactList, function (taact) {
                if (taact.caid == $scope.taactList[index].caid && taact.leaf == true) {
                    taact.select = $scope.taactList[index].select;
                }
            })
        }
        else {
            var caid = $scope.taactList[index].caid;
            var key = true;
            for (var i = 0; i < $scope.taactList.length; i++) {
                if ($scope.taactList[i].caid == caid && $scope.taactList[i].leaf == true && $scope.taactList[i].select == false) {
                    key = false;
                    break;
                }
            }
            for (var j = 0; j < $scope.taactList.length; j++) {
                if ($scope.taactList[j].caid == caid && $scope.taactList[j].leaf == false) {
                    $scope.taactList[j].select = key;
                    break;
                }
            }
        }
    }

    //获取业务
    $scope.lrOrderGetCommand = function () {
        var reqData = { body: {} };
        lrOrderService.getCommand(reqData, function (res) {
            if (res.msret.msgcode == "00") {
                $scope.cmdList = res.body;
                angular.forEach($scope.cmdList, function (cmd) {
                    cmd.select = false;
                })
                $scope.$apply();
            }
            else {
                cms.message.error("获取业务列表失败.");
                cms.log("获取业务列表失败", res.msret.msgcode, res.msret.msg);
            }
        })
    }

    //获取订单状态表
    $scope.lrOrderGetOrderStats = function () {
        laterRiskService.getOrderStats({ body: {} }, function (res) {
            if (res.msret.msgcode == "00") {
                $scope.orderstats = res.body;
            }
            else {
                cms.message.error("获取订单状态列表失败.");
                cms.log("获取订单状态列表失败.", JSON.stringify(res.msret));
            }
        })
    }

    //切换资产管理人
    $scope.lrOrderChangeMaid = function () {
        $scope.tatrdList.splice(0, $scope.tatrdList.length);
        $scope.taactList.splice(0, $scope.taactList.length);
        $scope.traderList.splice(0, $scope.traderList.length);
        $scope.options.trid = "";
        $scope.lrOrderGetTatrd($scope.options.maid);
        $scope.lrOrderGetTacap($scope.options.maid);
    }

    //切换策略组合
    $scope.lrOrderChangeTrid = function () {
        $scope.traderList.splice(0, $scope.traderList.length);
        $scope.lrOrderGetTrader($scope.options.trid);
    }

    //点击查询
    $scope.lrOrderGetOrder = function (currentPage) {
        var iReg = /^(0|([1-9][0-9]*)?)$/;
        var fReg = /^((0|([1-9][0-9]*))(\.[0-9]+)?)?$/;
        var startDate;
        var endDate;
        if ($scope.selectHis == true) {
            if (typeof $scope.options.startDate == "undefined" || typeof $scope.options.endDate == "undefined") {
                cms.message.error("请设置开始和结束日期.");
                return;
            }
            startDate = $scope.options.startDate.getFullYear() * 10000 + ($scope.options.startDate.getMonth() + 1) * 100 + $scope.options.startDate.getDate();
            endDate = $scope.options.endDate.getFullYear() * 10000 + ($scope.options.endDate.getMonth() + 1) * 100 + $scope.options.endDate.getDate();
            if (startDate > endDate) {
                cms.message.error("结束日期不能早于开始日期.");
                return;
            }
        }
        if (!fReg.test($scope.options.startTradeprice) || !fReg.test($scope.options.endTradeprice)) {
            cms.message.error("请正确输入成交价格范围.");
            return;
        }
        if (($scope.options.startTradeprice == "" && $scope.options.endTradeprice != "") || ($scope.options.startTradeprice != "" && $scope.options.endTradeprice == "")) {
            cms.message.error("请输入完整的成交价格范围.");
            return;
        }
        if ($scope.options.startTradeprice != "" && $scope.options.endTradeprice != "" && Number($scope.options.startTradeprice) > Number($scope.options.endTradeprice)) {
            cms.message.error("起始成交价格不能大于结束成交价格.");
            return;
        }
        if (!iReg.test($scope.options.startTradevol) || !iReg.test($scope.options.endTradevol)) {
            cms.message.error("请正确输入成交数量范围.");
            return;
        }
        if (($scope.options.startTradevol == "" && $scope.options.endTradevol != "") || ($scope.options.startTradevol != "" && $scope.options.endTradevol == "")) {
            cms.message.error("请输入完整的成交数量范围.");
            return;
        }
        if ($scope.options.startTradevol != "" && $scope.options.endTradevol != "" && parseInt($scope.options.startTradevol) > parseInt($scope.options.endTradevol)) {
            cms.message.error("起始成交数量不能大于结束成交数量.");
            return;
        }
        var reqData = { body: {} };
        if ($scope.selectHis == true) {
            reqData.body.startDate = startDate;
            reqData.body.endDate = endDate;
        }
        reqData.body.page = currentPage;
        reqData.body.pageCount = $scope.pageCount;
        var traderidArray = [];
        angular.forEach($scope.traderList, function (trader) {
            if (trader.select == true) {
                traderidArray.push(trader.traderid);
            }
        })
        if (traderidArray.length > 0) {
            reqData.body.traderidArray = traderidArray;
        }
        var acidArray = [];
        angular.forEach($scope.taactList, function (taact) {
            if (taact.leaf == true && taact.select == true) {
                acidArray.push(taact.acid);
            }
        })
        if (acidArray.length > 0) {
            reqData.body.acidArray = acidArray;
        }
        if ($scope.options.marketcode != "") {
            reqData.body.marketcode = $scope.options.marketcode;
        }
        if ($scope.options.cname != "") {
            reqData.body.cname = $scope.options.cname;
        }
        if ($scope.options.side != "0") {
            reqData.body.side = $scope.options.side;
        }
        var cmdidArray = [];
        angular.forEach($scope.cmdList, function (cmd) {
            if (cmd.select == true) {
                cmdidArray.push(cmd.cmdid);
            }
        })
        if (cmdidArray.length > 0) {
            reqData.body.cmdidArray = cmdidArray;
        }
        if ($scope.options.sysorderid != "") {
            reqData.body.sysorderid = $scope.options.sysorderid;
        }
        if ($scope.options.borderid != "") {
            reqData.body.borderid = $scope.options.borderid;
        }
        if ($scope.options.startTradeprice != "") {
            reqData.body.startTradeprice = $scope.options.startTradeprice;
        }
        if ($scope.options.endTradeprice != "") {
            reqData.body.endTradeprice = $scope.options.endTradeprice;
        }
        if ($scope.options.startTradevol != "") {
            reqData.body.startTradevol = $scope.options.startTradevol;
        }
        if ($scope.options.endTradevol != "") {
            reqData.body.endTradevol = $scope.options.endTradevol;
        }
        var orderstatArray = [];
        angular.forEach($scope.dict_orderstat, function (order) {
            if (order.select == true) {
                orderstatArray.push(order.orderstat);
            }
        })
        if (orderstatArray.length > 0) {
            reqData.body.orderstatArray = orderstatArray;
        }
        if ($scope.selectHis == true) {
            lrOrderService.getHisOrder(reqData, function (res) {
                if (res.msret.msgcode == "00") {
                    $scope.orderList = res.body.data;
                    if (res.body.data.length == 0) {
                        cms.message.error("当前查询无结果.");
                    }
                    angular.forEach($scope.orderList, function (order) {
                        if (order.side == 1) {
                            order.showSide = "买";
                        }
                        else if (order.side == 2) {
                            order.showSide = "卖";
                        }
                        else {
                            order.showSide = '无';
                        }
                        order.tradeprice = Number(order.tradevol) == 0 ? 0 : (order.multiplier == 0 ? (Number(order.tradeamt) / Number(order.tradevol)).toFixed(3) : (Number(order.tradeamt) / Number(order.tradevol) / Number(order.multiplier)).toFixed(3));
                    })
                    $scope.allPage = Math.ceil(res.body.totalCount / $scope.pageCount) == 0 ? 1 : Math.ceil(res.body.totalCount / $scope.pageCount);
                    // $scope.currentPage = res.body.page;
                    // $scope.$apply();
                }
                else {
                    $scope.orderList.splice(0, $scope.orderList.length);
                    // $scope.allPage = 1;
                    // $scope.$apply();
                    cms.message.error("查询订单失败." + res.msret.msg);
                    cms.log("查询订单失败.", res.msret.msgcode, res.msret.msg);
                }
            })
        }
        else {
            lrOrderService.getOrder(reqData, function (res) {
                if (res.msret.msgcode == "00") {
                    $scope.orderList = res.body.data;
                    if (res.body.data.length == 0) {
                        cms.message.error("当前查询无结果.");
                    }
                    angular.forEach($scope.orderList, function (order) {
                        if (order.side == 1) {
                            order.showSide = "买";
                        }
                        else if (order.side == 2) {
                            order.showSide = "卖";
                        }
                        else {
                            order.showSide = '无';
                        }
                        order.tradeprice = Number(order.tradevol) == 0 ? 0 : (order.multiplier == 0 ? (Number(order.tradeamt) / Number(order.tradevol)).toFixed(3) : (Number(order.tradeamt) / Number(order.tradevol) / Number(order.multiplier)).toFixed(3));
                    })
                    $scope.allPage = Math.ceil(res.body.totalCount / $scope.pageCount) == 0 ? 1 : Math.ceil(res.body.totalCount / $scope.pageCount);
                    // $scope.currentPage = res.body.page;
                    // $scope.$apply();
                }
                else {
                    $scope.orderList.splice(0, $scope.orderList.length);
                    $scope.allPage = 1;
                    // $scope.currentPage = 1;
                    cms.message.error("查询订单失败." + res.msret.msg);
                    cms.log("查询订单失败.", res.msret.msgcode, res.msret.msg);
                }
            })
        }
        $scope.currentPage = currentPage;
        $scope.$apply();
    }

    // 跳转页面
    $scope.goToPage = function (page) {
        page = page > $scope.allPage ? $scope.allPage : page;
        page = page < 1 ? 1 : page;
        $scope.currentPage = page;
        $scope.lrOrderGetOrder(page);
    }

    //切换查询
    $scope.lrOrderChangeHis = function (type) {
        $scope.selectHis = type;
        $scope.lrOrderGetOrder(1);
    }

    //重置查询条件
    $scope.lrOrderResetOptions = function () {
        $scope.options.startDate = new Date();
        $scope.options.endDate = new Date();
        $scope.options.maid = "";
        $scope.options.trid = "";
        $scope.options.marketcode = "";
        $scope.options.cname = "";
        $scope.options.side = "0";
        $scope.options.sysorderid = "";
        $scope.options.borderid = "";
        $scope.options.startTradeprice = "";
        $scope.options.endTradeprice = "";
        $scope.options.startTradevol = "";
        $scope.options.endTradevol = "";
        $scope.tamgrList.splice(0, $scope.tamgrList.length);
        $scope.tatrdList.splice(0, $scope.tatrdList.length);
        $scope.taactList.splice(0, $scope.taactList.length);
        $scope.traderList.splice(0, $scope.traderList.length);
        angular.forEach($scope.dict_orderstat, function (order) {
            order.select = false;
        })
        angular.forEach($scope.cmdList, function (cmd) {
            cmd.select = false;
        })
        $scope.lrOrderGetTamgr();
    }

    //导出数据
    $scope.lrOrderExports = function () {
        if ($scope.orderList.length == 0) {
            cms.message.error("表格中无可导出的数据.")
            return;
        }
        var exportData = {};
        var headers = ["MAC信息", "IP地址", "日期", "交易员ID", "策略组合", "资产账户", "系统订单号",
            "券商订单号", "资金账号", "证券代码", "证券名称", "买卖类型", "业务名称",
            "订单状态", "订单信息", "发单时间", "撤单时间", "委托价格", "委托数量",
            "成交数量", "撤单数量", "成交均价", "成交金额"];
        exportData.headers = headers;
        exportData.fileType = "xlsx";
        exportData.fileName = "orders";
        exportData.data = [];
        angular.forEach($scope.orderList, function (order) {
            var temp = [];
            temp.push(order.mac);
            temp.push(order.lip);
            temp.push(order.trday);
            temp.push(order.traderid);
            temp.push(order.trid);
            temp.push(order.acid);
            temp.push(order.sysorderid);
            temp.push(order.borderid);
            temp.push(order.bacid);
            temp.push(order.marketcode);
            temp.push(order.cname);
            temp.push(order.showSide);
            temp.push(order.cmdname);
            temp.push(order.orderstatname);
            temp.push(order.msg);
            temp.push(order.ordertm);
            temp.push(order.cancelordertm);
            temp.push(Number(order.orderprice).toFixed(3));
            temp.push(Number(order.ordervol).toFixed(0));
            temp.push(Number(order.tradevol).toFixed(0));
            temp.push(Number(order.cancelvol).toFixed(0));
            temp.push(Number(order.tradeprice).toFixed(3));
            temp.push(Number(order.tradeamt).toFixed(3));
            exportData.data.push(temp);
        })
        lrOrderService.exportExcelFile(exportData, function (err, res) {
            if (err) return;
            if (res.result == true) {
                cms.message.success("导出成功.", 5);
            }
            else {
                cms.message.error("导出文件失败，" + res.reason);
                cms.log("导出文件失败：", res.reason);
            }
        })
    }

    //改单
    $scope.lrOrderModifyOrder = function (order) {
        $scope.modifyOrderStats = [];
        $scope.currentOrder.trday = order.trday;
        $scope.currentOrder.sysorderid = order.sysorderid;
        $scope.currentOrder.marketcode = order.marketcode;
        $scope.currentOrder.showSide = order.showSide;
        $scope.currentOrder.ordervol = Number(order.ordervol);
        $scope.currentOrder.orderprice = Number(order.orderprice);
        $scope.currentOrder.preTradeamt = Number(order.tradeamt);
        $scope.currentOrder.orderstat = order.orderstat;
        $scope.currentOrder.preOrderstat = order.orderstat;
        $scope.currentOrder.orderStatlevel = $scope.stateLevel[order.orderstat];
        for (let i = 0; i < $scope.orderstats.length; i++) {
            let item = $scope.orderstats[i];
            if ($scope.currentOrder.orderStatlevel <= $scope.stateLevel[item.typeid]) {
                if ((order.orderstat === "4" || order.orderstat === "7") && (item.typeid === "6" || item.typeid === "9")) {
                    continue;
                }
                $scope.modifyOrderStats.push(item);
            };
        }
       
        $scope.currentOrder.tradevol = Number(order.tradevol);
        $scope.currentOrder.preTradevol = Number(order.tradevol);
        $scope.currentOrder.tradeprice = Number(order.tradeprice);
        $scope.currentOrder.preTradeprice = Number(order.tradeprice);
        $scope.lrOrderShowModal($scope.modalInfo.stateEnum.modify);
    }

    //打开弹框
    $scope.lrOrderShowModal = function (state) {
        $scope.modalInfo.state = state;
        switch (state) {
            case $scope.modalInfo.stateEnum.modify:
                $scope.modalInfo.path = "../risk-manage/laterRisk-modifyOrder.html";
                break;
            default:
                break;
        }
    }

    //弹框加载完成
    $scope.lrOrderModalLoadReady = function () {
        switch ($scope.modalInfo.state) {
            case $scope.modalInfo.stateEnum.modify:
                mainService.showModal("lrorder_modal_back", "lrorder_modify_modal", "lrorder_modify_modal_title");
                break;
            default:
                break;
        }
    }

    //关闭弹框
    $scope.lrOrderCloseModal = function () {
        mainService.hideModal("lrorder_modal_back");
        $scope.modalInfo.state = 0;
        $scope.modalInfo.path = "";
    }

    //确认改单
    $scope.lrOrderModifyOrderSure = function () {
        if ($scope.stateLevel[$scope.currentOrder.orderstat] <= 5 || $scope.currentOrder.orderstat === "6" || $scope.currentOrder.orderstat === "9" || $scope.currentOrder.orderstat === "40") {
            if($scope.currentOrder.tradevol != 0 ) {
                cms.message.error("成交数量输入不正确.");
                return;
            }
            if($scope.currentOrder.tradeprice != 0 ) {
                cms.message.error("成交均价输入不正确.");
                return;
            }
        }
        if ($scope.currentOrder.orderstat === "8"){
            if ($scope.currentOrder.tradevol != $scope.currentOrder.ordervol) {
                cms.message.error("成交数量输入不正确.");
                return;
            }
            if ($scope.currentOrder.tradeprice == 0) {
                cms.message.error("成交均价输入不正确.");
                return;
            }
        }
        if (($scope.currentOrder.orderstat == "7" || $scope.currentOrder.orderstat == "4" || $scope.currentOrder.orderstat =="5" ) && $scope.currentOrder.tradevol == $scope.currentOrder.ordervol || 
        $scope.currentOrder.tradevol > $scope.currentOrder.ordervol || $scope.currentOrder.tradevol < $scope.currentOrder.preTradevol) {
            cms.message.error("成交数量输入不正确.");
            return;
        }
        if ($scope.currentOrder.tradevol * $scope.currentOrder.tradeprice < $scope.currentOrder.preTradeamt || $scope.currentOrder.tradeprice == undefined) {
            cms.message.error("成交均价输入不正确.");

            return;
        }
        if ($scope.currentOrder.tradevol == $scope.currentOrder.preTradevol && $scope.currentOrder.tradeprice != $scope.currentOrder.preTradeprice) {
            cms.message.error("请先修改成交数量.");
            return;
        }
        if ($scope.currentOrder.tradevol == $scope.currentOrder.preTradevol && $scope.currentOrder.tradeprice == $scope.currentOrder.preTradeprice && $scope.currentOrder.orderstat == $scope.currentOrder.preOrderstat) {
            cms.message.error("没有要提交的修改.");
            return;
        };
        var reqData = {
            body: {
                trday: $scope.currentOrder.trday,
                sysorderid: $scope.currentOrder.sysorderid,
                orderstat: $scope.currentOrder.orderstat,
                tradevol: $scope.currentOrder.tradevol,
                tradeamt: Number($scope.currentOrder.tradevol) * Number($scope.currentOrder.tradeprice)
            }
        };
        lrOrderService.modifyOrder(reqData, function (res) {
            if (res.msret.msgcode == "00") {
                cms.message.success("改单请求提交成功.", 5);
                $scope.lrOrderCloseModal();
                $scope.lrOrderGetOrder($scope.currentPage);
            }
            else {
                cms.message.error("改单请求提交失败." + res.msret.msgcode);
                cms.log("改单失败.", res.msret.msgcode, res.msret.msg);
            }
        })
    }

})
