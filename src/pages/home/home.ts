import { Component } from '@angular/core';
import { NavController,AlertController} from 'ionic-angular';

import { ManagePage } from '../manage/manage';
import { TabsPage } from '../tabs/tabs';
import { MyPage } from '../my/my';

declare let appManager: any;
declare var device: any;

let appListInfos = []; // 应用列表


@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {
    public checked = false; // 删除按钮是否激活，激活时隐去跳转管理页面的按钮
    public showRecent = false;

    constructor(public navCtrl: NavController,
				public alertCtrl: AlertController) {
        this.init();
    }
	
	onReceive(ret) {
	    let _this = this;
		_this.display_msg("receive message:" + ret.message + ". type: " + ret.type + ". from: " + ret.from);
		if (ret.type == 4)	{
			const prompt = this.alertCtrl.create({
            title: '<div class="permission-warning">安装提示</div>',
            message: "<div>即将安装: " + ret.message + "</div>",
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
                        appManager.install(ret.message, function (ret) {
							console.log("3: " + JSON.stringify(ret));
							_this.refleshList();
						}, function (err) {
							console.log("4: " + JSON.stringify(err));
						});
                    }
                }
            ]
			});
			prompt.present();
		}
			
	}


	 display_msg(content) {
		console.log("ElastosJS  HomePage === msg " + content);
	}

    init() {
        let _this = this;
        document.addEventListener("deviceready", onDeviceReady, false);

        function onDeviceReady() {
            _this.display_msg(device.cordova);
            appManager.setListener(_this.onReceive);
            _this.refleshList();
        }
    }

    refleshList() {
        window.localStorage.setItem('shouldLauncherBeRefreshed_home', '0'); // home页刷新标识: 0-不刷新, 1-刷新.
        let _this = this;
        function refreshItems(appInfos) {
            if (appInfos != null) {
                appListInfos = _this.dealData(appInfos);
                _this.display_msg("refreshItems " + appListInfos.toString())
            }
        };
        appManager.getAppInfos(refreshItems, _this.display_msg);
    }

    dealData(data) {
        let arr = [];
        if (typeof data == 'object') {
            for (const key in data) {
                arr.push({
                    id: data[key].id,
                    name: data[key].name,
                    version: data[key].version,
                    bigIcon: data[key].icons[0].src
                })
            }
        } else {
            arr = data;
        }
        return arr;
    }

    getAppInfoList() {
		let _this = this;
        if ('1' == window.localStorage.getItem('shouldLauncherBeRefreshed_home')) {
            _this.refleshList();
        }
        _this.display_msg("getAppInfoList " + appListInfos);
        return appListInfos;
    }

    goManager() {
        this.navCtrl.push(ManagePage);
    }

    goTabs() {
        this.navCtrl.push(TabsPage);
    }

    goToMy() {
        this.navCtrl.push(MyPage)
    }

    pressEvent() {
        //this.checked = true;
    }

    delEvent(item) {
        //let _this = this;
        //appManager.unInstall(item.id, function (ret) {
        //    _this.refleshList();
        //});
        // this.checked = false;
    }

    tapEvent() {
        //this.checked = false;
    }

    onClick(item) {
        appManager.start(item.id);
    }

}
