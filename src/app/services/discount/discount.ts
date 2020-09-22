import { Discount } from './../../models/discount';
import { Injectable } from '@angular/core';
// import { CustomHttpProvider } from '../custom-http/custom-http';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';
import { PriorityProvider } from '../priority/priority';

@Injectable({
  providedIn: 'root'
})
export class DiscountProvider {

  constructor(
//    private customHttpProvider: CustomHttpProvider,
    private global: AppState,
    private storage: Storage,
    private priorityProvider: PriorityProvider
  ) {
  }

  getByPriority(codProErp: string, codCliErp: string, codRepErp: string) {
    return new Promise<Discount>(async (resolve) => {
      const idEmp = this.global.getProperty('idEmp');
      const discounts: Array<Discount> =
        await this.storage.get(this.global.modelNames.desconto + idEmp);
      const discount = this.priorityProvider.getByPriority(discounts, codCliErp, codProErp);
      resolve(discount);
    });
  }
}
