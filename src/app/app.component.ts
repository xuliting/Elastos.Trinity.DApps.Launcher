import { Component } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppmanagerService } from "./services/appmanager.service";
import { SettingService } from "./services/setting.service";
import { SplashscreenPage } from './splash/splashscreen/splashscreen.page';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
   // styleUrls: ['./app.scss'],
})
export class AppComponent {

    nativeApps: AppManagerPlugin.AppInfo[] = [];

    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        public appManager: AppmanagerService,
        public setting: SettingService,
        public modalCtrl: ModalController,
        public splashScreen: SplashScreen
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            console.log("platform.ready");
            screen.orientation.lock('portrait');
            this.statusBar.styleDefault();
           // this.splash();
            this.splashScreen.hide();
            this.appManager.init();
            this.setting.init();
            this.nativeApps = this.appManager.nativeApps;
        });
    }

    async splash() {
        const splash = await this.modalCtrl.create({component: SplashscreenPage});
        return await splash.present();
    }
}
