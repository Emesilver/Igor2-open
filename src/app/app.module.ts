import { CustomerLimitPage } from './customer-limit/customer-limit.page';
import { BalanceProvider } from './services/balance/balance';
import { IonicStorageModule } from '@ionic/storage';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
// import { FCM } from '@ionic-native/fcm/ngx';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Network } from '@ionic-native/network/ngx';
import { UserProvider } from './services/user/user';
import { StockProvider } from './services/stock/stock';
import { DiscountProvider } from './services/discount/discount';
import { CustomStorageProvider } from './services/custom-storage/custom-storage';
import { SynchronizeProvider } from './services/synchronize/synchronize';
import { ToastProvider } from './services/toast/toast';
import { LogProvider } from './services/log/log';
import { UtilProvider } from './services/util/util';
import { LoaderProvider } from './services/loader/loader';
import { PriceProvider } from './services/price/price';
import { ItemProvider } from './services/item/item';
import { PaymentPlanProvider } from './services/payment-plan/payment-plan';
import { OrderProvider } from './services/order/order';
import { CustomerProvider } from './services/customer/customer';
import { ParamProvider } from './services/param/param';
import { CityStateProvider } from './services/city-state/city-state';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { FormsModule } from '@angular/forms';
import { SelectStatePage } from './select-state/select-state.page';
import { SelectStatePageModule } from './select-state/select-state.module';
import { SelectCityPageModule } from './select-city/select-city.module';
import { SelectCityPage } from './select-city/select-city.page';
import { SelectCustomerPage } from './select-customer/select-customer.page';
import { SelectCustomerPageModule } from './select-customer/select-customer.module';
import { CustomerLimitPageModule } from './customer-limit/customer-limit.module';
import { SelectItemPage } from './select-item/select-item.page';
import { SelectItemPageModule } from './select-item/select-item.module';
import { CustomErrorPage } from './custom-error/custom-error.page';
import { CustomErrorPageModule } from './custom-error/custom-error.module';
import { ComissionProvider } from './services/comission/comission';
import { DeliveryTypeProvider } from './services/delivery-type/delivery-type';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
    SelectStatePage,
    SelectCityPage,
    SelectCustomerPage,
    CustomerLimitPage,
    SelectItemPage,
    CustomErrorPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    SelectStatePageModule,
    SelectCityPageModule,
    SelectCustomerPageModule,
    CustomerLimitPageModule,
    SelectItemPageModule,
    CustomErrorPageModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FCM,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    UniqueDeviceID,
    Network,
    ParamProvider,
    CustomerProvider,
    OrderProvider,
    PaymentPlanProvider,
    ItemProvider,
    PriceProvider,
    LoaderProvider,
    UtilProvider,
    LogProvider,
    ToastProvider,
    SynchronizeProvider,
    CustomStorageProvider,
    CityStateProvider,
    DiscountProvider,
    BalanceProvider,
    StockProvider,
    UserProvider,
    CallNumber,
    LaunchNavigator,
    ComissionProvider,
    DeliveryTypeProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
