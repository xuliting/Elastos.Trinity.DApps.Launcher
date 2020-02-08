import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { DragulaModule } from 'ng2-dragula';
import { TranslateModule } from '@ngx-translate/core';
import { RunningManagerComponent } from '../components/running-manager/running-manager.component';
import { RunningAppsComponent } from '../components/running-apps/running-apps.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        DragulaModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage
            }
        ])
    ],
    entryComponents: [],
    declarations: [HomePage]
})
export class HomePageModule { }
