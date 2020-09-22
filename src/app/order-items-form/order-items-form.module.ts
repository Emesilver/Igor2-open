import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderItemsFormPage } from './order-items-form.page';

const routes: Routes = [
  {
    path: '',
    component: OrderItemsFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OrderItemsFormPage]
})
export class OrderItemsFormPageModule {}
