webpackJsonp([0],{

/***/ 109:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 109;

/***/ }),

/***/ 150:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 150;

/***/ }),

/***/ 193:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__manage_manage__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tabs_tabs__ = __webpack_require__(198);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var appListInfos = []; // 应用列表
var runningList = []; // 正在运行
var recentList = []; // 最近运行
function onReceive(ret) {
    display_msg("receive message:" + ret.message + ". from: " + ret.from);
}
;
function display_msg(content) {
    console.log("ElastosJS  HomePage === msg " + content);
}
;
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl) {
        this.navCtrl = navCtrl;
        this.checked = false; // 删除按钮是否激活，激活时隐去跳转管理页面的按钮
        this.showRecent = false;
        this.init();
    }
    HomePage.prototype.init = function () {
        var _this = this;
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            display_msg(device.cordova);
            appManager.setListener(onReceive);
            _this.refleshList();
        }
    };
    HomePage.prototype.refleshList = function () {
        window.localStorage.setItem('shouldLauncherBeRefreshed_home', '0'); // home页刷新标识: 0-不刷新, 1-刷新.
        var _this = this;
        function refreshItems(appInfos) {
            if (appInfos != null) {
                appListInfos = _this.dealData(appInfos);
                display_msg("refreshItems " + appListInfos.toString());
            }
        }
        ;
        appManager.getAppInfos(refreshItems, display_msg);
    };
    HomePage.prototype.dealData = function (data) {
        var arr = [];
        if (typeof data == 'object') {
            for (var key in data) {
                arr.push({
                    id: data[key].id,
                    name: data[key].name,
                    version: data[key].version,
                    bigIcon: data[key].bigIcon
                });
            }
        }
        else {
            arr = data;
        }
        return arr;
    };
    HomePage.prototype.getAppInfoList = function () {
        if ('1' == window.localStorage.getItem('shouldLauncherBeRefreshed_home')) {
            this.refleshList();
        }
        display_msg("getAppInfoList " + appListInfos);
        return appListInfos;
    };
    HomePage.prototype.goManager = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__manage_manage__["a" /* ManagePage */]);
    };
    HomePage.prototype.goTabs = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__tabs_tabs__["a" /* TabsPage */]);
    };
    HomePage.prototype.pressEvent = function () {
        this.checked = true;
    };
    HomePage.prototype.delEvent = function (item) {
        var _this = this;
        appManager.unInstall(item.id, function (ret) {
            _this.refleshList();
        });
        this.checked = false;
    };
    HomePage.prototype.tapEvent = function () {
        this.checked = false;
    };
    HomePage.prototype.onClick = function (item) {
        if (this.checked) {
            return false;
        }
        else {
            appManager.start(item.id);
        }
    };
    //最近运行的APP
    HomePage.prototype.getRunningApp = function () {
        appManager.getRunningList(function (ret1) {
            if (typeof ret1 == 'object') {
                for (var _i = 0, ret1_1 = ret1; _i < ret1_1.length; _i++) {
                    var id = ret1_1[_i];
                    if (id != 'launcher') {
                        appManager.getAppInfo(id, function (ret2) {
                            if (typeof ret2 == 'object') {
                                runningList.push({
                                    id: ret2.id,
                                    name: ret2.name,
                                    version: ret2.version,
                                    bigIcon: ret2.bigIcon
                                });
                            }
                        }, function (ret2) {
                            display_msg('info failed: ' + JSON.stringify(ret2));
                        });
                    }
                }
            }
        }, function (ret1) {
            display_msg('running failed: ' + JSON.stringify(ret1));
        });
        return runningList;
    };
    //最近运行的APP
    HomePage.prototype.getRecentRunApp = function () {
        appManager.getLastList(function (ret1) {
            if (typeof ret1 == 'object') {
                for (var _i = 0, ret1_2 = ret1; _i < ret1_2.length; _i++) {
                    var id = ret1_2[_i];
                    if (id != 'launcher') {
                        appManager.getAppInfo(id, function (ret2) {
                            if (typeof ret2 == 'object') {
                                recentList.push({
                                    id: ret2.id,
                                    name: ret2.name,
                                    version: ret2.version,
                                    bigIcon: ret2.bigIcon
                                });
                            }
                        }, function (ret2) {
                            display_msg('info failed: ' + JSON.stringify(ret2));
                        });
                    }
                }
            }
        }, function (ret1) {
            display_msg('recent failed: ' + JSON.stringify(ret1));
        });
        return recentList;
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\home\home.html"*/'<ion-content class="no-padding">\n\n  <ion-grid class="mt-48" >\n\n    <ion-row class="main-contain">\n\n      <ion-col class="main-section" col-3 *ngFor="let item of getAppInfoList(), let i = index" (press)="pressEvent()"\n\n        (click)="onClick(item)">\n\n        <img src={{item.bigIcon}} alt="">\n\n        <span *ngIf="checked" class="del-ioc" (click)="delEvent(item)"></span>\n\n        <div class="app-title">{{item.name}}</div>\n\n      </ion-col>\n\n    </ion-row>\n\n\n\n    <ion-card class="home-tab">\n\n      <div class="tab-lt" (click)="goManager()">\n\n        <img src="assets/icon/icon-bag.png" alt="" srcset="">\n\n      </div>\n\n      <div class="tab-rt" (click)="goTabs()">\n\n          <img src="assets/icon/icon-file.png" alt="" srcset="">\n\n      </div>\n\n    </ion-card>\n\n  </ion-grid>\n\n</ion-content>'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\home\home.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 194:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ManagePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_file__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__info_info__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__zipdir_zipdir__ = __webpack_require__(197);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var appListInfos = []; // 应用列表
function display_msg(content) {
    console.log("ElastosJS  ManagePage === msg " + content);
}
;
/**
 * Generated class for the ManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
var ManagePage = /** @class */ (function () {
    function ManagePage(navCtrl, navParams, file, alertCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.file = file;
        this.alertCtrl = alertCtrl;
        this.buildInAppIds = [];
        this.checkIndex = []; // 复选框选中的应用集合
        this.isShow = false;
        this.appZipDir = "www/install-file/";
        this.builtInDir = "www/built-in/";
        this.refleshList();
        // this.addListen();
    }
    ManagePage.prototype.refleshList = function () {
        window.localStorage.setItem('shouldLauncherBeRefreshed_manage', '0'); // manage页刷新标识: 0-不刷新, 1-刷新.
        window.localStorage.setItem('shouldLauncherBeRefreshed_home', '1'); // home页刷新标识: 0-不刷新, 1-刷新.
        var _this = this;
        function refreshItems(appInfos) {
            if (appInfos != null) {
                appListInfos = _this.dealData(appInfos);
                display_msg("refreshItems " + appListInfos.toString());
            }
        }
        ;
        appManager.getAppInfos(refreshItems, display_msg);
        // get built-in apps
        var rootPath = _this.file.applicationDirectory;
        _this.file.listDir(rootPath, _this.builtInDir)
            .then(function (ret) {
            _this.buildInAppIds = [];
            ret.forEach(function (item) {
                _this.buildInAppIds.push("assets:/" + item.fullPath);
            });
        })
            .catch(function (err) {
            alert(JSON.stringify(err));
        });
    };
    ManagePage.prototype.dealData = function (data) {
        var arr = [];
        if (typeof data == 'object') {
            for (var key in data) {
                arr.push({
                    id: data[key].id,
                    name: data[key].name,
                    version: data[key].version,
                    bigIcon: data[key].bigIcon
                });
            }
        }
        else {
            arr = data;
        }
        return arr;
    };
    ManagePage.prototype.addListen = function () {
        var fileInput = document.getElementById('m_upload');
        fileInput.addEventListener('change', function (el) {
            alert('!!!!');
            alert(el.target['value']);
        });
    };
    ManagePage.prototype.getAppInfoList = function () {
        if ('1' == window.localStorage.getItem('shouldLauncherBeRefreshed_manage')) {
            this.refleshList();
        }
        display_msg("getAppInfoList " + appListInfos);
        return appListInfos;
    };
    /**
     *
     * @desc  页面跳转到首页
     */
    ManagePage.prototype.goToIndex = function () {
        this.navCtrl.pop();
    };
    /**
     *
     * @desc  页面跳转到详情
     */
    ManagePage.prototype.goInfo = function (item) {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__info_info__["a" /* InfoPage */], item);
    };
    /**
     *
     * @desc 列表选中
     */
    ManagePage.prototype.checkApp = function (item) {
        item.checked = !item.checked;
        if (this.checkIndex.indexOf(item) < 0) {
            this.checkIndex.push(item);
        }
        else {
            this.checkIndex.splice(this.checkIndex.indexOf(item), 1);
        }
        if (this.checkIndex.length > 0) {
            this.isShow = true;
        }
        else {
            this.isShow = false;
        }
    };
    /**
     *
     * @desc   删除操作
     */
    ManagePage.prototype.doDel = function () {
        this.showDelPrompt();
    };
    /**
     *
     * @desc 添加应用
     */
    ManagePage.prototype.importFromEpk = function () {
        var _this = this;
        var rootPath = _this.file.applicationDirectory;
        _this.file.listDir(rootPath, _this.appZipDir)
            .then(function (ret) {
            var zipList = [];
            ret.forEach(function (item) {
                zipList.push("assets:/" + item.fullPath);
            });
            _this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_4__zipdir_zipdir__["a" /* ZipdirPage */], { "zipList": zipList });
        })
            .catch(function (err) {
            alert(JSON.stringify(err));
        });
    };
    /**
     *
     * @desc 确认删除弹窗
     */
    ManagePage.prototype.showDelPrompt = function () {
        var _this = this;
        var prompt = _this.alertCtrl.create({
            //   title: '<div class="permission-warning">安装该应用需要获取以下权限</div>',
            message: '<div class="m-center">确认删除应用</div>',
            buttons: [
                {
                    text: '取消',
                    handler: function (data) {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: '确认',
                    handler: function (data) {
                        console.log('Saved clicked');
                        _this.checkIndex.forEach(function (item) {
                            if (_this.buildInAppIds.indexOf(item.id) > -1) {
                                console.log("can not delete built-in app " + item.id);
                                // _this.showCanNotDelPrompt(item);
                            }
                            else {
                                appManager.unInstall(item.id, function (ret) {
                                    console.log("already deleted " + item.id);
                                }, function (err) {
                                    console.log("delete app " + item.id + " failed: " + JSON.stringify(err));
                                });
                            }
                        });
                        _this.refleshList();
                        _this.checkIndex = [];
                    }
                }
            ]
        });
        prompt.present();
    };
    ManagePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-manage',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\manage\manage.html"*/'<!--\n\n  Generated template for the ManagePage page.\n\n\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n\n  Ionic pages and navigation.\n\n-->\n\n\n\n<ion-header no-border class="tab-header">\n\n  <ion-navbar>\n\n    <h2>应用程序管理</h2>\n\n  </ion-navbar>\n\n</ion-header>\n\n\n\n<ion-content>\n\n  <ion-grid>\n\n    <ion-card class="import-box" (click)="importFromEpk()">\n\n      <img src="assets/icon/icon-add.png" alt="">\n\n      <div class="sub-ttl">从本地添加应用</div>\n\n    </ion-card>\n\n\n\n    <ion-list class="mgt-list">\n\n      <ion-item *ngFor="let item of getAppInfoList(), let i = index">\n\n        <ion-checkbox ng-checked="checked" (click)=\'checkApp(item)\'></ion-checkbox>\n\n        <ion-thumbnail item-start class="full-row" (click)="goInfo(item)">\n\n          <img src={{item.bigIcon}} alt="">\n\n          <div class="thum-inner">\n\n            <h2>{{item.name}}</h2>\n\n          </div>\n\n          <button ion-button clear item-end class="rt-icon"></button>\n\n        </ion-thumbnail>\n\n      </ion-item>\n\n    </ion-list>\n\n\n\n    <ion-card class="card-del" *ngIf="isShow" (click)="doDel()">\n\n      删除应用\n\n    </ion-card>\n\n  </ion-grid>\n\n</ion-content>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\manage\manage.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
            __WEBPACK_IMPORTED_MODULE_2__ionic_native_file__["a" /* File */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */]])
    ], ManagePage);
    return ManagePage;
}());

