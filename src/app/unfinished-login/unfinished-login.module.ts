import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UnfinishedLoginPage } from './unfinished-login.page';

const routes: Routes = [
  {
    path: '',
    component: UnfinishedLoginPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UnfinishedLoginPage]
})
export class UnfinishedLoginPageModule {}
