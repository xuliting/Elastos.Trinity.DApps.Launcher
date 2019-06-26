import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppmanagerService } from "../../services/appmanager.service";
import { DragulaService } from 'ng2-dragula';

@Component({
    selector: 'app-running-manager',
    templateUrl: './running-manager.component.html',
    styleUrls: ['./running-manager.component.scss'],
})
export class RunningManagerComponent implements OnInit, OnDestroy {

    public empty = [];
    public pressed = false;

    constructor(public appManager: AppmanagerService,
        public translate: TranslateService,
        private dragulaService: DragulaService) {
        console.log(this.translate.currentLang);
        this.dragulaService.createGroup("Runnings", {
            // ...
        });

        this.dragulaService.dropModel("Runnings").subscribe(args => {
            console.log(args);
            appManager.close(args.item)
        });
    }

    ngOnInit() { }

    ngOnDestroy() {
        this.dragulaService.destroy("Runnings")
    }

    onClick(id: string) {
        this.appManager.start(id);
    }
}
