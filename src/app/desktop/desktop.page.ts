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

    this.appManager.resetDesktop();
  }

  /************** Check app if it's installed or needs updating before opening **************/
  openNativeApp(app) {
    this.appManager.sections.map((section) => {
      if (section.name === app.name) {
        section.started = true;
      } else {
        section.started = false;
      }
    });

    if (app.name === 'dapp browser') {
      console.log('Dapp browser active');
      this.router.navigate(['home']);
    } else {
      this.openApp(app.id);
    }
  }

  openApp(id: string) {
    if (this.appManager.checkingApp) {
      console.log('Can\'t start ' + id + '... another app is already loading');
      return;
    } else if (id === 'org.elastos.trinity.blockchain' || id === 'org.elastos.trinity.dapp.dappstore1') {
        appManager.start(id);
    } else {
      this.appManager.findApp(id);
    }
  }
}
