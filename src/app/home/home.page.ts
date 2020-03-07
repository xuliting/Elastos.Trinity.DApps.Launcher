import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { AppmanagerService } from '../services/appmanager.service';
import { StorageService } from '../services/storage.service';
import { TranslateService } from '@ngx-translate/core';

import { Dapp } from '../models/dapps.model';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  public favAppsActive = true;

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
    this.isBrowsedAppFav();
  }

  /******************************** Handle Favorites ********************************/
  favApp(app: Dapp, section: string) {
    app.isFav = true;

    // If app is favorited from 'recents' list, fav app in 'favorites' list
    if (section === 'recent') {
      this.appManager.installedApps.map((installedApp) => {
        if (app.id === installedApp.id) {
          installedApp.isFav = true;
        }
      });
    }

    this.appManager.genericToast(app.name + ' added to favorites');
    this.appManager.storeFavorites();
  }

  removeFav(app: Dapp, section: string) {
    app.isFav = false;

    // If app is unfavorited from 'recents' list, unfavorite app in 'favorites' list
    if (section === 'recent') {
      this.appManager.installedApps.map((installedApp) => {
        if (app.id === installedApp.id) {
          installedApp.isFav = false;
        }
      });
    }

    // If app is unfavorited from 'favorites' list, unfavorite app in 'recents' list
    if (section === 'favorites') {
      this.appManager.browsedApps.map((browsedApp) => {
        if (app.id === browsedApp.id) {
          browsedApp.isFav = false;
        }
      });
    }

    this.appManager.genericToast(app.name + ' removed from favorites');
    this.appManager.storeFavorites();
  }

  /******************************** Handle Bookmarks ********************************/
  bookmarkApp(app: Dapp) {
    if (app.isBookmarked) {
      return;
    } else {
      app.isBookmarked = true;
      this.appManager.storeBookmarks();
    }
  }

  removeBookmark(app: Dapp) {
    app.isBookmarked = false;
    this.appManager.storeBookmarks();
  }

  /******************************** Handle History ********************************/
  isBrowsedAppFav() {
    this.appManager.browsedApps.forEach((browsedApp) => {
      browsedApp.isFav = false;
    });

    this.appManager.browsedApps.map((browsedApp) => {
      if (this.appManager.favorites.includes(browsedApp.id)) {
        browsedApp.isFav = true;
      }
    });
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
