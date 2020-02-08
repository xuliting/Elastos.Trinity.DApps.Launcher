import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController, PopoverController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DappStoreApp, Dapp } from '../models/dapps.model';
import { StorageService } from './storage.service';
import { RunningManagerComponent } from '../components/running-manager/running-manager.component';

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

    /* Running manager */
    public popup = false;
    public runningList: any = [];
    public lastList: any = [];
    private handledIntentId: number;

    constructor(
        private platform: Platform,
        private http: HttpClient,
        private translate: TranslateService,
        private storage: StorageService,
        private sanitizer: DomSanitizer,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private alertController: AlertController,
        public popoverController: PopoverController,
    ) {
        managerService = this;
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

    onReceive = (ret) => {
        console.log('onReceive', ret);
        console.log('ElastosJS  HomePage receive message:' + ret.message + '. type: ' + ret.type + '. from: ' + ret.from);

        let params: any = ret.message;
        if (typeof (params) === 'string') {
            try {
                params = JSON.parse(params);
            } catch (e) {
                // JSON exception? Not JSON format?
                console.log('Params are not JSON format: ', params);
            }
        }
        console.log(params);
        switch (ret.type) {
            case MessageType.INTERNAL:
                switch (params.action) {
                    case 'toggle':
                        // console.log('Showing toggled apps');
                        // this.popRunningManager(Event);
                        break;
                }
                break;

            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'started':
                        managerService.addToHistory(params.id);
                        break;
                    case 'closed':
                        managerService.getRunningList();
                        managerService.getBookmarks(params.id);
                        break;
                    case 'unInstalled':
                        // managerService.appUninstalled(params.id);
                        managerService.getAppInfos(true);
                        break;
                    case 'installed':
                        // managerService.appInstalled(params.id);
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
                        isBookmarked: false,
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

            // TMP BPI TEST
          /*   let fakeProgressValue = 0;
            appManager.setTitleBarProgress(0);
            let fakeProgressTimer = setInterval(()=>{
                fakeProgressValue += 4;
                appManager.setTitleBarProgress(fakeProgressValue);
            }, 50); */

            let targetApp: AppManagerPlugin.AppInfo = this.appInfos.find(app => app.id === id);
            if (targetApp) {
                this.http.get<any>('https://dapp-store.elastos.org/apps/' + id + '/manifest').subscribe((storeApp: any) => {
                    console.log('Got app!', storeApp);

                    // TMP BPI TEST
                    /* clearInterval(fakeProgressTimer);
                    appManager.hideTitleBarProgress(); */

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
                }, (err) => {
                    console.log('Can\'t find matching app in store server', err);
                    appManager.start(id);
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

    ////////////////////////////// Uninstall last installed app //////////////////////////////
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

    ////////////////////////////// Bookmarks //////////////////////////////
    getBookmarks(id: string) {
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

    ////////////////////////////// Browsing history  //////////////////////////////
    addToHistory(paramsId: string) {
        console.log('Adding to browsing history', paramsId);
        let targetApp: Dapp = this.allApps.find(app => app.id === paramsId);
        this.browsedApps.unshift(targetApp);
        this.removeDuplicates(this.browsedApps);
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

     ////////////////////////////// Running Manager //////////////////////////////
    popRunningManager(ev: any) {
        console.log(this.runningList);
        this.popup = true;
        this.presentPopover(ev);
    }

    async presentPopover(ev) {
        const popover = await this.popoverController.create({
            component: RunningManagerComponent,
            translucent: true,
            event: ev,
            cssClass: 'my-custom-popup'
        });
        popover.onDidDismiss().then(() => { this.popup = false; });
        return await popover.present();
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

    // Only used for testing
    appInstalled(id: string) {
        let msg = "'" + id + "' " + this.translate.instant('installed');
        this.installToast(msg);
    }

    // Only uses for testing
    appUninstalled(id: string) {
        let msg = "'" + id + "' " + this.translate.instant('uninstalled');
        this.uninstallToast(msg);
    }

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    ////////////////////////////// For Testing //////////////////////////////
    removeApp(app) {
        appManager.unInstall(
            app.id,
            (res) => {
                console.log('Uninstall Success', app);
                this.installedApps = this.installedApps.filter(dapp => dapp.id === app.id);
                this.allApps = this.allApps.filter(dapp => dapp.id === app.id);
            },
            (err) => console.log(err)
        );
    }
}




