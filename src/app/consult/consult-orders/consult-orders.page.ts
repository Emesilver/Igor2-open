import { Component, OnInit } from '@angular/core';
import { SelectCustomerPage } from 'src/app/select-customer/select-customer.page';
import { ModalController } from '@ionic/angular';
import { Order } from 'src/app/models/order';
import { OrderProvider } from 'src/app/services/order/order';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-consult-orders',
  templateUrl: './consult-orders.page.html',
  styleUrls: ['./consult-orders.page.scss'],
})
export class ConsultOrdersPage implements OnInit {
  orders!: Array<Order>;
  ordersFiltered!: Array<Order>;
  customerName = '';

  constructor(
    private modalController: ModalController,
    private orderProvider: OrderProvider,
    private router: Router
  ) {}

  ngOnInit() {
    this.doSelectCustomer();
  }

  async doSelectCustomer() {
    const modal = await this.modalController.create({
      component: SelectCustomerPage,
    });
    this.orders = await this.orderProvider.getOrders();
    modal.present();
    modal.onDidDismiss().then((response) => {
      if (response.data.customer) {
        // Se selecionou um cliente eu faco o filtro aqui
        const codCliErp = response.data.customer.codCliErp;
        this.customerName =
          response.data.customer.cpfCnpj +
          ' - ' +
          response.data.customer.fantasia;
        this.ordersFiltered = this.orders.filter(
          (order: Order) => order.codCliErp === codCliErp
        );
      }
    });
  }

  goToOrderPage(isView: boolean, order: Order) {
    const extras: NavigationExtras = {
      state: { isView, order },
    };
    this.router.navigate(['/order-general-form'], extras);
  }
}
