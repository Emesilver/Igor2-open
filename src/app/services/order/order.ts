import { ItemProvider } from './../item/item';
import { ToastProvider } from './../toast/toast';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { CustomHttpProvider } from './../custom-http/custom-http';
import { Order } from './../../models/order';
import { OrderItem } from './../../models/order-item';
import { Injectable } from '@angular/core';
import { UtilProvider } from '../util/util';
//import { LogProvider } from '../log/log';
import { sortBy as _sortBy, remove as _remove } from 'lodash';
import * as moment from 'moment';
import { AppState, ModelNames, Properties } from 'src/app/app.global';

@Injectable()
export class OrderProvider {
  constructor(
    private utilProvider: UtilProvider,
    private global: AppState,
    //    private logProvider: LogProvider,
    private customHttpProvider: CustomHttpProvider,
    private customStorageProvider: CustomStorageProvider,
    private toastProvider: ToastProvider,
    private itemProvider: ItemProvider
  ) {}

  getOrders(): Promise<Order[]> {
    return this.customStorageProvider.getLocal(
      ModelNames.pedido + this.global.getProperty(Properties.ID_EMP)
    );
  }

  async saveOrderDraft(order: Order) {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const orders = (await this.getDraftOrders()) || [];
    if (order.codPedGuid) {
      // UPDATE
      // Quando atualizar o rascunhho, atualizar a data do pedido
      order.dataPed = moment().format(); // ('YYYY-MM-DD');
      const oldOrder = orders.find((el) => el.codPedGuid === order.codPedGuid);

      if (oldOrder) {
        _remove(
          orders,
          (recOrder: Order) => recOrder.codPedGuid === order.codPedGuid
        );

        const o = Object.assign(oldOrder, order);
        orders.unshift(o);
        this.customStorageProvider.saveLocal<Order>('draft' + idEmp, orders);
      } else {
        // this.logProvider.save(
        //   `Erro ao encontrar pedido pelo UUID na edição do passo geral. UUID: ${order.codPedGuid}`
        // );
      }
    } else {
      // INSERT
      order.codPedGuid = this.utilProvider.generateUUID();
      orders.unshift(order);
      this.customStorageProvider.saveLocal<Order>('draft' + idEmp, orders);
    }
  }

  async getDraftOrders(): Promise<Order[]> {
    return this.customStorageProvider.getLocal(
      'draft' + this.global.getProperty(Properties.ID_EMP)
    );
  }

  async getDraftByUuidLocal(uuid: string): Promise<Order | undefined> {
    const orders: Order[] = (await this.getDraftOrders()) || [];
    return orders.find((order) => order.codPedGuid === uuid);
  }

  async removeDraft(uuid: string) {
    const drafts = await this.getDraftOrders();
    drafts.splice(
      drafts.findIndex((x) => x.codPedGuid === uuid),
      1
    );
    await this.customStorageProvider.saveLocal<Order>(
      'draft' + this.global.getProperty(Properties.ID_EMP),
      drafts
    );
  }

  async sendToSLC(order: Order) {
    const idEmp = this.global.getProperty(Properties.ID_EMP) as string;
    const codRepErp = this.global.getProperty(Properties.COD_REP_ERP) as string;
    try {
      await this.customHttpProvider.postObj(
        idEmp,
        codRepErp,
        ModelNames.pedido,
        order
      );
      order.statusPed = 'ENV';
      try {
        await this.customStorageProvider.updateLocal(
          order,
          ModelNames.pedido + idEmp,
          this.global.getModelKeys(ModelNames.pedido)
        );
        try {
          await this.removeDraft(order.codPedGuid);
        } catch (error) {
          this.toastProvider.show('Falha ao remover rascunho do celular');
        }
      } catch (error) {
        this.toastProvider.show('Falha ao atualizar o pedido no celular');
      }
    } catch (error) {
      this.toastProvider.show(
        'Não foi possível enviar o pedido agora, mas ele está salvo como rascunho. Tente novamente mais tarde.'
      );
    }
  }

  async getLastCustomerOrders(
    codCliErp: string,
    qty: number
  ): Promise<Order[]> {
    const savedOrders = await this.getOrders();
    if (savedOrders) {
      const validSavedOrders = savedOrders.filter((x) => !!x.itens);
      if (validSavedOrders) {
        const customerOrders = validSavedOrders.filter(
          (x) => x.codCliErp === codCliErp
        );
        const orderedCustomerOrders = _sortBy(
          customerOrders,
          (customerOrder: Order) => new Date(customerOrder.dataPed)
        ).reverse();

        if (orderedCustomerOrders && orderedCustomerOrders.length > 0) {
          return savedOrders.slice(0, qty);
        }
      }
    }
    return [];
  }

  async getLastOrder(): Promise<Order | undefined> {
    const savedOrders = await this.getOrders();
    if (savedOrders) {
      const validSavedOrders = savedOrders.filter(
        (savedOrder) => !!savedOrder.itens
      );
      const orderedOrders = _sortBy(
        validSavedOrders,
        (validOrder: Order) => new Date(validOrder.dataPed)
      ).reverse();
      if (orderedOrders && orderedOrders.length > 0) {
        return orderedOrders[0];
      }
    }
    return undefined;
  }

  async getByDatePedPerMonth(month: number) {
    const savedOrders = await this.getOrders();
    if (savedOrders) {
      return savedOrders.filter(
        (savedOrder) =>
          moment(savedOrder.dataPed, 'YYYY-MM-DD').month() === month
      );
    }
    return [];
  }

  itemExistInOrder(codProErp: string, itens: OrderItem[]): boolean {
    return itens.some((item) => item.codProErp === codProErp);
  }

  getNewEmpty(codRepERP: string) {
    return new Order(
      this.global.getProperty(Properties.ID_EMP) as string,
      0,
      '',
      '',
      'RAS', // Rascunho
      '',
      '',
      codRepERP,
      '',
      '',
      moment().format(), // ('YYYY-MM-DD'), // dataPed
      0,
      '',
      '',
      '',
      '',
      '',
      this.getDueDate(), //  Data Entrega
      0,
      0, // qtdTotal
      0,
      0,
      0,
      0,
      0,
      0,
      '',
      [],
      true,
      '',
      '',
      0,
      ''
    );
  }

  getNewOrderItemEmpty(newIdx: number): OrderItem {
    return new OrderItem(
      newIdx,
      '',
      '',
      '',
      0,
      0,
      '',
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      '',
      '',
      0,
      '',
      '',
      ''
    );
  }

  getDueDate(): string {
    return moment().add(1, 'days').format();
  }

  async fillItensProps(order: Order) {
    order.itens.forEach((itemOrder) => {
      itemOrder.codCliErp = order.codCliErp;
      const itemPromise = this.itemProvider.getByCodProErp(itemOrder.codProErp);

      itemPromise.then((res) => {
        itemOrder.descricao = res.descricao;
      });
    });
  }
}