//# sourceMappingURL=manage.js.map

/***/ }),

/***/ 196:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InfoPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var appId = '';
function display_msg(content) {
    console.log("ElastosJS  ManagePage === msg " + content);
}
var InfoPage = /** @class */ (function () {
    function InfoPage(navCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.appInfo = {};
        appId = this.navParams.get('id');
        this.refreshAppInfo(appId);
    }
    InfoPage.prototype.refreshAppInfo = function (appId) {
        var _this = this;
        function refreshItems(ret) {
            if (ret != null) {
                _this.appInfo = ret;
                _this.appInfo["urls"] = JSON.parse(_this.appInfo["urls"]);
                _this.appInfo["plugins"] = JSON.parse(_this.appInfo["plugins"]);
                display_msg("refreshItems " + _this.appInfo.toString());
            }
        }
        ;
        appManager.getAppInfo(appId, refreshItems, display_msg);
    };
    InfoPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad InfoPage');
    };
    InfoPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-info',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\info\info.html"*/'<ion-header no-border class="tab-header">\n\n    <ion-navbar transparent>\n\n        <h2>应用详情</h2>\n\n    </ion-navbar>\n\n</ion-header>\n\n\n\n<ion-content class="">\n\n    <ion-grid class="mt-48">\n\n        <ion-card>\n\n            <ion-item ng-model="appInfo">\n\n                <ion-thumbnail item-start class="up-app">\n\n                    <img src="{{appInfo.smallIcon}}">\n\n                </ion-thumbnail>\n\n                <h2>{{appInfo.name}}</h2>\n\n                <p>{{appInfo.version}}</p>\n\n                <p>{{appInfo.description}}</p>\n\n            </ion-item>\n\n        </ion-card>\n\n\n\n        <ion-card>\n\n            <ion-item class="item-text-wrap">\n\n                <ion-note item-start>\n\n                    DefaultLocale\n\n                </ion-note>\n\n                <ion-label>{{appInfo.defaultLocale}}</ion-label>\n\n            </ion-item>\n\n            <ion-item class="item-text-wrap">\n\n                <ion-note item-start>\n\n                    ID\n\n                </ion-note>\n\n                <ion-label>{{appInfo.id}}</ion-label>\n\n            </ion-item>\n\n            <ion-item class="item-text-wrap">\n\n                <ion-note item-start>\n\n                    Author\n\n                </ion-note>\n\n                <ion-label>{{appInfo.authorName}}</ion-label>\n\n            </ion-item>\n\n            <ion-item class="item-text-wrap">\n\n                <ion-note item-start>\n\n                    Email\n\n                </ion-note>\n\n                <ion-label>{{appInfo.authorEmail}}</ion-label>\n\n            </ion-item>\n\n            <ion-item class="item-text-wrap">\n\n                <ion-note item-start>\n\n                    LaunchPath\n\n                </ion-note>\n\n                <ion-label>{{appInfo.launchPath}}</ion-label>\n\n            </ion-item>\n\n            <ion-item class="item-text-wrap">\n\n                <ion-note item-start>\n\n                    BuiltIn\n\n                </ion-note>\n\n                <ion-label>{{appInfo.builtIn}}</ion-label>\n\n            </ion-item>\n\n        </ion-card>\n\n\n\n        <ion-card>\n\n            <ion-list no-lines>\n\n                <ion-item class="item-text-wrap" *ngFor="let item of appInfo.urls">\n\n                    <ion-note item-start *ngIf="item.authority == 0">\n\n                        无权限\n\n                    </ion-note>\n\n                    <ion-note item-start *ngIf="item.authority != 0">\n\n                        有权限\n\n                    </ion-note>\n\n                    <ion-label>{{item.url}}</ion-label>\n\n                </ion-item>\n\n            </ion-list>\n\n        </ion-card>\n\n\n\n        <ion-card>\n\n            <ion-list no-lines>\n\n                <ion-item class="item-text-wrap" *ngFor="let item of appInfo.plugins">\n\n                    <ion-note item-start *ngIf="item.authority == 0">\n\n                        无权限\n\n                    </ion-note>\n\n                    <ion-note item-start *ngIf="item.authority != 0">\n\n                        有权限\n\n                    </ion-note>\n\n                    <ion-label>{{item.plugin}}</ion-label>\n\n                </ion-item>\n\n            </ion-list>\n\n        </ion-card>\n\n\n\n    </ion-grid>\n\n</ion-content>'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\info\info.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */]])
    ], InfoPage);
    return InfoPage;
}());

