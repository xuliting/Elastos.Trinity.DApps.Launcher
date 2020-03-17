import { Component, NgZone } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppmanagerService } from './services/appmanager.service';
import { StorageService } from './services/storage.service';
import { ThemeService } from './services/theme.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent {

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
            this.appManager.init();
            this.router.navigate(['onboard']);
        });
    }
}
