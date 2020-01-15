import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppmanagerService } from "../../services/appmanager.service";
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-appinfo',
    templateUrl: './appinfo.page.html',
    styleUrls: ['./appinfo.page.scss'],
})
export class AppinfoPage implements OnInit {

    id: "";

    constructor(public appManager: AppmanagerService,
        public translate: TranslateService,
        public route: ActivatedRoute,
        private navCtrl: NavController,
        public alertController: AlertController) { }

    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            this.id = data["appid"];
        })
    }

   /*  async presentAlertConfirm() {
        var me = this;
        const alert = await this.alertController.create({
            message: me.translate.instant("uninstall-confirm"),
            cssClass: 'my-custom-alert',
            buttons: [
                {
                    text: me.translate.instant("cancel"),
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                    }
                },
                {
                    text: me.translate.instant("ok"),
                    handler: () => {
                        me.unInstall();
                        console.log('Confirm Okay');
                    }
                }
            ]
        });

        await alert.present();
    }

    unInstallClick() {
        this.presentAlertConfirm().then();
    }

    unInstall() {
        this.appManager.unInstall(this.id, () => this.navCtrl.pop(), null);
    } */

    pluginAuthority(item, authority) {
        this.appManager.setPluginAuthority(this.id, item.plugin, authority);
        item.authority = authority;
    }

    urlAuthority(item, authority) {
        this.appManager.setUrlAuthority(this.id, item.url, authority);
        item.authority = authority;
    }
}
