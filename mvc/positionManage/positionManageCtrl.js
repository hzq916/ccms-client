angular.module('cmsController').controller('positionManageCtrl',
    function ($scope, $timeout, positionManageService, $rootScope, mainService, $ocLazyLoad) {
        $scope.findStockCode = "";
        $scope.allAssetManager = []; // 保存账户体系的数组
        $scope.products = []; // 保存所有的产品

        $scope.modalInfo = { path: "", state: "" };
        $scope.showSubguide = true;
        $scope.importing = false;

        $scope.currentUnit = {};
        $scope.currentProduct = {};
        $scope.productTradeAccouts = []; // 保存当前产品的交易账户
        $scope.holdPosition = [];
        $scope.importPosition = [];
        $scope.allPosition = []; //引用当前显示的持仓数据
        $scope.showImportTips = false; //账户类型为证券账户
        $scope.showImportFutureTips = false; //账户类型为期货账户
        $scope.showImportStrategyTips = false; //当导入组合持仓


        $scope.showQuestionMark1 = false; //当是证券类型的账户,控制问好的显示
        $scope.showQuestionMark11 = false; //当是证券类型的账户，控制表格的显示
        $scope.showQuestionMark2 = false; //当是期货类型的账户,控制问好的显示
        $scope.showQuestionMark22 = false; //当是期货类型的账户, 控制表格的显示

        $scope.showQuestionMark3 = false; //当是组合导入持仓，控制问号显示
        $scope.showQuestionMark33 = true; //当是组合中导入证券仓位，控制表格显示,默认值设置为true
        $scope.showQuestionMark44 = false; //当是组合导入期权仓位, 控制表格显示



        $scope.isOverrideImport = true;

        $scope.currentPosition = {};

        $scope.guideTree = [];

        var hadTatract = false, hadTatrd = false;

        $scope.keyName = "";
        $scope.reverse = false;
        $scope.sortFunction = null;

        $scope.importTypes1 = [{ text: "覆盖式导入", value: "1" }, { text: "追加式导入", value: "2" }];
        $scope.importTypes2 = [{ text: "覆盖式导入", value: "3" }, { text: "追加式导入", value: "4" }];
        $scope.importTypes3 = [{ text: "覆盖式导入", value: "5" }, { text: "追加式导入", value: "6" }];


        $scope.importTypeNumber = '1';

        $scope.importAccountType = '0' // 0代表的是组合 1代表的是证券账户 2代表的是期权账户



        $scope.clickMenuItem1 = function (option) {
            console.log("+++++++++");
            $scope.showQuestionMark33 = false;
            $scope.showQuestionMark44 = false;
            if (option.value == "1") {
                $scope.importTypeNumber = '1';
                $scope.clickImportBtn(true);
            } else {
                $scope.importTypeNumber = '2';
                $scope.clickImportBtn(false);
            }
        }

        $scope.clickMenuItem2 = function (option) {
            $scope.showQuestionMark33 = true;
            $scope.showQuestionMark11 = false;
            $scope.showQuestionMark22 = false;
            $scope.showQuestionMark44 = false;
            if (option.value == "3") {
                $scope.importTypeNumber = '3';
                $scope.clickImportBtn2(true);
            } else {
                $scope.importTypeNumber = '4';
                $scope.clickImportBtn2(false);
            }
        }

        $scope.clickMenuItem3 = function (option) {
            $scope.showQuestionMark33 = false;
            $scope.showQuestionMark11 = false;
            $scope.showQuestionMark22 = false;
            $scope.showQuestionMark44 = true;
            if (option.value == "5") {
                $scope.importTypeNumber = '5';
                $scope.clickImportBtn3(true);
            } else {
                $scope.importTypeNumber = '6';
                $scope.clickImportBtn3(false);
            }
        }

        //点击表头
        $scope.clickTableHeader = function (keyName, isNumber) {
            $scope.reverse = $scope.keyName == keyName ? !$scope.reverse : false;
            $scope.keyName = keyName;
            $scope.sortFunction = mainService.getSortFunc($scope.reverse, isNumber);
        }

        $scope.$on("changedAssetAccount_broadcast", function (event, message) {
            $scope.getAllTaMgr();

        });

        $scope.$on("changedManager_broadcast", function (event, message) {
            $scope.getAllTaMgr();

        });

        $scope.$on("changedProduct_broadcast", function (event, message) {
            $scope.getAllTaMgr();


        });
        $scope.$on("changedTradeAccount_broadcast", function (event, message) {
            $scope.getAllTaMgr();
        });

        $scope.$on("changedTradeUnit_broadcast", function (event, message) {
            $scope.getAllTaMgr();
        });
        //页面加载完毕
        $scope.$watch('$viewContentLoaded', function () {
            $scope.getAllTaMgr();

            // var positionManage_import_data=document.getElementById("positionManage_import_data");
            // positionManage_import_data.onchange=function() {
            //     if (!positionManage_import_data.value) {
            //         return;
            //     }
            //
            //     $scope.importing=true;
            //     cmsCommon.parseExcelFile(positionManage_import_data,function(result){
            //         document.getElementById("positionManage_reset").click();
            //
            //         if (result.result) {
            //             $scope.excelData=result.data;
            //
            //             if ($scope.excelData.length < 2) {
            //                 cms.message.error("当前文件没有数据,覆盖导入会清空当前的所有持仓");
            //                 // $scope.importing=false;
            //
            //                 $scope.importPosition=[];
            //                 $scope.allPosition=[];
            //                 return;
            //             }
            //             $scope.excelData.splice(0,1);
            //
            //             var excelData=[];
            //             for (var i = 0; i < $scope.excelData.length; i++) {
            //                 var obj=$scope.excelData[i];
            //                 if ($scope.currentUnit.trid) {
            //                     var tmp={acid:obj[0], tracid:obj[1], marketcode:obj[2], chabbr:obj[3], ukcode:obj[4], satypeStr:obj[5], totalvol:obj[6], validvol:obj[7],
            //                         mtmcost:obj[8], cumcost:obj[9], marketid:obj[10], directionStr:obj[11],  rowIndex:i};
            //                 } else {
            //                     var tmp={ tracid:obj[0], marketcode:obj[1], chabbr:obj[2], ukcode:obj[3], satypeStr:obj[4], totalvol:obj[5], validvol:obj[6],
            //                         mtmcost:obj[7], cumcost:obj[8], marketid:obj[9], directionStr:obj[10],  rowIndex:i};
            //                 }
            //                 tmp.tracid=parseInt(tmp.tracid);
            //                 tmp.ukcode=parseInt(tmp.ukcode);
            //                 tmp.satype=parseInt(tmp.satype);
            //                 tmp.direction=parseInt(tmp.direction);
            //                 tmp.totalvol2=tmp.totalvol;
            //                 tmp.validvol2=tmp.validvol;
            //
            //                 if ( !$scope.checkImportData(tmp,i+1) ) {
            //                     $scope.importing=false;
            //                     return ;
            //                 }
            //                 switch (tmp.satypeStr) {
            //                     case "底仓":
            //                         tmp.satype="10";
            //                         break;
            //                     case "预约券":
            //                         tmp.satype="20";
            //                         break;
            //                     default:
            //
            //                 }
            //
            //                 switch (tmp.directionStr) {
            //                     case "买":
            //                         tmp.direction="1";
            //                         break;
            //                     case "卖":
            //                         tmp.direction="2";
            //                         break;
            //                     default:
            //                 }
            //
            //
            //                 excelData.push(tmp);
            //             }
            //
            //             if ( ! $scope.checkDataUnique(excelData,typeof $scope.currentUnit.trid == "undefined") ) {
            //                 return;
            //             }
            //
            //             $scope.importPosition=excelData;
            //             $scope.allPosition=excelData;
            //
            //             $scope.$apply();
            //         }
            //         else {
            //             cms.message.error("读取表格文件数据失败!");
            //
            //         }
            //     });
            //
            // };
        });

        function compareTradeUnitPosition(firstObj, secondObj) {
            if (firstObj.trid > secondObj.trid) {
                return 1;
            } else if (firstObj.trid < secondObj.trid) {
                return -1
            } else {
                if (firstObj.tracid > secondObj.tracid) {
                    return 1;
                } else if (firstObj.tracid < secondObj.tracid) {
                    return -1
                } else {
                    if (firstObj.ukcode > secondObj.ukcode) {
                        return 1;
                    } else if (firstObj.ukcode < secondObj.ukcode) {
                        return -1
                    } else {
                        if (firstObj.satype > secondObj.satype) {
                            return 1;
                        } else if (firstObj.satype < secondObj.satype) {
                            return -1
                        } else {
                            if (firstObj.direction > secondObj.direction) {
                                return 1;
                            } else if (firstObj.direction < secondObj.direction) {
                                return -1
                            } else {
                                return 0;
                            }
                        }
                    }
                }
            }
        }

        function compareTradeAccountPosition(firstObj, secondObj) {
            if (firstObj.tracid > secondObj.tracid) {
                return 1;
            } else if (firstObj.tracid < secondObj.tracid) {
                return -1
            } else {
                if (firstObj.ukcode > secondObj.ukcode) {
                    return 1;
                } else if (firstObj.ukcode < secondObj.ukcode) {
                    return -1
                } else {
                    if (firstObj.satype > secondObj.satype) {
                        return 1;
                    } else if (firstObj.satype < secondObj.satype) {
                        return -1
                    } else {
                        if (firstObj.direction > secondObj.direction) {
                            return 1;
                        } else if (firstObj.direction < secondObj.direction) {
                            return -1
                        } else {
                            return 0;
                        }
                    }
                }
            }
        }

        $scope.checkDataUnique = function (dataArr, isTradeUnit) {
            var tmpArr = cms.deepCopy(dataArr, []);
            if (tmpArr.length < 2) {
                return true;
            }

            //检测是否重复
            if (isTradeUnit) {
                tmpArr.sort(compareTradeUnitPosition);

                for (var i = 0; i < tmpArr.length - 1; i++) {
                    if (compareTradeUnitPosition(tmpArr[i], tmpArr[i + 1]) === 0) {
                        cms.message.error("第" + (tmpArr[i].rowIndex + 1) + "行和第" + (tmpArr[i + 1].rowIndex + 1) + "行数据有重复");
                        return false;
                    }
                }
            } else {
                tmpArr.sort(compareTradeAccountPosition);
                for (var i = 0; i < tmpArr.length - 1; i++) {
                    if (compareTradeAccountPosition(tmpArr[i], tmpArr[i + 1]) === 0) {
                        cms.message.error("第" + (tmpArr[i].rowIndex + 1) + "行和第" + (tmpArr[i + 1].rowIndex + 1) + "行数据有重复");
                        return false;
                    }
                }
            }

            return true;
        }

        //校验股票账户导入数据格式

        $scope.checkImportData = function (singleData, index) {
            // console.log(singleData);
            if (!singleData.marketcode) {
                cms.message.error("第" + index + "行股票代码不正确");
                return false;
            }

            if (!singleData.chabbr) {
                cms.message.error("第" + index + "行股票名称不正确");
                return false;
            }
            
            if (isNaN(parseFloat(singleData.totalvol)) || singleData.totalvol < 0) {
                cms.message.error("第" + index + "行持仓数量不正确");
                return false;
            }
            if (isNaN(parseFloat(singleData.validvol)) || singleData.validvol < 0) {
                cms.message.error("第" + index + "行可用数量不正确");
                return false;
            }
            if (isNaN(parseFloat(singleData.holdcost))) {
                cms.message.error("第" + index + "行持仓成本不正确");
                return false;
            }
            if (!singleData.marketStr) {
                cms.message.error("第" + index + "行市场不正确");
                return false;
            }
            // if (isNaN(parseInt(singleData.tracid))) {
            //     cms.message.error("第" + index + "行交易账户ID不正确,必须是正整数");
            //     return false;
            // }
            return true;
        }

        //校验期货账户导入数据格式

        $scope.checkImportData2 = function (singleData, index) {
            // console.log(singleData);
            if (!singleData.marketcode) {
                cms.message.error("第" + index + "行合约代码不正确");
                return false;
            }

            if (isNaN(parseFloat(singleData.overnightvol)) || singleData.overnightvol < 0) {
                cms.message.error("第" + index + "行昨仓数量不正确");
                return false;
            }
            
            if (isNaN(parseFloat(singleData.totalvol)) || singleData.totalvol < 0) {
                cms.message.error("第" + index + "行持仓数量不正确");
                return false;
            }

            if (isNaN(parseFloat(singleData.holdcost))) {
                cms.message.error("第" + index + "行持仓成本不正确");
                return false;
            }
            if (singleData.direction != "1" && singleData.direction != "2") {
                cms.message.error("第" + index + "行买卖方向不正确");
                return false;
            }
            if (!singleData.marketStr) {
                cms.message.error("第" + index + "行市场不正确");
                return false;
            }
            // if (isNaN(parseInt(singleData.tracid))) {
            //     cms.message.error("第" + index + "行交易账户ID不正确,必须是正整数");
            //     return false;
            // }
            return true;
        }

        //校验组合证券持仓导入

        $scope.checkImportData3 = function (singleData, index) {
            // console.log(singleData);
            if (!singleData.marketcode) {
                cms.message.error("第" + index + "行证券代码不正确");
                return false;
            }


            if (isNaN(parseFloat(singleData.totalvol)) || singleData.totalvol < 0) {
                cms.message.error("第" + index + "行持仓数量不正确");
                return false;
            }

            if (isNaN(parseFloat(singleData.validvol)) || singleData.validvol < 0) {
                cms.message.error("第" + index + "行可用数量不正确");
                return false;
            }

            if (isNaN(parseFloat(singleData.holdcost))) {
                cms.message.error("第" + index + "行持仓成本不正确");
                return false;
            }
           
            if (!singleData.marketStr) {
                cms.message.error("第" + index + "行市场不正确");
                return false;
            }
            // if (isNaN(parseInt(singleData.tracid))) {
            //     cms.message.error("第" + index + "行交易账户ID不正确,必须是正整数");
            //     return false;
            // }
            return true;
        }

         //校验组合期货持仓导入

         $scope.checkImportData4 = function (singleData, index) {
            // console.log(singleData);
            if (!singleData.marketcode) {
                cms.message.error("第" + index + "行合约代码不正确");
                return false;
            }

            if (isNaN(parseFloat(singleData.overnightvol)) || singleData.overnightvol < 0) {
                cms.message.error("第" + index + "行昨仓数量不正确");
                return false;
            }

           
            if (isNaN(parseFloat(singleData.totalvol)) || singleData.totalvol < 0) {
                cms.message.error("第" + index + "行持仓数量不正确");
                return false;
            }

           

            if (isNaN(parseFloat(singleData.holdcost))) {
                cms.message.error("第" + index + "行持仓成本不正确");
                return false;
            }
            if (singleData.direction != "1" && singleData.direction != "2") {
                cms.message.error("第" + index + "行买卖方向不正确");
                return false;
            }
           
            if (!singleData.marketStr) {
                cms.message.error("第" + index + "行市场不正确");
                return false;
            }
            // if (isNaN(parseInt(singleData.tracid))) {
            //     cms.message.error("第" + index + "行交易账户ID不正确,必须是正整数");
            //     return false;
            // }
            return true;
        }



        $scope.checkUploadData = function (singleData, index) {
            console.log(singleData.tracid);
            if (isNaN(parseInt(singleData.tracid))) {
                cms.message.error("第" + index + "行交易账户ID不正确,必须为正整数");
                return false;
            }

            if ($scope.currentUnit.trid) {
                var tradeAccountIndex = cms.binarySearch($scope.productTradeAccouts, "tracid", String(singleData.tracid));
                if (tradeAccountIndex == -1 || $scope.productTradeAccouts[tradeAccountIndex].acid != singleData.acid) {
                    cms.message.error("第" + index + "行交易账户ID不正确");
                    return false;
                }
            } else {
                var tradeAccountIndex = cms.binarySearch($scope.productTradeAccouts, "tracid", String(singleData.tracid));
                if (tradeAccountIndex == -1 || $scope.productTradeAccouts[tradeAccountIndex].acid != $scope.currentUnit.acid) {
                    cms.message.error("第" + index + "行交易账户ID不正确");
                    return false;
                }
            }

            if (!singleData.marketcode) {
                cms.message.error("第" + index + "行股票代码不正确");
                return false;
            }

            if (!singleData.chabbr) {
                cms.message.error("第" + index + "行股票名称不正确");
                return false;
            }
            if (!singleData.ukcode) {
                cms.message.error("第" + index + "行ukcode不正确");
                return false;
            }
            if (singleData.satype != "10" && singleData.satype != "20") {
                cms.message.error("第" + index + "行持仓类型不正确");
                return false;
            }
            if (isNaN(parseFloat(singleData.totalvol)) || singleData.totalvol < 0) {
                cms.message.error("第" + index + "行总计数量不正确");
                return false;
            }
            if (isNaN(parseFloat(singleData.validvol)) || singleData.validvol < 0) {
                cms.message.error("第" + index + "行可用数量不正确");
                return false;
            }
            if (isNaN(parseFloat(singleData.mtmcost))) {
                cms.message.error("第" + index + "行盯市成本不正确");
                return false;
            }
            if (isNaN(parseFloat(singleData.cumcost))) {
                cms.message.error("第" + index + "行券商成本不正确");
                return false;
            }
            if (!singleData.marketid) {
                cms.message.error("第" + index + "行市场不正确");
                return false;
            }
            if (singleData.direction != "1" && singleData.direction != "2") {
                cms.message.error("第" + index + "行买卖方向不正确");
                return false;
            }
            return true;
        }

        $scope.getAllTaMgr = function () {
            //首先清空已有数据
            $scope.allAssetManager = [];

            var requestData = { body: {} };
            positionManageService.getAllTaMgr(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有资产管理人失败." + res.msret.msg);
                    return;
                }
                $scope.allAssetManager = res.body;

                $scope.allAssetManager.forEach(function (obj) {
                    obj.maid = parseInt(obj.maid);
                    obj.menuId = obj.maid;
                    obj.menuName = obj.maname + "(" + obj.maid + ")";
                    obj.type = 'maid';
                    obj.children = [];

                });
                $scope.getProducts();
                $scope.$apply();
            });
        }

        $scope.getProducts = function () {
            var requestData = { body: {} };
            positionManageService.getProducts(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有产品失败." + res.msret.msg);
                    return;
                }

                $scope.products = res.body;
                var i = 0, j = 0;
                for (; i < $scope.products.length; i++) {
                    $scope.products[i].maid = parseInt($scope.products[i].maid);
                    $scope.products[i].caid = parseInt($scope.products[i].caid);
                    $scope.products[i].menuId = $scope.products[i].caid;
                    $scope.products[i].menuName = $scope.products[i].caname + "(" + $scope.products[i].caid + ")";
                    $scope.products[i].type = 'caid';
                    $scope.products[i].children = [{ menuId: 1, type: "assetAccount", menuName: "资产账户", children: [] }, { menuId: 2, type: "tradeUnit", menuName: "策略组合", children: [] }];
                    var maIndex = cms.accurateSearch($scope.allAssetManager, "maid", ($scope.products[i].maid));
                    if (maIndex != -1) {
                        $scope.allAssetManager[maIndex].children.push($scope.products[i]);
                    } else {
                        var newManager = { maid: $scope.products[i].maid, menuId: $scope.products[i].maid, menuName: "(" + $scope.products[i].maid + ")", type: 'maid', children: [] };
                        newManager.children.push($scope.products[i]);
                        $scope.allAssetManager.push(newManager);
                    }
                }
                $scope.getTatrd();
                $scope.getAssetAccounts();

                $scope.$apply();
            });
        }


        $scope.getAssetAccounts = function () {
            var requestData = { body: {} };
            positionManageService.getAssetAccounts(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有资产账户失败." + res.msret.msg);
                    return;
                }

                var assetAccounts = res.body;
                var i = 0, j = 0;
                for (; i < assetAccounts.length; i++) {
                    if (assetAccounts[i].caid == -1) {
                        continue; //不显示没有绑定产品的资产账户
                    }

                    assetAccounts[i].maid = parseInt(assetAccounts[i].maid);
                    assetAccounts[i].caid = parseInt(assetAccounts[i].caid);
                    assetAccounts[i].acid = parseInt(assetAccounts[i].acid);

                    assetAccounts[i].menuId = assetAccounts[i].acid;
                    assetAccounts[i].menuName = assetAccounts[i].acname + "(" + assetAccounts[i].acid + ")";
                    assetAccounts[i].type = 'acid';



                    var maIndex = cms.accurateSearch($scope.allAssetManager, "maid", (assetAccounts[i].maid));
                    if (maIndex != -1) {
                        var caIndex = cms.accurateSearch($scope.allAssetManager[maIndex].children, "caid", (assetAccounts[i].caid));
                        if (caIndex != -1) {
                            $scope.allAssetManager[maIndex].children[caIndex].children[0].children.push(assetAccounts[i]);
                        } else {
                            var newProduct = {
                                maid: assetAccounts[i].maid, caid: assetAccounts[i].caid, menuId: assetAccounts[i].caid, menuName: "(" + assetAccounts[i].caid + ")", type: 'caid',
                                children: [{ menuId: 1, type: "assetAccount", menuName: "资产账户", children: [] }, { menuId: 2, type: "tradeUnit", menuName: "策略组合", children: [] }]
                            };
                            newProduct.children[0].children.push(assetAccounts[i]);
                            $scope.allAssetManager[maIndex].children.push(newProduct);
                        }
                    } else {
                        var newManager = { maid: assetAccounts[i].maid, menuId: assetAccounts[i].maid, menuName: "(" + assetAccounts[i].maid + ")", type: 'maid', children: [] };
                        var newProduct = {
                            maid: assetAccounts[i].maid, caid: assetAccounts[i].caid, menuId: assetAccounts[i].caid, menuName: "(" + assetAccounts[i].caid + ")", type: 'caid',
                            children: [{ menuId: 1, type: "assetAccount", menuName: "资产账户", children: [] }, { menuId: 2, type: "tradeUnit", menuName: "策略组合", children: [] }]
                        };
                        newProduct.children[0].children.push(assetAccounts[i]);
                        newManager.children.push(newProduct);
                        $scope.allAssetManager.push(newManager);
                    }
                }
                hadTatract = true;
                if (hadTatrd == true) {
                    $scope.products.forEach(function (product) {
                        product.children.forEach(function (units, index, array) {
                            if (!units.children.length) {
                                product.children.splice(index, 1);
                            }
                        })
                    });
                    $scope.guideTree = $scope.allAssetManager;
                }
                $scope.$apply();
            });
        }


        $scope.getTatrd = function () {
            var requestData = { body: {} };
            positionManageService.getTatrd(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取所有的组合策略失败." + res.msret.msg);
                    return;
                }
                var tradeUnits = res.body;
                var i = 0, j = 0;
                for (; i < tradeUnits.length; i++) {
                    tradeUnits[i].maid = parseInt(tradeUnits[i].maid);
                    tradeUnits[i].caid = parseInt(tradeUnits[i].caid);
                    tradeUnits[i].trid = parseInt(tradeUnits[i].trid);

                    tradeUnits[i].menuId = tradeUnits[i].trid;
                    tradeUnits[i].menuName = tradeUnits[i].trname + "(" + tradeUnits[i].trid + ")";
                    tradeUnits[i].type = 'trid';

                    var maIndex = cms.accurateSearch($scope.allAssetManager, "maid", (tradeUnits[i].maid));
                    if (maIndex != -1) {
                        var caIndex = cms.accurateSearch($scope.allAssetManager[maIndex].children, "caid", (tradeUnits[i].caid));
                        if (caIndex != -1) {
                            $scope.allAssetManager[maIndex].children[caIndex].children[1].children.push(tradeUnits[i]);
                        } else {
                            var newProduct = {
                                maid: tradeUnits[i].maid, caid: tradeUnits[i].caid, menuId: tradeUnits[i].caid, menuName: "(" + tradeUnits[i].caid + ")", type: 'caid',
                                children: [{ menuId: 1, type: "assetAccount", menuName: "资产账户", children: [] }, { menuId: 2, type: "tradeUnit", menuName: "策略组合", children: [] }]
                            };
                            newProduct.children[1].children.push(tradeUnits[i]);
                            $scope.allAssetManager[maIndex].children.push(newProduct);
                        }
                    } else {
                        var newManager = { maid: tradeUnits[i].maid, menuId: tradeUnits[i].maid, menuName: "(" + tradeUnits[i].maid + ")", type: 'maid', children: [] };
                        var newProduct = {
                            maid: tradeUnits[i].maid, caid: tradeUnits[i].caid, menuId: tradeUnits[i].caid, menuName: "(" + tradeUnits[i].caid + ")", type: 'caid',
                            children: [{ menuId: 1, type: "assetAccount", menuName: "资产账户", children: [] }, { menuId: 2, type: "tradeUnit", menuName: "策略组合", children: [] }]
                        };
                        newProduct.children[1].children.push(tradeUnits[i]);
                        newManager.children.push(newProduct);
                        $scope.allAssetManager.push(newManager);
                    }
                }
                hadTatrd = true;
                if (hadTatract == true) {
                    $scope.products.forEach(function (product) {
                        product.children.forEach(function (units, index, array) {
                            if (!units.children.length) {
                                product.children.splice(index, 1);
                            }
                        })
                    });
                    $scope.guideTree = $scope.allAssetManager;

                }
                $scope.$apply();
            });
        }

        /**
         * actype: １(普通股票账户) 2(信用股票账户) 3(期货账户) 4(虚拟货比账户) 5(股票齐全账户)
        */
        //点击菜单
        $scope.clickGuideMenu = function (obj) {
            console.log(obj);
            console.log("++++++++++++++++++");
            if (obj.type == 'trid') {
                $scope.showQuestionMark3 = true;
                $scope.showQuestionMark1 = false;
                $scope.showQuestionMark2 = false;
                $scope.showQuestionMark11 = false;
                $scope.showQuestionMark22 = false;
                $scope.showQuestionMark33 = true;
                $scope.showQuestionMark44 = false;
                $scope.importAccountType = '0'; //０代表组合
                $scope.clickTradeUnit(obj);
            }
            if (obj.actype == "1" || obj.actype == "2") {
                //代表证券账户
                $scope.importAccountType = '1'; //代表证券账户
                $scope.clickAssetAccount(obj);
                $scope.showQuestionMark1 = true;
                $scope.showQuestionMark2 = false;
                $scope.showQuestionMark11 = true;
                $scope.showQuestionMark22 = false;
                $scope.showQuestionMark3 = false;
                $scope.showQuestionMark33 = false;
                $scope.showQuestionMark44 = false;
            } else if (obj.actype == "3" || obj.actype == "5") {
                //代表期权账户
                $scope.importAccountType = '2'; //代表期权账户
                $scope.clickAssetAccount(obj);
                $scope.showQuestionMark1 = false;
                $scope.showQuestionMark2 = true;
                $scope.showQuestionMark11 = false;
                $scope.showQuestionMark22 = true;
                $scope.showQuestionMark3 = false;
                $scope.showQuestionMark33 = false;
                $scope.showQuestionMark44 = false;
            } else {
                //其他类型，暂时不清楚
            }

        }


        $scope.positionHideModal = function () {
            mainService.hideModal("positionManage_modal_back", "accountManage_add_modal", "accountManage_add_modal_title");
            $scope.modalInfo.state = "";
            $scope.modalInfo.path = "";
            $scope.currAccount = { caid: "", bid: "", stat: "1" };
        }

        // $scope.showOrHideChildren=function(obj) {
        //     obj.showChildren=!obj.showChildren;
        // }

        $scope.clickProduct = function (product) {
            $scope.currentProduct = product;
        }


        //获取账户持仓
        $scope.clickAssetAccount = function (assetAccount) {
            $scope.importing = false;
            $scope.currentUnit = assetAccount;
            var positionManage_import_data = document.getElementById("positionManage_import_data");
            positionManage_import_data.value = "";
            $scope.importPosition = [];
            $scope.holdPosition = [];

            var requestData = { body: { acid: assetAccount.acid, todayRetrieve: true } };
            positionManageService.getAssetAccountPosition(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取资产账户持仓失败." + res.msret.msg);
                    return;
                }
                // cms.message.success("获取资产账户持仓成功",3);
                console.log(res.body.data);
                $scope.holdPosition = res.body.data;
                $scope.allPosition = $scope.holdPosition;
                $scope.allPosition.forEach(function (obj) {
                    obj.totalvol2 = obj.totalvol;
                    obj.validvol2 = obj.validvol;

                    switch (obj.satype) {
                        case "10":
                            obj.satypeStr = "底仓";
                            break;
                        case "20":
                            obj.satypeStr = "预约券";
                            break;
                        default:

                    }

                    switch (obj.direction) {
                        case "1":
                            obj.directionStr = "多仓";
                            break;
                        case "2":
                            obj.directionStr = "空仓";
                            break;
                        default:
                    }

                    switch (obj.marketid) {
                        case "1":
                        obj.marketStr = "深圳证券交易所";
                        break;
                        case "2":
                        obj.marketStr = "上海证券交易所";
                        break;
                        case "3":
                        obj.marketStr = "中国金融期货交易所";
                        break;
                        case "4":
                        obj.marketStr = "上海期货交易所";
                        break;
                        case "5":
                        obj.marketStr = "郑州商品交易所";
                        break;
                        case "6":
                        obj.marketStr = "大连商品交易所";
                        break;
                        case "7":
                        obj.marketStr = "上海黄金交易所";
                        break;
                        case "10":
                        obj.marketStr = "香港交易及结算所有公司";
                        break;
                        default:
                    }
                });
                console.log("账户持仓数据");
                console.log($scope.allPosition);
                $scope.$apply();
            });

        }

        //获取策略组合持仓
        $scope.clickTradeUnit = function (tradeUnit) {
            $scope.importing = false;
            $scope.currentUnit = tradeUnit;
            // document.getElementById("positionManage_import_data").click();
            var positionManage_import_data = document.getElementById("positionManage_import_data");
            positionManage_import_data.value = "";
            $scope.importPosition = [];
            $scope.holdPosition = [];

            var today = cms.formatDate_ex(new Date());
            var requestData = { body: { trid: tradeUnit.trid, begin_date: today, end_date: today, todayRetrieve: true } };
            positionManageService.getTradeUnitPosition(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取策略组合持仓失败." + res.msret.msg);
                    return;
                }
                // cms.message.success("获取策略组合持仓成功",3);
                $scope.holdPosition = res.body.data;
                $scope.allPosition = $scope.holdPosition;

                $scope.allPosition.forEach(function (obj) {
                    obj.totalvol2 = obj.totalvol;
                    obj.validvol2 = obj.validvol;
                    switch (obj.satype) {
                        case "10":
                            obj.satypeStr = "底仓";
                            break;
                        case "20":
                            obj.satypeStr = "预约券";
                            break;
                        default:

                    }

                    switch (obj.direction) {
                        case "1":
                            obj.directionStr = "多仓";
                            break;
                        case "2":
                            obj.directionStr = "空仓";
                            break;
                        default:
                    }

                    switch (obj.marketid) {
                        case "1":
                        obj.marketStr = "深圳证券交易所";
                        break;
                        case "2":
                        obj.marketStr = "上海证券交易所";
                        break;
                        case "3":
                        obj.marketStr = "中国金融期货交易所";
                        break;
                        case "4":
                        obj.marketStr = "上海期货交易所";
                        break;
                        case "5":
                        obj.marketStr = "郑州商品交易所";
                        break;
                        case "6":
                        obj.marketStr = "大连商品交易所";
                        break;
                        case "7":
                        obj.marketStr = "上海黄金交易所";
                        break;
                        case "10":
                        obj.marketStr = "香港交易及结算所有公司";
                        break;
                        default:
                    }
                });
                $scope.$apply();
            });
        }

        //点击导入账户持仓按钮
        $scope.clickImportBtn = function (isOverrideImport) {
            $scope.importing = false;
            $scope.isOverrideImport = isOverrideImport;
            let rowIndex = 0;
            // document.getElementById("positionManage_import_data").click();
            cms.importExcelFile(function (err, result) {
                if (err) return;
                if (result.result) {
                    $scope.importing = true;
                    $scope.excelData = result.data;

                    if ($scope.excelData.length < 2) {
                        cms.message.error("当前文件没有数据,覆盖导入会清空当前的所有持仓");
                        // $scope.importing=false;

                        $scope.importPosition = [];
                        $scope.allPosition = [];
                        return;
                    }
                    $scope.excelData.splice(0, 1);

                    var excelData = [];
                    console.log($scope.excelData);
                    for (var i = 0; i < $scope.excelData.length; ++i, ++rowIndex) {
                        var obj = $scope.excelData[i];

                        if ($scope.importAccountType === '1') {
                            //证券账户
                            console.log("证券账户导入持仓---");
                            var tmp = {
                                marketcode: obj[0], chabbr: obj[1], totalvol: obj[2], validvol: obj[3],
                                holdcost: obj[4], marketStr: obj[5], tracid: obj[6], rowIndex: i
                            };
                            // obj[0]-交易账户 obj[1]-证券代码 obj[2]-证券名称　obj[3]-ukcode obj[4]-持仓类型　obj[5]-总计数量 obj[6]-可用数量
                            // obj[7]-盯市成本 obj[8]-券商成本 obj[9]-市场ID obj[10]-仓位方向
                            if (!$scope.checkImportData(tmp, rowIndex + 1)) {
                                $scope.importing = false;
                                return;
                            }
                        }
                        if ($scope.importAccountType === '2') {
                            //期权账户
                            console.log("期权账户导入持仓-----");
                            console.log(obj);
                            var tmp = {
                                marketcode: obj[0], overnightvol: obj[1], totalvol: obj[2],
                                holdcost: obj[3], direction: obj[4], marketStr: obj[5], tracid: obj[6], rowIndex: i
                            };
                            // obj[0]-交易账户 obj[1]-证券代码 obj[2]-证券名称　obj[3]-ukcode obj[4]-持仓类型　obj[5]-总计数量 obj[6]-可用数量
                            // obj[7]-盯市成本 obj[8]-券商成本 obj[9]-市场ID obj[10]-仓位方向
                            switch (tmp.direction) {
                                case "多仓":
                                    tmp.direction = "1";
                                    break;
                                case "空仓":
                                    tmp.direction = "2";
                                    break;
                                default:
                            }
                            if (!$scope.checkImportData2(tmp, rowIndex + 1)) {
                                $scope.importing = false;
                                return;
                            }
                        }

                       
                        // switch (tmp.satypeStr) {
                        //     case "底仓":
                        //         tmp.satype = "10";
                        //         break;
                        //     case "外部底仓":
                        //         tmp.satype = "11";
                        //         break;
                        //     case "预约券":
                        //         tmp.satype = "20";
                        //         break;
                        //     case "市场券":
                        //         tmp.satype = "21";
                        //         break;
                        //     default:

                        // }
                        excelData.push(tmp);
                    }

                    // if (!$scope.checkDataUnique(excelData, typeof $scope.currentUnit.trid == "undefined")) {
                    //     return;
                    // }

                    $scope.importPosition = excelData;
                    $scope.allPosition = excelData;

                    $scope.$apply();
                }
                else {
                    cms.message.error("读取表格文件数据失败!");

                }
            })
        }


        //点击组合导入证券持仓按钮
        $scope.clickImportBtn2 = function (isOverrideImport) {
            $scope.importing = false;
            $scope.isOverrideImport = isOverrideImport;
            let rowIndex = 0;
            // document.getElementById("positionManage_import_data").click();
            cms.importExcelFile(function (err, result) {
                if (err) return;
                if (result.result) {
                    $scope.importing = true;
                    $scope.excelData = result.data;

                    if ($scope.excelData.length < 2) {
                        cms.message.error("当前文件没有数据,覆盖导入会清空当前的所有持仓");
                        // $scope.importing=false;

                        $scope.importPosition = [];
                        $scope.allPosition = [];
                        return;
                    }
                    $scope.excelData.splice(0, 1);
                    console.log($scope.excelData);
                    var excelData = [];
                    for (var i = 0; i < $scope.excelData.length; ++i, ++rowIndex) {
                        var obj = $scope.excelData[i];
                        // obj[0]- 交易账户 obj[1]-策略组合 obj[2]-证券代码 obj[3]-证券名称 obj[4]-ukcode obj[5]-持仓类型 obj[6]-总计数量
                        //obj[7]-可计数量 obj[8]-可用数量 obj[9]-盯市成本 obj[10]-券商陈本 obj[11]-市场ID　obj[12]仓位方向
                        if ($scope.currentUnit.trid) {
                            var tmp = {
                                marketcode: obj[0], totalvol: obj[2], validvol: obj[3],
                                holdcost: obj[4], marketStr: obj[5], tracid: obj[6],
                                rowIndex: rowIndex
                            };
                        }
                        if (!$scope.checkImportData3(tmp, rowIndex + 1)) {
                            $scope.importing = false;
                            return;
                        }
                        // switch (tmp.satypeStr) {
                        //     case "底仓":
                        //         tmp.satype = "10";
                        //         break;
                        //     case "外部底仓":
                        //         tmp.satype = "11";
                        //         break;
                        //     case "预约券":
                        //         tmp.satype = "20";
                        //         break;
                        //     case "市场券":
                        //         tmp.satype = "21";
                        //         break;
                        //     default:

                        // }

                        // switch (tmp.directionStr) {
                        //     case "买":
                        //         tmp.direction = "1";
                        //         break;
                        //     case "卖":
                        //         tmp.direction = "2";
                        //         break;
                        //     default:
                        // }


                        excelData.push(tmp);
                    }

                    // if (!$scope.checkDataUnique(excelData, typeof $scope.currentUnit.trid == "undefined")) {
                    //     return;
                    // }

                    $scope.importPosition = excelData;
                    $scope.allPosition = excelData;

                    $scope.$apply();
                }
                else {
                    cms.message.error("读取表格文件数据失败!");

                }
            })
        }


        //点击组合导入期货期权持仓按钮
        $scope.clickImportBtn3 = function (isOverrideImport) {
            $scope.importing = false;
            $scope.isOverrideImport = isOverrideImport;
            let rowIndex = 0;
            // document.getElementById("positionManage_import_data").click();
            cms.importExcelFile(function (err, result) {
                if (err) return;
                if (result.result) {
                    $scope.importing = true;
                    $scope.excelData = result.data;

                    if ($scope.excelData.length < 2) {
                        cms.message.error("当前文件没有数据,覆盖导入会清空当前的所有持仓");
                        // $scope.importing=false;

                        $scope.importPosition = [];
                        $scope.allPosition = [];
                        return;
                    }
                    $scope.excelData.splice(0, 1);

                    var excelData = [];
                    for (var i = 0; i < $scope.excelData.length; ++i, ++rowIndex) {
                        var obj = $scope.excelData[i];

                        if ($scope.currentUnit.trid) {
                            var tmp = {
                                marketcode: obj[0], overnightvol: obj[1], totalvol: obj[2],
                                holdcost: obj[3], directionStr: obj[4], marketStr: obj[5], tracid: obj[6],
                                rowIndex: rowIndex
                            };
                        }
                        // switch (tmp.satypeStr) {
                        //     case "底仓":
                        //         tmp.satype = "10";
                        //         break;
                        //     case "外部底仓":
                        //         tmp.satype = "11";
                        //         break;
                        //     case "预约券":
                        //         tmp.satype = "20";
                        //         break;
                        //     case "市场券":
                        //         tmp.satype = "21";
                        //         break;
                        //     default:
                        // }

                        switch (tmp.directionStr) {
                            case "多仓":
                                tmp.direction = "1";
                                break;
                            case "空仓":
                                tmp.direction = "2";
                                break;
                            default:
                        }

                        if (!$scope.checkImportData4(tmp, rowIndex + 1)) {
                            $scope.importing = false;
                            return;
                        }


                        excelData.push(tmp);
                    }

                    // if (!$scope.checkDataUnique(excelData, typeof $scope.currentUnit.trid == "undefined")) {
                    //     return;
                    // }

                    $scope.importPosition = excelData;
                    $scope.allPosition = excelData;

                    $scope.$apply();
                }
                else {
                    cms.message.error("读取表格文件数据失败!");

                }
            })
        }


        //覆盖式导入持仓
        $scope.savePosition = function () {
            if (!$scope.currentUnit.trid) {
                $scope.saveTradeAccountPosition();
            } else {
                $scope.saveTradeUnitPosition();
            }
        }

        //覆盖式导入账户持仓
        $scope.saveTradeAccountPosition = function () {
            // for (var i = 0; i < $scope.importPosition.length; i++) {
            //     if (!$scope.checkUploadData($scope.importPosition[i], i + 1)) {
            //         return;
            //     }
            // }

            //当覆盖式导入账户证券类型持仓
            if ($scope.importAccountType === '1') {
                console.log("当覆盖式导入账户证券类型持仓");
                var requestData = { body: { acid: $scope.currentUnit.acid, excelData: $scope.importPosition } };
                positionManageService.saveStockTradeAccountPosition(requestData, function (res) {
                    console.log(res);
                    console.log(requestData);
                    if (res.msret.msgcode != '00') {
                        cms.message.error("覆盖导入交易账户证券持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("覆盖导入交易账户证券持仓成功.");
                    $scope.clickAssetAccount($scope.currentUnit);
                });
            }

            //当覆盖式导入期货期权类型持仓
            if ($scope.importAccountType === '2') {
                console.log("当覆盖式导入期货期权类型持仓");
                var requestData = { body: { acid: $scope.currentUnit.acid, excelData: $scope.importPosition } };
                positionManageService.saveFutureTradeAccountPosition(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("覆盖导入交易账户期货期权持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("覆盖导入交易账户期货期权持仓成功.");
                    $scope.clickAssetAccount($scope.currentUnit);
                });
            }

        }

        //覆盖式导入组合持仓
        $scope.saveTradeUnitPosition = function () {
            // for (var i = 0; i < $scope.importPosition.length; i++) {
            //     if (!$scope.checkUploadData($scope.importPosition[i], i + 1)) {
            //         return;
            //     }
            // }

            //覆盖式导入组合证券持仓
            if ($scope.importTypeNumber === '3') {
                console.log("覆盖式导入组合证券持仓");
                var requestData = { body: { trid: $scope.currentUnit.trid, excelData: $scope.importPosition } };
                console.log(requestData);
                positionManageService.saveStockTradeUnitPosition(requestData, function (res) {
                    console.log(res);
                    console.log(requestData);
                    if (res.msret.msgcode != '00') {
                        cms.message.error("覆盖导入策略组合持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("覆盖导入策略组合持仓成功.");
                    $scope.clickTradeUnit($scope.currentUnit);
                });
            }

            //覆盖式导入组合期货持仓
            if ($scope.importTypeNumber === '5') {
                console.log("覆盖式导入组合期货持仓");
                var requestData = { body: { trid: $scope.currentUnit.trid, excelData: $scope.importPosition } };
                positionManageService.saveFutureTradeUnitPosition(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("覆盖导入策略组合持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("覆盖导入策略组合持仓成功.");
                    $scope.clickTradeUnit($scope.currentUnit);
                });
            }
        }

        //添加式导入持仓
        $scope.addPosition = function () {
            if ($scope.currentUnit.acid) {
                $scope.addTradeAccountPosition();
            } else {
                $scope.addTradeUnitPosition();
            }
        }

        //添加式导入账户持仓
        $scope.addTradeAccountPosition = function () {
            // for (var i = 0; i < $scope.importPosition.length; i++) {
            //     if (!$scope.checkUploadData($scope.importPosition[i], i + 1)) {
            //         return;
            //     }
            // }

            //添加式导入账户证券持仓
            if ($scope.importAccountType === '1') {
                var requestData = { body: { acid: $scope.currentUnit.acid, excelData: $scope.importPosition } };
                positionManageService.addStockTradeAccountPosition(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("追加式导入交易账户证券持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("追加式导入交易账户证券持仓成功.");
                    $scope.clickAssetAccount($scope.currentUnit);

                });
            }


            //添加式导入账户期货期权持仓
            if ($scope.importAccountType === '2') {
                var requestData = { body: { acid: $scope.currentUnit.acid, excelData: $scope.importPosition } };
                positionManageService.addFutureTradeAccountPosition(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("追加式导入交易账户期权期货持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("追加式导入交易账户期权期货持仓成功.");
                    $scope.clickAssetAccount($scope.currentUnit);

                });
            }

        }

        //添加式导入组合持仓
        $scope.addTradeUnitPosition = function () {
            // for (var i = 0; i < $scope.importPosition.length; i++) {
            //     if (!$scope.checkUploadData($scope.importPosition[i], i + 1)) {
            //         return;
            //     }
            // }

            //添加式导入组合证券持仓
            if ($scope.importTypeNumber === '4') {
                var requestData = { body: { trid: $scope.currentUnit.trid, excelData: $scope.importPosition } };
                positionManageService.addStockTradeUnitPosition(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("追加式导入策略组合持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("追加式导入策略组合持仓成功.");
                    $scope.clickTradeUnit($scope.currentUnit);

                });
            }

            //添加式导入组合期权期货持仓
            if ($scope.importTypeNumber === '6') {
                var requestData = { body: { trid: $scope.currentUnit.trid, excelData: $scope.importPosition } };
                positionManageService.addFutureTradeUnitPosition(requestData, function (res) {
                    if (res.msret.msgcode != '00') {
                        cms.message.error("追加式导入策略组合持仓失败." + res.msret.msg);
                        return;
                    }
                    $scope.importing = false;
                    cms.message.success("追加式导入策略组合持仓成功.");
                    $scope.clickTradeUnit($scope.currentUnit);

                });
            }

        }


        $scope.saveHoldPosition = function () {

            var requestData = { body: { caid: $scope.currentUnit.caid } };
            positionManageService.getTradeAccount(requestData, function (res) {
                if (res.msret.msgcode != '00') {
                    cms.message.error("获取产品下的交易账户失败." + res.msret.msg);
                    return;
                }
                $scope.productTradeAccouts = res.body;
                if ($scope.isOverrideImport) {
                    $scope.savePosition();
                } else {
                    $scope.addPosition();
                }
                $scope.$apply();
            });

        }

        $scope.cancelImport = function () {
            $scope.importPosition = [];
            $scope.importing = false;
            $scope.allPosition = $scope.holdPosition;
        }

        $scope.refresh = function () {
            $scope.importing = false;

            if (!$scope.currentUnit.maid) {
                cms.message.error("当前没有选择单元!");
                return;
            }
            if ($scope.currentUnit.trid) {

                $scope.clickTradeUnit($scope.currentUnit);
            } else {

                $scope.clickAssetAccount($scope.currentUnit);
            }
        }

        //导出持仓数据
        $scope.exportData = function (fileType) {
            console.log(fileType);
            var exportExceldata = [];

            if ($scope.currentUnit.trid) {
                //导出组合持仓数据
                for (var i = 0; i < $scope.holdPosition.length; i++) {
                    var singleData = [];
                    singleData.push($scope.holdPosition[i].marketcode);
                    singleData.push($scope.holdPosition[i].chabbr);
                    singleData.push($scope.holdPosition[i].overnightvol);
                    singleData.push(parseFloat($scope.holdPosition[i].totalvol));
                    singleData.push(parseFloat($scope.holdPosition[i].validvol));
                    singleData.push(Number($scope.holdPosition[i].holdcost).toFixed(3));
                    singleData.push($scope.holdPosition[i].directionStr);
                    // singleData.push($scope.holdPosition[i].marketid);
                    switch ($scope.holdPosition[i].marketid) {
                        case "1":
                        $scope.holdPosition[i].markets = "SZ";
                        break;
                        case "2":
                        $scope.holdPosition[i].markets = "SH";
                        break;
                        case "3":
                        $scope.holdPosition[i].markets = "CFE";
                        break;
                        case "4":
                        $scope.holdPosition[i].markets = "SHF";
                        break;
                        case "5":
                        $scope.holdPosition[i].markets = "CZC";
                        break;
                        case "6":
                        $scope.holdPosition[i].markets = "DCE";
                        break;
                        case "7":
                        $scope.holdPosition[i].markets = "SGE";
                        break;
                        case "10":
                        $scope.holdPosition[i].markets = "HK";
                        break;
                        default:
                    }
                    singleData.push($scope.holdPosition[i].markets)
                    singleData.push($scope.holdPosition[i].tracid);

                    // singleData.push($scope.holdPosition[i].trid);
                    // singleData.push($scope.holdPosition[i].ukcode);
                    // singleData.push($scope.holdPosition[i].satypeStr);
                    // singleData.push(Number($scope.holdPosition[i].cumcost).toFixed(3));

                    exportExceldata.push(singleData);
                }
                var dataObj = {
                    data: exportExceldata, fileName: "策略组合持仓" + $scope.currentUnit.trid, fileType: fileType,
                    headers: ["代码", "名称", "昨仓数量", "持仓数量", "可用数量", "持仓成本", "仓位方向","市场","交易账户"]
                };
            } else {
                if ($scope.importAccountType === '1') {
                    //导出证券账户
                    for (var i = 0; i < $scope.holdPosition.length; i++) {
                        var singleData = [];
                        singleData.push($scope.holdPosition[i].marketcode);
                        singleData.push($scope.holdPosition[i].chabbr);
                        singleData.push(parseFloat($scope.holdPosition[i].overnightvol));
                        singleData.push(parseFloat($scope.holdPosition[i].totalvol));
                        singleData.push(parseFloat($scope.holdPosition[i].validvol));
                        singleData.push(Number($scope.holdPosition[i].holdcost).toFixed(3));
                        // singleData.push($scope.holdPosition[i].marketid);
                        switch ($scope.holdPosition[i].marketid) {
                            case "1":
                            $scope.holdPosition[i].markets = "SZ";
                            break;
                            case "2":
                            $scope.holdPosition[i].markets = "SH";
                            break;
                            case "3":
                            $scope.holdPosition[i].markets = "CFE";
                            break;
                            case "4":
                            $scope.holdPosition[i].markets = "SHF";
                            break;
                            case "5":
                            $scope.holdPosition[i].markets = "CZC";
                            break;
                            case "6":
                            $scope.holdPosition[i].markets = "DCE";
                            break;
                            case "7":
                            $scope.holdPosition[i].markets = "SGE";
                            break;
                            case "10":
                            $scope.holdPosition[i].markets = "HK";
                            break;
                            default:
                        }
                        singleData.push($scope.holdPosition[i].markets)
                        singleData.push($scope.holdPosition[i].tracid);

                        // singleData.push($scope.holdPosition[i].trid);
                        // singleData.push($scope.holdPosition[i].ukcode);
                        // singleData.push($scope.holdPosition[i].satypeStr);
                        // singleData.push(Number($scope.holdPosition[i].mtmcost).toFixed(3));
                        // singleData.push($scope.holdPosition[i].directionStr);

                        exportExceldata.push(singleData);
                    }
                    var dataObj = {
                        data: exportExceldata, fileName: "资产账户持仓" + $scope.currentUnit.acid, fileType: fileType,
                        headers: ["证券代码", "证券名称", "昨仓数量", "持仓数量", "可用数量", "持仓成本", "市场", "交易账户"]
                    };
                }

                if ($scope.importAccountType === '2') {
                    //导出期权证券
                    for (var i = 0; i < $scope.holdPosition.length; i++) {
                        var singleData = [];
                        singleData.push($scope.holdPosition[i].marketcode);
                        singleData.push($scope.holdPosition[i].overnightvol);
                        singleData.push(parseFloat($scope.holdPosition[i].totalvol));
                        singleData.push(Number($scope.holdPosition[i].holdcost).toFixed(3));
                        singleData.push($scope.holdPosition[i].directionStr);
                        // singleData.push($scope.holdPosition[i].marketid);
                        switch ($scope.holdPosition[i].marketid) {
                            case "1":
                            $scope.holdPosition[i].markets = "SZ";
                            break;
                            case "2":
                            $scope.holdPosition[i].markets = "SH";
                            break;
                            case "3":
                            $scope.holdPosition[i].markets = "CFE";
                            break;
                            case "4":
                            $scope.holdPosition[i].markets = "SHF";
                            break;
                            case "5":
                            $scope.holdPosition[i].markets = "CZC";
                            break;
                            case "6":
                            $scope.holdPosition[i].markets = "DCE";
                            break;
                            case "7":
                            $scope.holdPosition[i].markets = "SGE";
                            break;
                            case "10":
                            $scope.holdPosition[i].markets = "HK";
                            break;
                            default:
                        }
                        singleData.push($scope.holdPosition[i].markets)
                        singleData.push($scope.holdPosition[i].tracid);

                        // singleData.push($scope.holdPosition[i].trid);
                        // singleData.push($scope.holdPosition[i].chabbr);
                        // singleData.push($scope.holdPosition[i].ukcode);
                        // singleData.push($scope.holdPosition[i].satypeStr);
                        // singleData.push(parseFloat($scope.holdPosition[i].validvol));
                        // singleData.push(Number($scope.holdPosition[i].mtmcost).toFixed(3));

                        exportExceldata.push(singleData);
                    }
                    var dataObj = {
                        data: exportExceldata, fileName: "资产账户持仓" + $scope.currentUnit.acid, fileType: fileType,
                        headers: ["合约代码", "昨仓数量", "持仓数量", "持仓成本", "仓位方向", "市场", "交易账户"]
                    };
                }
            }

            cms.exportExcelFile(dataObj, function (err, res) {
                if (err) return;
                if (!res.result) {
                    cms.message.error("导出表格数据失败。" + res.reason);
                    return;
                }
                cms.message.success("导出成功");
            })

        }

        $scope.cancelEdit = function (position, property) {
            position[property + "2"] = position[property];
            position.edit_totalvol = false;
            position.edit_validvol = false;
        }

        $scope.cancelAllEdit = function (position, clickEvent) {

            $scope.currentPosition.active = false;
            position.edit_totalvol = false;
            position.edit_validvol = false;
            position.active = true;
            $scope.currentPosition = position;
        }

        $scope.clickTotalVol = function (position, clickEvent) {
            cms.addClassToTableHead(clickEvent, 'common_activeTH');
            if ($scope.importing == false && $rootScope.menuRight.indexOf(2002003003) == -1) {
                return;
            }
            clickEvent.stopPropagation();
            $scope.currentPosition.active = false;
            $scope.currentPosition.edit_totalvol = false;
            $scope.currentPosition.edit_validvol = false;

            $scope.currentPosition = position;
            position.active = true;
            position.edit_totalvol = true;
            position.edit_validvol = false;
        }

        $scope.clickValidVol = function (position, clickEvent) {
            cms.addClassToTableHead(clickEvent, 'common_activeTH');
            if ($scope.importing == false && $rootScope.menuRight.indexOf(2002003003) == -1) {
                return;
            }
            clickEvent.stopPropagation();
            $scope.currentPosition.active = false;
            $scope.currentPosition.edit_totalvol = false;
            $scope.currentPosition.edit_validvol = false;

            $scope.currentPosition = position;
            position.active = true;
            position.edit_validvol = true;
            position.edit_totalvol = false;
        }

        $scope.editSinglePosition = function (position, property) {
            if (position[property] == position[property + "2"] ||
                parseFloat(position[property]) == parseFloat(position[property + "2"])) {
                position[property + "2"] = position[property];
                cms.message.error("数量没有变化,请重试");
                return;
            }

            var fReg = /^(0|([1-9][0-9]{0,14}))(\.[0-9]{0,2})?$/;

            if ($scope.importing) {
                switch (property) {
                    case "validvol":
                        if (!fReg.test(position[property + "2"]) ||
                            parseFloat(position[property + "2"]) > parseFloat(position[property])) {
                            position[property + "2"] = position[property];
                            cms.message.error("可用数量不正确");
                            return;
                        } else {
                            position[property] = position[property + "2"];
                            cms.message.success("修改可用数量成功!");
                            position.edit_validvol = false;
                            $scope.$apply();
                        }
                        break;
                    case "totalvol":
                        if (!fReg.test(position[property + "2"]) ||
                            parseFloat(position[property + "2"]) < parseFloat(position[property])) {
                            position[property + "2"] = position[property];
                            cms.message.error("总计数量不正确");
                            return;
                        } else {
                            position[property] = position[property + "2"];
                            cms.message.success("修改总计数量成功!");
                            position.edit_totalvol = false;
                            $scope.$apply();
                        }
                        break;
                    default:

                }
            } else {
                switch (property) {
                    case "validvol":
                        if (!fReg.test(position[property + "2"]) ||
                            parseFloat(position[property + "2"]) > parseFloat(position.totalvol)) {
                            position[property + "2"] = position[property];
                            cms.message.error("可用数量不正确");
                            return;
                        } else {
                            if ($scope.currentUnit.trid) {
                                var requestData = {
                                    body: {
                                        trid: $scope.currentUnit.trid, tracid: position.tracid, ukcode: position.ukcode, satype: position.satype, direction: position.direction,
                                        property: property, value: position[property + "2"], trday: position.trday
                                    }
                                };
                                positionManageService.editTradeUnitSinglePosition(requestData, function (res) {
                                    if (res.msret.msgcode != '00') {
                                        cms.message.error("修改可用数量失败!" + res.msret.msg);
                                        return;
                                    }
                                    position[property] = position[property + "2"];
                                    cms.message.success("修改可用数量成功!");
                                    position.edit_validvol = false;
                                    $scope.$apply();
                                });
                            } else {
                                var requestData = {
                                    body: {
                                        tracid: position.tracid, ukcode: position.ukcode, satype: position.satype, direction: position.direction,
                                        property: property, value: position[property + "2"], trday: position.trday
                                    }
                                };
                                positionManageService.editTradeAccountSinglePosition(requestData, function (res) {
                                    if (res.msret.msgcode != '00') {
                                        cms.message.error("修改可用数量失败!" + res.msret.msg);
                                        return;
                                    }
                                    position[property] = position[property + "2"];
                                    cms.message.success("修改可用数量成功!");
                                    position.edit_validvol = false;
                                    $scope.$apply();
                                });
                            }

                        }
                        break;
                    case "totalvol":
                        if (!fReg.test(position[property + "2"]) ||
                            parseFloat(position[property + "2"]) < parseFloat(position.validvol)) {
                            position[property + "2"] = position[property];
                            cms.message.error("总计数量不正确");
                            return;
                        } else {
                            if ($scope.currentUnit.trid) {
                                var requestData = {
                                    body: {
                                        trid: $scope.currentUnit.trid, tracid: position.tracid, ukcode: position.ukcode, satype: position.satype, direction: position.direction,
                                        property: property, value: position[property + "2"], trday: position.trday
                                    }
                                };
                                positionManageService.editTradeUnitSinglePosition(requestData, function (res) {
                                    if (res.msret.msgcode != '00') {
                                        cms.message.error("修改总计数量失败!" + res.msret.msg);
                                        return;
                                    }
                                    position[property] = position[property + "2"];
                                    cms.message.success("修改总计数量成功!");
                                    position.edit_totalvol = false;
                                    $scope.$apply();
                                });
                            } else {
                                var requestData = {
                                    body: {
                                        tracid: position.tracid, ukcode: position.ukcode, satype: position.satype, direction: position.direction,
                                        property: property, value: position[property + "2"], trday: position.trday
                                    }
                                };
                                positionManageService.editTradeAccountSinglePosition(requestData, function (res) {
                                    if (res.msret.msgcode != '00') {
                                        cms.message.error("修改总计数量失败!" + res.msret.msg);
                                        return;
                                    }
                                    position[property] = position[property + "2"];
                                    cms.message.success("修改总计数量成功!");
                                    position.edit_totalvol = false;
                                    $scope.$apply();
                                });
                            }
                        }
                        break;
                    default:

                }

            }

        }

        $scope.inputPress = function (keyevent, position, property) {

            if (keyevent.keyCode === 13) { //回车
                $scope.editSinglePosition(position, property);
            } else if (keyevent.keyCode === 27) {  //escape
                $scope.cancelEdit(position, property);
            }
        }

        $scope.myFilter1 = function (obj) {
            return (obj.marketcode.indexOf($scope.findStockCode) !== -1) || (obj.marketcode.indexOf($scope.chabbr) !== -1);
        }



    });


// angular.module('cmsController',[]).filter("filterProperty",function(){
//     return function( inputArray,destObj) {
//         console.log("arguments");
//         // for (var i = 0; i < inputArray.length; i++) {
//         //     // if (typeof destObj == "string" && str.constructor == String) {
//         //     //     for (var i = 0; i < arguments.length; i++) {
//         //     //         arguments[i]
//         //     //     }
//         //     //     inputArray[i][]
//         //     // } else {
//         //     //
//         //     // }
//         //
//         // }
//     }
// });
