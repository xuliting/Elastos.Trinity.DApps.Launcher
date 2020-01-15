import { Component, OnInit } from '@angular/core';
import { AppmanagerService } from '../services/appmanager.service';
import { PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RunningManagerComponent } from '../components/running-manager/running-manager.component';
import { Dapp } from '../models/dapps.model';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public popup = false;
  public noFavApps = false;
  public installedApps: Dapp[] = [];
  public sections = [
    'Browsed',
    'Installed',
    'Bookmarked',
    'Contacts',
  ];

  constructor(
    public popoverController: PopoverController,
    public translate: TranslateService,
    public appManager: AppmanagerService,
    public toastCtrl: ToastController,
    public storage: StorageService,
  ) {
  }

  /* ionViewWillEnter() {
    this.installedApps = this.appManager.installedApps.filter((app) =>
      app.id !== 'org.elastos.trinity.dapp.installer' &&
      app.id !== 'org.elastos.trinity.dapp.did' &&
      app.id !== 'org.elastos.trinity.dapp.qrcodescanner' &&
      app.id !== 'org.elastos.trinity.dapp.wallet' &&
      app.id !== 'org.elastos.trinity.blockchain'
    );
    console.log('Apps from home', this.installedApps);
  } */

  getFavApps() {
    let favApps: Dapp[] = [];
    this.appManager.installedApps.map(app => {
      if (app.isFav) {
        favApps.push(app);
      }
    });
    return favApps;
  }

  favApp(app: Dapp) {
    if (!app.isFav) {
      this.appRemovedFromFav(app);
    } else {
      let favApps: string[] = [];
      this.appManager.installedApps.map((installedApp) => {
        if (installedApp.isFav) {
          favApps = favApps.concat(installedApp.id);
          this.appAddedToFav(installedApp.name);
        }

        /* this.appManager.browsedApps.map(browsedApp => {
          if (browsedApp.id === installedApp.id) {
            browsedApp.isFav = true;
          }
        }); */

      });
      this.storage.setFavApps(favApps);
    }
    this.uninstallApp();
  }

  async uninstallApp() {
    let appId: string = await this.appManager.uninstallApp();
    this.installedApps = this.installedApps.filter(app => app.id !== appId);
    console.log('Apps Remaining', this.installedApps);
  }

  async appAddedToFav(dappName: string) {
    const toast = await this.toastCtrl.create({
      mode: 'ios',
      message: dappName + ' added to favorites',
      color: 'primary',
      duration: 2000
    });
    toast.present();
  }

  async appRemovedFromFav(app: Dapp) {
    const toast = await this.toastCtrl.create({
      mode: 'ios',
      message: app.name + ' removed from favorites',
      color: 'primary',
      duration: 2000
    });
    toast.present();
  }

  findApp(app: Dapp) {
    this.appManager.findAppFromBrowser(app);
  }

  startApp(id) {
    this.appManager.start(id);
  }

  popRunningManager(event: any) {
    console.log(this.appManager.runningList);
    this.popup = true;
    this.presentPopover(event);
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: RunningManagerComponent,
      event: ev,
      translucent: true,
      cssClass: 'my-custom-popup'
    });
    popover.onDidDismiss().then(() => { this.popup = false; });
    return await popover.present();
  }
}