//# sourceMappingURL=info.js.map

/***/ }),

/***/ 197:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ZipdirPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var zipList = [];
var ZipdirPage = /** @class */ (function () {
    function ZipdirPage(navCtrl, navParams, alertCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        zipList = this.navParams.get("zipList");
        console.log("zipList: " + zipList);
    }
    ZipdirPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad ZipdirPage');
    };
    ZipdirPage.prototype.getZipList = function () {
        console.log("zipList: " + zipList);
        return zipList;
    };
    ZipdirPage.prototype.installZip = function (item) {
        this.showPermissionPrompt(item);
    };
    ZipdirPage.prototype.doInstallZip = function (item) {
        var _this = this;
        appManager.install(item, function (ret) {
            console.log("3: " + JSON.stringify(ret));
            window.localStorage.setItem('shouldLauncherBeRefreshed_manage', '1'); // home页刷新标识: 0-不刷新, 1-刷新.
            _this.goManager();
        }, function (err) {
            console.log("4: " + JSON.stringify(err));
        });
    };
    ZipdirPage.prototype.goManager = function () {
        this.navCtrl.pop();
    };
    /**
     *
     * @desc 安装弹窗
     */
    ZipdirPage.prototype.showPermissionPrompt = function (item) {
        var _this = this;
        var prompt = this.alertCtrl.create({
            title: '<div class="permission-warning">安装提示</div>',
            message: "<div>即将安装: " + item + "</div>",
            buttons: [
                {
                    text: '取消',
                    handler: function (data) {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: '确认',
                    handler: function (data) {
                        _this.doInstallZip(item);
                    }
                }
            ]
        });
        prompt.present();
    };
    ZipdirPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-zipdir',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\zipdir\zipdir.html"*/'<!--\n\n  Generated template for the ZipdirPage page.\n\n\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n\n  Ionic pages and navigation.\n\n-->\n\n<ion-header>\n\n  <ion-navbar>\n\n    <ion-title>ZipDir</ion-title>\n\n  </ion-navbar>\n\n  <ion-buttons end (click)="goManager()" style="z-index: 999;"></ion-buttons>\n\n</ion-header>\n\n\n\n<ion-content overflow-scroll="true">\n\n  <ion-list no-lines>\n\n    <ion-item *ngFor="let item of getZipList(), let i = index">\n\n      <ion-thumbnail item-start (click)="installZip(item)">\n\n        <img src="assets/imgs/slice1.png" alt="">\n\n        <div class="thum-inner">\n\n          <h2>{{item}}</h2>\n\n        </div>\n\n      </ion-thumbnail>\n\n    </ion-item>\n\n  </ion-list>\n\n</ion-content>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\zipdir\zipdir.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */]])
    ], ZipdirPage);
    return ZipdirPage;
}());

