import { Component, OnInit } from '@angular/core';
import { Order } from '../models/order';
import { OrderProvider } from '../services/order/order';
import { CustomerProvider } from '../services/customer/customer';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-drafts-list',
  templateUrl: './drafts-list.page.html',
  styleUrls: ['./drafts-list.page.scss'],
})
export class DraftsListPage implements OnInit {

  orderDrafts: Array<Order>;
  customerDrafts: Array<any>;
  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    // public events: Events,
    private orderProvider: OrderProvider,
    private customerProvider: CustomerProvider,

  ) {
    this.init();
  }

  ngOnInit() {
  }

  async init() {
    this.orderDrafts = await this.orderProvider.getAllOrderDraft();
    this.customerDrafts = await this.customerProvider.getAllDraftLocal();
  }

  goOrderGeneralForm(order: Order) {
    const extras: NavigationExtras = {
      state: { isView: false, order }
    };
    this.router.navigate(['/order-general-form'], extras);
  }

  goCustomerForm(customer) {
    const extras: NavigationExtras = {
      state: { customer }
    };
    this.router.navigate(['/customer-form'], extras);
  }

  async confirmRemoveDraft(uuid, type) {
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
            if (type === 1) {
              this.removeOrderDraft(uuid);
            } else {
              this.removeCustomerDraft(uuid);
            }
          }
        }
      ]
    });
    alert.present();
  }

  async removeOrderDraft(uuid) {
    await this.orderProvider.removeDraft(uuid);
    this.orderDrafts.splice(this.orderDrafts.findIndex(x => x.codPedGuid === uuid), 1);
  }

  async removeCustomerDraft(uuid) {
    await this.customerProvider.removeDraft(uuid);
    this.customerDrafts.splice(this.customerDrafts.findIndex(x => x.cliGuid === uuid), 1);
  }

}
