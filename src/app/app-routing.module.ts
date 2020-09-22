import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: '', loadChildren: './home/home.module#HomePageModule' },
//  { path: '', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'customer-list', loadChildren: './customer-list/customer-list.module#CustomerListPageModule' },
  { path: 'unfinished-login', loadChildren: './unfinished-login/unfinished-login.module#UnfinishedLoginPageModule' },
  { path: 'customer-form', loadChildren: './customer-form/customer-form.module#CustomerFormPageModule' },
  { path: 'customer-limit', loadChildren: './customer-limit/customer-limit.module#CustomerLimitPageModule' },
  { path: 'customer-view', loadChildren: './customer-view/customer-view.module#CustomerViewPageModule' },
  { path: 'order-finish-form', loadChildren: './order-finish-form/order-finish-form.module#OrderFinishFormPageModule' },
  { path: 'order-general-form', loadChildren: './order-general-form/order-general-form.module#OrderGeneralFormPageModule' },
  { path: 'order-item-form', loadChildren: './order-item-form/order-item-form.module#OrderItemFormPageModule' },
  { path: 'order-items-form', loadChildren: './order-items-form/order-items-form.module#OrderItemsFormPageModule' },
  { path: 'order-list', loadChildren: './order-list/order-list.module#OrderListPageModule' },
  { path: 'politica', loadChildren: './politica/politica.module#PoliticaPageModule' },
  { path: 'synchronize', loadChildren: './synchronize/synchronize.module#SynchronizePageModule' },
  { path: 'drafts-list', loadChildren: './drafts-list/drafts-list.module#DraftsListPageModule' },
  { path: 'chat', loadChildren: './chat/chat.module#ChatPageModule' },
  { path: 'consult', loadChildren: './consult/consult/consult.module#ConsultPageModule' },
  { path: 'consult-items', loadChildren: './consult/consult-items/consult-items.module#ConsultItemsPageModule' },
  { path: 'consult-orders',loadChildren: './consult/consult-orders/consult-orders.module#ConsultOrdersPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
