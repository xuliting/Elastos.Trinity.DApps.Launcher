import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController, PopoverController, MenuController, NavController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Dapp } from '../models/dapps.model';

import { RunningAppsComponent } from '../components/running-apps/running-apps.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';

import { NotificationManagerService } from './notificationmanager.service';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { resolve } from 'dns';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;
declare let notificationManager;

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

    /* Native apps */
    public nativeApps: Dapp[] = [];

    /* 3rd party apps */
    public installedApps: Dapp[] = [];
    public browsedApps: Dapp[] = [];
    public favApps: Dapp[] = [];

    /* Background apps */
    public popup = false;
    public runningList: any = [];

    /* For install progress bar */
    public checkingApp = false;
    private storeChecked = false;
    private updateApps: string[] = [];

    /* Languages */
    private currentLang: string = null;
    private supportedLanguage: string[] = ['en', 'zh'];

    /* Onboard */
    private firstVisit = false;

    /* Intent */
    private handledIntentId: Number;

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
        private navController: NavController,
        private router: Router,
        private theme: ThemeService,
        private notification: NotificationManagerService
    ) { }

    init() {
        this.initTranslateConfig();
        this.resetProgress();
        this.getVisit();
        this.getLanguage();
        this.getCurrentNet();
        this.getRunningApps();
        this.getAppInfos();

        console.log('AppmanagerService init');
        appManager.setListener((ret) => {
            this.onMessageReceived(ret);
        });

        console.log('Listening to intent events');
        appManager.setIntentListener((ret) => {
            this.onIntentReceived(ret);
        });

        titleBarManager.addOnItemClickedListener((menuItem) => {
            this.onTitleBarItemClicked(menuItem);
        });
    }

    getVisit() {
        this.storage.getVisit().then(data => {
            if (data || data === true) {
                this.firstVisit = false;
                console.log('First visit?', this.firstVisit);
            } else {
                this.router.navigate(['onboard']);
            }
        });
    }

    /******************************** Intent Listener ********************************/

    // Intent
    onIntentReceived(ret: AppManagerPlugin.ReceivedIntent) {
        console.log('Received external intent', ret);
        switch (ret.action) {
            case 'app':
                console.log('App intent', ret);
                this.handledIntentId = ret.intentId;
                this.findApp(ret.params.id);
        }
    }

    // Message
    async onMessageReceived(ret: AppManagerPlugin.ReceivedMessage) {
        console.log('Elastos launcher received message:' + ret.message + '. type: ' + ret.type + '. from: ' + ret.from);

        let params: any = ret.message;
        if (typeof (params) === 'string') {
            try {
                params = JSON.parse(params);
            } catch (e) {
                console.log('Params are not JSON format: ', params);
            }
        }
        console.log(JSON.stringify(params));
        switch (ret.type) {
            case MessageType.INTERNAL:
                switch (params.action) {
                    case 'toggle':
                        break;
                    case 'minimize':
                        this.resetProgress();
                        break;
                }
                switch (params.visible) {
                    case 'show':
                        this.resetProgress();
                        break;
                }
                switch (ret.message) {
                    case 'navback':
                        // Navigate back in opened app
                        this.navController.back();
                        break;
                }
                break;

            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'started':
                        // titleBarManager.setTitle(params.name);

                        // Add started app to history
                        this.addToHistory(params.id);
                        break;
                    case 'closed':
                        /* if (this.popup) {
                            this.popoverController.dismiss();
                        } */
                        this.resetProgress();
                        break;
                    case 'unInstalled':
                        break;
                    case 'installed':
                        this.genericToast("Capsule added: " + params.id, 5000);
                        break;
                    case 'initiated':
                        this.getAppInfos();
                        break;
                    case 'authorityChanged':
                        this.getAppInfos();
                        break;
                    case 'currentLocaleChanged':
                        this.getLanguage();
                        break;
                    case 'launcher_upgraded':
                        this.genericToast("Launcher capsule has been upgraded. PLEASE RESTART", 5000);
                        break;
                    case 'preferenceChanged':
                        if (params.data.key === "ui.darkmode") {
                            this.zone.run(() => {
                                this.handleDarkModeChange(params.data.value);
                            });
                        }
                        if (params.data.key === "chain.network.type") {
                            this.getCurrentNet();
                        }
                        break;
                }
                break;

            // EPK installation from the CLI - Message received by the runtime.
            case MessageType.EX_INSTALL:
                appManager.askPrompt('', 'Install this dapp for development?', () => {
                    this.installApp(params.uri, params.id, false);
                });
                break;
        }
    }

    onTitleBarItemClicked(icon: TitleBarPlugin.TitleBarIcon) {
        switch (icon.key) {
            case 'notifications':
                // Toggles the notifications panel on/off
                this.popNotifications();
                break;
            case 'runningapps':
                // Launch the running list
                this.popRunningApps();
                break;
            case 'scan':
                // Launch the scanner app
                this.findApp("org.elastos.trinity.dapp.qrcodescanner");
                break;
            case 'settings':
                // Launch the settings app
                this.findApp("org.elastos.trinity.dapp.settings");
                break;
        }
    }

    /******************************** Fetch Apps ********************************/

    // Fetch stored apps
    getFavApps(): Promise<Dapp[]> {
        return new Promise((resolve, reject) => {
            this.storage.getFavApps().then(apps => {
                console.log('Fetched favorite apps', apps);
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
        this.favApps = await this.getFavApps();
        this.browsedApps = await this.getBrowsedApps();

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
                    isFav: null
                });

                if (
                    app.id === 'org.elastos.trinity.dapp.qrcodescanner' ||
                    app.id === 'org.elastos.trinity.dapp.wallet' ||
                    app.id === 'org.elastos.trinity.dapp.did' ||
                    app.id === 'org.elastos.trinity.dapp.friends' ||
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
                        isFav: null,
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
                        isFav: null
                    });
                }
            });

            this.checkForUpdates();
        });

        if (this.favApps.length < 36) {
            for (let i = this.favApps.length; i < 36; i++) {
                this.favApps.push({
                    id: 'emptyFav',
                    version: null,
                    name: 'Favorite',
                    shortName: null,
                    description: null,
                    startUrl: null,
                    icons: null,
                    authorName: null,
                    authorEmail: null,
                    category: null,
                    urls: null,
                    isFav: null,
                });
            }
        }
    }

    checkForUpdates() {
        if (!this.storeChecked) {
            this.updateApps = [];
            this.storeChecked = true;
            this.appInfos.forEach((app) => {
                this.http.get<any>('https://dapp-store.elastos.org/apps/' + app.id + '/manifest').subscribe((storeApp: any) => {
                    console.log('Got app!', storeApp);

                    let currentVersion = app.versionCode;
                    let storeVersion = storeApp.version_code;
                    if (storeVersion === currentVersion) {
                        console.log(app.id + ', version ' + currentVersion + ' is up to date');
                    } else if (storeApp.version_code < currentVersion) {
                        console.log(app.id + ', version ' + currentVersion + ' is higher than store version ' + storeVersion);
                    } else {
                        console.log(app.id + ', version ' + currentVersion + ' is lower than store version ' + storeVersion);
                        this.updateApps.push(app.id);
                    }
                }, (err) => {
                    console.error('Can\'t find matching app in store server', err);
                });
            });
        } else {
            console.log('Apps already checked for updates');
            return;
        }
    }

    // Get app icon
    sanitize(url: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    /******************************** App Install ********************************/
    findApp(id: string) {
        console.log('Finding app', id);
        console.log('Apps that needs update', this.updateApps);
        this.zone.run(() => {
            // Initial conditions for app load progress
            this.checkingApp = true;

            // Check if app is installed or needs updating before starting app
            const targetApp: AppManagerPlugin.AppInfo = this.appInfos.find(app => app.id === id);

            // Check if app is not installed or needs updating, if not proceed, else automatically start
            if (targetApp && !this.updateApps.includes(id)) {
                this.startApp(id);
            } else if (targetApp && this.updateApps.includes(id)) {
                console.log(id + 'is installed but needs update');
                this.intentInstall(id, true).then(() => {
                    this.updateApps = this.updateApps.filter((appId) => appId !== id);
                });
            } else {
                console.log(id + ' is not installed');
                this.intentInstall(id, false);
            }
        });
    }

    startApp(id: string) {
        console.log('Starting app ' + id);
        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.LAUNCH, "Starting");
        appManager.start(id);
    }

    // Test Install
    async intentInstall(id: string, isUpdate: boolean) {
        console.log('Downloading...' + id);
        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.DOWNLOAD, "Downloading");
        const epkPath = await this.downloadDapp(id);

        console.log('EPK file downloaded and saved to ' + epkPath);
        this.installApp(epkPath, id, isUpdate);
    }

    installApp(epk: any, id: string, isUpdate: boolean) {
        console.log('Installing...' + id);
        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.UPLOAD, "Getting ready");
        appManager.install(
            epk, true,
            (ret) => {
                console.log('Install success', ret);
                console.log('is update?', isUpdate);
                this.resetProgress();
                if (!isUpdate) {
                    this.addToHistory(id);
                }
            },
            (err) => {
                this.resetProgress();
                // the epk deployed by trinity-cli has no signature.
                if (err && err.includes('Failed to verify EPK')) {
                  appManager.alertPrompt('Failed to verify EPK', 'You can turn on developer mode in Settings.');
                } else {
                  this.appStartErrToast();
                }
                console.log('installApp Error', err);
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

                console.log("Download operation completed");
                resolve(filePath);
            }, (err) => {
                console.error(err);
                this.resetProgress();
                this.appStartErrToast();
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
                        fileWriter.onwriteend = (event) => {
                            console.log("File written");
                            resolve('trinity:///data/' + fileName);
                        };
                        fileWriter.onerror = (event) => {
                            console.error('createWriter ERROR - ' + JSON.stringify(event));
                            reject(event);
                            this.resetProgress();
                        };
                        fileWriter.write(blob);
                    }, (err) => {
                        console.error('createWriter ERROR - ' + JSON.stringify(err));
                        reject(err);
                        this.resetProgress();
                    });
                }, (err) => {
                    console.error('getFile ERROR - ' + JSON.stringify(err));
                    reject(err);
                    this.resetProgress();
                });
            }, (err) => {
                console.error('resolveLocalFileSystemURL ERROR - ' + JSON.stringify(err));
                reject(err);
                this.resetProgress();
            });
        });
    }

    resetProgress() {
        console.log('Resetting progress');
        this.checkingApp = false;
        titleBarManager.hideActivityIndicator(TitleBarPlugin.TitleBarActivityType.LAUNCH);
        titleBarManager.hideActivityIndicator(TitleBarPlugin.TitleBarActivityType.UPLOAD);
        titleBarManager.hideActivityIndicator(TitleBarPlugin.TitleBarActivityType.DOWNLOAD);
    }

    /******************************** Favorites ********************************/
    storeFavorites() {
        this.storage.setFavApps(this.favApps);
    }

    /******************************** Browsing History ********************************/
    addToHistory(paramsId: string) {
        appManager.getAppInfos((info) => {
            this.appInfos = Object.values(info);
            const targetApp: AppManagerPlugin.AppInfo = this.appInfos.find(app => app.id === paramsId);
            if (
                !targetApp ||
                targetApp.id === 'org.elastos.trinity.dapp.qrcodescanner' ||
                targetApp.id === 'org.elastos.trinity.dapp.wallet' ||
                targetApp.id === 'org.elastos.trinity.dapp.did' ||
                targetApp.id === 'org.elastos.trinity.dapp.friends' ||
                targetApp.id === 'org.elastos.trinity.dapp.settings' ||
                targetApp.id === 'org.elastos.trinity.blockchain'
            ) {
                return;
            } else {
                console.log('Adding to browsing history', targetApp);
                const favApp: Dapp = this.favApps.find(app => app.id === targetApp.id);
                this.browsedApps.unshift({
                    id: targetApp.id,
                    version: targetApp.version,
                    name: targetApp.name,
                    shortName: targetApp.shortName,
                    description: targetApp.description,
                    startUrl: targetApp.startUrl,
                    icons: targetApp.icons,
                    authorName: targetApp.authorName,
                    authorEmail: targetApp.authorEmail,
                    category: targetApp.category,
                    urls: targetApp.urls,
                    isFav: favApp ? true : false,
                });
                this.removeDuplicates(this.browsedApps);
            }
        });
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
        this.uninstallApp();
    }

    /******************************** Uninstall Apps  ********************************/
    uninstallApp() {
        let uninstallApps: Dapp[] = [];
        this.browsedApps.map(app => {
            if (app.isFav) {
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
                    this.browsedApps = this.browsedApps.filter(app => app.id !== uninstallApps[uninstallApps.length - 1].id);
                    this.installedApps = this.installedApps.filter(app => app.id !== uninstallApps[uninstallApps.length - 1].id);
                    this.storage.setBrowsedApps(this.browsedApps);
                },
                (err) => console.log(err));
        }
    }

    deleteApp(id: string) {
        console.log('Deleting app ', id);
        appManager.unInstall(
            id,
            (res) => {
                console.log('Uninstall Success', id);
                this.favApps = this.favApps.filter((app) => app.id !== id);
                this.browsedApps = this.browsedApps.filter((app) => app.id !== id);
                this.installedApps = this.installedApps.filter((app) => app.id !== id);
                this.storage.setFavApps(this.favApps);
                this.storage.setBrowsedApps(this.browsedApps);
            },
            (err) => console.log(err));
    }

    /******************************** Running Apps ********************************/
    getRunningApps(): Promise<void> {
        return new Promise((resolve, reject) => {
            appManager.getRunningList((list) => {
                console.log('Got running apps', list);
                this.runningList = list;
                resolve();
            });
        });
    }

    async popRunningApps() {
        await this.getRunningApps();

        if (!this.popup) {
            this.popup = true;
            this.presentRunningApps();
        } else {
            this.popoverController.dismiss().then(() => {
                this.popup = true;
                this.presentRunningApps();
            });
        }
    }

    async presentRunningApps() {
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

    /******************************** Notifications Manager ********************************/
    async popNotifications() {
      this.notification.fillAppInfoToNotification(this.allApps);

        if (!this.popup) {
            this.popup = true;
            this.presentNotifications();
        } else {
            this.popoverController.dismiss().then(() => {
                this.popup = true;
                this.presentNotifications();
            });
        }
    }
 
    async presentNotifications() {
        const popover = await this.popoverController.create({
            component: NotificationsComponent,
            // componentProps: {
            //   notifications: this.notificationList
            // },
            translucent: true,
        });
        popover.onDidDismiss().then(() => { this.popup = false; });
        return await popover.present();
    }

    /******************************** Preferences ********************************/
    getLanguage() {
        appManager.getLocale(
            (defaultLang, currentLang, systemLang) => {
                this.setCurLang(currentLang);
            }
        );
    }

    setCurLang(lang: string) {
        console.log('Setting current language to ' + lang);
        this.zone.run(() => {
            this.translate.use(lang);
        });
    }

    getCurrentNet() {
        appManager.getPreference("chain.network.type", (networkCode) => {
            this.zone.run(() => {
                if (networkCode === 'MainNet') {
                    titleBarManager.setTitle('Home');
                }
                if (networkCode === 'TestNet') {
                    titleBarManager.setTitle('Test Net Active');
                }
                if (networkCode === 'RegTest') {
                    titleBarManager.setTitle('Regression Net Active');
                }
                if (networkCode === 'PrvNet') {
                    titleBarManager.setTitle('Private Net Active');
                }
            });
        });
    }

    handleDarkModeChange(useDarkMode) {
        this.theme.setTheme(useDarkMode);
    }

    /******************************** Intent Actions ********************************/
    launcher() {
        appManager.launcher();
    }

    start(id: string) {
        appManager.start(id, () => { });
    }

    sendIntent(action: string, params: any) {
        appManager.sendIntent(action, params);
    }

    close(id: string) {
        appManager.closeApp(id);
    }

    /******************************** Alerts/Toasts ********************************/
    appStartErrToast() {
        this.toastCtrl.create({
            mode: 'ios',
            header: 'Something went wrong',
            message: 'Can\'t start app at this time, please try again',
            color: 'medium',
            duration: 4000,
            position: 'bottom'
        }).then(toast => toast.present());
    }

    genericToast(msg, duration = 1000) {
        this.toastCtrl.create({
            mode: 'ios',
            header: msg,
            color: 'medium',
            duration: duration,
            position: 'bottom'
        }).then(toast => toast.present());
    }

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }

    initTranslateConfig() {
        this.translate.addLangs(["zh", "en","fr"]);
        appManager.getLocale((defaultLang: string, currentLang: string, systemLang: string)=>{
                if(currentLang === 'zh'){
                    this.translate.setDefaultLang(currentLang);
                    this.translate.use(currentLang);
                }else if(currentLang === 'en'){
                    this.translate.setDefaultLang(currentLang);
                    this.translate.use(currentLang);
                }else if(currentLang === 'fr'){
                    this.translate.setDefaultLang(currentLang);
                    this.translate.use(currentLang);
                }else{
                    this.translate.setDefaultLang('en');
                    this.translate.use('en');
                }
        });
    }
}




