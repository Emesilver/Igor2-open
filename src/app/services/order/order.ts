// import { PaymentPlanProvider } from './../payment-plan/payment-plan';
// import { CustomerProvider } from './../customer/customer';
import { ItemProvider } from './../item/item';
import { ToastProvider } from './../toast/toast';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { CustomHttpProvider } from './../custom-http/custom-http';
import { Order } from './../../models/order';
import { OrderItem } from './../../models/order-item';
import { Injectable } from '@angular/core';
import { UtilProvider } from '../util/util';
import { LogProvider } from '../log/log';
import { sortBy as _sortBy, filter as _filter, remove as _remove } from 'lodash';
import * as moment from 'moment';
import { AppState } from 'src/app/app.global';


@Injectable()
export class OrderProvider {
  headers: any = { 'Content-Type': 'application/json' };

  constructor(
    private utilProvider: UtilProvider,
    private global: AppState,
    private logProvider: LogProvider,
    private customHttpProvider: CustomHttpProvider,
    private customStorageProvider: CustomStorageProvider,
    private toastProvider: ToastProvider,
    private itemProvider: ItemProvider
  ) { }

  getLocalList(): Promise<Array<Order>> {
    return this.customStorageProvider.getLocal(this.global.modelNames.pedido + this.global.getProperty('idEmp'))
  }

  async saveOrderDraft(order: Order) {
    return new Promise<Order>(async resolve => {
      const idEmp = this.global.getProperty('idEmp');
      const orders: Array<Order> = (await this.getAllOrderDraft()) || [];
      if (order.codPedGuid) {
        // UPDATE
        // Quando atualizar o rascunhho, atualizar a data do pedido
        order.dataPed = moment().format(); // ('YYYY-MM-DD');
        const oldOrder = orders.find((el) => {
          return el.codPedGuid === order.codPedGuid;
        });

        if (oldOrder) {
          _remove(orders, (recOrder) => {
            return recOrder.codPedGuid === order.codPedGuid;
          });

          const o = Object.assign(oldOrder, order);
          orders.unshift(o);
          // this.storage.set('draft' + idEmp, orders);
          this.customStorageProvider.saveLocal('draft' + idEmp, orders)
          resolve(o);

        } else {
          this.logProvider
            .save(`Erro ao encontrar pedido pelo UUID na edição do passo geral. UUID: ${order.codPedGuid}`);
        }
      } else {
        // INSERT
        order.codPedGuid = this.utilProvider.generateUUID();
        orders.unshift(order);
        this.customStorageProvider.saveLocal('draft' + idEmp, orders)
        resolve(order);
      }
    });
  }

  getAllOrderDraft(): Promise<Array<Order>> {
    // return new Promise(async (resolve) => {
    //   resolve(await this.storage.get('draft' + this.global.getProperty('idEmp')));
    // });
    return this.customStorageProvider.getLocal('draft' + this.global.getProperty('idEmp'))
  }

  async getDraftByUuidLocal(uuid: string) {
    return new Promise<Order>(async (resolve) => {
      const orders: Array<Order> = (await this.getAllOrderDraft()) || [];
      resolve(orders.find((order) => order.codPedGuid === uuid));
    });
  }

  async removeDraft(uuid) {
    const drafts = await this.getAllOrderDraft();
    drafts.splice(drafts.findIndex(x => x.codPedGuid === uuid), 1);
    // await this.storage.set('draft' + this.global.getProperty('idEmp'), drafts);
    await this.customStorageProvider.saveLocal('draft' + this.global.getProperty('idEmp'), drafts)
  }

