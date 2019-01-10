import {Component} from '@angular/core';
import {NavController, NavParams, AlertController} from 'ionic-angular';
import {File} from '@ionic-native/file';

import {InfoPage} from '../info/info';
import {ZipdirPage} from "../zipdir/zipdir";

declare let appManager: any;

let appListInfos = []; // 应用列表

function display_msg(content) {
    console.log("ElastosJS  ManagePage === msg " + content);
};


/**
 * Generated class for the ManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-manage',
    templateUrl: 'manage.html',
})
export class ManagePage {
    public buildInAppIds = [];
    public checkIndex = []; // 复选框选中的应用集合
    public isShow = false;
    public appZipDir = "www/install-file/";
    public builtInDir = "www/built-in/";

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public file: File,
                public alertCtrl: AlertController
    ) {
        this.refleshList();
        // this.addListen();
    }

    refleshList() {
        window.localStorage.setItem('shouldLauncherBeRefreshed_manage', '0'); // manage页刷新标识: 0-不刷新, 1-刷新.
        window.localStorage.setItem('shouldLauncherBeRefreshed_home', '1'); // home页刷新标识: 0-不刷新, 1-刷新.
        let _this = this;

        function refreshItems(appInfos) {
            if (appInfos != null) {
                appListInfos = _this.dealData(appInfos);
                display_msg("refreshItems " + appListInfos.toString())
            }
        };
        appManager.getAppInfos(refreshItems, display_msg);

        // get built-in apps
        let rootPath = _this.file.applicationDirectory;
        _this.file.listDir(rootPath, _this.builtInDir)
            .then(function (ret) {
                _this.buildInAppIds = [];
                ret.forEach(function (item) {
                    _this.buildInAppIds.push("assets:/" + item.fullPath);
                });
            })
            .catch(err => {
                alert(JSON.stringify(err));
            });
    }

    dealData(data) {
        let arr = [];
        if (typeof data == 'object') {
            for (const key in data) {
                arr.push({
                    id: data[key].id,
                    name: data[key].name,
                    version: data[key].version,
                    bigIcon: data[key].bigIcon
                })
            }
        } else {
            arr = data;
        }
        return arr;
    }

    addListen() {
        var fileInput = document.getElementById('m_upload')
        fileInput.addEventListener('change', function (el) {
            alert('!!!!')
            alert(el.target['value'])
        })
    }


    getAppInfoList() {
        if ('1' == window.localStorage.getItem('shouldLauncherBeRefreshed_manage')) {
            this.refleshList();
        }
        display_msg("getAppInfoList " + appListInfos);
        return appListInfos;
    }

    /**
     *
     * @desc  页面跳转到首页
     */
    goToIndex() {
        this.navCtrl.pop();
    }

    /**
     *
     * @desc  页面跳转到详情
     */
    goInfo(item) {
        this.navCtrl.push(InfoPage, item);
    }

    /**
     *
     * @desc 列表选中
     */
    checkApp(item) {
        item.checked = !item.checked;
        if (this.checkIndex.indexOf(item) < 0) {
            this.checkIndex.push(item);
        } else {
            this.checkIndex.splice(this.checkIndex.indexOf(item), 1)
        }
        if (this.checkIndex.length > 0) {
            this.isShow = true;
        } else {
            this.isShow = false;
        }
    }

    /**
     *
     * @desc   删除操作
     */
    doDel() {
        this.showDelPrompt();
    }

    /**
     *
     * @desc 添加应用
     */
    importFromEpk() {
        let _this = this;
        let rootPath = _this.file.applicationDirectory;
        _this.file.listDir(rootPath, _this.appZipDir)
            .then(function (ret) {
                let zipList = [];
                ret.forEach(function (item) {
                    zipList.push("assets:/" + item.fullPath);
                });
                _this.navCtrl.push(ZipdirPage, {"zipList": zipList});
            })
            .catch(err => {
                alert(JSON.stringify(err));
            });
    }

    /**
     *
     * @desc 确认删除弹窗
     */
    showDelPrompt() {
        let _this = this;
        const prompt = _this.alertCtrl.create({
            //   title: '<div class="permission-warning">安装该应用需要获取以下权限</div>',
            message: '<div class="m-center">确认删除应用</div>',
            buttons: [
                {
                    text: '取消',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: '确认',
                    handler: data => {
                        console.log('Saved clicked');
                        _this.checkIndex.forEach(function (item) {
                            if (_this.buildInAppIds.indexOf(item.id) > -1) {
                                console.log("can not delete built-in app " + item.id);
                                // _this.showCanNotDelPrompt(item);
                            } else {
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
    }

}
