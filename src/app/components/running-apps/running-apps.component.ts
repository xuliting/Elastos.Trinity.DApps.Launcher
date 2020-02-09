import { Component, OnInit } from '@angular/core';
import { AppmanagerService } from 'src/app/services/appmanager.service';
import { NavParams } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-running-apps',
  templateUrl: './running-apps.component.html',
  styleUrls: ['./running-apps.component.scss'],
})
export class RunningAppsComponent implements OnInit {

  runningList: any[] = [];
  runningApps: any[] = [];

  constructor(
    private navParams: NavParams,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.runningList = this.navParams.get('apps');
    console.log('App ids running', this.runningList);
    this.getAppInfo();
  }

  getAppInfo() {
    appManager.getAppInfos((info) => {
      const appInfos = Object.values(info);
      appInfos.map((app) => {
        if (this.runningList.includes(app.id)) {
          this.runningApps = this.runningApps.concat(app);
        }
      });
      console.log('Apps running', this.runningApps);
    });
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  startApp(id: string) {
    appManager.start(id);
  }
}
