import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController, Platform, IonSlides } from '@ionic/angular';

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
  @ViewChild(IonSlides) private slide: IonSlides;

  public hiddenSlider = true;

  // Slider
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    init: false
  };

  constructor(
    private platform: Platform,
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
    titleBarManager.setBehavior(TitleBarPlugin.TitleBarBehavior.DESKTOP);
    titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
    titleBarManager.setTitle("Home");
    if (!this.theme.darkMode) {
      titleBarManager.setBackgroundColor("#5a62ff");
    } else {
      titleBarManager.setBackgroundColor("#37477d");
    }
  }

  ionViewDidEnter() {
    // Dirty hack because on iOS we are currently unable to understand why the
    // ion-slides width is sometimes wrong when an app starts. Waiting a few
    // seconds (DOM fully rendered once...?) seems to solve this problem.
    if (this.platform.platforms().indexOf('ios') >= 0) {
      setTimeout( () => {
        this.showSlider();
      }, 3000);
    } else {
      this.showSlider();
    }
  }

  showSlider() {
    this.hiddenSlider = false;
    this.slide.getSwiper().then((swiper) => {
      swiper.init();
    });
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
      this.appManager.favApps.pop();
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

    if (this.appManager.favApps.length < 36) {
      this.appManager.favApps.push({
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

  /************** Check app if installed before opening **************/
  openApp(id: string) {
    if (this.appManager.checkingApp) {
      console.log('Installation in progress');
      return;
    } else {
      this.appManager.findApp(id);
    }
  }

  openDemoApp() {
    this.openApp("org.elastos.trinity.dapp.diddemo");
  }
}
