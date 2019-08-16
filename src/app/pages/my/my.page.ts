import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingService } from "../../services/setting.service";

@Component({
    selector: 'app-my',
    templateUrl: './my.page.html',
    styleUrls: ['./my.page.scss'],
})
export class MyPage implements OnInit {

    myInfos = [{
        route: "/manager",
        label: "app-manager",
        icon: "manager",
        fn: "manager()",
    }, {
        route: "/language",
        label: "language-setting",
        icon: "language",
        note: "中文(简体)",
    },
    // {
    //     route: "/wallpaper",
    //     label: "wallpaper-setting",
    //     icon: "wallpaper",
    // },
    // {
    //     route: "/iconsize",
    //     label: "icon-size",
    //     icon: "iconsize",
    // },
    {
        route: "/about",
        label: "about",
        icon: "about",
        note: "v1.0",
    },
    // {
    //     route: "/share",
    //     label: "share",
    //     icon: "share",
    // }
    ];

    public infos: any;

    constructor(private translate: TranslateService,
        public setting: SettingService) {

        var me = this;
        this.translate.onLangChange.subscribe(data => {
            console.log("onLangChange");
            me.changeLangNote(data.lang);
        });
        this.changeLangNote(this.translate.currentLang);
    }

    ngOnInit() {
    }

    changeLangNote(code) {
        this.myInfos[1].note = this.setting.getLanguageName(code);
        this.infos = this.myInfos;
    }
}
