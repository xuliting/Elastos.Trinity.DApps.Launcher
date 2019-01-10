import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

declare let appManager: any;

let appId = '';

function display_msg(content) {
    console.log("ElastosJS  ManagePage === msg " + content);
}

@Component({
    selector: 'page-info',
    templateUrl: 'info.html',
})
export class InfoPage {
    public appInfo:object = {};

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        appId = this.navParams.get('id');
        this.refreshAppInfo(appId);
    }

    refreshAppInfo(appId) {
        let _this = this;
        function refreshItems(ret) {
            if (ret != null) {
                _this.appInfo = ret;
                _this.appInfo["urls"] = JSON.parse(_this.appInfo["urls"]);
                _this.appInfo["plugins"] = JSON.parse(_this.appInfo["plugins"]);
                display_msg("refreshItems " + _this.appInfo.toString())
            }
        };
        appManager.getAppInfo(appId, refreshItems, display_msg);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoPage');
    }

}
