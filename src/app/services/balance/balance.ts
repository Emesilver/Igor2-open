import { Balance } from '../../models/balance';
import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class BalanceProvider {
  constructor(
    public global: AppState,
    public customStorage: CustomStorageProvider
  ) {}

  async getByCustomer(codCliEmp: string): Promise<Balance | undefined> {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const balances: Array<Balance> = await this.customStorage.getLocal<Balance>(
      ModelNames.saldo + idEmp
    );
    return balances.find((bal) => bal.codCliErp === codCliEmp);
  }
}
