import { Injectable } from '@angular/core';
import { Price } from '../../models/price';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable()
export class PriceProvider {
  private pricesClient: Price[] = [];
  private pricesProdCache: Price[] = [];
  private lastClient = '';
  private lastProd = '';
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider
  ) {}

  async buildPricesClient(codTabErp: string, codCliErp: string) {
    if (codCliErp !== this.lastClient || !this.pricesClient.length) {
      const idEmp = this.global.getProperty(Properties.ID_EMP);
      const codRepErp = this.global.getProperty(Properties.COD_REP_ERP);
      const precos = await this.customStorage.getLocal<Price>(
        ModelNames.preco + idEmp
      );
      this.pricesClient = precos.filter(
        (price) =>
          (!price.codTabErp || price.codTabErp == codTabErp) &&
          (!price.codRepErp || price.codRepErp === codRepErp) &&
          (!price.codCliErp || price.codCliErp === codCliErp)
      );
      this.lastClient = codCliErp;
      // Invalidar cache de precos por produto
      this.pricesProdCache = [];
    }
  }
  async getProdPriceList(
    codTabErp: string,
    codProErp: string,
    codCliErp: string
  ) {
    await this.buildPricesClient(codTabErp, codCliErp);
    if (this.lastProd !== codProErp || !this.pricesProdCache.length) {
      this.pricesProdCache = this.pricesClient.filter(
        (price) => price.codProErp === codProErp
      );
    }
    return this.pricesProdCache;
  }

  async getMinQtd(codTabErp: string, codProErp: string, codCliErp: string) {
    const pricesProd = await this.getProdPriceList(
      codTabErp,
      codProErp,
      codCliErp
    );
    if (!pricesProd.length) {
      return 0;
    }
    return pricesProd.reduce(
      (min, price) => (price.qtdeMin < min ? price.qtdeMin : min),
      999
    );
  }

  async getByPriority(
    codTabErp: string,
    codProErp: string,
    codCliErp: string,
    qtde: number
  ) {
    const codRepErp = this.global.getProperty(Properties.COD_REP_ERP);
    // na ordem de prioridade: produto/cliente, produto/representante e apenas produto.
    const pricesProd = await this.getProdPriceList(
      codTabErp,
      codProErp,
      codCliErp
    );
    let price = pricesProd.find(
      (prc) =>
        prc.codCliErp === codCliErp &&
        prc.qtdeMin <= qtde &&
        prc.qtdeMax >= qtde
    );
    if (!price) {
      price = pricesProd.find(
        (prc) =>
          prc.codRepErp === codRepErp &&
          prc.qtdeMin <= qtde &&
          prc.qtdeMax >= qtde
      );
    }
    if (!price) {
      price = pricesProd.find(
        (prc) =>
          prc.codRepErp === '' &&
          prc.codCliErp === '' &&
          prc.qtdeMin <= qtde &&
          prc.qtdeMax >= qtde
      );
    }
    return price;
  }
}
