import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'customer-list', loadChildren: () => import('./customer-list/customer-list.module').then(m => m.CustomerListPageModule) },
  { path: 'unfinished-login', loadChildren: () => import('./unfinished-login/unfinished-login.module').then(m => m.UnfinishedLoginPageModule) },
  { path: 'customer-form', loadChildren: () => import('./customer-form/customer-form.module').then(m => m.CustomerFormPageModule) },
  { path: 'customer-limit', loadChildren: () => import('./customer-limit/customer-limit.module').then(m => m.CustomerLimitPageModule) },
  { path: 'customer-view', loadChildren: () => import('./customer-view/customer-view.module').then(m => m.CustomerViewPageModule) },
  { path: 'order-finish-form', loadChildren: () => import('./order-finish-form/order-finish-form.module').then(m => m.OrderFinishFormPageModule) },
  { path: 'order-general-form', loadChildren: () => import('./order-general-form/order-general-form.module').then(m => m.OrderGeneralFormPageModule) },
  { path: 'order-item-form', loadChildren: () => import('./order-item-form/order-item-form.module').then(m => m.OrderItemFormPageModule) },
  { path: 'order-items-form', loadChildren: () => import('./order-items-form/order-items-form.module').then(m => m.OrderItemsFormPageModule) },
  { path: 'order-list', loadChildren: () => import('./order-list/order-list.module').then(m => m.OrderListPageModule) },
  { path: 'politica', loadChildren: () => import('./politica/politica.module').then(m => m.PoliticaPageModule) },
  { path: 'synchronize', loadChildren: () => import('./synchronize/synchronize.module').then(m => m.SynchronizePageModule) },
  { path: 'drafts-list', loadChildren: () => import('./drafts-list/drafts-list.module').then(m => m.DraftsListPageModule) },
  { path: 'consult', loadChildren: () => import('./consult/consult/consult.module').then(m => m.ConsultPageModule) },
  { path: 'consult-items', loadChildren: () => import('./consult/consult-items/consult-items.module').then(m => m.ConsultItemsPageModule) },
  { path: 'consult-orders',loadChildren: () => import('./consult/consult-orders/consult-orders.module').then(m => m.ConsultOrdersPageModule) },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
