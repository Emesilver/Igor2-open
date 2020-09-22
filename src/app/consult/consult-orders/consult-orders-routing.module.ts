import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultOrdersPage } from './consult-orders.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultOrdersPageRoutingModule {}
