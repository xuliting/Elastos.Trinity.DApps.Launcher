import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController } from '@ionic/angular';
import { SettingService } from './setting.service';
import { DomSanitizer } from '@angular/platform-browser';

declare let appManager: AppManagerPlugin.AppManager;
let managerService = null;

enum MessageType {
    INTERNAL = 1,
    IN_RETURN = 2,
    IN_REFRESH = 3,

    EXTERNAL = 11,
    EX_LAUNCHER = 12,
    EX_INSTALL = 13,
    EX_RETURN = 14,
}

@Injectable({
    providedIn: 'root'
})
export class AppmanagerService {

    public appInfos: AppManagerPlugin.AppInfo[] = [];
    public appList: string[] = [];
    public runningList: any = [];
    public lastList: any = [];
    public rows: any = [];
    private currentLang: string = null;

    constructor(private translate: TranslateService,
        private setting: SettingService,
        private sanitizer: DomSanitizer,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private alertController: AlertController) {
        managerService = this;

        var me = this;
        this.translate.onLangChange.subscribe(data => {
            console.log("onLangChange");
            me.onLangChange(data.lang);
        });
    }

    init() {
        console.log("AppmanagerService init");
        appManager.setListener(this.onReceive);
        this.getLanguage();
        this.getAppInfos(true);
        this.getRunningList();
        this.getLastList();
        this.getRuntimeVersion();
    }

    sanitize(url: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);;
    }

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    display_err(err) {
        appManager.alertPrompt("Error", err);
    }

    toast(msg: string = '', duration: number = 2000): void {
        this.toastCtrl.create({
            message: msg,
            duration: duration,
            position: 'top'
        }).then(toast => toast.present());
    }

    toast_installed(id: string) {
        var msg = "'" + id + "' " + this.translate.instant('installed');
        this.toast(msg);
    }

    setCurrentLanguage(code: string) {
        appManager.setCurrentLocale(code);
    }

    onLangChange(code: string) {
        this.changeInfosLanguage(this.translate.currentLang);
        this.setCurrentLanguage(this.translate.currentLang);
    }

    changeInfosLanguage(lang: string) {
        if (this.currentLang == lang || lang == null || this.appList.length < 1) return;

        for (var id in this.appInfos) {
            var locale = this.appInfos[id].locales[this.appInfos[id].defaultLocale];
            if (typeof (locale) !== "object") continue;

            locale = this.appInfos[id].locales[lang];
            if (typeof (locale) !== "object") {
                locale = this.appInfos[id].locales[this.appInfos[id].defaultLocale];
            }
            this.appInfos[id].name = locale.name;
            this.appInfos[id].shortName = locale.shortName;
            this.appInfos[id].description = locale.description;
            this.appInfos[id].authorName = locale.authorName;
        }
        this.currentLang = lang;
    }

    getLanguage() {
        var me = this;
        appManager.getLocale(
            (defaultLang, currentLang, systemLang) => {
                console.log('defaultLangL', defaultLang, ' currentLang:', currentLang, ' systemLang:', systemLang);
                if (systemLang !== 'zh') {
                    systemLang = 'en';
                }
                me.setting.setDefaultLang(systemLang);
                me.setting.setSystemLang(systemLang);
            }
        );
    }

    launcher() {
        appManager.launcher();
    }

    start(id: string) {
        appManager.start(id, () => {});
    }

    sendIntent(action: string, params: any) {
        appManager.sendIntent(action, params);
    }

    close(id: string) {
        appManager.closeApp(id);
    }

    install(url: string, dev: boolean) {
        var me = this;
        appManager.install(url, dev,
            ret => {
                console.log(ret);
            },
            err => {
                if (err.indexOf("App '") === 0) {
                    var arr = err.split("'");
                    me.askInstall(url, arr[1], dev);
                } else {
                    me.display_err(err);
                }
            }
        );
    }

    askInstall(url: string, id: string, dev: boolean) {
        appManager.askPrompt(this.translate.instant("update-prompt"),
            this.translate.instant("update-ask") + ": '" + id + "'?",
            () => this.unInstall(id, ()=>this.install(url, dev), null));
    }

    unInstall(id: string, success: any, error: any) {
        var me = this;
        appManager.unInstall(id,
            ret => success(ret),
            err => {
                if (error !== null) {
                    error(err);
                }  else {
                    me.presentAlertError(err);
                }
            });
    }

    async presentAlertError(err: string) {
        const alert = await this.alertController.create({
            message: err,
            buttons: ['OK']
        });

        await alert.present();
    }


    onReceive(ret) {
        console.log("ElastosJS  HomePage receive message:" + ret.message + ". type: " + ret.type + ". from: " + ret.from);
        var params: any = ret.message;
        if (typeof (params) === "string") {
            params = JSON.parse(params);
        }
        console.log(params);
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case "started":
                    case "closed":
                        managerService.getRunningList();
                        break;
                    case "installed":
                        managerService.toast_installed(params.id);
                    case "unInstalled":
                    case "initiated":
                        managerService.getAppInfos(true);
                        break;
                    case "authorityChanged":
                        managerService.getAppInfos(false);
                        break;
                    case "currentLocaleChanged":
                        break;
                }
                break;
            case MessageType.EX_INSTALL:
                managerService.install(params.uri, params.dev);
                break;
        }
    }

    getRows(size) {
        this.rows = [];
        for (let i = 0; i < this.appList.length; i += size) {
            this.rows.push(this.appList.slice(i, i + size));
        }
    }

    getAppInfos(refresh: boolean = false)/*: Promise<any> */ {
        console.log('AppmanagerService getAppInfos');
        let me = this;
        appManager.getAppInfos(
            (appsInfo, idList) => {
                // console.log('appsInfo:', appsInfo, ' idList:', idList);
                me.appInfos = appsInfo;
                me.appList = idList;

                let hiddenAppList: string[] = ["org.elastos.trinity.dapp.installer"];
                for (var id of hiddenAppList) {
                  let index = me.appList.indexOf(id, 0);
                  if (index > -1) {
                     me.appList.splice(index, 1);
                  }
                }

                if (refresh) {
                    me.zone.run(() => {
                        me.getRows(4);
                        me.changeInfosLanguage(me.setting.currentLang);
                    });
                }
            }
        );
    }

    getRunningList() {
        console.log("AppmanagerService getRunningList");
        let me = this;
        appManager.getRunningList(list => me.runningList = list);
    }

    getLastList() {
        console.log("AppmanagerService getLastList");
        let me = this;
        appManager.getLastList(list => me.lastList = list);
    }

    setPluginAuthority(id: string, plugin: string, authority: AppManagerPlugin.PluginAuthority) {
        var me = this;
        appManager.setPluginAuthority(id, plugin, authority,
            () => console.log('setPluginAuthority success'),
            err => me.display_err(err));
    }

    setUrlAuthority(id: string, url: string, authority: AppManagerPlugin.UrlAuthority) {
        var me = this;
        appManager.setUrlAuthority(id, url, authority,
            () => console.log('setUrlAuthority success'),
            err => me.display_err(err));
    }

    getRuntimeVersion() {
        appManager.getVersion( (val) => {
            this.setting.version = val;
        });
    }
}
