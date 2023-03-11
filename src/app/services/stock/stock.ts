import { Stock } from '../../models/stock';
import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class StockProvider {
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider
  ) {}

  async getByPriority(
    codProErp: string,
    codCliErp: string
  ): Promise<Stock | undefined> {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const stocks: Array<Stock> = await this.customStorage.getLocal<Stock>(
      ModelNames.estoque + idEmp
    );
    // Retornar na ordem de prioridade: cliente/produto, apenas produto
    let stock = stocks.find(
      (stk) => stk.codCliErp === codCliErp && stk.codProErp === codProErp
    );
    if (!stock) {
      stock = stocks.find((stk) => stk.codProErp === codProErp);
    }
    return stock;
  }
}
