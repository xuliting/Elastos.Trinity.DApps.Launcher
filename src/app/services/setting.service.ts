import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class SettingService {
    public languages = [{
        name: 'System language',
        code: 'system',
    }, {
        name: 'English',
        code: 'en'

    }, {
        name: '中文（简体）',
        code: 'zh'
    }];

    public currentLang: string = null;
    public systemLang: string = null;
    public selectLang: string = null;

    public version: string = "1.0.0";

    constructor(
        private translate: TranslateService,
        private storage: Storage
    ) {
    }

    init() {
        for (var i = 1; i < this.languages.length; i++) {
            this.translate.addLangs([this.languages[i].code]);
        }

        var me = this;
        this.translate.onLangChange.subscribe(data => {
            console.log("onLangChange");
            me.onLangChange(data.lang);
        });
        this.storage.get("selectLang").then(code => {
            console.log(code);
            if (typeof (code) === "string" && code != null) {
                me.setSelectLang(code);
            }
        });
    }

    onLangChange(code: string) {
        this.currentLang = this.translate.currentLang;
        this.setSystemLangName();
    }

    getLanguageName(code: string) {
        for (var i = 0; i < this.languages.length; i++) {
            if (this.languages[i].code === code) {
                return this.languages[i].name;
            }
        }
    }

    setDefaultLang(code: string) {
        if (this.selectLang === null) {
            this.selectLang = code;
        }

        if (this.translate.defaultLang !== code) {
            this.translate.setDefaultLang(code);
        }

        if (this.currentLang === null) {
            this.setCurrentLang(code);
        }
    }

    setSystemLangName() {
        this.languages[0].name = this.translate.instant("system_language");
        if (this.systemLang !== null) {
            this.languages[0].name += ": " + this.getLanguageName(this.systemLang);
        }
    }

    setSystemLang(code: string) {
        if (this.systemLang === null) {
            this.setSystemLangName();
        }
        this.systemLang = code;
    }

    setCurrentLang(code: string) {
        if (this.currentLang !== code) {
            this.translate.use(code);
        }
    }

    setSelectLang(code: string) {
        if (this.selectLang !== code) {
            this.selectLang = code;
            this.storage.set("selectLang", this.selectLang).then();
        }
        if (code === "system") {
            code = this.systemLang;
        }
        this.setCurrentLang(code);
    }

}
