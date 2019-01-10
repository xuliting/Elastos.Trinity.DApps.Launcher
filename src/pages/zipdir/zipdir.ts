import {Component} from '@angular/core';
import {NavController, NavParams, AlertController} from 'ionic-angular';

// import { ManagePage } from '../manage/manage';

declare let appManager: any;

let zipList = [];

@Component({
    selector: 'page-zipdir',
    templateUrl: 'zipdir.html',
})
export class ZipdirPage {

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController
    ) {
        zipList = this.navParams.get("zipList");
        console.log("zipList: " + zipList);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ZipdirPage');
    }

    getZipList() {
        console.log("zipList: " + zipList);
        return zipList;
    }

    installZip(item) {
        this.showPermissionPrompt(item);
    }

    doInstallZip(item) {
        let _this = this;
        appManager.install(item, function (ret) {
            console.log("3: " + JSON.stringify(ret));
            window.localStorage.setItem('shouldLauncherBeRefreshed_manage', '1'); // home页刷新标识: 0-不刷新, 1-刷新.
            _this.goManager();
        }, function (err) {
            console.log("4: " + JSON.stringify(err));
        });
    }

    goManager() {
        this.navCtrl.pop();
    }

    /**
     *
     * @desc 安装弹窗
     */
    showPermissionPrompt(item) {
        const prompt = this.alertCtrl.create({
            title: '<div class="permission-warning">安装提示</div>',
            message: "<div>即将安装: " + item + "</div>",
            buttons: [
                {
                    text: '取消',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: '确认',
                    handler: data => {
                        this.doInstallZip(item);
                    }
                }
            ]
        });
        prompt.present();
    }

}
