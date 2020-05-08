import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from 'src/app/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { NavParams } from '@ionic/angular';

declare let appManager: AppManagerPlugin.AppManager;
declare let notificationManager;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  public notifications = [
   /*  {
      message: 'Free 100 ELA! Just send 10 ELA to me :)',
      app: {
        id: "org.elastos.trinity.dapp.did",
        name: "DID",
        icons: [
          {src: "icon://org.elastos.trinity.dapp.did/0", sizes: "512x512", type: "image/png"},
          {src: "icon://org.elastos.trinity.dapp.did/1", sizes: "128x128", type: "image/png"}
        ]
      },
    },
    {
      message: 'Free 100 ELA! Just send 10 ELA to me :)',
      app: {
        id: "org.elastos.trinity.dapp.did2",
        name: "DID",
        icons: [
          {src: "icon://org.elastos.trinity.dapp.did/0", sizes: "512x512", type: "image/png"},
          {src: "icon://org.elastos.trinity.dapp.did/1", sizes: "128x128", type: "image/png"}
        ]
      },
    },
    {
      message: 'Free 100 ELA! Just send 10 ELA to me :)',
      app: {
        id: "org.elastos.trinity.dapp.did3",
        name: "DID",
        icons: [
          {src: "icon://org.elastos.trinity.dapp.did/0", sizes: "512x512", type: "image/png"},
          {src: "icon://org.elastos.trinity.dapp.did/1", sizes: "128x128", type: "image/png"}
        ]
      },
    } */
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private navParams: NavParams,
    public theme: ThemeService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.notifications = this.navParams.get('notifications');
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  start(id: string) {
    appManager.start(id);
  }

  close(notificationId) {
    notificationManager.clearNotification(notificationId);
    this.notifications = this.notifications.filter((notification) => notification.notificationId !== notificationId);
  }
}
