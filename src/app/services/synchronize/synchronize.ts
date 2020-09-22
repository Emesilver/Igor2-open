import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Company } from 'src/app/models/company';
import { Order } from './../../models/order';
import { AppState } from 'src/app/app.global';
import { ItemProvider } from '../item/item';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { ToastProvider } from '../toast/toast';
import { DeliveryTypeProvider } from '../delivery-type/delivery-type';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { UrlHelperProvider } from '../url-helper/url-helper';
import { EventsService } from '../events/events.service';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeProvider {
  headers: any = { 'Content-Type': 'application/json' };

  constructor(
    public customHttpProvider: CustomHttpProvider,
    public urlHelperProvider: UrlHelperProvider,
    public global: AppState,
    public storage: Storage,
    public itemProvider: ItemProvider,
    public genericStorageProvider: CustomStorageProvider,
    private toastProvider: ToastProvider,
    private deliveryTypeProvider: DeliveryTypeProvider,
    private events: EventsService,
  ) { }

  async syncComplete(data: any) {
    try {
      const modelName = this.global.modelNames;

      for (const element of data) {
        const idEmp = element.idEmp
        const codRepErp = element.codRepErp
        const customers = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.cliente, true);
        const balances = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.saldo, true);
        const items = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.produto, true);
        const mainItems = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.principais_produtos, true);
        const orders = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.pedido, true);
        const paymentPlans = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.plano, true);
        const params = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.par_venda, true);
        const prices = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.preco, true);
        const discounts = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.desconto, true);
        const stocks = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.estoque, true);
        const comissions = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.comissao, true);
        const deliveries = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.tipo_entrega, true);
        const deliveriesCapa = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.tipo_entrega_capa, true);
        const operations = await this.customHttpProvider.getTotalLoadByEmp(
          idEmp, codRepErp, modelName.operacao, true)

        // Tratamentos especificos
        this.sortMainItens(mainItems)
        this.sortOrdersByDate(orders)

        // saveTotal eh protegida para nao salvar dados nulos
        await this.saveTotal(customers, modelName.cliente + element.idEmp);
        await this.saveTotal(balances, modelName.saldo + element.idEmp);
        await this.saveTotal(items, modelName.produto + element.idEmp);
        await this.saveTotal(mainItems, modelName.principais_produtos + element.idEmp);
        await this.saveTotal(orders, modelName.pedido + element.idEmp);
        await this.saveTotal(paymentPlans, modelName.plano + element.idEmp);
        await this.saveTotal(params, modelName.par_venda + element.idEmp);
        await this.saveTotal(prices, modelName.preco + element.idEmp);
        await this.saveTotal(discounts, modelName.desconto + element.idEmp);
        await this.saveTotal(stocks, modelName.estoque + element.idEmp);
        await this.saveTotal(comissions, modelName.comissao + element.idEmp);
        await this.saveTotal(deliveries, modelName.tipo_entrega + element.idEmp);
        await this.saveTotal(deliveriesCapa, modelName.tipo_entrega_capa + element.idEmp);
        await this.saveTotal(operations, modelName.operacao + element.idEmp);

      }
    } catch (error) {
      this.genericStorageProvider.clear();
      console.error(error);
    }
  }

  private sortOrdersByDate(orders:Array<Order>) {
    orders.sort((a, b) => {
      if (a.dataPed === b.dataPed) {
        if (a.codPedErp > b.codPedErp) {
          return -1
        } else {
          return 1
        }
      }
      else {
        return +new Date(b.dataPed) - +new Date(a.dataPed);
      }
    })
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
    })
  }

  async saveTotal(tableData, collection:string) {
    let retOk = false
    // proteger para nao salvar local sem informacoes, pois pode ter dado falha na leitura online e o tableData ser null
    if (tableData) {
      this.storage.set(collection, tableData);
      retOk = true
    }
    return retOk
  }

  async syncByCharge(companies: Array<Company>) {
    for (const company of companies) {
      try {
        const charges: any = await this.getChargeNeed(company.idEmp, company.codRepErp);
        if (charges && (charges.length > 0)) {
          for (const charge of charges) {
            const model = this.global.modelNameByTableName(charge.tabela)
            try {
              if (charge.tipo === 'T') {
                if (charge.tabela === 'pedido') {
                  // Pedidos tem tratamento diferenciado porque pode é enviado ao ERP e retorna ao Igor
                  await this.totalChargeOrderByCharge(company.idEmp, company.codRepErp, charge);
                  // o postCharge eh feito na propria totalChargeOrder
                } else {
                  const tableData = await this.customHttpProvider.getTotalLoadByCharge(
                    company.idEmp, company.codRepErp, model, charge.ultCarga
                  );
                  if (await this.saveTotal(tableData, model + company.idEmp)) {
                    await this.postCharge(company.idEmp, company.codRepErp, charge);
                  }
                }
              } else {
                if (await this.partialUpdate(company.idEmp, company.codRepErp, charge.tabela, charge.ultCarga) ) {
                  await this.postCharge(company.idEmp, company.codRepErp, charge);
                }
              }
            } catch (error) {
              console.error(error);
              this.toastProvider.show('Falha:' + error.message);
            }
          }
        }
      } catch (error) {
        this.toastProvider.show('Falha de sincronismo para empresa ' + company.idEmp + '. Erro:' + error);
      }
    }
    this.events.publish('refreshInfo', {})
  }

  private getChargeNeed(idEmp: string, codRepErp: string) {
    return new Promise((resolve, reject) => {
      this.customHttpProvider.getByURLBase(idEmp, codRepErp, this.global.modelNames.carga)
      .then((chargesNeeded) => {
        resolve(chargesNeeded)
      })
      .catch((error) => {
        reject(error)
      })
    })
  }

  private async totalChargeOrderByCharge(idEmp: string, codRepErp: string, charge) {
    const model = this.global.modelNameByTableName(charge.tabela);
    const bkpName = model + idEmp + 'bkp';
    // Fazer backup da tabela de pedidos
    const ordersLocal: Array<Order> = await this.customHttpProvider.getLocal(model + idEmp)

    let ordersSent = null;
    if (ordersLocal) {
      ordersSent = ordersLocal.filter((orderFiltering) => {
        return (orderFiltering.statusPed === 'ENV');
      });
      if (ordersSent) {
        this.storage.set(bkpName, ordersSent);
      } else {
        // se existe algum backup antigo, uso esse mesmo
        ordersSent = await this.storage.get(bkpName);
      }
    }
    // Sobrescreve a tabela de pedidos da memoria com os pedidos do servidor
    const ordersRemote = await this.customHttpProvider.getTotalLoadByCharge(idEmp, codRepErp, model, charge.ultCarga);
    // sempre que solicitar a carga online, deve se tomar o cuidado de testar se teve retorno
    if (ordersRemote) {
      this.sortOrdersByDate(ordersRemote)
      if (ordersSent) {
        // Adicionar os registros enviados que ainda nao voltaram do erp
        ordersSent.forEach(orderSent => {
          const orderExisting = ordersRemote.find((el) => {
            return el.codPedGuid === orderSent.codPedGuid;
          });
          if (!orderExisting) {
            ordersRemote.unshift(orderSent);
          }
        });
      }
      // Grava os pedidos da memoria no storage
      if (this.saveTotal(ordersRemote, model + idEmp)) {
        // Informa o servidor que recebeu a carga
        await this.postCharge(idEmp, codRepErp, charge);
      }

      // Apaga o backup
      this.storage.remove(bkpName);
    }
  }

  private async partialUpdate(idEmp:string, codRepErp: string, tableName: string, ultCarga) {
    let retOk = false
    const model = this.global.modelNameByTableName(tableName);
    const dataPartialReturned = await this.customHttpProvider.getPartialLoad(idEmp, codRepErp, model, ultCarga)
    if (dataPartialReturned) {
      await this.genericStorageProvider.updateLocal(
        dataPartialReturned, model+idEmp, this.global.getFieldIdName(model)
      )
      retOk = true
    }
    return retOk
  }

  // Marca a carga como recebida
  async postCharge(idEmp: string, codRepErp: string, data: any) {
    return new Promise((resolve, reject) => {
      this.customHttpProvider.postObj(idEmp, codRepErp, this.global.modelNames.carga, data)
      .then((dataResult) => {
        resolve(dataResult)
      })
      .catch((error) => {
        reject('Ops! Recebi as atualizações mas deu erro na confirmação. Erro:' + error)
      })
    });
  }

}
