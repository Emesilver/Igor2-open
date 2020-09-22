import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultItemsPage } from './consult-items.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultItemsPageRoutingModule {}
