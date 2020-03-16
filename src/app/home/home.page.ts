import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { AppmanagerService } from '../services/appmanager.service';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';

import { Dapp } from '../models/dapps.model';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  public favAppsActive = false;

  constructor(
    public translate: TranslateService,
    public appManager: AppmanagerService,
    public toastCtrl: ToastController,
    public storage: StorageService,
    public theme: ThemeService
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    titleBarManager.setTitle('Dapp Browser');
    titleBarManager.setBehavior(TitleBarPlugin.TitleBarBehavior.DEFAULT);
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.BACK);

    if (!this.theme.darkMode) {
      titleBarManager.setBackgroundColor("#5a62ff");
      titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log('Drag & drop event ', + event);
    moveItemInArray(
      this.appManager.favApps,
      event.previousIndex,
      event.currentIndex
    );

    this.storage.setFavApps(this.appManager.favApps);
  }

  /******************************** Handle Favorites ********************************/
  favApp(app: Dapp) {
    const targetApp = this.appManager.favApps.find((favApp) => favApp.id === app.id);

    if (targetApp) {
      return;
    } else {
      this.appManager.favApps.unshift({
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

    this.appManager.browsedApps.map((browsedApp) => {
      if (app.id === browsedApp.id) {
        browsedApp.isFav = true;
      }
    });

    this.appManager.genericToast(app.name + ' added to favorites');
    this.saveApps();
  }

  removeFav(app: Dapp) {
    this.appManager.favApps = this.appManager.favApps.filter((favApp) => favApp.id !== app.id);

    this.appManager.browsedApps.map((browsedApp) => {
      if (app.id === browsedApp.id) {
        browsedApp.isFav = false;
      }
    });

    this.appManager.genericToast(app.name + ' removed from favorites');
    this.saveApps();
  }

  saveApps() {
    this.storage.setFavApps(this.appManager.favApps);
    this.storage.setBrowsedApps(this.appManager.browsedApps);
  }

  /************** Check app if installed or needs updating before opening **************/
  openApp(id: string) {
    if (this.appManager.checkingApp) {
      console.log('Installation in progress');
      return;
    } else if (id === 'org.elastos.trinity.blockchain' || id === 'org.elastos.trinity.dapp.dappstore1') {
        this.appManager.start(id);
    } else {
      this.appManager.findApp(id);
    }
  }
}
