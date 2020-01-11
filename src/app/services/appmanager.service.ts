import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController } from '@ionic/angular';
import { SettingService } from './setting.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Dapp } from '../models/dapps.model';

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

    /* Declared */
    public appInfos: AppManagerPlugin.AppInfo[] = [];
    public nativeApps: AppManagerPlugin.AppInfo[] = [];
    public appList: string[] = [];
    public runningList: any = [];
    public lastList: any = [];
    private handledIntentId: number;

    /* TO DO */
    public rows: any = [];
    private currentLang: string = null;

    constructor(
        private platform: Platform,
        private http: HttpClient,
        private translate: TranslateService,
        private setting: SettingService,
        private sanitizer: DomSanitizer,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private alertController: AlertController
    ) {
        managerService = this;

        this.translate.onLangChange.subscribe(data => {
            console.log('onLangChange');
            this.onLangChange(data.lang);
        });
    }

    get apps() {
        return [...this.appInfos];
    }

    get _nativeApps() {
        return [...this.nativeApps];
    }

    init() {
        console.log('AppmanagerService init');
        appManager.setListener(this.onReceive);

        if (this.platform.platforms().indexOf('cordova') >= 0) {
            console.log('Listening to intent events');
            appManager.setIntentListener(
              this.onReceiveIntent
            );
        }

        // this.fakeIntentInstall();

        this.getAppInfos();
        this.getRunningList();
        this.getLastList();
        // this.getLanguage();
        // this.getRuntimeVersion();
    }

    ////////////////////////////// App install //////////////////////////////

    fetchDappId() {
        console.log("Fetching DApps");
        let dapps: Dapp[] = [];
        this.http.get<[]>('https://dapp-store.elastos.org/apps/list').subscribe((response: Dapp[]) => {
            dapps = dapps.concat(response);
            console.log("DApps from store server", dapps);
            dapps.map(dapp => {
                if (dapp.packageName === "org.elastos.trinity.dapp.dposvoting") {
                    console.log("App matches", + dapp);
                    this.fakeIntentInstall(dapp);
                }
            });
        });
    }

    // Test Install
    async fakeIntentInstall(dapp) {
        const epkPath = await this.downloadDapp(dapp);
        console.log('EPK file downloaded and saved to ' + epkPath);
        this.installApp(epkPath, dapp);
    }

    installApp(epk, dapp) {
        console.log('Installing ' + dapp.packageName);
        appManager.install(
            epk, true,
            (ret) => {
                console.log(ret);
                this.installSuccess(dapp.name);
            },
            (err) => {
                console.log(err);
                this.installFailed(err, dapp.name);
            }
        );
    }

    async installSuccess(appName) {
        const toast = await this.toastCtrl.create({
          mode: 'ios',
          message: 'Installed ' + appName,
          color: 'primary',
          duration: 2000
        });
        toast.present();
    }

    async installFailed(err, appName) {
        const toast = await this.toastCtrl.create({
          mode: 'ios',
          header: 'Failed to install ' + appName,
          message: err,
          color: 'primary',
          duration: 2000
        });
        toast.present();
    }

    downloadDapp(dapp) {
        console.log('App download starting for', + dapp.packageName);

        return new Promise((resolve, reject) => {
            // Download EPK file as blob
            this.http.get('https://dapp-store.elastos.org/apps/' + dapp._id + '/download', {
                responseType: 'arraybuffer'} ).subscribe(async response => {
                console.log('Downloaded', response);
                let blob = new Blob([response], { type: 'application/octet-stream' });
                console.log('Blob', blob);

                // Save to a temporary location
                let filePath = await this._savedDownloadedBlobToTempLocation(blob);

                resolve(filePath);
            });
        });
    }

    _savedDownloadedBlobToTempLocation(blob) {
        let fileName = 'appinstall.epk';

        return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry: CordovaFilePlugin.DirectoryEntry) => {
                dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
                    console.log('Downloaded file entry', fileEntry);
                    fileEntry.createWriter((fileWriter) => {
                    fileWriter.write(blob);
                    resolve('trinity:///data/' + fileName);
                    }, (err) => {
                    console.error('createWriter ERROR - ' + JSON.stringify(err));
                    reject(err);
                    });
                }, (err) => {
                    console.error('getFile ERROR - ' + JSON.stringify(err));
                    reject(err);
                });
            }, (err) => {
                console.error('resolveLocalFileSystemURL ERROR - ' + JSON.stringify(err));
                reject(err);
            });
        });
    }

    ////////////////////////////// Listener //////////////////////////////

    // Intent listener
    onReceiveIntent = (ret) => {
        console.log('Intent received', ret);

        switch (ret.action) {
            case 'app':
                console.log('app intent recieved', ret);
                this.handledIntentId = ret.intentId;
        }
    }

    onReceive(ret) {
        console.log('ElastosJS  HomePage receive message:' + ret.message + '. type: ' + ret.type + '. from: ' + ret.from);

        let params: any = ret.message;
        if (typeof (params) === 'string') {
            params = JSON.parse(params);
        }
        console.log(params);
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'started':
                    case 'closed':
                        managerService.getRunningList();
                        break;
                    case 'installed':
                        managerService.toast_installed(params.id);
                    case 'unInstalled':
                    case 'initiated':
                        managerService.getAppInfos(true);
                        break;
                    case 'authorityChanged':
                        managerService.getAppInfos(false);
                        break;
                    case 'currentLocaleChanged':
                        break;
                }
                break;
            case MessageType.EX_INSTALL:
                managerService.install(params.uri, params.dev);
                break;
        }
    }

    ////////////////////////////// Fetch Installed Apps //////////////////////////////

    // Get app info
    getAppInfos() {
        appManager.getAppInfos((info) => {
            console.log('App infos', info);
            this.appInfos = Object.values(info);
            console.log('Installed apps', this.appInfos);

            this.appInfos.map(app => {
                if (
                    app.id === 'org.elastos.trinity.dapp.did' ||
                    app.id ===  'org.elastos.trinity.dapp.qrcodescanner' ||
                    app.id === 'org.elastos.trinity.dapp.wallet'
                ) {
                    this.nativeApps.push(app);
                }
            });

            const hiddenAppList: string[] = ['org.elastos.trinity.dapp.installer'];
            for (const id of hiddenAppList) {
                const index: number = this.appList.indexOf(id, 0);
                if (index > -1) {
                    this.appList.splice(index, 1);
                }
            }
        });
    }

    // Get app icon
    sanitize(url: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    getRunningList() {
        console.log('AppmanagerService getRunningList');
        appManager.getRunningList(list => this.runningList = list);
    }

    getLastList() {
        console.log('AppmanagerService getLastList');
        appManager.getLastList(list => this.lastList = list);
    }

    /*****************************TO DO*********************************/

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
                me.setting.setDefaultLang(defaultLang);
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

    getRows(size) {
        this.rows = [];
        for (let i = 0; i < this.appList.length; i += size) {
            this.rows.push(this.appList.slice(i, i + size));
        }
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
