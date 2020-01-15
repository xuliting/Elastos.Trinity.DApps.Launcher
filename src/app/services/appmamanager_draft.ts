import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController } from '@ionic/angular';
import { SettingService } from './setting.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DappStoreApp, Dapp } from '../models/dapps.model';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';

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
    public installedApps: Dapp[] = [];
    public nativeApps: Dapp[] = [];
    public browsedApps: Dapp[] = [];

    public appList: string[] = [];
    public favApps: string[] = [];

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
        private storage: StorageService,
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
        /* this.http.get<any>('https://dapp-store.elastos.org/apps/' + 'org.elastos.trinity.dapp.friends' + '/manifest').subscribe((manifest: any) => {
            console.log('Got app!', manifest);
        }); */

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

    ////////////////////////////// Listener //////////////////////////////

    // Intent listener
    onReceiveIntent = (ret) => {
        console.log('Intent received', ret);

        switch (ret.action) {
            case 'app':
                console.log('app intent recieved', ret);
                this.handledIntentId = ret.intentId;
                this.intentInstall(ret.params.app);
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
                        managerService.addToHistory(params.id);
                    case 'closed':
                        managerService.getRunningList();
                        break;
                    case 'installed':
                        managerService.appInstalled(params.id);
                    case 'unInstalled':
                        managerService.appUninstalled(params.id);
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

    ////////////////////////////// App install //////////////////////////////

    // Only used to fetch app id ex: "5e19e87a9c3b5c723847886d" if intent doesn't provide it
    fetchDappId() {
        console.log("Fetching DApps");
        let dapps: DappStoreApp[] = [];
        this.http.get<[]>('https://dapp-store.elastos.org/apps/list').subscribe((response: DappStoreApp[]) => {
            dapps = dapps.concat(response);
            console.log("DApps from store server", dapps);
            dapps.map(dapp => {
                if (dapp.packageName === "org.elastos.trinity.dapp.dposvoting") {
                    console.log(dapp, 'App matches');
                    this.intentInstall(dapp);
                }
            });
        });
    }

    // Test Install
    async intentInstall(dapp) {
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
        console.log(dapp, 'App download starting...');

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

    installToast(msg: string = ''): void {
        this.toastCtrl.create({
            mode: 'ios',
            message: msg,
            color: '',
            duration: 4000,
            position: 'top'
        }).then(toast => toast.present());
    }

    uninstallToast(msg: string = ''): void {
        this.toastCtrl.create({
            mode: 'ios',
            message: msg,
            color: 'danger',
            duration: 4000,
            position: 'top'
        }).then(toast => toast.present());
    }

    appInstalled(id: string) {
        let msg = "'" + id + "' " + this.translate.instant('installed');
        this.installToast(msg);
    }

    appUninstalled(id: string) {
        let msg = "'" + id + "' " + this.translate.instant('uninstalled');
        this.uninstallToast(msg);
    }

    ////////////////////////////// Fetch Installed Apps //////////////////////////////

    // Get favorite apps
    getFavApps(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.storage.getFavApps().then(apps => {
                console.log('Fetching favorite apps');
                resolve(apps);
            });
        });
    }

    // Get installed app info
    async getAppInfos() {
        this.favApps = await this.getFavApps();
        let apps: Dapp[] = [];
        this.installedApps = [];
        this.nativeApps = [];

        appManager.getAppInfos((info) => {
            console.log('App infos', info);
            this.appInfos = Object.values(info);
            this.appInfos.map(app => {

                apps.push({
                    id: app.id,
                    version: app.version,
                    name: app.name,
                    shortName: app.shortName,
                    description: app.description,
                    startUrl: app.startUrl,
                    icons: app.icons,
                    authorName: app.authorName,
                    authorEmail: app.authorEmail,
                    category: app.category,
                    urls: app.urls,
                    isFav: false,
                });

                if (
                    app.id === 'org.elastos.trinity.dapp.did' ||
                    app.id ===  'org.elastos.trinity.dapp.qrcodescanner' ||
                    app.id === 'org.elastos.trinity.dapp.wallet' ||
                    app.id === 'org.elastos.trinity.blockchain' ||
                    app.id === 'org.elastos.trinity.dapp.installer'
                ) {
                    this.nativeApps.push({
                        id: app.id,
                        version: app.version,
                        name: app.name,
                        shortName: app.shortName,
                        description: app.description,
                        startUrl: app.startUrl,
                        icons: app.icons,
                        authorName: app.authorName,
                        authorEmail: app.authorEmail,
                        category: app.category,
                        urls: app.urls,
                        isFav: false,
                    });
                } else {
                    this.installedApps.unshift({
                        id: app.id,
                        version: app.version,
                        name: app.name,
                        shortName: app.shortName,
                        description: app.description,
                        startUrl: app.startUrl,
                        icons: app.icons,
                        authorName: app.authorName,
                        authorEmail: app.authorEmail,
                        category: app.category,
                        urls: app.urls,
                        isFav: false,
                    });
                }
            });
        });

        if (this.favApps.length > 0) {
            this.favApps.map(favApp => {
                this.installedApps.map(installedApp => {
                    if (installedApp.id === favApp) {
                        installedApp.isFav = true;
                    }
                });
            });
        }
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

    ////////////////////////////// Uninstall last bookmarked app //////////////////////////////
    uninstallApp(): Promise<string> {
        let bookmarkedApps: Dapp[] = [];
        this.installedApps.map(app => {
            if (app.isFav) {
                return;
            } else {
                bookmarkedApps.push(app);
            }
        });
        console.log('Candidates for uninstall', bookmarkedApps, bookmarkedApps.length);

        return new Promise((resolve, reject) => {
            if (bookmarkedApps.length > 4) {
                console.log('Uninstalling..', bookmarkedApps[bookmarkedApps.length - 1]);
                appManager.unInstall(
                    bookmarkedApps[bookmarkedApps.length - 1].id,
                    (res) => {
                        console.log('Uninstall Success', bookmarkedApps[bookmarkedApps.length - 1].id);
                        this.installedApps.filter(app => app.id === bookmarkedApps[bookmarkedApps.length - 1].id);
                        resolve(bookmarkedApps[bookmarkedApps.length - 1].id);
                    },
                    (err) => console.log(err));
            }
        });
    }

    ////////////////////////////// Browsing history  //////////////////////////////
    addToHistory(paramsId) {
        console.log('Adding to browsing history');
        this.installedApps.map(app => {
            if (app.id === paramsId) {
                this.browsedApps.unshift(app);
            }
        });

        // Remove any duplicated apps + sort browsing list by latest viewed apps;
        this.browsedApps = this.browsedApps.filter((app, index) => this.browsedApps.indexOf(app) === index);
    }

    ////////////////////////////// Intent actions //////////////////////////////
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

    /*****************************TO DO*********************************/

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    display_err(err) {
        appManager.alertPrompt("Error", err);
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
