angular.module('cmsController').controller('accountLoginManageCtrl',
    function ($scope, $timeout, $rootScope, accountLoginManageService, mainService, $ocLazyLoad) {
        $scope.accountTypeArray = []; //账户类型
        $scope.findAssetAccount = "";
        $scope.unitArrary = []; // 保存账户体系的数组
        $scope.allAssetManager = [];
        $scope.currentTamgr = {};
        $scope.currentTamgrObj = {};
        $scope.allAssetAccount = [];
        $scope.currAccount = { caid: "", bid: "", stat: "1" }; //当前操作的对象,是一个拷贝对象,单独获取的
        $scope.currAssetAccount = null;
        $scope.modalInfo = { path: "" };
        $scope.tipsInfo = { path: "" };
        $scope.modalInfoLv2 = {path : ""};

        $scope.selectedProductCaid = ""; // 保存当前的产品caid
        $scope.createtime = "";
        $scope.accountDetailTit = "";
        $scope.copyAccount;

        // $scope.showBindPass=false;
        // $scope.showEditOldPass=false;
        // $scope.showEditNewPass=false;
        // $scope.showEditNewPass2=false;

        $scope.currentAssetAccount = {};
        $scope.brokers = [];
        $scope.allCurrency = [];
        $scope.products = [];

        $scope.accountPassInfo = {};            //用于修改密码
        $scope.oldpassInputType = "password";
        $scope.newpassInputType = "password";
        $scope.newpassrepInputType = "password";

        $scope.keyName = "";
        $scope.reverse = false;
        $scope.sortFunction = null;
        $scope.changeSure = false;
        $scope.accountTypeMap = {};

        //保存当要修改资金账号信息的数据
        $scope.accountMoneyInfo = {};
        $scope.accountChangeInfo = {
            acid: "",
            bid: "",
            bacid:0,
            bacidcard:0
        };
        //保存登录状态，控制修改资金账号按钮的禁用
        $scope.accountloginstat = '';


        //点击一键登录之后，一键登录按钮的状态有５秒钟被禁用
        $scope.loginAllState = false;
        

        $scope.$on("changeTaacctFund", function (event, msg) {
            $scope.getAssetAccountsDetail($scope.currentTamgr);
        });

        $scope.$on("changedBrokers_broadcast", function (event, msg) {
            $scope.getTsBroker();
        });

        $scope.$on("changedManager_broadcast", function (event, message) {
            $scope.getAllTaMgr();
        });

        $scope.$on("bindProduct_broadcast", function (event, message) {

            var managerIndex = cms.binarySearch($scope.allAssetManager, "maid", parseInt(message.maid));
            if (managerIndex != -1) {
                $scope.currentTamgr = $scope.allAssetManager[managerIndex];
                $scope.getProducts($scope.currentTamgr.maid)
            }

        });

        //点击表头
        $scope.clickTableHeader = function (keyName, isNumber) {
            $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
            $scope.keyName = keyName;
            $scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
        }

        //页面加载完毕
        $scope.$watch('$viewContentLoaded', function () {
            $scope.getAllTaMgr();
            $scope.getTsBroker();
            $scope.getAccountType();


            var requestData = { body: {} };
            accountLoginManageService.getCurrency(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取币种失败." + res.msret.msg);
                    return;
                }
                if (res.body.length === 0) {
                    cms.message.success("获取币种成功,但数量为0.");
                }
                $scope.allCurrency = res.body;
                $scope.allCurrency.forEach(function (obj) {
                    obj.currencyid = parseInt(obj.currencyid);
                });

                accountLoginManageService.allCurrency = $scope.allCurrency;

                $scope.$apply();
            });
        });

        $scope.getAccountType = function () {
            $scope.accountTypeArray = [];
            var requestData = { body: {} };
            accountLoginManageService.getAccountType(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有账户类型." + res.msret.msg);
                    return;
                }
                $scope.accountTypeArray = res.body;
                for (let i = 0; i < $scope.accountTypeArray.length; i++) {
                    $scope.accountTypeMap[$scope.accountTypeArray[i].dictid] = $scope.accountTypeArray[i].dictname;
                }
                console.log($scope.accountTypeArray);
                $scope.$apply();
            });
        }


        $scope.getAllTaMgr = function () {
            //首先清空已有数据
            $scope.allAssetManager = [];
            $scope.allAssetAccount = [];
            $scope.currentTamgr = {};
            $scope.currentAssetAccount = {};

            var requestData = { body: {} };
            accountLoginManageService.getAllTaMgr(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有资产管理人失败." + res.msret.msg);
                    return;
                }
                $scope.allAssetManager = res.body;
                $scope.allAssetManager.unshift({ maid: -1, maname: "全部" });
                $scope.allAssetManager.forEach(function (manager) {
                    manager.maid = parseInt(manager.maid);
                    if (manager.maid == -1) {
                        manager.fullName = manager.maname;
                    } else {
                        manager.fullName = manager.maname + '(' + manager.maid + ')';
                    }
                })
                if ($scope.allAssetManager.length) {

                    if (mainService.bindProduct && mainService.bindProduct.maid) {
                        var managerIndex = cms.binarySearch($scope.allAssetManager, "maid", parseInt(mainService.bindProduct.maid));
                        if (managerIndex != -1) {
                            $scope.currentTamgr = $scope.allAssetManager[managerIndex];
                            $scope.getProducts($scope.currentTamgr.maid)
                        }
                        mainService.bindProduct = {};
                    } else {
                        $scope.currentTamgr = $scope.allAssetManager[0];
                        $scope.getProducts($scope.currentTamgr.maid);
                    }

                }

                $scope.$apply();

            });
        }

        $scope.getProducts = function (maid) {

            var requestData = {};
            if (maid == -1) {
                requestData = { body: {} };
            } else {
                requestData = { body: { maid: maid } };
            }
            accountLoginManageService.getProducts(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有产品失败." + res.msret.msg);
                    return;
                }

                $scope.products = res.body;
                $scope.products.forEach(function (obj) {
                    obj.maid = parseInt(obj.maid);
                    obj.caid = parseInt(obj.caid);
                });
                $scope.getAssetAccountsDetail($scope.currentTamgr);

                $scope.$apply();
            });
        }

        $scope.getAssetAccountsDetail = function (assetManager) {
            if (typeof assetManager.maid == "undefined") {
                cms.message.error("请先选择资产管理人");
                return;
            }
            var requestData = {};
            $scope.currentTamgr = assetManager;

            if (assetManager.maid == -1) {
                requestData = { body: { passwordSet: 1 } };
            } else {
                requestData = { body: { maid: assetManager.maid , passwordSet: 1 } };
            }

            accountLoginManageService.getAssetAccountsDetail(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有资产账户失败." + res.msret.msg);
                    return;
                }
                $scope.allAssetAccount = res.body;
                accountLoginManageService.allAssetAccount = res.body;
                console.log($scope.allAssetAccount);

                $scope.allAssetAccount.forEach(function (obj) {
                    var hasManager = false;
                    for (var maidIndex = 0; maidIndex < $scope.allAssetManager.length; ++maidIndex) {
                        if (Number($scope.allAssetManager[maidIndex].maid) == Number(obj.maid)) {
                            hasManager = true;
                            break;
                        }
                    }
                    if (!hasManager) {
                        var addManager = {maid: obj.maid, fullName: obj.maname+"("+obj.maid+")"};
                        $scope.allAssetManager.push(addManager);
                    }
                    obj.assetAccountName = obj.acname + "(" + obj.acid + ")";
                    obj.currencyid = parseInt(obj.currencyid);
                    obj.caid = parseInt(obj.caid);
                    if (obj.loginstat === "1") {
                        obj.loginAgainState = true;
                    } else {
                        obj.loginAgainState = false;
                    }
                    

                    if (!obj.loginfailcount) {
                        obj.loginfailcount = 0;
                    }
                    if (!obj.totalamt) {
                        obj.totalamt = 0;
                    }
                    if (!obj.validamt) {
                        obj.validamt = 0;
                    }
                    obj.actypeStr = $scope.accountTypeMap[obj.actype];

                    var caidIndex = cms.binarySearch($scope.products, "caid", obj.caid);
                    if (caidIndex != -1) {
                        obj.caname = $scope.products[caidIndex].caname;
                    }
                });
                $scope.$apply();
            });
        }

        $scope.operateAssetAccount = function (acid, detailState,assetAccount) {
            $scope.detailState = detailState;
            var requestData = { body: { acid: acid } };
            accountLoginManageService.getAssetAccounts(requestData, function (res) {
                if (res.msret.msgcode != '00' || res.body.length !== 1) {
                    cms.message.error("获取指定账户失败." + res.msret.msg);
                    return;
                }
                if (detailState == "editAssetAccount") {
                    $scope.accountDetailTit = "修改信息";
                } else if (detailState == "bindAssetAccount") {
                    $scope.accountDetailTit = "绑定产品";
                }
                $scope.currAccount = res.body[0];
                $scope.accountloginstat = assetAccount.loginstat;
                $scope.currAccount.pre_caid = $scope.currAccount.caid;
                $scope.currAccount.pre_actype = $scope.currAccount.actype;
                console.log(assetAccount);
                console.log($scope.accountloginstat);
                if ($scope.currAccount.bact_name === "na") {
                    $scope.currAccount.bact_name = "";
                }
                if ($scope.currAccount.bact_idcard === "na") {
                    $scope.currAccount.bact_idcard = "";
                }
                if ($scope.currAccount.bact_comment === "na") {
                    $scope.currAccount.bact_comment = "";
                }
                $scope.modalInfo.path = "../accountLoginManageMent/accountLoginDetailDialog.html";
                $scope.modalInfo.state = "editAssetAccountDialog";
                $scope.$apply();
            });


        }

        $scope.authorizeAssetAccount = function () {
            $scope.currentTamgrObj.currentTamgr = cms.deepCopy($scope.currentTamgr);

            $scope.currAccount = { stat: "1" };
            $scope.currAccount.caid = "";
            $scope.currAccount.acid = "";
            if ($scope.brokers.length) {
                $scope.currAccount.bid = $scope.brokers[0].bid;
            }

            $scope.modalInfo.path = "../account-manage/authorizeAssetAccount.html";
            $scope.modalInfo.state = "authorizeAssetAccountDialog";
        }

        $scope.tradeManage = function (account) {
            mainService.currentAcid = account.acid;
            $scope.$emit("redirectTradeAccount", "TradeAccount");
            $rootScope.rootLoopMenu("2002002");
        }

        $scope.setTaacctFund = function (account) {
            console.log(account);
            accountLoginManageService.currentAssetAccount = account;
            $scope.currentAssetAccount = account;

            $ocLazyLoad.load(["../taacctFundManage/taacctFundManage.css",
                "../unit-manage/unitlist.css",
                "../taacctFundManage/taacctFundManageCtrl.js",
                "../taacctFundManage/taacctFundManageService.js"])
                .then(function () {
                    $scope.modalInfo.path = "../taacctFundManage/taacctFund.html";
                    $scope.modalInfo.state = "taacctFundManageDialog";
                })
        }
        $scope.accountLoginEditTipsLoad = function () {
            if ($scope.tipsInfo.path == "../account-manage/accountEditTips.html") {
                mainService.showModal("accountLoginManage_editTips_back", "account_editTips_modal", "account_editTips_modal_title");
            } else if ($scope.tipsInfo.path == "../account-manage/accountOptionTips.html") {
                mainService.showModal("accountLoginManage_editTips_back", "account_optionTips_modal", "account_optionTips_modal_title");
            }
        }

        //弹框加载完成
        $scope.accountLoginManageLoadModalReady = function () {

            switch ($scope.modalInfo.state) {
                case "editAssetAccountDialog":

                    mainService.showModal("accountLoginManage_modal_back", "accountLoginManage_add_modal", "accountLoginManage_add_modal_title");
                    if ($scope.detailState === "bindAssetAccount") {
                        if ($scope.allCurrency.length) {
                            $scope.currAccount.currencyid = String($scope.allCurrency[0].currencyid);
                        }

                        $scope.currAccount.actype = "1";
                        if ($scope.products.length) {
                            $scope.currAccount.caid = String($scope.products[0].caid);
                        }

                    }
                    break;
                case "changePassword":
                    mainService.showModal("accountLoginManage_modal_back", "accountLogin_changepass_modal", "accountLogin_changepass_modal_title");
                    break;
                case "resetPassword":
                    mainService.showModal("accountLoginManage_modal_back", "accountLogin_resetpass_modal", "accountLogin_resetpass_modal_title");
                    break;
                default:
                    break;
            }
        }

        $scope.accountHideModal = function () {
            mainService.hideModal("accountLoginManage_modal_back", "accountLoginManage_add_modal", "accountLoginManage_add_modal_title");
            $scope.modalInfo.state = "";
            $scope.modalInfo.path = "";
            $scope.currAccount = { caid: "", bid: "", stat: "1" };
            $scope.changeSure = false;
        }

        $scope.closeTips = function () {
            $scope.tipsInfo.path = "";
            mainService.hideModal("accountLoginManage_editTips_back", "account_editTips_modal", "account_editTips_modal_title");
        }

        $scope.cancelTips = function () {
            $scope.tipsInfo.path = "";
            $scope.currAccount.actype = $scope.currAccount.pre_actype;
            $scope.currAccount.caid = $scope.currAccount.pre_caid;
            mainService.hideModal("accountLoginManage_editTips_back", "account_editTips_modal", "account_editTips_modal_title");
        }
        $scope.sureTips = function () {
            $scope.changeSure = true;
            $scope.tipsInfo.path = "";
            mainService.hideModal("accountLoginManage_editTips_back", "account_editTips_modal", "account_editTips_modal_title");
        }
        $scope.getTsBroker = function () {
            var requestData = { body: {} };
            accountLoginManageService.getTsBroker(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有经纪商失败." + res.msret.msg);
                    return;
                }
                $scope.brokers = res.body;
                $scope.$apply();

            });

        }

        $scope.addAssetAccount = function () {
            if ($scope.currentTamgrObj.currentTamgr.maid == -1) {
                cms.message.error("必须选择一个资产管理人");
                return;
            }
            $scope.currAccount.maid = $scope.currentTamgrObj.currentTamgr.maid;
            var iReg = /^[1-9][0-9]{0,3}$/;
            // if (!$scope.currAccount.acid || !iReg.test($scope.currAccount.acid)) {
            //     cms.message.error("资产账户编号必须为正整数");
            //     return;
            // }

            if (!$scope.currAccount.bid) {
                cms.message.error("必须选择经纪商");
                return;
            }

            if (!/^\d{1,}$/.test($scope.currAccount.bacid)) {
                cms.message.error("经纪商资金帐号ID必须为正整数");
                return;
            }

            if (!/^\d{1,}$/.test($scope.currAccount.bacidcard)) {
                cms.message.error("经纪商客户号必须为正整数");
                return;
            }


            // $scope.currAccount.acid = parseInt($scope.currAccount.acid)+$scope.currAccount.maid*10000;
            var requestData = {
                maid: $scope.currAccount.maid, bid: $scope.currAccount.bid,
                bacid: $scope.currAccount.bacid, bacidcard: $scope.currAccount.bacidcard
            };

            accountLoginManageService.createAccountNew({ serviceid: $rootScope.serviceid["ccms-server"], body: requestData }, function (data) {
                if (data.error) {
                    cms.message.error("授权资产账号失败." + data.error.msg);
                    return;
                }
                cms.message.success("授权资产账号成功.");
                $scope.getAssetAccountsDetail($scope.currentTamgr);
                $scope.accountHideModal();
            });
        }

        $scope.editAssetAccount = function () {
            if (!$scope.currAccount.caid || $scope.currAccount.caid == -1) {
                cms.message.error("必须选择产品");
                return;
            }

            if (!$scope.currAccount.acname) {
                cms.message.error("账户简称不能为空");
                return;
            }

            if (!$scope.currAccount.actype) {
                cms.message.error("必须选择账户类型");
                return;
            }

            // if (!$scope.currAccount.bact_name) {
            //     cms.message.error("所有者姓名不能为空");
            //     return;
            // }
            // || !$scope.checkIDCard($scope.currAccount.bact_idcard)
            // if (!$scope.currAccount.bact_idcard) {
            //     cms.message.error("所有者身份证帐号不正确");
            //     return;
            // }
            var tmpData = {};
            cms.deepCopy($scope.currAccount, tmpData);

            var requestData = { body: tmpData };

            if ($scope.detailState === "bindAssetAccount") {
                // if (!/^\d{1,}$/.test($scope.currAccount.maid)) {
                //     cms.message.error("资产管理人ID必须为正整数");
                //     return;
                // }
                // if (!/^\d{1,}$/.test($scope.currAccount.acid)) {
                //     cms.message.error("资产账户ID必须为正整数");
                //     return;
                // }

                // if (!/^\d{1,}$/.test($scope.currAccount.bid)) {
                //     cms.message.error("经纪商ID必须为正整数");
                //     return;
                // }

                // if (!/^\d{1,}$/.test($scope.currAccount.bacid)) {
                //     cms.message.error("经纪商资金帐号ID必须为正整数");
                //     return;
                // }

                // if (!/^\d{1,}$/.test($scope.currAccount.bacidcard)) {
                //     cms.message.error("经纪商客户号必须为正整数");
                //     return;
                // }
                if (!$scope.currAccount.currencyid) {
                    cms.message.error("必须选择币种");
                    return;
                }
                // if (!tmpData.bact_pass) {
                //     cms.message.error("密码不能为空");
                //     return;
                // }
                // tmpData.bact_pass = accountLoginManageService.simple_encrypt(tmpData.bact_pass);


                accountLoginManageService.bindAssetAccount(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("绑定资产账号失败." + res.msret.msg);
                        return;
                    }
                    $scope.getAssetAccountsDetail($scope.currentTamgr);
                    $scope.accountHideModal();
                    $scope.changeSure = false;
                    $scope.$emit("changedAssetAccount");
                });
            } else {
                console.log($scope.currAccount);
                if ($scope.changeSure == false && ($scope.currAccount.pre_caid != $scope.currAccount.caid || $scope.currAccount.pre_actype != $scope.currAccount.actype)) {
                    $scope.tipsInfo.path = "../account-manage/accountEditTips.html";
                    return 0;
                }

                accountLoginManageService.editAssetAccount(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("绑定资产账号失败." + res.msret.msg);
                        return;
                    }
                    $scope.getAssetAccountsDetail($scope.currentTamgr);
                    $scope.accountHideModal();
                    $scope.changeSure = false;
                    $scope.$emit("changedAssetAccount");
                });
            }

        }

        $scope.createOptionAccount = function (assetAccount) {
            $scope.copyAccount = {};
            $scope.copyAccount = cms.deepCopy(assetAccount);
            $scope.copyAccount.bacid = "";
            $scope.modalInfo.path = "../account-manage/createOptionAccount.html";
            $scope.modalInfo.state = "createOptionAccount";
        }

        $scope.showOptionTips = function () {
            if ($scope.copyAccount.bacid == "") {
                cms.message.error("请输入资金账号");
                return;
            }
            if (isNaN($scope.copyAccount.bacid)) {
                cms.message.error("资金账号必须是数字");
                return;
            } else {
                $scope.copyAccount.bacid = Number($scope.copyAccount.bacid);
            }
            $scope.tipsInfo.path = "../account-manage/accountOptionTips.html";
        }

        $scope.closeOptionTips = function () {
            $scope.tipsInfo.path = "";
            mainService.hideModal("accountLoginManage_editTips_back", "account_optionTips_modal", "account_optionTips_modal_title");
        }

        $scope.submitOptionAccount = function () {
            $scope.closeOptionTips();
            console.log($scope.copyAccount);

            var requestData = {
                body: {
                    maid: Number($scope.copyAccount.maid),
                    bid: Number($scope.copyAccount.bid),
                    bacid: $scope.copyAccount.bacid,
                    bacidcard: $scope.copyAccount.bacidcard,
                    caid: Number($scope.copyAccount.caid),
                    acname: $scope.copyAccount.acname,
                    actype: 5,
                    currencyid: Number($scope.copyAccount.currencyid),
                    bact_pass: $scope.copyAccount.bact_pass,
                    bact_name: $scope.copyAccount.bact_name,
                    bact_idcard: $scope.copyAccount.bact_idcard,
                    stat: Number($scope.copyAccount.stat),
                    associate_acid: Number($scope.copyAccount.acid),
                    bact_comment: $scope.copyAccount.bact_comment,

                }
            }
            accountLoginManageService.createOptionAccount(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("绑定股票期权账户失败." + res.msret.msg);
                    return;
                }
                $scope.getAssetAccountsDetail($scope.currentTamgr);
                $scope.accountHideModal();
                $scope.changeSure = false;
                $scope.$emit("changedAssetAccount");
            });
        }

        $scope.changeAcid = function () {
            if ($scope.currAccount.acid) {
                $scope.currAccount.real_acid = parseInt($scope.currentTamgr.maid) * 10000 + parseInt($scope.currAccount.acid);
            } else {
                $scope.currAccount.real_acid = "";
            }

        }


        $scope.checkIDCard = function (IDCardNumber) {

            var city = {
                11: "北京",
                12: "天津",
                13: "河北",
                14: "山西",
                15: "内蒙古",
                21: "辽宁",
                22: "吉林",
                23: "黑龙江",
                31: "上海",
                32: "江苏",
                33: "浙江",
                34: "安徽",
                35: "福建",
                36: "江西",
                37: "山东",
                41: "河南",
                42: "湖北",
                43: "湖南",
                44: "广东",
                45: "广西",
                46: "海南",
                50: "重庆",
                51: "四川",
                52: "贵州",
                53: "云南",
                54: "西藏 ",
                61: "陕西",
                62: "甘肃",
                63: "青海",
                64: "宁夏",
                65: "新疆",
                71: "台湾",
                81: "香港",
                82: "澳门",
                91: "国外 "
            };
            var iSum = 0;
            var info = "";
            if (!/^\d{17}(\d|x)$/i.test(IDCardNumber)) return false;
            IDCardNumber = IDCardNumber.replace(/x$/i, "a");
            if (city[parseInt(IDCardNumber.substr(0, 2))] == null) return false;
            var sBirthday = IDCardNumber.substr(6, 4) + "-" + Number(IDCardNumber.substr(10, 2)) + "-" + Number(IDCardNumber.substr(12, 2));
            var d = new Date(sBirthday.replace(/-/g, "/"));
            if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) return false;
            for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(IDCardNumber.charAt(17 - i), 11);
            if (iSum % 11 != 1) return false;
            //aCity[parseInt(IDCardNumber.substr(0,2))]+","+sBirthday+","+(IDCardNumber.substr(16,1)%2?"男":"女");//此次还可以判断出输入的身份证号的人性别
            return true;
        }

        //修改密码
        $scope.accountChangePass = function (assetAccount) {
            $scope.accountPassInfo.acid = assetAccount.acid;
            $scope.accountPassInfo.oldpass = "";
            $scope.accountPassInfo.newpass = "";
            $scope.accountPassInfo.newpassrep = "";
            $scope.modalInfo.path = "../accountLoginManageMent/accountLoginManagePassWorldDialog.html";
            $scope.modalInfo.state = "changePassword";
        }

        //确定修改密码
        $scope.accountChangePassSure = function () {
            if ($scope.accountPassInfo.oldpass == "") {
                cms.message.error("请输入原密码");
                return;
            }
            if ($scope.accountPassInfo.oldpass == "*") {
                cms.message.error("原密码不能为*");
                $scope.accountPassInfo.oldpass = "";
                return;
            }
            if ($scope.accountPassInfo.newpass == "") {
                cms.message.error("请输入新密码");
                return;
            }
            if ($scope.accountPassInfo.newpass == "*") {
                cms.message.error("新密码不能为*");
                $scope.accountPassInfo.newpass = "";
                return;
            }
            if ($scope.accountPassInfo.newpass == $scope.accountPassInfo.oldpass) {
                cms.message.error("新密码与原密码不能一致");
                return;
            }
            if ($scope.accountPassInfo.newpassrep !== $scope.accountPassInfo.newpass) {
                cms.message.error("两次密码不一致");
                return;
            }
            var reqData = {
                body: {
                    acid: $scope.accountPassInfo.acid,
                    oldpass: accountLoginManageService.simple_encrypt($scope.accountPassInfo.oldpass),
                    newpass: accountLoginManageService.simple_encrypt($scope.accountPassInfo.newpass)
                }
            };
            accountLoginManageService.updatePassword(reqData, function (res) {
                if (res.msret.msgcode == "00") {
                    cms.message.success("操作成功", 5);
                    $scope.accountHideModal();
                    $scope.$apply();
                }
                else {
                    cms.message.error("修改密码失败：" + res.msret.msg);
                    cms.message.error("修改密码失败：" + res.msret.msgcode, res.msret.msg);
                }
            })

        }


        //确定重置密码
        $scope.accountResetPassSure = function () {
            if ($scope.accountPassInfo.resetpass == "") {
                cms.message.error("请输入新密码");
                return;
            }
            if ($scope.accountPassInfo.resetpass == "*") {
                cms.message.error("新密码不能为*");
                $scope.accountPassInfo.resetpass = "";
                return;
            }
            if ($scope.accountPassInfo.resetpassrep !== $scope.accountPassInfo.resetpass) {
                cms.message.error("两次密码不一致");
                return;
            }
            var reqData = {
                body: {
                    acid: $scope.accountPassInfo.acid,
                    newpass: accountLoginManageService.simple_encrypt($scope.accountPassInfo.resetpass)
                }
            };
            console.log(reqData);
            accountLoginManageService.updatePassword(reqData, function (res) {
                if (res.msret.msgcode == "00") {
                    cms.message.success("操作成功", 5);
                    $scope.accountHideModal();
                } else {

                    cms.message.error("重置密码失败：" + res.msret.msgcode + res.msret.msg);
                }
            })
        }

        $scope.clickAssetAccountTR = function (assetAccount) {
            $scope.currAssetAccount = assetAccount;
        }

        $scope.accountResetPass = function (assetAccount) {
            $scope.accountPassInfo.acid = assetAccount.acid;
            $scope.accountPassInfo.resetpass = "";
            $scope.accountPassInfo.resetpassrep = "";
            $scope.modalInfo.path = "../accountLoginManageMent/accountLoginManResetPassWorldDialog.html";
            $scope.modalInfo.state = "resetPassword";
        }

        //导出数据
        $scope.exportAccountList = function () {
            if ($scope.allAssetAccount.length == 0) {
                cms.message.error("表格中无可导出的数据.")
                return;
            }
            var exportData = {};
            var headers = ["资产管理人", "资产账户", "资金账号", "所属产品", "账户类型", "可用资金", "账户资金", "经纪商客户号", "所有者姓名", "登录状态"];
            exportData.headers = headers;
            exportData.fileType = "xlsx";
            exportData.fileName = "资金账号列表";
            exportData.data = [];
            angular.forEach($scope.allAssetAccount, function (data) {
                var temp = [];
                temp.push(data.maname + "(" + data.maid + ")");
                temp.push(data.assetAccountName);
                temp.push(data.bacid);
                temp.push(data.caid == -1 ? "--" : (data.caname + "(" + data.caid + ")"));
                temp.push(data.actypeStr);
                temp.push(Number(data.validamt).toFixed(3));
                temp.push(Number(data.totalamt).toFixed(3));
                temp.push(data.bacidcard);
                temp.push(data.bact_name);
                temp.push(data.loginstat == 0 ? "未登录" : "已登录");
                exportData.data.push(temp);
            });
            cms.exportExcelFile(exportData, function (err, res) {
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

        
        //二级弹框加载完成
        $scope.accountLoginManageLoadModal2Ready = function () {
            switch ($scope.modalInfoLv2.state) {
                case "changeAccountInfo":
                    mainService.showModal("accountLoginManage_modal_back2", "accountLoginManage_changeAccountInfo_modal", "accountLoginManage_changeAccountInfo_modal_title");
                    break;
                default:
                    break;
            }
        }



        //点击修改信息弹框中的修改资金账号
        $scope.accountLoginChangeInfo = function(changeAccount) {
            console.log(changeAccount);
            $scope.accountChangeInfo.acid = changeAccount.acid;
            $scope.accountChangeInfo.bid = changeAccount.bid;
            $scope.accountChangeInfo.bacid = changeAccount.bacid;
            $scope.accountChangeInfo.bacidcard = changeAccount.bacidcard
            console.log($scope.accountChangeInfo);
            $scope.modalInfoLv2.path = "../accountLoginManageMent/changeAccountLoginManage.html";
            $scope.modalInfoLv2.state = "changeAccountInfo";
        }

        //隐藏二级弹框
        $scope.accountLoginHideModal2 = function() {
            mainService.hideModal("accountLoginManage_modal_back2", "accountLoginManage_changeAccountInfo_modal", "accountLoginManage_changeAccountInfo_modal_title");
            $scope.modalInfoLv2.path = "";
            $scope.modalInfoLv2.state = "";
        }


        $scope.clickLoginAll = function() {
            $scope.loginAllState = true;
            //一键登录所有
            var reqData = {
                body: {
                    loginAll: true
                }
            };
            accountLoginManageService.loginTaact(reqData, function(res) {
                if (res.msret.msgcode == "00") {
                    cms.message.success("一键登录重试请求成功");
                } else if (res.msret.msgcode == "10") {
                    cms.message.error("一键登录重试请求部分成功,"+res.msret.msg);
                } else {
                    cms.message.error("一键登录重试请求失败,"+res.msret.msg);
                }
            })
            setTimeout(function(){
                $scope.loginAllState = false;
            }, 5000)
        }

        //登录重试
        $scope.clickLoginAgain = function(assetAccount, index) {
            console.log(assetAccount);
            console.log(index);
            // $scope.allAssetAccount[index]["loginAgainState"] = true;
            var reqData = {
                body: {
                    loginAll: false,
                    acid: assetAccount.acid
                }
            };
            console.log(reqData);
            accountLoginManageService.loginTaact(reqData, function(res) {
                console.log(res);
                if (res.msret.msgcode == "00") {
                    cms.message.success("登录重试请求成功");
                } else {
                    cms.message.error("登录重试请求失败,"+res.msret.msg);
                }
            })
            // setTimeout(function(){
            //     $scope.allAssetAccount[index]["loginAgainState"] = false;
            // }, 5000);
        }


        $scope.confirmAccountInfo = function() {
            //确认修改资金账号信息
            var reqData = {
                body: {
                    acid: $scope.accountChangeInfo.acid,
                    bid: $scope.accountChangeInfo.bid,
                    bacid:$scope.accountChangeInfo.bacid,
                    bacidcard:$scope.accountChangeInfo.bacidcard
                }
            };
            var requestData = { body: { acid: $scope.accountChangeInfo.acid } };
            console.log(reqData);
            accountLoginManageService.editAssetAccountOther(reqData, function (res) {
                if (res.msret.msgcode == "00") {
                    cms.message.success("修改成功", 5);
                    accountLoginManageService.getAssetAccounts(requestData, function (res) {
                        if (res.msret.msgcode != '00' || res.body.length !== 1) {
                            cms.message.error("获取指定账户失败." + res.msret.msg);
                            return;
                        }
                        $scope.currAccount = res.body[0];
                        $scope.currAccount.pre_caid = $scope.currAccount.caid;
                        $scope.currAccount.pre_actype = $scope.currAccount.actype;
                        console.log($scope.accountloginstat);
                        if ($scope.currAccount.bact_name === "na") {
                            $scope.currAccount.bact_name = "";
                        }
                        if ($scope.currAccount.bact_idcard === "na") {
                            $scope.currAccount.bact_idcard = "";
                        }
                        if ($scope.currAccount.bact_comment === "na") {
                            $scope.currAccount.bact_comment = "";
                        }
                        console.log($scope.currAccount);
                        $scope.$apply();
                    });
                    $scope.accountLoginHideModal2();
                } else {

                    cms.message.error("修改资金账号失败失败：" + res.msret.msgcode + res.msret.msg);
                }
            })
        }


    }).filter("myfilter", function () {
        return function (inputArray, param) {
            var arr = [];
            inputArray.forEach(function (obj) {
                if (obj.acid.indexOf(param) !== -1 || obj.acname.indexOf(param) !== -1) {
                    arr.push(obj);
                }
            });

            return arr;
        }
    });
