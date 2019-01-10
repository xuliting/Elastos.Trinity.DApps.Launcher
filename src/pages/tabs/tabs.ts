import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

import {RunningPage} from '../running/running';
import {RecentPage} from '../recent/recent';


@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage {

    tab1Root = RunningPage;
    tab2Root = RecentPage;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad TabsPage');
    }

    goHome() {
        this.navCtrl.pop();
    }

}
