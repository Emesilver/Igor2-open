import { Discount } from './../../models/discount';
import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { PriorityProvider } from '../priority/priority';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class DiscountProvider {
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider,
    private priorityProvider: PriorityProvider
  ) {}

  async getByPriority(codProErp: string, codCliErp: string): Promise<Discount> {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const discounts = await this.customStorage.getLocal<Discount>(
      ModelNames.desconto + idEmp
    );
    return this.priorityProvider.getByPriority(discounts, codCliErp, codProErp);
  }
}
