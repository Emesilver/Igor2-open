import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderFinishFormPage } from './order-finish-form.page';

const routes: Routes = [
  {
    path: '',
    component: OrderFinishFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OrderFinishFormPage]
})
export class OrderFinishFormPageModule {}
