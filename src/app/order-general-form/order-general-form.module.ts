import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderGeneralFormPage } from './order-general-form.page';

const routes: Routes = [
  {
    path: '',
    component: OrderGeneralFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OrderGeneralFormPage]
})
export class OrderGeneralFormPageModule {}
