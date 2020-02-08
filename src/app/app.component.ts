import { Component } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppmanagerService } from './services/appmanager.service';
import { SplashscreenPage } from './splash/splashscreen/splashscreen.page';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent {

    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        public appManager: AppmanagerService,
        public modalCtrl: ModalController,
        public splashScreen: SplashScreen
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            console.log('platform.ready');
            screen.orientation.lock('portrait');
            this.statusBar.styleDefault();
            this.splash();
            //  this.splashScreen.hide();
            this.appManager.init();
        });
    }

    async splash() {
        const splash = await this.modalCtrl.create({component: SplashscreenPage});
        return await splash.present();
    }

    startApp(id) {
        this.appManager.start(id);
    }

    findApp(id: string) {
        if (this.appManager.installing) {
          return;
        } else if (id === 'org.elastos.trinity.blockchain') {
            this.appManager.start(id);
        } else {
          console.log('Finding...', id);
          this.appManager.findApp(id);
        }
    }
}
