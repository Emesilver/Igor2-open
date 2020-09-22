import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Price } from '../../models/price';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';

/*
  Generated class for the PriceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PriceProvider {

  constructor(
    public global: AppState,
    public storage: Storage,
    public customHttpProvider: CustomHttpProvider,
  ) { }

  getByPriority(codTabErp: string, codProErp: string, codCliErp: string, codRepErp: string) {
    return new Promise<Price>(async (resolve) => {
      const idEmp = this.global.getProperty('idEmp');
      const prices: Array<Price> =
        await this.storage.get(this.global.modelNames.preco + idEmp);

      // na ordem de prioridade: produto/cliente, produto/representante e apenas produto.
      let price = prices.find(prc =>
        prc.codTabErp === codTabErp && prc.codProErp === codProErp && prc.codCliErp === codCliErp
      );

      if (!price) {
        price = prices.find(prc =>
          prc.codTabErp === codTabErp && prc.codProErp === codProErp && prc.codRepErp === codRepErp
        );
      }
      if (!price) {
        price = prices.find(prc =>
          prc.codTabErp === codTabErp && prc.codProErp === codProErp && prc.codRepErp === '' &&
          prc.codCliErp === ''
        );
      }
      resolve(price);
    });
  }
}
