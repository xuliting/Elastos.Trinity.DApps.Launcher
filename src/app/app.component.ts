import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppmanagerService } from "./services/appmanager.service";
import { SettingService } from "./services/setting.service";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public appManager: AppmanagerService,
        public setting: SettingService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            console.log("platform.ready");
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.appManager.init();
            this.setting.init();
        });
    }
}
