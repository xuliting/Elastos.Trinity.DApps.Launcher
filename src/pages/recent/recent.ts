import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let appManager: any;

let appListInfos = []; // 应用列表

function display_msg(content) {
    console.log("ElastosJS  RunningPage === msg " + content);
}


@Component({
  selector: 'page-recent',
  templateUrl: 'recent.html',
})
export class RecentPage {
    public showEmptyCard = true; // 是否显示空白卡片
    public checked = false; // 删除按钮是否激活，激活时隐去跳转管理页面的按钮

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

        appManager.getLastList(refreshItems, display_msg);
    }

    getAppRecentList () {
        display_msg("getAppRecentList " + JSON.stringify(appListInfos));
        return appListInfos;
    }

    pressEvent() {
        // this.checked = true;
    }

    stopEvent(item) {
        // let _this = this;
        // appManager.close(item.id, function (ret) {
        //     display_msg("close ret: " + JSON.stringify(ret));
        //     _this.checked = false;
        //     _this.refleshList();
        // }, function (err) {
        //     _this.checked = false;
        //     display_msg("close err: " + JSON.stringify(err));
        // });
    }

    tapEvent() {
        this.checked = false;
    }

    onClick(item) {
        if (this.checked) {
            return false;
        } else {
            appManager.start(item.id);
        }
    }

}
