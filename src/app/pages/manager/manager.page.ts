import { Component, OnInit } from '@angular/core';
import { AppmanagerService } from "../../services/appmanager.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-manager',
    templateUrl: './manager.page.html',
    styleUrls: ['./manager.page.scss'],
})
export class ManagerPage implements OnInit {

    constructor(public appManager: AppmanagerService,
        public translate: TranslateService) {

    }

    ngOnInit() {
    }

}
