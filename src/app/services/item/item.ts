import { Storage } from '@ionic/storage';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { filter as _filter, sortBy as _sortBy } from 'lodash';
import { Item } from '../../models/item';
import { AppState } from 'src/app/app.global';

@Injectable({
  providedIn: 'root'
})
export class ItemProvider {

  constructor(
    private customStorageProvider: CustomStorageProvider,
    private customHttpProvider: CustomHttpProvider,

    private global: AppState,
  ) { }

  getLocalList(): Promise<Array<any>> {
    return this.customStorageProvider.getLocal(this.global.modelNames.produto + this.global.getProperty('idEmp'))
  }

  async getInLastOrder(itemId: string, clientId: string, companyId) {
    let orders = await this.customStorageProvider.getLocal(this.global.modelNames.pedido + companyId);

    orders = _filter(orders, { codCliErp: clientId, itens: [{ codProErp: itemId }] });

    orders = _sortBy(orders, (dateObj) => {
      return new Date(dateObj.dataPed);
    }).reverse();

    if (orders.length > 0) {
      return orders[0].itens.find(x => x.codProErp === itemId);
    }

    return null;
  }

  getMainItens(): Promise<Array<any>> {
    return this.customStorageProvider.getLocal(
      this.global.modelNames.principais_produtos + this.global.getProperty('idEmp')
    )
    // return new Promise((resolve, reject) => {
    //   const online = this.global.getProperty('online');
    //   if (online && remote) {
    //     this.customHttpProvider.getMainItens()
    //     .then((mainItens) => {
    //       mainItens = mainItens.sort((a, b) => {
    //         if (a.total > b.total) {
    //           return -1;
    //         } else if (b.total > a.total) {
    //           return 1;
    //         } else if (a.descricao > b.descricao) {
    //           return 1;
    //         } else if (b.descricao > a.descricao) {
    //           return -1;
    //         }
    //         return 0;
    //       });
    //       resolve(mainItens);
    //     })
    //     .catch((error) => {
    //       reject(null)
    //     })
    //   } else {
    //     resolve(this.customStorageProvider.getLocal(this.global.modelNames.principais_produtos + idEmp));
    //   }
    // })
  }

  getByCodProErp(codProErp: string): Promise<Item> {
    return new Promise<Item>(async resolve => {
      const items: Array<Item> = await this.customStorageProvider
        .getLocal(this.global.modelNames.produto + this.global.getProperty('idEmp'));
      resolve(items.find(x => x.codProErp === codProErp));
    });
  }
}
