import { Component, OnInit } from '@angular/core';
import { SettingService } from "../../services/setting.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-language',
    templateUrl: './language.page.html',
    styleUrls: ['./language.page.scss'],
})
export class LanguagePage implements OnInit {

    constructor(
        public translate: TranslateService,
        public setting: SettingService
    ) {
    }

    ngOnInit() {
    }

}
