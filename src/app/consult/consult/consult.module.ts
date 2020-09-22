import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultPageRoutingModule } from './consult-routing.module';

import { ConsultPage } from './consult.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultPageRoutingModule
  ],
  declarations: [ConsultPage]
})
export class ConsultPageModule {}