//# sourceMappingURL=zipdir.js.map

/***/ }),

/***/ 198:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TabsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__running_running__ = __webpack_require__(199);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recent_recent__ = __webpack_require__(200);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var TabsPage = /** @class */ (function () {
    function TabsPage(navCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.tab1Root = __WEBPACK_IMPORTED_MODULE_2__running_running__["a" /* RunningPage */];
        this.tab2Root = __WEBPACK_IMPORTED_MODULE_3__recent_recent__["a" /* RecentPage */];
    }
    TabsPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad TabsPage');
    };
    TabsPage.prototype.goHome = function () {
        this.navCtrl.pop();
    };
    TabsPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-tabs',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\tabs\tabs.html"*/'<!--\n\n  Generated template for the TabsPage page.\n\n\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n\n  Ionic pages and navigation.\n\n-->\n\n<ion-header class="tab-header">\n\n    <ion-navbar>\n\n        <ion-buttons end (click)="goHome()" style="z-index: 999;"></ion-buttons>\n\n        <h2>运行程序管理</h2>\n\n    </ion-navbar>\n\n</ion-header>\n\n\n\n\n\n<ion-content padding class="tab-content">\n\n    <ion-tabs class="tabs-icon-top">\n\n        <ion-tab [root]="tab1Root" tabTitle="正在运行"></ion-tab>\n\n        <ion-tab [root]="tab2Root" tabTitle="最近打开"></ion-tab>\n\n    </ion-tabs>\n\n</ion-content>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\tabs\tabs.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */]])
    ], TabsPage);
    return TabsPage;
}());

