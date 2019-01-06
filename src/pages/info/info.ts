import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

declare let appManager: any;

let appId = '';

function display_msg(content) {
    console.log("ElastosJS  InfoPage === msg " + content);
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
                _this.appInfo["urls"] = _this.dealUrlsData(_this.appInfo["urls"]);
                _this.appInfo["plugins"] = _this.dealPluginsData(_this.appInfo["plugins"]);
                display_msg("refreshItems " + JSON.stringify(_this.appInfo));
            }
        };
        appManager.getAppInfo(appId, refreshItems, display_msg);
    }

    dealUrlsData(urls) {
        let arr = [];
        let data = JSON.parse(urls);
        if (typeof data == 'object') {
            for (const key in data) {
                arr.push({
                    url: data[key].url,
                    authority: data[key].authority,
                    checked: data[key].authority == appManager.AuthorityStatus.ALLOW
                })
            }
        } else {
            arr = data;
        }
        return arr;
    }

    dealPluginsData(plugins) {
        let arr = [];
        let data = JSON.parse(plugins);
        if (typeof data == 'object') {
            for (const key in data) {
                arr.push({
                    plugin: data[key].url,
                    authority: data[key].authority,
                    checked: data[key].authority == appManager.AuthorityStatus.ALLOW
                })
            }
        } else {
            arr = data;
        }
        return arr;
    }

    urlAuthority(item) {
        let _this = this;
        let checked = item.checked ? appManager.AuthorityStatus.ALLOW : appManager.AuthorityStatus.DENY;
        display_msg("appManager.setUrlAuthority(" + appId + ", " + item.url + ", " + checked + ", fun())");
        appManager.setUrlAuthority(appId, item.url, checked, function (ret) {
            display_msg("setUrlAuthority succeed " + JSON.stringify(item) + " -- " + JSON.stringify(ret));
            _this.refreshAppInfo(appId);
        }, function (err) {
            display_msg("setUrlAuthority failed " + JSON.stringify(item) + " -- " + JSON.stringify(err));
        });
    }

    pluginAuthority(item) {
        let _this = this;
        let checked = item.checked ? appManager.AuthorityStatus.ALLOW : appManager.AuthorityStatus.DENY;
        display_msg("appManager.setUrlAuthority(" + appId + ", " + item.plugin + ", " + checked + ", fun())");
        appManager.setPluginAuthority(appId, item.plugin, checked, function (ret) {
            display_msg("setPluginAuthority succeed " + JSON.stringify(item) + " -- " + JSON.stringify(ret));
            _this.refreshAppInfo(appId);
        }, function (err) {
            display_msg("setPluginAuthority failed " + JSON.stringify(item) + " -- " + JSON.stringify(err));
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoPage');
    }

}
