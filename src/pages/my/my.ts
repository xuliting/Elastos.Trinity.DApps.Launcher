import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

import {HomePage} from '../home/home';
import {ManagePage} from '../manage/manage';
import {TabsPage} from '../tabs/tabs';
import {AppConfig} from "../../app/app.config";

declare let appManager: any;

@Component({
    selector: 'page-my',
    templateUrl: 'my.html',
})
export class MyPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    display_msg(content) {
        console.log("ElastosJS  MyPage === msg " + content);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MyPage');
    }

    goHome() {
        this.navCtrl.push(HomePage);
    }

    goManager() {
        this.navCtrl.push(ManagePage);
    }

    goTabs() {
        this.navCtrl.push(TabsPage);
    }

    goSamples() {
        this.display_msg(AppConfig.SAMPLES_APP_ID);
        appManager.start(AppConfig.SAMPLES_APP_ID);
    }

    goTodo() {
        this.display_msg(AppConfig.TODO_APP_ID);
        appManager.start(AppConfig.TODO_APP_ID);
    }

}
