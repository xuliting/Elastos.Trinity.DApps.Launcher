import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController, PopoverController, MenuController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

import { Dapp } from '../models/dapps.model';
import { StorageService } from './storage.service';
import { RunningAppsComponent } from '../components/running-apps/running-apps.component';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

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

    /* For install progress bar */
    public progressValue = 0;
    public checkingApp = false;
    private appChecked = false;
    private checkedApps: string[] = [];

    /* Running manager */
    public popup = false;
    public runningList: any = [];
    public lastList: any = [];
    public rows: any = [];

    /* Languages */
    private currentLang: string = null;
    private supportedLanguage: string[] = ['en', 'zh'];

    private handledIntentId: number;

    constructor(
        private platform: Platform,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        public zone: NgZone,
        public toastCtrl: ToastController,
        public alertController: AlertController,
        public popoverController: PopoverController,
        public menuCtrl: MenuController,
        private translate: TranslateService,
        private storage: StorageService,
    ) {}

    init() {
        this.getAppInfos();
        this.getRunningList();
        this.getLastList();

        console.log('AppmanagerService init');
        appManager.setListener((ret) => {
            this.onReceiveInternal(ret);
        });

        if (this.platform.platforms().indexOf('cordova') >= 0) {
            console.log('Listening to intent events');
            appManager.setIntentListener((ret) => {
              this.onReceiveExternal(ret);
            });
        }

        // Empty checked apps every hour
        setInterval(() => {
            this.checkedApps = [];
        }, 3600000);
    }

    /******************************** Intent Listener ********************************/

    // External
    onReceiveExternal(ret) {
        console.log('Received external intent', ret);
        switch (ret.action) {
            case 'app':
                console.log('App intent', ret);
                this.handledIntentId = ret.intentId;
                this.findApp(ret.params.id);
        }
    }

    // Internal
    onReceiveInternal(ret) {
        console.log('Received internal intent', ret);
        console.log('ElastosJS  HomePage receive message:' + ret.message + '. type: ' + ret.type + '. from: ' + ret.from);

        let params: any = ret.message;
        if (typeof (params) === 'string') {
            try {
                params = JSON.parse(params);
            } catch (e) {
                console.log('Params are not JSON format: ', params);
            }
        }
        console.log(params);
        switch (ret.type) {
            case MessageType.INTERNAL:
                switch (params.action) {
                    case 'toggle':
                        this.popRunningManager();
                        break;
                }
                switch (params.visible) {
                    case 'show':
                        console.log('App visibility:', params.visible);
                        this.resetProgress();
                        break;
                }
                switch (ret.message) {
                    case 'menu-toggle':
                    this.menuCtrl.toggle();
                    break;
                }
                break;

            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'started':
                        // titleBarManager.setTitle(params.name);
                        this.addToHistory(params.id);
                        this.checkedApps.push(params.id);
                        break;
                    case 'closed':
                        if (this.popup) {
                            this.popoverController.dismiss();
                        }
                        this.resetProgress();
                        // titleBarManager.setTitle('');
                        // this.findBookmark(params.id);
                        break;
                    case 'unInstalled':
                        // this.appUninstalled(params.id);
                        this.getAppInfos();
                        break;
                    case 'installed':
                        // this.appInstalled(params.id);
                        this.getAppInfos();
                        break;
                    case 'initiated':
                        this.getAppInfos();
                        break;
                    case 'authorityChanged':
                        this.getAppInfos();
                        break;
                    case 'currentLocaleChanged':
                        break;
                    case "launcher_upgraded":
                        break;
                }
                break;

            // EPK installation from the CLI - Message received by the runtime.
            case MessageType.EX_INSTALL:
                this.installApp(params.uri, params.id);
                break;
        }
    }

    /******************************** Fetch Apps ********************************/

    // Fetch stored apps
    getFavApps(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.storage.getFavApps().then(apps => {
                console.log('Fetched favorite apps', apps);
                resolve(apps || []);
            });
        });
    }

    getBookmarkedApps(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.storage.getBookmarkedApps().then(apps => {
                console.log('Fetched bookmarked apps', apps);
                resolve(apps || []);
            });
        });
    }

    getBrowsedApps(): Promise<Dapp[]> {
        return new Promise((resolve, reject) => {
            this.storage.getBrowsedApps().then(apps => {
                console.log('Fetched browsing history', apps);
                resolve(apps || []);
            });
        });
    }

    // Get installed app info
    async getAppInfos() {
        let favorites: string[] = await this.getFavApps();
        let bookmarks: string[] = await this.getBookmarkedApps();
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
                    isBookmarked: bookmarks.includes(app.id) ? true : false
                });

                if (
                    app.id ===  'org.elastos.trinity.dapp.qrcodescanner' ||
                    app.id === 'org.elastos.trinity.dapp.wallet' ||
                    app.id === 'org.elastos.trinity.dapp.did' ||
                    app.id === 'org.elastos.trinity.dapp.friends' ||
                    app.id === 'org.elastos.trinity.dapp.dposvoting' ||
                    app.id === 'org.elastos.trinity.dapp.settings' ||
                    app.id === 'org.elastos.trinity.blockchain'
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
                        isBookmarked: false,
                    });
                } else if (app.id === 'org.elastos.trinity.dapp.installer') {
                    return;
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
                        isBookmarked: bookmarks.includes(app.id) ? true : false
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

    /******************************** App Install ********************************/
    findApp(id: string) {
        console.log('Finding app', id);
        this.zone.run(() => {

            // Initial conditions for app load progress
            this.checkingApp = true;
            this.appChecked = false;

            // Start progress bar
            this.progressValue = 1;
            titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.DOWNLOAD);

            // Check if app is installed or needs updating before starting app
            const targetApp: AppManagerPlugin.AppInfo = this.appInfos.find(app => app.id === id);

            // Check if app was opened the past hour, if not proceed, else automatically start
            if (targetApp && !this.checkedApps.includes(id)) {
                this.http.get<any>('https://dapp-store.elastos.org/apps/' + id + '/manifest').subscribe((storeApp: any) => {
                    console.log('Got app!', storeApp);
                    if (storeApp.version === targetApp.version) {
                        console.log(storeApp.id + ' ' + storeApp.version + ' is up to date and starting');
                        this.appChecked = true;
                        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.LAUNCH);
                        appManager.start(id);
                    } else {
                        console.log(
                            'Versions are different', id +
                            ' Installed Version:' + targetApp.version +
                            ' Store version:' + storeApp.version
                        );
                        this.checkVersion(targetApp.version, storeApp.version, targetApp.id);
                    }
                }, (err) => {
                    console.log('Can\'t find matching app in store server', err);
                    this.appChecked = true;
                    appManager.start(id);
                });
            } else if (targetApp && this.checkedApps.includes(id)) {
                console.log('App already checked the past hour and starting', id);
                console.log('Checked apps', this.checkedApps);
                this.appChecked = true;
                appManager.start(id);
            } else {
                console.log(id + ' is not installed');
                this.intentInstall(id);
            }

            setTimeout(() => {
                if (!this.appChecked) {
                    console.log('App failed to start in time, something went wrong with store server or download process');
                    this.checkingApp = false;
                    this.resetProgress();
                    this.appStartErrToast();
                }
            }, 20000);
        });
    }

    /*
        Since versions aren't numbers nor can they be converted,
        we need to loop through each number of each version and compare them
    */
    checkVersion(installedVer: string, storeVer: string, appId: string) {
        const current = installedVer.split('.');
        const fetched = storeVer.split('.');
        for (let i = 0; i < storeVer.length; i++) {
            const installedApp: number = parseInt(current[i]) || 0;
            const storeApp: number = parseInt(fetched[i]) || 0;
            if (storeApp > installedApp) {
                this.intentInstall(appId); // If store version is newer, install
            }
            if (storeApp < installedApp) {
                this.appChecked = true;
                appManager.start(appId); // If store version is older, start app
            }
        }
    }

    // Test Install
    async intentInstall(id: string) {
        console.log('Downloading...' + id);
        const epkPath = await this.downloadDapp(id);
        console.log('EPK file downloaded and saved to ' + epkPath);
        this.installApp(epkPath, id);
    }

    installApp(epk: any, id: string) {
        console.log('Installing...' + id);

        /* BUG TRACED HERE: After inquiring app for install, appManager installs the WRONG APP */
        appManager.install(
            epk, true,
            (ret) => {
                this.appChecked = true;
                appManager.start(id);
                console.log('Install success', ret);
            },
            (err) => {
                console.log('Error', err);
            }
        );
    }

    downloadDapp(id: string) {
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

    resetProgress() {
        this.checkingApp = false;
        this.progressValue = 0;
        titleBarManager.hideActivityIndicator(TitleBarPlugin.TitleBarActivityType.LAUNCH);
        titleBarManager.hideActivityIndicator(TitleBarPlugin.TitleBarActivityType.DOWNLOAD);
    }

    /******************************** Uninstall Last Installed App ********************************/
    uninstallApp() {
        let uninstallApps: Dapp[] = [];
        this.installedApps.map(app => {
            if (app.isFav || app.isBookmarked) {
                return;
            } else {
                uninstallApps.push(app);
            }
        });
        console.log('Candidates for uninstall', uninstallApps, uninstallApps.length);

        if (uninstallApps.length > 10) {
            console.log('Uninstalling..', uninstallApps[uninstallApps.length - 1]);
            appManager.unInstall(
                uninstallApps[uninstallApps.length - 1].id,
                (res) => {
                    console.log('Uninstall Success', uninstallApps[uninstallApps.length - 1].id);
                    this.installedApps.filter(app => app.id === uninstallApps[uninstallApps.length - 1].id);
                },
                (err) => console.log(err));
        }
    }

    /******************************** Favorites ********************************/
    getFavorites(): Dapp[] {
        let favorites: Dapp[] = [];
        this.installedApps.map(app => {
          if (app.isFav) {
            favorites.push(app);
          }
        });
        return favorites;
    }

    /******************************** Bookmarks ********************************/
    getBookmarks(): Dapp[] {
        let bookmarks: Dapp[] = [];
        this.installedApps.map(app => {
          if (app.isBookmarked) {
            bookmarks.push(app);
          }
        });
        return bookmarks;
    }

    findBookmark(id: string) {
        this.installedApps.map(app => {
            if (app.id === id && app.isBookmarked === false) {
                this.addBookmark(app);
            }
        });
    }

    async addBookmark(app: Dapp) {
        const alert = await this.alertController.create({
          header: app.name,
          message: 'Do you want to add this to your bookmarks?',
          mode: 'ios',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            }, {
              text: 'Okay',
              handler: () => {
                app.isBookmarked = true;
                this.storeBookmarks();
              }
            }
          ]
        });

        await alert.present();
    }

    storeBookmarks() {
        let bookmarks: string[] = [];
        this.installedApps.map(dapp => {
          if (dapp.isBookmarked) {
            bookmarks.push(dapp.id);
          }
        });

        this.storage.setBookmarkedApps(bookmarks);
    }

    /******************************** Browsing History ********************************/
    addToHistory(paramsId: string) {
        console.log('Adding to browsing history', paramsId);
        const targetApp: Dapp = this.installedApps.find(app => app.id === paramsId);
        if (!targetApp || targetApp.id === 'org.elastos.trinity.dapp.installer') {
            return;
        } else {
            this.browsedApps.unshift(targetApp);
            this.removeDuplicates(this.browsedApps);
        }
    }

    // Remove any duplicated objects and sort list by latest viewed app
    removeDuplicates(apps: Dapp[]) {
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

    /******************************** Running Manager ********************************/
    getRunningList(): Promise<void> {
        return new Promise((resolve, reject) => {
            appManager.getRunningList((list) => {
                console.log('Got running apps', list);
                this.runningList = list;
                resolve();
            });
        });
    }

    getLastList() {
        console.log('AppmanagerService getLastList');
        appManager.getLastList(list => this.lastList = list);
    }

    async popRunningManager() {
        await this.getRunningList();

        if (!this.popup) {
            this.popup = true;
            this.presentPopover();
        } else {
            this.popoverController.dismiss();
        }
    }

    async presentPopover() {
        const popover = await this.popoverController.create({
            component: RunningAppsComponent,
            componentProps: {
                apps: this.runningList
            },
            translucent: true,
        });
        popover.onDidDismiss().then(() => { this.popup = false; });
        return await popover.present();
    }

    /******************************** Intent Actions ********************************/
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

    /******************************** Language  ********************************/
    getLanguage() {
        var me = this;
        appManager.getLocale(
            (defaultLang, currentLang, systemLang) => {
                console.log('defaultLangL', defaultLang, ' currentLang:', currentLang, ' systemLang:', systemLang);
                if (!this.isSupportedLanguage(systemLang)) {
                    systemLang = 'en';
                }
                // TODO - RE-FIX ME - SETTINGS MOVED - me.setting.setDefaultLang(systemLang);
                // TODO - RE-FIX ME - SETTINGS MOVED - me.setting.setSystemLang(systemLang);
            }
        );
    }

    isSupportedLanguage(lang: string) {
        return this.supportedLanguage.indexOf(lang) === -1 ? false : true;
    }

    /******************************** Alerts/Toasts ********************************/
    appStartErrToast() {
        this.toastCtrl.create({
            mode: 'ios',
            header: 'Something went wrong',
            message: 'Can\'t start app at this time, please try again',
            color: 'primary',
            duration: 4000,
            position: 'bottom'
        }).then(toast => toast.present());
    }

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    /******************************** For Testing ********************************/
    async resetBrowserAlert() {
        const alert = await this.alertController.create({
            mode: 'ios',
            header: 'Are you sure?',
            message: 'Resetting your browser will erase your browsing history and favorites',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {}
                },
                {
                  text: 'Proceed',
                  handler: () => {
                    this.installedApps.forEach((app) => {
                        app.isFav = false;
                    });
                    this.allApps.forEach((app) => {
                        app.isFav = false;
                    });
                    this.resetProgress();
                    this.browsedApps = [];
                    this.storage.setFavApps([]);
                    this.storage.setBookmarkedApps([]);
                    this.storage.setBrowsedApps([]);
                  }
                }
              ]
        });
        alert.present();
    }
}