  saveBackend(order: Order) {
    return new Promise(async (resolve, reject) => {
      const idEmp = this.global.getProperty('idEmp')
      const codRepErp = this.global.getProperty('codRepErp')
      this.customHttpProvider.postObj(idEmp, codRepErp, this.global.modelNames.pedido, order)
      .then(() => {
        order.statusPed = 'ENV';
        this.customStorageProvider.updateLocal(
          order,
          this.global.modelNames.pedido + idEmp,
          this.global.getFieldIdName(this.global.modelNames.pedido)
        ).then(() => {
          this.removeDraft(
            order.codPedGuid
          ).then(() => {
            resolve()
          }).catch((error) => {
            this.toastProvider.show('Falha ao remover rascunho do celular');
            reject(error)
          })
        }).catch((error) => {
          this.toastProvider.show('Falha ao atualizar o pedido no celular');
          this.toastProvider.show(error.message);
            reject(error)
        })
      })
      .catch((error) => {
        this.toastProvider.show('Não foi possível enviar o pedido agora, mas ele está salvo como rascunho. Tente novamente mais tarde.');
        this.toastProvider.show(error.message);
        reject(error);
      })
    });
  }

  async getLastOrderByCustomer(codCliErp, slice = 1) {
    return new Promise<Order>(async resolve => {
      // let orders = await this.storage.get(this.global.modelNames.pedido + this.global.getProperty('idEmp'));
      let orders = await this.customStorageProvider.getLocal(this.global.modelNames.pedido + this.global.getProperty('idEmp'))
      if (orders) {
        orders = orders.filter(x => !!x.itens);
        if (orders) {
          orders = orders.filter(x => x.codCliErp === codCliErp);
          orders = _sortBy(orders, (order: Order) => {
            return new Date(order.dataPed);
          }).reverse();

          if (orders && orders.length > 0) {
            if (slice === 1) {
              resolve(orders[0]);
              return;
            } else {
              resolve(orders.slice(0, slice));
              return;
            }
          }
        }
      }

      resolve();
    });
  }

  async getLastOrder() {
    return new Promise<Order>(async resolve => {
      let orders = await this.customStorageProvider.getLocal(this.global.modelNames.pedido + this.global.getProperty('idEmp'))
      if (orders) {
        orders = orders.filter(recOrder => !!recOrder.itens);
        orders = _sortBy(orders, (order: Order) => {
          return new Date(order.dataPed);
        }).reverse();

        if (orders && orders.length > 0) {
          resolve(orders[0]);
          return;
        }
      }
      resolve();
    });
  }

  getByDatePedPerMonth(month) {
    return new Promise<any>(async resolve => {
      let orders = await this.customStorageProvider.getLocal(this.global.modelNames.pedido + this.global.getProperty('idEmp'))
      orders = _filter(orders, (o: Order) => {
        return moment(o.dataPed, 'YYYY-MM-DD').month() === month;
      });

      resolve(orders);
    });
  }

  itemExistInOrder(codProErp: string, itens: Array<OrderItem>): boolean {
    let ret = false;
    for (const item of itens) {
      if (item.codProErp === codProErp) {
        ret = true;
        break;
      }
    }
    return ret;
  }

  getNewEmpty(codRepERP) {
    return new Order(
      this.global.getProperty('idEmp'),
      null,
      '',
      null,
      'RAS', // Rascunho
      null,
      null,
      codRepERP,
      null,
      '',
      moment().format(), // ('YYYY-MM-DD'), // dataPed
      null,
      null,
      null,
      null,
      null,
      null,
      this.getDueDate(), //  Data Entrega
      0,
      0, // qtdTotal
      0,
      0,
      0,
      0,
      0,
      0,
      null,
      [],
      true,
      '',
      null,
      0
    );
  }

  getNewOrderItemEmpty(newIdx: number): OrderItem {
    return new OrderItem(
      newIdx,
      null,
      null,
      null,
      0,
      0,
      null,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      null,
      null,
      0
    );
  }

  getDueDate(): string {
    return moment().add(1, 'days').format();
  }

  async fillItensProps(order: Order) {
    order.itens.forEach(itemOrder => {
      itemOrder.codCliErp = order.codCliErp;
      const itemPromise = this.itemProvider.getByCodProErp(itemOrder.codProErp);
      // itemOrder.descricao = itemDesc.descricao;

      itemPromise.then((res) => {
        itemOrder.descricao = res.descricao;
      });

    });
  }

}
