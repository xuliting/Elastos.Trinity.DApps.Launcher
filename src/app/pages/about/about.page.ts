import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
    selector: 'app-about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

    public version = "0.5.1";
    public commitVersion = "v0.12";

    constructor(public translate: TranslateService,
        private inappBrowser: InAppBrowser) { }

    ngOnInit() {
    }

    goWebsite(url: string) {
        alert(url);
        const target = "_system";
        const options = "location=no";
        this.inappBrowser.create(url, target, options);
    }

}
