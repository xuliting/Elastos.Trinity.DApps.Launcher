import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from 'src/app/services/theme.service';
import { NotificationManagerService } from 'src/app/services/notificationmanager.service';
import { TranslateService } from '@ngx-translate/core';

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
      title: 'Free 100 ELA! Just send 10 ELA to me :)',
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
      title: 'Free 100 ELA! Just send 10 ELA to me :)',
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
      title: 'Free 100 ELA! Just send 10 ELA to me :)',
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
    public notificationService: NotificationManagerService,
    public theme: ThemeService,
    public translate: TranslateService
  ) {}

  ngOnInit() {}

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  start(notification) {
    if (notification.type === 'normal') {
      if (notification.url && (notification.url !== '')) {
        console.log('NotificationsComponent sendUrlIntent');
        appManager.sendUrlIntent(notification.url,
          () => {console.log('sendUrlIntent success'); },
          (error) => {console.log('NotificationsComponent sendUrlIntent failed, ', error); });
      } else {
        appManager.start(notification.app.id);
      }

      this.notificationService.deleteNotification(notification.notificationId);
    }
  }

  close(notificationId) {
    this.notificationService.deleteNotification(notificationId);
  }
}
