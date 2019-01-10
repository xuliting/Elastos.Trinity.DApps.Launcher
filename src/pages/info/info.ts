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
    public appInfo:object = {
        "defaultLocale": "",
        "backgroundColor": "",
        "plugins": [{"authority": 0,"plugin": "","checked":false}],
        "authorEmail": "",
        "urls": [{"authority": 0,"url": "","checked":false}],
        "startUrl": "",
        "themeColor": "",
        "version": "",
        "id": "",
        "description": "",
        "themeDisplay": "",
        "authorName": "",
        "name": "",
        "builtIn": 0,
        "icons": [{
            "type": "",
            "sizes": "",
            "src": ""
        }, {
            "type": "",
            "sizes": "",
            "src": ""
        }],
        "shortName": ""
    };

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        appId = this.navParams.get('id');
        this.refreshAppInfo(appId);
    }

    refreshAppInfo(appId) {
        let _this = this;
        appManager.getAppInfo(appId, function (ret) {
            if (ret != null) {
                display_msg("refreshItems ret: " + JSON.stringify(ret));
                _this.appInfo = ret;
				_this.appInfo["startUrl"] = _this.dealstartUrl(_this.appInfo["startUrl"]);
                _this.appInfo["urls"] = _this.dealUrlsData(_this.appInfo["urls"]);
                _this.appInfo["plugins"] = _this.dealPluginsData(_this.appInfo["plugins"]);
                display_msg("refreshItems appInfo: " + JSON.stringify(_this.appInfo));
            }
        }, display_msg);
    }

	 dealstartUrl(startUrl) {
        let arr = startUrl.substr(startUrl.lastIndexOf("/") + 1);
		return arr;
	 }
	 
    dealUrlsData(urls) {
        let arr = [];
        if (typeof urls == 'object') {
            for (const key in urls) {
                arr.push({
                    url: urls[key].url,
                    authority: urls[key].authority,
                    checked: urls[key].authority == appManager.AuthorityStatus.ALLOW
                })
            }
        } else {
            arr = urls;
        }
        return arr;
    }

    dealPluginsData(plugins) {
        let arr = [];
        if (typeof plugins == 'object') {
            for (const key in plugins) {
                arr.push({
                    plugin: plugins[key].plugin,
                    authority: plugins[key].authority,
                    checked: plugins[key].authority == appManager.AuthorityStatus.ALLOW
                })
            }
        } else {
            arr = plugins;
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
