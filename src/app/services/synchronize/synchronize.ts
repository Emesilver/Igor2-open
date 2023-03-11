import { Injectable } from '@angular/core';
import { Company } from 'src/app/models/company';
import { Order } from './../../models/order';
import { AppState, ModelNames } from 'src/app/app.global';
import { ItemProvider } from '../item/item';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { ToastProvider } from '../toast/toast';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { UrlHelperProvider } from '../url-helper/url-helper';
import { EventsService } from '../events/events.service';
import { Charge } from 'src/app/models/interfaces/charge';

@Injectable({
  providedIn: 'root',
})
export class SynchronizeProvider {
  headers: any = { 'Content-Type': 'application/json' };

  constructor(
    public customHttpProvider: CustomHttpProvider,
    public urlHelperProvider: UrlHelperProvider,
    public global: AppState,
    public itemProvider: ItemProvider,
    private customStorageProvider: CustomStorageProvider,
    private toastProvider: ToastProvider,
    private events: EventsService
  ) {}

  async syncComplete(companies: Company[]) {
    try {
      const modelNames = ModelNames;

      for (const company of companies) {
        const customers_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.cliente,
          true
        );
        const balances_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.saldo,
          true
        );
        const items_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.produto,
          true
        );
        const mainItems_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.principais_produtos,
          true
        );
        const orders_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.pedido,
          true
        );
        const paymentPlans_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.plano,
          true
        );
        const params_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.par_venda,
          true
        );
        const prices_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.preco,
          true
        );
        const discounts_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.desconto,
          true
        );
        const stocks_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.estoque,
          true
        );
        const comissions_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.comissao,
          true
        );
        const deliveries_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.tipo_entrega,
          true
        );
        const deliveriesCapa_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.tipo_entrega_capa,
          true
        );
        const operations_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.operacao,
          true
        );
        const titles_p = this.customHttpProvider.getTotalLoadByEmp(
          company,
          modelNames.titulo,
          true
        );

        const [
          customers,
          balances,
          items,
          mainItems,
          orders,
          paymentPlans,
          params,
          prices,
          discounts,
          stocks,
          comissions,
          deliveries,
          deliveriesCapa,
          operations,
          titles,
        ] = await Promise.all([
          customers_p,
          balances_p,
          items_p,
          mainItems_p,
          orders_p,
          paymentPlans_p,
          params_p,
          prices_p,
          discounts_p,
          stocks_p,
          comissions_p,
          deliveries_p,
          deliveriesCapa_p,
          operations_p,
          titles_p,
        ]);

        // Tratamentos especificos
        this.sortMainItens(mainItems);
        this.sortOrdersByDate(orders);

        // saveTotal eh protegida para nao salvar dados nulos
        await this.saveTotal(customers, modelNames.cliente + company.idEmp);
        await this.saveTotal(balances, modelNames.saldo + company.idEmp);
        await this.saveTotal(items, modelNames.produto + company.idEmp);
        await this.saveTotal(
          mainItems,
          modelNames.principais_produtos + company.idEmp
        );
        await this.saveTotal(orders, modelNames.pedido + company.idEmp);
        await this.saveTotal(paymentPlans, modelNames.plano + company.idEmp);
        await this.saveTotal(params, modelNames.par_venda + company.idEmp);
        await this.saveTotal(prices, modelNames.preco + company.idEmp);
        await this.saveTotal(discounts, modelNames.desconto + company.idEmp);
        await this.saveTotal(stocks, modelNames.estoque + company.idEmp);
        await this.saveTotal(comissions, modelNames.comissao + company.idEmp);
        await this.saveTotal(
          deliveries,
          modelNames.tipo_entrega + company.idEmp
        );
        await this.saveTotal(
          deliveriesCapa,
          modelNames.tipo_entrega_capa + company.idEmp
        );
        await this.saveTotal(operations, modelNames.operacao + company.idEmp);
        await this.saveTotal(titles, modelNames.titulo + company.idEmp);
      }
    } catch (error) {
      this.customStorageProvider.clear();
    }
  }

  private sortOrdersByDate(orders: Array<Order>) {
    orders.sort((a, b) => {
      if (a.dataPed === b.dataPed) {
        if (a.codPedErp > b.codPedErp) {
          return -1;
        } else {
          return 1;
        }
      } else {
        return +new Date(b.dataPed) - +new Date(a.dataPed);
      }
    });
  }

  // Coloca os itens mais utilizados antes
  private sortMainItens(mainItens: Array<any>) {
    mainItens.sort((a, b) => {
      if (a.total > b.total) {
        return -1;
      } else if (b.total > a.total) {
        return 1;
      } else if (a.descricao > b.descricao) {
        return 1;
      } else if (b.descricao > a.descricao) {
        return -1;
      }
      return 0;
    });
  }

  async saveTotal(tableData: any[], collection: string) {
    let retOk = false;
    // proteger para nao salvar local sem informacoes, pois pode ter dado falha na leitura online e o tableData ser null
    if (tableData) {
      this.customStorageProvider.saveLocal(collection, tableData);
      //      this.storage.set(collection, tableData);
      retOk = true;
    }
    return retOk;
  }

  async syncByCharge(companies: Company[]) {
    for (const company of companies) {
      try {
        const charges = await this.getChargeNeed(company);
        if (charges && charges.length > 0) {
          const promises = charges.map((charge) => {
            return this.processCharge(
              this.global.modelNameByTableName(charge.tabela as ModelNames),
              charge,
              company
            );
          });
          await Promise.all(promises);
        }
      } catch (error) {
        this.toastProvider.show(
          'Falha de sincronismo para empresa ' +
            company.idEmp +
            '. Erro:' +
            error
        );
      }
    }
    this.events.publish('refreshInfo', {});
  }

  async processCharge(model: string, charge: Charge, company: Company) {
    try {
      if (charge.tipo === 'T') {
        if (charge.tabela === 'pedido') {
          // Pedidos tem tratamento diferenciado porque pode é enviado ao ERP e retorna ao Igor
          await this.totalChargeOrderByCharge(company, charge);
          // o postCharge eh feito na propria totalChargeOrder
        } else {
          const tableData = await this.customHttpProvider.getTotalLoadByCharge(
            company,
            model,
            charge.ultCarga
          );
          if (await this.saveTotal(tableData, model + company.idEmp)) {
            await this.postCharge(company.idEmp, company.codRepErp, charge);
          }
        }
      } else {
        if (await this.partialUpdate(company, charge.tabela, charge.ultCarga)) {
          await this.postCharge(company.idEmp, company.codRepErp, charge);
        }
      }
    } catch (error: any) {
      this.toastProvider.show('Falha:' + error.message);
    }
  }

  private async getChargeNeed(company: Company) {
    const endPoint = await this.urlHelperProvider.getURL(
      company.idEmp,
      company.codRepErp,
      ModelNames.carga,
      'GET',
      ''
    );
    try {
      return await this.customHttpProvider.getTypedObjURL<Charge>(endPoint);
    } catch (error) {
      this.toastProvider.show('Estamos trabalhando offline (sem internet).');
      return [];
    }
  }

  private async totalChargeOrderByCharge(company: Company, charge: Charge) {
    const model = this.global.modelNameByTableName(charge.tabela as ModelNames);
    const bkpName = model + company.idEmp + 'bkp';
    // Fazer backup da tabela de pedidos
    const ordersLocal = await this.customHttpProvider.getLocal<Order>(
      model + company.idEmp
    );

    let ordersSent: Order[] = [];
    if (ordersLocal) {
      ordersSent = ordersLocal.filter((orderFiltering) => {
        return orderFiltering.statusPed === 'ENV';
      });
      if (ordersSent.length) {
        this.customStorageProvider.saveLocal(bkpName, ordersSent);
      } else {
        // se existe algum backup antigo, uso esse mesmo
        ordersSent = await this.customStorageProvider.getLocal<Order>(bkpName);
      }
    }
    // Sobrescreve a tabela de pedidos da memoria com os pedidos do servidor
    const ordersRemote = await this.customHttpProvider.getTotalLoadByCharge(
      company,
      model,
      charge.ultCarga
    );
    // sempre que solicitar a carga online, deve se tomar o cuidado de testar se teve retorno
    if (ordersRemote) {
      this.sortOrdersByDate(ordersRemote);
      if (ordersSent) {
        // Adicionar os registros enviados que ainda nao voltaram do erp
        ordersSent.forEach((orderSent) => {
          const orderExisting = ordersRemote.find((el) => {
            return el.codPedGuid === orderSent.codPedGuid;
          });
          if (!orderExisting) {
            ordersRemote.unshift(orderSent);
          }
        });
      }
      // Grava os pedidos da memoria no storage
      if (await this.saveTotal(ordersRemote, model + company.idEmp)) {
        // Informa o servidor que recebeu a carga
        await this.postCharge(company.idEmp, company.codRepErp, charge);
      }

      // Apaga o backup
      this.customStorageProvider.remove(bkpName);
    }
  }

  private async partialUpdate(
    company: Company,
    tableName: string,
    ultCarga: number
  ) {
    let retOk = false;
    const model = this.global.modelNameByTableName(tableName as ModelNames);
    const dataPartialReturned = await this.customHttpProvider.getPartialLoad(
      company,
      model,
      ultCarga
    );
    if (dataPartialReturned) {
      await this.customStorageProvider.updateLocal(
        dataPartialReturned,
        model + company.idEmp,
        this.global.getModelKeys(model)
      );
      retOk = true;
    }
    return retOk;
  }

  // Marca a carga como recebida
  async postCharge(idEmp: string, codRepErp: string, data: any) {
    return new Promise((resolve, reject) => {
      this.customHttpProvider
        .postObj(idEmp, codRepErp, ModelNames.carga, data)
        .then((dataResult) => {
          resolve(dataResult);
        })
        .catch((error) => {
          reject(
            'Ops! Recebi as atualizações mas deu erro na confirmação. Erro:' +
              error
          );
        });
    });
  }
}
