import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderBarComponent } from './header-bar/header-bar.component'

@NgModule({
  declarations: [HeaderBarComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
  ],
  exports: [HeaderBarComponent],
  providers: [
  ],
  entryComponents: [],
})
export class ComponentsModule { }
