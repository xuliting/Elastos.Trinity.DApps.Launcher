import { Component, ViewChild } from '@angular/core';
import { Platform, ModalController, IonSlides } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppmanagerService } from './services/appmanager.service';
import { StorageService } from './services/storage.service';
import { ThemeService } from './services/theme.service';
import { Dapp } from './models/dapps.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent {

    @ViewChild('slider') slider: IonSlides;

    public scanner = {
        name: 'scanner',
        color: '#1317ac',
        id: 'org.elastos.trinity.dapp.qrcodescanner',
        iconDir: '/assets/icon/qr-scanner-icon-white@2x.png',
        active: false
    };

    public sections = [
        { name: 'desktop', color: '#20e3d2', id: null, iconDir: '/assets/icon/home-icon-white@2x.png', active: false },
        { name: 'dapp browser', color: '#f06666', id: null, iconDir: '/assets/icon/dapp-browser-icon-white@2x.png', active: false },
        { name: 'wallet', color: '#e853dd', id: 'org.elastos.trinity.dapp.wallet', iconDir: '/assets/icon/wallet-icon@2x.png', active: false },
        { name: 'identity', color: '#5aacff', id: 'org.elastos.trinity.dapp.did', iconDir: '/assets/icon/identity-icon@2x.png', active: false },
        { name: 'contacts', color: '#5cd552', id: 'org.elastos.trinity.dapp.friends', iconDir: '/assets/icon/friends-icon-white@2x.png', active: false },
        { name: 'node voting', color: '#9c50ff', id: 'org.elastos.trinity.dapp.dposvoting', iconDir: '/assets/icon/dpos-voting-icon-white@2x.png', active: false },
        { name: 'candidate voting', color: '#ffde6e', id: null, iconDir: '/assets/icon/crc-voting-icon-white@2x.png', active: false },
        { name: 'settings', color: '#555555', id: 'org.elastos.trinity.dapp.settings', iconDir: '/assets/icon/settings-icon-white@2x.png', active: false },
    ];

    slideOpts = {
        initialSlide: 1,
        speed: 400,
        centeredSlides: false,
        slidesPerView: 3.5
    };

    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        private router: Router,
        public modalCtrl: ModalController,
        public splashScreen: SplashScreen,
        public appManager: AppmanagerService,
        public storage: StorageService,
        public theme: ThemeService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            console.log('platform.ready');
            screen.orientation.lock('portrait');
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.appManager.init();
        });
    }

    openScanner() {
        this.sections.forEach((_section) => {
            _section.active = false;
        });
        this.scanner.active = true;
        this.appManager.findApp(this.scanner.id);
    }

    openSection(section) {
        this.scanner.active = false;
        this.sections.map((_section) => {
            if (_section.name === section.name) {
                _section.active = true;
            } else {
                _section.active = false;
            }
        });

        if (section.name === 'desktop') {
            console.log('Desktop active');
            this.router.navigate(['desktop']);
            return;
        }
        if (section.name === 'dapp browser') {
            console.log('Dapp browser active');
            this.router.navigate(['home']);
        } else {
            if (this.appManager.checkingApp) {
                console.log('Can\'t start ' + section.id + '... another app is already loading');
                return;
            } else if (section.id === 'org.elastos.trinity.blockchain') {
                this.appManager.start(section.id);
            } else {
                console.log('Loading ' + section.id);
                this.appManager.findApp(section.id);
            }
        }
    }

    openApp(appId: string) {
        if (this.appManager.checkingApp) {
            console.log('Can\'t start ' + appId + '... another app is already loading');
            return;
        } else {
          this.appManager.findApp(appId);
        }
    }

    toggleDarkMode() {
        this.theme.toggleTheme();
    }

    // Reset Favorites, Bookmarks, History and Progress bar - Currently Used Only For Testing
    resetBrowser() {
        this.appManager.resetBrowserAlert();
    }
}
