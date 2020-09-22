import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultOrdersPageRoutingModule } from './consult-orders-routing.module';

import { ConsultOrdersPage } from './consult-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultOrdersPageRoutingModule
  ],
  declarations: [ConsultOrdersPage]
})
export class ConsultOrdersPageModule {}
