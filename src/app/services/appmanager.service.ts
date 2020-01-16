import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController } from '@ionic/angular';
import { SettingService } from './setting.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DappStoreApp, Dapp } from '../models/dapps.model';
import { StorageService } from './storage.service';

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

    /* Apps list */
    public appInfos: AppManagerPlugin.AppInfo[] = [];
    public allApps: Dapp[] = [];
    public installedApps: Dapp[] = [];
    public nativeApps: Dapp[] = [];
    public browsedApps: Dapp[] = [];

    public appList: string[] = [];

    /* For install progress bar */
    public installing = false;
    private storeFetched = false;

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

    init() {
        this.getAppInfos();
        this.getRunningList();
        this.getLastList();

        console.log('AppmanagerService init');
        appManager.setListener(this.onReceive);

        if (this.platform.platforms().indexOf('cordova') >= 0) {
            console.log('Listening to intent events');
            appManager.setIntentListener(
              this.onReceiveIntent
            );
        }
        // this.getLanguage();
        // this.getRuntimeVersion();
    }

    ////////////////////////////// Listener //////////////////////////////

    // Intent listener
    onReceiveIntent = (ret) => {
        switch (ret.action) {
            case 'app':
                console.log('App intent recieved', ret);
                this.handledIntentId = ret.intentId;
                this.findApp(ret.params.id);
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
                        break;
                    case 'closed':
                        managerService.getRunningList();
                        break;
                    case 'unInstalled':
                        managerService.appUninstalled(params.id);
                        managerService.getAppInfos(true);
                        break;
                    case 'installed':
                        managerService.appInstalled(params.id);
                        managerService.getAppInfos(true);
                        break;
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

    // Get favorite apps
    getFavApps(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.storage.getFavApps().then(apps => {
                console.log('Fetched favorite apps', apps);
                resolve(apps);
            });
        });
    }

    getBrowsedApps(): Promise<Dapp[]> {
        return new Promise((resolve, reject) => {
            this.storage.getBrowsedApps().then(apps => {
                console.log('Fetched browsing history', apps);
                resolve(apps);
            });
        });
    }

    // Get installed app info
    async getAppInfos() {
        let favorites: string[] = await this.getFavApps();
        let history: Dapp[] = await this.getBrowsedApps();

        this.installedApps = [];
        this.nativeApps = [];

        appManager.getAppInfos((info) => {
            console.log('App infos', info);
            this.appInfos = Object.values(info);
            this.appInfos.map(app => {

                this.allApps.push({
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
                    isFav: favorites.includes(app.id) ? true : false,
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
                        isFav: favorites.includes(app.id) ? true : false,
                    });
                }
            });
        });

        if (history.length > 0) {
            this.browsedApps = history;
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

    ////////////////////////////// App install //////////////////////////////

    // Check if app recieved from intent is installed or needs updating before starting app
    findApp(id: string) {
        this.zone.run(() => {
            console.log('From intent', + id);
            this.installing = true;
            this.storeFetched = false;
            let targetApp: AppManagerPlugin.AppInfo = this.appInfos.find(app => app.id === id);
            if (targetApp) {
                this.http.get<any>('https://dapp-store.elastos.org/apps/' + id + '/manifest').subscribe((storeApp: any) => {
                    console.log('Got app!', storeApp);
                    if (storeApp.version === targetApp.version) {
                        console.log(storeApp.id + ' ' + storeApp.version + ' is up to date and starting');
                        this.installing = false;
                        this.storeFetched = true;
                        appManager.start(id);
                    } else {
                        console.log(
                            'Update available for', id +
                            ' Old Version:' + targetApp.version +
                            ' New version:' + storeApp.version
                        );
                        this.intentInstall(id);
                    }
                });
            } else {
                console.log(id + ' is not installed');
                this.intentInstall(id);
            }

            setTimeout(() => {
                if (!this.storeFetched) {
                    console.log('Store server failed to respond');
                    this.installing = false;
                }
            }, 10000);
        });
    }

    // Test Install
    async intentInstall(id) {
        console.log('Downloading...' + id);
        const epkPath = await this.downloadDapp(id);
        console.log('EPK file downloaded and saved to ' + epkPath);
        this.installApp(epkPath, id);
    }

    installApp(epk, id) {
        console.log('Installing...' + id);

        /* BUG TRACED HERE: After inquiring app for install, appManager installs the WRONG APP */
        appManager.install(
            epk, true,
            (ret) => {
                this.installing = false;
                this.storeFetched = true;
                appManager.start(id);
                console.log('Success', ret);
            },
            (err) => {
                this.installing = false;
                this.storeFetched = true;
                console.log('Error', err);
            }
        );
    }

    downloadDapp(id) {
        console.log('App download starting...' + id);

        return new Promise((resolve, reject) => {
            // Download EPK file as blob
            this.http.get('https://dapp-store.elastos.org/apps/' + id + '/download', {
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
            if (bookmarkedApps.length > 10) {
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
        console.log('Adding to browsing history', paramsId);
        let targetApp: Dapp = this.allApps.find(app => app.id === paramsId);
        this.browsedApps.unshift(targetApp);
        this.removeDuplicates(this.browsedApps);
    }

    // Remove any duplicated objects and sort list by latest viewed app
    removeDuplicates(apps) {
        this.browsedApps = apps.reduce((_apps, current) => {
            const x = _apps.find(app => app.id === current.id);
            if (!x) {
                return _apps.concat([current]);
            } else {
                return _apps;
            }
        }, []);
        this.storage.setBrowsedApps(this.browsedApps);
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

     ////////////////////////////// Alerts //////////////////////////////

    installToast(msg: string = ''): void {
        this.toastCtrl.create({
            mode: 'ios',
            message: msg,
            color: 'success',
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




