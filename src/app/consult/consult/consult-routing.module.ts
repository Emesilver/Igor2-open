import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultPage } from './consult.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultPageRoutingModule {}
