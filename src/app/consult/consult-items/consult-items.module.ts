import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultItemsPageRoutingModule } from './consult-items-routing.module';

import { ConsultItemsPage } from './consult-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultItemsPageRoutingModule
  ],
  declarations: [ConsultItemsPage]
})
export class ConsultItemsPageModule {}
