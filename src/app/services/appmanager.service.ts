import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { SettingService } from "./setting.service";
import { DomSanitizer } from '@angular/platform-browser';

declare let appManager: any;
let managerService = null;

enum MessageType {
    INTERNAL = 1,
    IN_RETURN = 2,
    IN_REFRESH = 3,

    EXTERNAL = 11,
    EX_LAUNCHER = 12,
    EX_INSTALL = 13,
    EX_RETURN = 14,
};

@Injectable({
    providedIn: 'root'
})
export class AppmanagerService {

    public appInfos: any = {};
    public appList: any = [];
    public runningList: any = [];
    public lastList: any = [];
    public rows: any = [];
    private currentLang: string = null;

    constructor(private translate: TranslateService,
        private setting: SettingService,
        private sanitizer: DomSanitizer,
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
        this.getAppInfos();
        this.getRunningList();
        this.getLastList();
        // alert(screen.width + " + " + document.documentElement.clientWidth + " + " + window.innerWidth + " " + window.devicePixelRatio);
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);;
    }

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    display_err(err) {
        appManager.alertPrompt("Error", err);
    }

    onLangChange(code: string) {
        this.changeInfosLanguage(this.translate.currentLang)
    }

    changeInfosLanguage(lang: string) {
        if (this.currentLang == lang || lang == null || this.appList.length < 1) return;

        for (var id in this.appInfos) {
            var locale = this.appInfos[id].locales[this.appInfos[id].defaultLocale];
            if (typeof(locale) != "object") continue;

            locale = this.appInfos[id].locales[lang];
            if (typeof(locale) != "object") {
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
            ret => {
                console.log(ret);
                me.setting.setDefaultLang(ret.defaultLang);
                me.setting.setSystemLang(ret.systemLang);
            },
            err => me.print_err(err)
        );
    }

    launcher() {
        appManager.launcher();
    }

    start(id: string) {
        appManager.start(id);
    }

    close(id: string) {
        appManager.close(id);
    }

    install(url: string) {
        var me = this;
        appManager.install(url,
            ret => {
                console.log(ret);
            },
            err => me.display_err(err)
        );
    }

    async presentAlertConfirm(url: string) {
        var me = this;
        const alert = await this.alertController.create({
            header: '<div class="permission-warning">' + me.translate.instant("install-prompt") + '</div>',
            message: "<div>" + + me.translate.instant("install-soon") + ": " + url + "</div>",
            buttons: [
                {
                    text: me.translate.instant("cancel"),
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                    }
                },
                {
                    text: me.translate.instant("ok"),
                    handler: () => {
                        me.install(url);
                    }
                }
            ]
        });

        await alert.present();
    }

    askInstall(url: string) {
        appManager.askPrompt(this.translate.instant("install-prompt"),
            this.translate.instant("install-soon") + ": " + url,
            () => this.install(url));
        // this.presentAlertConfirm(url).then();
    }

    unInstall(id: string, success: any, error: any) {
        var me = this;
        appManager.unInstall(id,
            ret => success(ret),
            err => {if (error != null)
                        error(err);
                    else
                        me.presentAlertError(err);});
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
        if (typeof (params) == "string") {
            params = JSON.parse(params);
        }
        console.log(params);
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case "started":
                    case "clsoed":
                        managerService.getRunningList();
                        break;
                    case "installed":
                    case "unInstalled":
                    case "authorityChanged":
                        managerService.getAppInfos();
                        break;
                }
                break;
            case MessageType.EX_INSTALL:
                managerService.askInstall(params.uri);
                break;
        }
    }

    getRows(size) {
        this.rows = [];
        for (var i = 0; i < this.appList.length; i += size) {
            this.rows.push(this.appList.slice(i, i + size));
        }
    }

    getAppInfos()/*: Promise<any> */ {
        console.log("AppmanagerService getAppInfos");
        let me = this;
        appManager.getAppInfos(
            ret => {
                console.log(ret);
                me.appInfos = ret.infos;
                // for (var id in me.appInfos) {
                //     me.appInfos[id].icons[0].src = me.sanitize(me.appInfos[id].icons[0].src);
                // }
                me.appList = ret.list;
                me.getRows(4);
                me.changeInfosLanguage(this.setting.currentLang);
            },
            err => me.display_err(err));
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

    setPluginAuthority(id: string, plugin: string, authority: number) {
        var me = this;
        appManager.setPluginAuthority(id, plugin, authority,
            ret => console.log(ret),
            err => me.display_err(err));
    }

    setUrlAuthority(id: string, url: string, authority: number) {
        var me = this;
        appManager.setUrlAuthority(id, url, authority,
            ret => console.log(ret),
            err => me.display_err(err));
    }
}
