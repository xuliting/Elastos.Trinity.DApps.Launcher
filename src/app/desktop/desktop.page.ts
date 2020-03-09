import { Component, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { AppmanagerService } from '../services/appmanager.service';
import { Dapp } from '../models/dapps.model';
import { Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.page.html',
  styleUrls: ['./desktop.page.scss'],
})
export class DesktopPage implements OnInit {

  @ViewChild('slider') slider: IonSlides;

  public sections = [
    { name: 'notifications', color: '#20e3d2', id: null, iconDir: '/assets/apps/home-icon-white@2x.png', active: false },
    { name: 'background apps', color: '#20e3d2', id: null, iconDir: '/assets/apps/home-icon-white@2x.png', active: false },
    { name: 'favorites', color: '#20e3d2', id: null, iconDir: '/assets/apps/bookmark-icon@2x.png', active: false },
  ];

  public apps = [
    { name: 'dapp browser', color: '#f06666', id: null, iconDir: '/assets/apps/dapp-browser-icon-white@2x.png', active: false },
    { name: 'scanner', color: '#1317ac', id: 'org.elastos.trinity.dapp.qrcodescanner', iconDir: '/assets/apps/qr-scanner-icon-white@2x.png', active: false },
    { name: 'wallet', color: '#e853dd', id: 'org.elastos.trinity.dapp.wallet', iconDir: '/assets/apps/wallet-icon@2x.png', active: false },
    { name: 'identity', color: '#5aacff', id: 'org.elastos.trinity.dapp.did', iconDir: '/assets/apps/identity-icon@2x.png', active: false },
    { name: 'contacts', color: '#5cd552', id: 'org.elastos.trinity.dapp.friends', iconDir: '/assets/apps/friends-icon-white@2x.png', active: false },
    { name: 'node voting', color: '#9c50ff', id: 'org.elastos.trinity.dapp.dposvoting', iconDir: '/assets/apps/dpos-voting-icon-white@2x.png', active: false },
    { name: 'candidate voting', color: '#ffde6e', id: null, iconDir: '/assets/apps/crc-voting-icon-white@2x.png', active: false },
    { name: 'settings', color: '#555555', id: 'org.elastos.trinity.dapp.settings', iconDir: '/assets/apps/settings-icon-white@2x.png', active: false },
  ];

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    centeredSlides: false,
    slidesPerView: 3.5
  };

  constructor(
    private router: Router,
    public appManager: AppmanagerService,
    public theme: ThemeService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    titleBarManager.setBehavior(TitleBarPlugin.TitleBarBehavior.DESKTOP);
    titleBarManager.setTitle("Desktop");
  }

  /************** Check app if it's installed or needs updating before opening **************/
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

  openNativeApp(app) {
    if (app.name === 'dapp browser') {
      console.log('Dapp browser active');
      this.router.navigate(['home']);
    } else {
      if (this.appManager.checkingApp) {
        console.log('Can\'t start ' + app.id + '... another app is already loading');
        return;
      } else if (app.id === 'org.elastos.trinity.blockchain') {
        this.appManager.start(app.id);
      } else {
        console.log('Loading ' + app.id);
        this.appManager.findApp(app.id);
      }
    }
  }
}
