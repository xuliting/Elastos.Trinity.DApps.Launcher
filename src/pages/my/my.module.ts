import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPage } from './my';

@NgModule({
  imports: [
    IonicPageModule.forChild(MyPage),
  ],
})
export class MyPageModule {}
