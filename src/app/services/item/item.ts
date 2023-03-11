import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { Injectable } from '@angular/core';
import { filter as _filter, sortBy as _sortBy } from 'lodash';
import { Item } from '../../models/item';
import { AppState, ModelNames, Properties } from '../../app.global';
import { Order } from '../../models/order';

@Injectable({
  providedIn: 'root',
})
export class ItemProvider {
  constructor(
    private customStorageProvider: CustomStorageProvider,
    private global: AppState
  ) {}

  async getLocalList(): Promise<Item[]> {
    return this.customStorageProvider.getLocal(
      ModelNames.produto + this.global.getProperty(Properties.ID_EMP)
    );
  }

  async getInLastOrder(itemId: string, clientId: string) {
    let orders = await this.customStorageProvider.getLocal<Order>(
      ModelNames.pedido + this.global.getProperty(Properties.ID_EMP)
    );

    orders = _filter(orders, {
      codCliErp: clientId,
      itens: [{ codProErp: itemId }],
    });

    orders = _sortBy(orders, (dateObj) => {
      return new Date(dateObj.dataPed);
    }).reverse();

    if (orders.length > 0) {
      return orders[0].itens.find((x) => x.codProErp === itemId);
    }

    return null;
  }

  async getMainItens(): Promise<Item[]> {
    return this.customStorageProvider.getLocal(
      ModelNames.principais_produtos +
        this.global.getProperty(Properties.ID_EMP)
    );
  }

  async getByCodProErp(codProErp: string): Promise<Item> {
    const items = await this.customStorageProvider.getLocal<Item>(
      ModelNames.produto + this.global.getProperty(Properties.ID_EMP)
    );
    return items.find((item: Item) => item.codProErp === codProErp) as Item;
  }
}
