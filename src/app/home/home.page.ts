import { Component, OnInit } from '@angular/core';
import { AppmanagerService } from '../services/appmanager.service';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Dapp } from '../models/dapps.model';
import { StorageService } from '../services/storage.service';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  public noFavApps = false;
  public installedApps: Dapp[] = [];
  public sections = [
    'Browsing History',
    'Installed',
    'Bookmarks',
    'Favorites',
    'Contacts',
  ];

  constructor(
    public translate: TranslateService,
    public appManagerService: AppmanagerService,
    public toastCtrl: ToastController,
    public storage: StorageService,
  ) {
  }

  ngOnInit() {
  }

  // Fetch favorite apps
  getFavorites(): Dapp[] {
    let favorites: Dapp[] = [];
    this.appManagerService.installedApps.map(app => {
      if (app.isFav) {
        favorites.push(app);
      }
    });
    return favorites;
  }

  // Fetch bookmarked apps
  getBookmarks(): Dapp[] {
    let bookmarks: Dapp[] = [];
    this.appManagerService.installedApps.map(app => {
      if (app.isBookmarked) {
        bookmarks.push(app);
      }
    });
    return bookmarks;
  }

  // Favorites
  favApp(app: Dapp) {
    if (app.isFav) {
      return;
    } else {
      app.isFav = true;
      this.appAddedToFav(app);
      this.storeFavorites();
    }
  }

  removeFavorite(app: Dapp) {
    app.isFav = false;
    this.appRemovedFromFav(app);
    this.storeFavorites();
    this.appManagerService.uninstallApp();
  }

  storeFavorites() {
    let favorites: string[] = [];
    this.appManagerService.installedApps.map(dapp => {
      if (dapp.isFav) {
        favorites.push(dapp.id);
      }
    });

    this.storage.setFavApps(favorites);
  }

  // Bookmarks
  bookmarkApp(app: Dapp) {
    if (app.isBookmarked) {
      return;
    } else {
      app.isBookmarked = true;
      this.appManagerService.storeBookmarks();
    }
  }

  removeBookmark(app: Dapp) {
    app.isBookmarked = false;
    this.appManagerService.storeBookmarks();
    this.appManagerService.uninstallApp();
  }

  // Check app if installed or needs updating before opening
  findApp(id: string) {
    console.log('Finding app');
    if (this.appManagerService.installing) {
      console.log('Installation in progress');
      return;
    } else if (id === 'org.elastos.trinity.blockchain' || id === 'org.elastos.trinity.dapp.dappstore1') {
        this.appManagerService.start(id);
    } else {
      console.log('Finding...', id);
      this.appManagerService.findApp(id);
    }
  }

  // Alerts
  async appAddedToFav(app: Dapp) {
    const toast = await this.toastCtrl.create({
      mode: 'ios',
      message: app.name + ' added to favorites',
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

  async appIsNative(app: Dapp) {
    const toast = await this.toastCtrl.create({
      mode: 'ios',
      header: app.name,
      message: 'You cannot add a native application of elastOS to your favorites',
      color: 'primary',
      duration: 4000
    });
    toast.present();
  }

  // Only used to manually uninstall apps for testing
  removeApp(app: Dapp) {
    console.log('Uninstalling app.. this manual uninstall is only used for testing');
    this.appManagerService.removeApp(app);
  }
}

/**
   * Used to try and fav apps from browsing
   * history whether they are installed or not.
   * Currently fav mechanism only works for installed apps
**/

  /* favApp(app: Dapp) {
    console.log('Favoriting app..', app.id);
    let targetApp: Dapp = this.appManager.allApps.find(dapp => dapp.id === app.id);

    if (targetApp) {
      console.log('Target app found', targetApp);
      this.appManager.installedApps.map(dapp => {
        if (dapp.id === app.id && !dapp.isFav) {
          dapp.isFav = true;
          console.log(dapp.id + ' added to favorites');
          this.appAddedToFav(dapp);
        }
      });

      this.appManager.nativeApps.map(dapp => {
        if (dapp.id === app.id) {
          console.log('This is a native app', dapp.id);
          this.appIsNative(dapp);
        }
      });

    } else {
      console.log('App is not installed');
      this.appManager.appPendingInstallBeforeFav = app;
      this.appManager.intentInstall(app.id);
    }

    this.storeFavorites();
  } */
