import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderItemFormPage } from './order-item-form.page';

const routes: Routes = [
  {
    path: '',
    component: OrderItemFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [OrderItemFormPage]
})
export class OrderItemFormPageModule {}