//# sourceMappingURL=tabs.js.map

/***/ }),

/***/ 199:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RunningPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var appListInfos = []; // 应用列表
function display_msg(content) {
    console.log("ElastosJS  RunningPage === msg " + content);
}
;
var RunningPage = /** @class */ (function () {
    function RunningPage(navCtrl) {
        this.navCtrl = navCtrl;
        this.showEmptyCard = true; // 是否显示空白卡片
        this.checked = false; // 删除按钮是否激活，激活时隐去跳转管理页面的按钮
        this.refleshList();
    }
    RunningPage.prototype.refleshList = function () {
        var _this = this;
        appListInfos = [];
        _this.showEmptyCard = true;
        function refreshItem(appInfo) {
            appListInfos.push({
                id: appInfo.id,
                name: appInfo.name,
                version: appInfo.version,
                bigIcon: appInfo.bigIcon
            });
            _this.showEmptyCard = false;
        }
        function refreshItems(appIds) {
            display_msg(appIds.toString());
            if (appIds != null) {
                for (var _i = 0, appIds_1 = appIds; _i < appIds_1.length; _i++) {
                    var value = appIds_1[_i];
                    if (value != "launcher") {
                        appManager.getAppInfo(value, refreshItem, display_msg);
                    }
                }
            }
        }
        appManager.getRunningList(refreshItems, display_msg);
    };
    RunningPage.prototype.getAppRunList = function () {
        display_msg("getAppRunningList " + appListInfos);
        return appListInfos;
    };
    RunningPage.prototype.pressEvent = function () {
        this.checked = true;
    };
    RunningPage.prototype.delEvent = function (item) {
        appManager.unInstall(item.id, display_msg);
        this.checked = false;
    };
    RunningPage.prototype.tapEvent = function () {
        this.checked = false;
    };
    RunningPage.prototype.onClick = function (item) {
        if (this.checked) {
            return false;
        }
        else {
            appManager.start(item.id);
        }
    };
    RunningPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-running',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\running\running.html"*/'<ion-content class="no-padding">\n\n  <ion-card class="card-empty" *ngIf="showEmptyCard == true">\n\n    <div class="icon-empty"></div>\n\n    <div class="empty-ttl">暂无运行中的程序</div>\n\n  </ion-card>\n\n  <ion-grid class="mt-48" >\n\n    <ion-row>\n\n      <ion-col col-21 (tap)="tapEvent($event)"></ion-col>\n\n    </ion-row>\n\n    <ion-row class="app-contain">\n\n      <ion-col col-3 *ngFor="let item of getAppRunList(), let i = index" (press)="pressEvent()"\n\n        (click)="onClick(item)">\n\n        <img src={{item.bigIcon}} alt="">\n\n        <span *ngIf="checked" class="del-ioc" (click)="delEvent(item)"></span>\n\n        <h3>{{item.name}}</h3>\n\n      </ion-col>\n\n    </ion-row>\n\n    <!--<ion-row class="app-contain">-->\n\n      <!--<ion-col col-3>-->\n\n        <!--<img src="assets/icon/icon-water.png" alt="" srcset="">-->\n\n        <!--<h3>水滴</h3>-->\n\n      <!--</ion-col>-->\n\n      <!--<ion-col col-3>-->\n\n        <!--<img src="assets/icon/icon-music.png" alt="" srcset="">-->\n\n        <!--<h3>蝌蚪音乐</h3>-->\n\n      <!--</ion-col>-->\n\n      <!--<ion-col col-3>-->\n\n        <!--<img src="assets/icon/icon-pocket.png" alt="" srcset="">-->\n\n        <!--<h3>口袋购物</h3>-->\n\n      <!--</ion-col>-->\n\n      <!--<ion-col col-3>-->\n\n        <!--<img src="assets/icon/icon-cal.png" alt="" srcset="">-->\n\n        <!--<h3>日历</h3>-->\n\n      <!--</ion-col>-->\n\n    <!--</ion-row>-->\n\n  </ion-grid>\n\n  <ion-grid class="grid-down" (tap)="tapEvent($event)"></ion-grid>\n\n</ion-content>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\running\running.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */]])
    ], RunningPage);
    return RunningPage;
}());

