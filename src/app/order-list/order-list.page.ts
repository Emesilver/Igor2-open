import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Order } from '../models/order';
import { OrderProvider } from '../services/order/order';
import { UserProvider } from '../services/user/user';
import { LoaderProvider } from '../services/loader/loader';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit {
  orders: Array<Order>;
  ordersFiltered: Array<Order>;
  draftOrders: Array<Order>;
  constructor(
    private router: Router,
    private loaderProvider: LoaderProvider,
    private alertCtrl: AlertController,
    private orderProvider: OrderProvider,
    private userProvider: UserProvider,
  ) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    await this.loaderProvider.show('Carregando Pedidos...');
    // const user = await this.userProvider.getUserLocal();
    this.draftOrders = await this.orderProvider.getAllOrderDraft();
    this.orders = await this.orderProvider.getLocalList();
    this.ordersFiltered = this.orders;
    await this.loaderProvider.close();
  }

  // ionViewDidEnter() {

  // }

  sortDate() {
    this.orders = this.ordersFiltered = this.orders.sort((a, b) => {
      return +new Date(b.dataPed) - +new Date(a.dataPed);
    });
  }

  getItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.ordersFiltered = this.orders.filter((item) => {
        return (item.dataPed.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
          (item.codPedErp && item.codPedErp.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.desCli && item.desCli.toLowerCase().indexOf(val.toLowerCase()) > -1)
        );
      });
    } else {
      this.ordersFiltered = this.orders;
    }
  }

  goToOrderPage(isView: boolean, order: Order) {
    const extras: NavigationExtras = {
      state: { isView, order }
    };
    this.router.navigate(['/order-general-form'], extras);
  }

  async confirmRemoveDraft(uuid) {
    const alert = await this.alertCtrl.create({
      header: 'Deletar rascunho.',
      message: 'Deseja excluir esse rascunho?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Deletar',
          handler: () => {
            this.removeDraft(uuid);
          }
        }
      ]
    });
    alert.present();
  }

  async removeDraft(guid) {
    await this.orderProvider.removeDraft(guid);
    this.draftOrders.splice(this.draftOrders.findIndex(x => x.codPedGuid === guid), 1);
  }

  // close() {
  //   this.router.navigate(['/home']);
  // }
}
