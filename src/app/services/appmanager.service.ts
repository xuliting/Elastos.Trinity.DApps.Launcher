import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ToastController, PopoverController, MenuController, NavController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Dapp } from '../models/dapps.model';
import { StorageService } from './storage.service';
import { RunningAppsComponent } from '../components/running-apps/running-apps.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { ThemeService } from './theme.service';

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

    /* Native apps */
    public nativeApps: Dapp[] = [];

    /* 3rd party apps */
    public installedApps: Dapp[] = [];
    public browsedApps: Dapp[] = [];
    public favApps: Dapp[] = [];

    /* Background apps */
    public popup = false;
    public runningList: any = [];

    /* Desktop apps */
    public sections = [
        {
            name: 'dapp browser',
            color: '#f06666',
            id: null,
            iconDir: '/assets/apps_svg/dapp-browser-icon-white.svg',
            iconDir2: '/assets/apps/dapp-browser-icon-white@2x.png',
            iconDir3: '/assets/icon/browser/caret-arrow.svg',
            iconDir4: '/assets/icon/browser/caret-arrow2.svg',
            active: false,
            started: false,
            description: [
                "dApps are Apps that can't be shutdown! This is a perfect environment to not just browse true decentralized applications but also to develop them for all to enjoy.",
                "Our dApps utilize as much Elastos technology as you want. P2P Networking, Decentralized Identity, Decentralized Storage, Blockchain, Smart Contracts and Tokens. We got it all!"
            ]
        },
        {
            name: 'wallet',
            color: '#e853dd',
            id: 'org.elastos.trinity.dapp.wallet',
            iconDir: '/assets/apps_svg/wallet-icon.svg',
            iconDir2: '/assets/apps/wallet-icon@2x.png',
            iconDir3: '/assets/icon/wallet/caret-arrow.svg',
            iconDir4: '/assets/icon/wallet/caret-arrow2.svg',
            active: false,
            started: false,
            description: [
                "As elastOS is a secure environment with all outside communication and network traffic blocked by default, this makes the elastOS wallet one of the most secure!",
                "This area is a place for wallet widgets. Want to check how much ELA you got? The wallet widget can show you without even opening the applications. Coming soon!"
            ]
        },
        {
            name: 'identity',
            color: '#5aacff',
            id: 'org.elastos.trinity.dapp.did',
            iconDir: '/assets/apps_svg/identity-icon.svg',
            iconDir2: '/assets/apps/identity-icon@2x.png',
            iconDir3: '/assets/icon/identity/caret-arrow.svg',
            iconDir4: '/assets/icon/identity/caret-arrow2.svg',
            active: false,
            started: false,
            description: [
                "Own you identity on elastOS. Manage your decentralized profiles and share with friends and business the data that only you want them to see.",
                "We call our identity DID's (Decentralized Identifier). It can be autonomous, independent and decentralized - acting as a proof of ownership for digital identities."
            ]
        },
        {
            name: 'contacts',
            color: '#5cd552',
            id: 'org.elastos.trinity.dapp.friends',
            iconDir: '/assets/apps_svg/friends-icon-white.svg',
            iconDir2: '/assets/apps/friends-icon-white@2x.png',
            iconDir3: '/assets/icon/contacts/caret-arrow.svg',
            iconDir4: '/assets/icon/contacts/caret-arrow2.svg',
            active: false,
            started: false,
            description: [
                "The elastOS ecosystem and network is all about friends! Here we will have contacts widgets (coming soon) where you can see all your contacts without opening the application. Check out what applications they are using and you may find your new favorite dApp.",
            ]
        },
        {
            name: 'node voting',
            color: '#9c50ff',
            id: 'org.elastos.trinity.dapp.dposvoting',
            iconDir: '/assets/apps_svg/dpos-voting-icon-white.svg',
            iconDir2: '/assets/apps/dpos-voting-icon-white@2x.png',
            iconDir3: '/assets/icon/voting/caret-arrow.svg',
            iconDir4: '/assets/icon/voting/caret-arrow2.svg',
            active: false,
            started: false,
            description: [
                "As part of our ecosystem, we have nodes which secure our network. These are called DPoS Supernodes and validate transactions.",
                "Each ELA you have in your wallet gives you a voting power of 1. With this you can vote for 36 nodes. You can still spend it at anytime, but you will have to revote."
            ]
        },
        /*{
            name: 'candidate voting',
            color: '#ffde6e',
            id: null,
            iconDir: '/assets/apps_svg/crc-voting-icon-white.svg',
            iconDir2: '/assets/apps/crc-voting-icon-white@2x.png',
            active: false,
            started: false,
            description: [
                "As part of the Elastos ecosystem, we have a community governance mechanism that drives decisions, disputes and resolutions.",
                "The Cyber Republic Council (CRC) comprises of 12 seats which are filled by a community election conducted on the blockchain. This is where you can participate."
            ]
        },*/
    ];

    /* For install progress bar */
    public checkingApp = false;
    private storeChecked = false;
    private updateApps: string[] = [];

    /* Languages */
    private currentLang: string = null;
    private supportedLanguage: string[] = ['en', 'zh'];

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
        private theme: ThemeService
    ) {}

    init() {
        this.resetProgress();
        this.getRunningApps();
        this.getAppInfos();

        console.log('AppmanagerService init');
        appManager.setListener((ret) => {
            this.onMessageReceived(ret);
        });

        if (this.platform.platforms().indexOf('cordova') >= 0) {
            console.log('Listening to intent events');
            appManager.setIntentListener((ret) => {
              this.onIntentReceived(ret);
            });
        }
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
    onMessageReceived(ret: AppManagerPlugin.ReceivedMessage) {
        console.log('Elastos launcher received message:' + ret.message + '. type: ' + ret.type + '. from: ' + ret.from);

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
                        break;
                    case 'minimize':
                        this.resetProgress();
                        this.resetDesktop();
                        break;
                }
                switch (params.visible) {
                    case 'show':
                        this.resetProgress();
                        break;
                }
                switch (ret.message) {
                    case 'navback':
                        // this.navController.back();

                        // Navigate to desktop
                        this.router.navigate(['desktop']);
                        break;
                    case 'notifications-toggle':
                        // Toggles the notifications panel on/off
                        this.popNotifications();
                        break;
                    case 'runningapps-toggle':
                        // Launch the running list
                        this.popRunningApps();
                        break;
                    case 'scan-clicked':
                        // Launch the scanner app
                        this.findApp("org.elastos.trinity.dapp.qrcodescanner");
                        break;
                    case 'settings-clicked':
                        // Launch the settings app
                        this.findApp("org.elastos.trinity.dapp.settings");
                        break;
                }
                break;

            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case 'started':
                        // titleBarManager.setTitle(params.name);

                        // Add started app to history
                        this.addToHistory(params.id);
                        // 'launching' app is completed only when 'show' is received (first screen shown) this.resetProgress();
                        break;
                    case 'closed':
                    /*     if (this.popup) {
                            this.popoverController.dismiss();
                        } */
                        this.resetProgress();
                        this.resetDesktop();

                        // Ask user if they want to bookmark app if not bookmarked
                        // this.findBookmark(params.id);
                        break;
                    case 'unInstalled':
                        break;
                    case 'installed':
                        this.resetProgress();
                        this.getAppInfos().then(() => {
                            titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.LAUNCH);
                            appManager.start(params.id);
                        });
                        break;
                    case 'initiated':
                        this.getAppInfos();
                        break;
                    case 'authorityChanged':
                        this.getAppInfos();
                        break;
                    case 'currentLocaleChanged':
                        break;
                    case 'launcher_upgraded':
                        break;
                    case 'preferenceChanged':
                        if (params.data.key == "ui.darkmode") {
                            this.handleDarkModeChange(params.data.value);
                        }
                        break;
                }
                break;

            // EPK installation from the CLI - Message received by the runtime.
            case MessageType.EX_INSTALL:
                this.installApp(params.uri, params.id);
                break;
        }
    }

    handleDarkModeChange(useDarkMode) {
        this.theme.setTheme(useDarkMode);
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
        this.updateApps = [];

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
                        isFav: null,
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
                        isFav: null
                    });
                }
            });

            this.checkForUpdates();
        });
    }

    checkForUpdates() {
        if (!this.storeChecked) {
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
                this.intentInstall(id);
            } else {
                console.log(id + ' is not installed');
                this.intentInstall(id);
            }
        });
    }

    startApp(id: string) {
        console.log('Starting app ' + id);
        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.LAUNCH);
        appManager.start(id);
    }

    // Test Install
    async intentInstall(id: string) {
        console.log('Downloading...' + id);
        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.DOWNLOAD);
        const epkPath = await this.downloadDapp(id);

        console.log('EPK file downloaded and saved to ' + epkPath);
        this.installApp(epkPath, id);
    }

    installApp(epk: any, id: string) {
        console.log('Installing...' + id);
        titleBarManager.showActivityIndicator(TitleBarPlugin.TitleBarActivityType.UPLOAD);
        appManager.install(
            epk, true,
            (ret) => {
                console.log('Install success', ret);
            },
            (err) => {
                this.resetProgress();
                this.appStartErrToast();
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

                console.log("Download operation completed");
                resolve(filePath);
            }, (err) => {
                console.error(err);
                this.resetProgress();
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


    resetDesktop() {
        this.zone.run(() => {
            console.log('Resetting desktop');
            this.sections.forEach((section) => {
                section.started = false;
            });
        });
    }

    /******************************** Favorites ********************************/
    storeFavorites() {
        this.storage.setFavApps(this.favApps);
    }

    /******************************** Browsing History ********************************/
    addToHistory(paramsId: string) {
        console.log('Adding to browsing history', paramsId);

        appManager.getAppInfos((info) => {
            this.appInfos = Object.values(info);
        });

        const targetApp: AppManagerPlugin.AppInfo = this.appInfos.find(app => app.id === paramsId);
        if (
            !targetApp ||
            targetApp.id === 'org.elastos.trinity.dapp.installer' ||
            targetApp.id ===  'org.elastos.trinity.dapp.qrcodescanner' ||
            targetApp.id === 'org.elastos.trinity.dapp.wallet' ||
            targetApp.id === 'org.elastos.trinity.dapp.did' ||
            targetApp.id === 'org.elastos.trinity.dapp.friends' ||
            targetApp.id === 'org.elastos.trinity.dapp.dposvoting' ||
            targetApp.id === 'org.elastos.trinity.dapp.settings' ||
            targetApp.id === 'org.elastos.trinity.blockchain'
        ) {
            return;
        } else {
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

    /******************************** Uninstall Last Browsed App  ********************************/
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
            this.popoverController.dismiss();
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
    popNotifications() {
        if (!this.popup) {
            this.popup = true;
            this.presentNotifications();
        } else {
            this.popoverController.dismiss();
        }
    }

    async presentNotifications() {
        const popover = await this.popoverController.create({
            component: NotificationsComponent,
            componentProps: {
                // apps: this.runningList
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

    genericToast(msg) {
        this.toastCtrl.create({
            mode: 'ios',
            header: msg,
            color: 'primary',
            duration: 4000,
            position: 'bottom'
        }).then(toast => toast.present());
    }

    print_err(err) {
        console.log("ElastosJS  Error: " + err);
    }
}