//# sourceMappingURL=running.js.map

/***/ }),

/***/ 200:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RecentPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var appListInfos = []; // 应用列表
function display_msg(content) {
    console.log("ElastosJS  RunningPage === msg " + content);
}
;
var RecentPage = /** @class */ (function () {
    function RecentPage(navCtrl) {
        this.navCtrl = navCtrl;
        this.showEmptyCard = true; // 是否显示空白卡片
        this.checked = false; // 删除按钮是否激活，激活时隐去跳转管理页面的按钮
        this.refleshList();
    }
    RecentPage.prototype.refleshList = function () {
        var _this = this;
        appListInfos = [];
        _this.showEmptyCard = true;
        function refreshItem(appInfo) {
            appListInfos.push({
                id: appInfo.id,
                name: appInfo.name,
                version: appInfo.version,
                bigIcon: appInfo.bigIcon
            });
            _this.showEmptyCard = false;
        }
        function refreshItems(appIds) {
            display_msg(appIds.toString());
            if (appIds != null) {
                for (var _i = 0, appIds_1 = appIds; _i < appIds_1.length; _i++) {
                    var value = appIds_1[_i];
                    if (value != "launcher") {
                        appManager.getAppInfo(value, refreshItem, display_msg);
                    }
                }
            }
        }
        appManager.getLastList(refreshItems, display_msg);
    };
    RecentPage.prototype.getAppRecentList = function () {
        display_msg("getAppRecentList " + appListInfos);
        return appListInfos;
    };
    RecentPage.prototype.pressEvent = function () {
        this.checked = true;
    };
    RecentPage.prototype.delEvent = function (item) {
        appManager.unInstall(item.id, display_msg);
        this.checked = false;
    };
    RecentPage.prototype.tapEvent = function () {
        this.checked = false;
    };
    RecentPage.prototype.onClick = function (item) {
        if (this.checked) {
            return false;
        }
        else {
            appManager.start(item.id);
        }
    };
    RecentPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-recent',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\recent\recent.html"*/'<ion-content class="no-padding">\n\n  <ion-card class="card-empty" *ngIf="showEmptyCard">\n\n    <div class="icon-empty"></div>\n\n    <div class="empty-ttl">暂无最近运行的程序</div>\n\n  </ion-card>\n\n  <ion-grid class="mt-48" >\n\n    <ion-row>\n\n      <ion-col col-21 (tap)="tapEvent($event)"></ion-col>\n\n    </ion-row>\n\n    <ion-row class="app-contain">\n\n      <ion-col col-3 *ngFor="let item of getAppRecentList(), let i = index" (press)="pressEvent()" (click)="onClick(item)">\n\n        <img src={{item.bigIcon}} alt="">\n\n        <span *ngIf="checked" class="del-ioc" (click)="delEvent(item)"></span>\n\n        <h3>{{item.name}}</h3>\n\n      </ion-col>\n\n    </ion-row>\n\n  </ion-grid>\n\n  <ion-grid class="grid-down" (tap)="tapEvent($event)"></ion-grid>\n\n</ion-content>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\pages\recent\recent.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */]])
    ], RecentPage);
    return RecentPage;
}());

