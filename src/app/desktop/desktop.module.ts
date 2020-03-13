import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { IonicModule } from '@ionic/angular';

import { DesktopPage } from './desktop.page';

const routes: Routes = [
  {
    path: '',
    component: DesktopPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    DragDropModule
  ],
  declarations: [DesktopPage]
})
export class DesktopPageModule {}
