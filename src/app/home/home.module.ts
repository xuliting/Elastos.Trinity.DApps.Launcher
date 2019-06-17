import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { RunningManagerComponent } from '../components/running-manager/running-manager.component';
import { DragulaModule } from 'ng2-dragula';
import { TranslateModule } from '@ngx-translate/core';

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
    entryComponents: [RunningManagerComponent],
    declarations: [HomePage, RunningManagerComponent]
})
export class HomePageModule { }