//# sourceMappingURL=recent.js.map

/***/ }),

/***/ 201:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(202);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(224);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 224:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(267);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_components_module__ = __webpack_require__(275);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_home_home__ = __webpack_require__(193);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_manage_manage__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_info_info__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__pages_running_running__ = __webpack_require__(199);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__pages_recent_recent__ = __webpack_require__(200);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__pages_tabs_tabs__ = __webpack_require__(198);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__pages_zipdir_zipdir__ = __webpack_require__(197);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__ionic_native_file__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__ionic_native_splash_screen__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__ionic_native_sqlite__ = __webpack_require__(277);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__ionic_native_status_bar__ = __webpack_require__(190);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




 // 引入模块











var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_5__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_6__pages_manage_manage__["a" /* ManagePage */],
                __WEBPACK_IMPORTED_MODULE_7__pages_info_info__["a" /* InfoPage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_running_running__["a" /* RunningPage */],
                __WEBPACK_IMPORTED_MODULE_9__pages_recent_recent__["a" /* RecentPage */],
                __WEBPACK_IMPORTED_MODULE_10__pages_tabs_tabs__["a" /* TabsPage */],
                __WEBPACK_IMPORTED_MODULE_11__pages_zipdir_zipdir__["a" /* ZipdirPage */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_4__components_components_module__["a" /* ComponentsModule */],
                // IonicModule.forRoot(MyApp)
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["d" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */], {
                    tabsHideOnSubPages: 'true',
                    backButtonText: '' /*配置返回按钮*/
                }, {
                    links: []
                })
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_5__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_6__pages_manage_manage__["a" /* ManagePage */],
                __WEBPACK_IMPORTED_MODULE_7__pages_info_info__["a" /* InfoPage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_running_running__["a" /* RunningPage */],
                __WEBPACK_IMPORTED_MODULE_9__pages_recent_recent__["a" /* RecentPage */],
                __WEBPACK_IMPORTED_MODULE_10__pages_tabs_tabs__["a" /* TabsPage */],
                __WEBPACK_IMPORTED_MODULE_11__pages_zipdir_zipdir__["a" /* ZipdirPage */]
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_12__ionic_native_file__["a" /* File */],
                __WEBPACK_IMPORTED_MODULE_13__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_14__ionic_native_sqlite__["a" /* SQLite */],
                __WEBPACK_IMPORTED_MODULE_15__ionic_native_status_bar__["a" /* StatusBar */],
                { provide: __WEBPACK_IMPORTED_MODULE_0__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicErrorHandler */] }
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 267:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(190);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(192);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(193);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */];
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.overlaysWebView(true);
            splashScreen.hide();
            // alert(location.search); // get parameters from url
        });
    }
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\app\app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\app\app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 275:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ComponentsModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__localimport_localimport__ = __webpack_require__(276);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__ = __webpack_require__(26);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var ComponentsModule = /** @class */ (function () {
    function ComponentsModule() {
    }
    ComponentsModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
            declarations: [__WEBPACK_IMPORTED_MODULE_1__localimport_localimport__["a" /* LocalimportComponent */]],
            imports: [
                __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["e" /* IonicPageModule */].forChild(__WEBPACK_IMPORTED_MODULE_1__localimport_localimport__["a" /* LocalimportComponent */]) // <- Add
            ],
            exports: [__WEBPACK_IMPORTED_MODULE_1__localimport_localimport__["a" /* LocalimportComponent */]]
        })
    ], ComponentsModule);
    return ComponentsModule;
}());

