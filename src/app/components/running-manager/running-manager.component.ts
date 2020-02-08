import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppmanagerService } from 'src/app/services/appmanager.service';
import { TranslateService } from '@ngx-translate/core';
import { DragulaService } from 'ng2-dragula';

@Component({
    selector: 'app-running-manager',
    templateUrl: './running-manager.component.html',
    styleUrls: ['./running-manager.component.scss'],
})
export class RunningManagerComponent implements OnInit, OnDestroy {

    public runningApps = [];
    public empty = [];
    public pressed = false;

    constructor(
        public appManagerService: AppmanagerService,
        public translate: TranslateService,
        private dragulaService: DragulaService
    ) {
        console.log(this.translate.currentLang);

        this.dragulaService.createGroup('Runnings', {
            // ...
        });

        this.dragulaService.drag('Runnings').subscribe(args => {
            this.pressed = true;
            console.log(args);
        });

        this.dragulaService.dropModel('Runnings').subscribe(args => {
            console.log(args);
            appManagerService.close(args.item);
        });
    }

    ngOnInit() {
        let apps = [];
        this.appManagerService.runningList.map((appId) => {
            this.appManagerService.appInfos.map((app) => {
                if (appId === app.id) {
                    apps = apps.concat(app);
                    this.runningApps = apps;
                }
            });
        });
    }

    ngOnDestroy() {
        this.dragulaService.destroy('Runnings');
    }

    onClick(id: string) {
        this.appManagerService.start(id);
    }

    onPress(): boolean {
        // this.pressed=true;
        return true;
    }

    getAppIcon(id: string) {
        return this.appManagerService.appInfos.map(app => {
            if (app.id === id) {
                console.log('FOUND APP FOR ICON', app.icons[0].src);
                return this.appManagerService.sanitize(app.icons[0].src);
            }
        });
    }

    getAppName(id: string) {
        return this.appManagerService.appInfos.map(app => {
            if (app.id === id) {
                console.log('FOUND APP FOR NAME', app.name);
                return app.name;
            }
        });
    }
}
