import { Component, OnInit, NgZone } from '@angular/core';
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
    private zone: NgZone,
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
      this.zone.run(() => {
        const appInfos = Object.values(info);
        appInfos.map((app) => {
            if (this.runningList.includes(app.id)) {
            this.runningApps = this.runningApps.concat(app);
            }
        });
        console.log('Running apps info', this.runningApps);
      });
    });
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  start(id: string) {
    appManager.start(id);
  }

  close(id: string) {
    appManager.closeApp(id);
    this.runningList = this.runningList.filter((appId) => appId !== id);
    this.runningApps = this.runningApps.filter((app) => app.id !== id);
  }
}
