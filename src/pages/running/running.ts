import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let appManager: any;

let appListInfos = []; // 应用列表

function display_msg(content) {
    console.log("ElastosJS  RunningPage === msg " + content);
};


@Component({
    selector: 'page-running',
    templateUrl: 'running.html',
})
export class RunningPage {
    public showEmptyCard = true; // 是否显示空白卡片

    constructor(public navCtrl: NavController) {
        this.refleshList();
    }

    refleshList() {
        let _this = this;
        appListInfos = [];
        _this.showEmptyCard = true;

        function refreshItem(appInfo) {
            appListInfos.push({
                id: appInfo.id,
                name: appInfo.name,
                version: appInfo.version,
                bigIcon: appInfo.icons[0].src
            });
            _this.showEmptyCard = false;
        }

        function refreshItems(appIds) {
			display_msg(appIds.toString());
            if (appIds != null) {
                for (const value of appIds) {
                    if (value != "launcher") {
                        appManager.getAppInfo(value, refreshItem, display_msg);
                    }
                }
            }
        }

        appManager.getRunningList(refreshItems, display_msg);
    }

    getAppRunList () {
        display_msg("getAppRunningList " + JSON.stringify(appListInfos));
        return appListInfos;
    }

    startApp(item) {
        appManager.start(item.id, function (ret) {
            display_msg("close ret: " + JSON.stringify(ret));
        }, function (err) {
            display_msg("close err: " + JSON.stringify(err));
        });
    }

    stopApp(item) {
        let _this = this;
        appManager.close(item.id, function (ret) {
            display_msg("close ret: " + JSON.stringify(ret));
            _this.refleshList();
        }, function (err) {
            display_msg("close err: " + JSON.stringify(err));
        });
    }

}