//# sourceMappingURL=components.module.js.map

/***/ }),

/***/ 276:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LocalimportComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

/**
 * Generated class for the LocalimportComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
var LocalimportComponent = /** @class */ (function () {
    function LocalimportComponent() {
        console.log('Hello LocalimportComponent Component');
        this.text = 'Hello World';
    }
    LocalimportComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'localimport',template:/*ion-inline-start:"D:\project\Elastos.Trinity.DApps.Launcher\src\components\localimport\localimport.html"*/'<!-- Generated template for the LocalimportComponent component -->\n\n<!-- <div>\n\n  {{text}}\n\n</div> -->\n\n<!-- <style>\n\n   .import-box {\n\n    background-color: #0064D7;\n\n    height: 112px; \n\n    text-align: center;\n\n    font-size: 22px;\n\n    color: #fff;\n\n    border-radius: 10px;\n\n  }\n\n  .import-box .button-ios {\n\n    background-color: #0064D7;\n\n  }\n\n  /* .import-box .button-ios img {\n\n    \n\n  } */\n\n</style> -->\n\n\n\n<div>\n\n  <button ion-button icon-only>\n\n    <ion-icon>\n\n      <img class="icon-right" src="../../assets/imgs/add.png" alt="">\n\n    </ion-icon>\n\n  </button>\n\n  <ion-card-content>\n\n    <!-- Add card content here! -->\n\n    <div class="title">Import from Local file</div>\n\n  </ion-card-content>\n\n</div>\n\n'/*ion-inline-end:"D:\project\Elastos.Trinity.DApps.Launcher\src\components\localimport\localimport.html"*/
        }),
        __metadata("design:paramtypes", [])
    ], LocalimportComponent);
    return LocalimportComponent;
}());

//# sourceMappingURL=localimport.js.map

/***/ })

},[201]);
//# sourceMappingURL=main.js.map