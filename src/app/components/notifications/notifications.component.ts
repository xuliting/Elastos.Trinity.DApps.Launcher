import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  public notifications = [
    {
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
    }
  ];

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {}

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  start(id: string) {
    appManager.start(id);
  }

  close(id: string) {
    this.notifications = this.notifications.filter((notification) => notification.app.id !== id);
  }
}
