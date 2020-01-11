import { Component } from '@angular/core';
import { AppmanagerService } from '../services/appmanager.service';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RunningManagerComponent } from '../components/running-manager/running-manager.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public popup = false;
  public apps: AppManagerPlugin.AppInfo[] = [];
  public sections = [
    'Browsing History',
    'Bookmarked Apps',
    'Contacts',
  ];

  constructor(
    public popoverController: PopoverController,
    public translate: TranslateService,
    public appManager: AppmanagerService
  ) {
    this.apps = appManager.appInfos.filter((app) => app.id !== 'org.elastos.trinity.dapp.installer');
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

  startApp(id) {
    this.appManager.start(id);
  }
}
