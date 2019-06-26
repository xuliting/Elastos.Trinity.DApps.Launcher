import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from './back-button/back-button.component'

@NgModule({
  declarations: [BackButtonComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [BackButtonComponent],
  providers: [
    // BackButtonComponent,
  ],
  entryComponents: [BackButtonComponent],
})
export class ComponentsModule { }
