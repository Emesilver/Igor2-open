import { Component } from '@angular/core';
import { EventsService } from '../services/events/events.service';
import { Router } from '@angular/router';
import { ToastProvider } from '../services/toast/toast';
import { OrderProvider } from '../services/order/order';
import { CustomerProvider } from '../services/customer/customer';
import * as moment from 'moment';
import { sumBy as _sumBy } from 'lodash';
import { UserProvider } from '../services/user/user';
import { AppState, Properties } from '../app.global';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  daySel = 0;
  dayOrderQty = 0;
  dayCustomerPos = 0;
  monthSel = 0;
  orderQty = 0;
  customerPos = 0;
  constructor(
    private userProvider: UserProvider,
    private events: EventsService,
    private router: Router,
    private toastProvider: ToastProvider,
    private orderProvider: OrderProvider,
    private customerProvider: CustomerProvider,
    private global: AppState
  ) {
    this.init();
  }

  async ionViewDidEnter() {
    this.events.publish('countDrafts', {});
    await this.getInfos();
    this.events.subscribe('refreshInfo', async () => {
      await this.getInfos();
    });
  }

  ionViewDidLeave() {
    this.events.destroy('refreshInfo');
  }

  async init() {
    // Se o operador jah esta configurado, nao preciso autenticar aqui novamente
    if (!this.global.getProperty(Properties.ID_OPER)) {
      const user = await this.userProvider.getUserLocal();
      if (user && user.currentCompany) {
        if (await this.userProvider.authenticate(user)) {
          this.getInfos();
          this.events.publish('countDrafts', {});
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  async getInfos() {
    const ordersMonth = await this.orderProvider.getByDatePedPerMonth(
      moment().month()
    );
    if (ordersMonth) {
      this.monthSel = _sumBy(ordersMonth, 'totalPedido');
      this.orderQty = ordersMonth.length;

      const customers = await this.customerProvider.getLocalCustomers();
      if (customers) {
        const customerWithOrder = customers.filter(
          (c) => !!ordersMonth.find((o) => c.codCliErp === o.codCliErp)
        );
        if (customerWithOrder && customerWithOrder.length > 0) {
          this.customerPos =
            (customerWithOrder.length / customers.length) * 100;
        }
      }
      const ordersDay = ordersMonth.filter(
        (o) =>
          moment(o.dataPed).format('YYYY-MM-DD') ===
          moment().format('YYYY-MM-DD')
      );
      if (ordersDay) {
        this.daySel = _sumBy(ordersDay, 'totalPedido');
        this.dayOrderQty = ordersDay.length;
        if (customers) {
          const customerWithOrder = customers.filter(
            (c) => !!ordersDay.find((o) => c.codCliErp === o.codCliErp)
          );
          if (customerWithOrder && customerWithOrder.length > 0) {
            // calcular com base em uma media de 22 dias por mes
            this.dayCustomerPos =
              (customerWithOrder.length / customers.length / 22) * 100;
          }
        }
      }
    }
  }

  gotoPage(link: string) {
    this.router.navigate([link]);
  }

  noConfig() {
    this.toastProvider.show('Acesso não configurado');
  }
}
