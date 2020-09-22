import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { OrderHandleType, Order } from '../models/order';
import { OrderProvider } from '../services/order/order';
import { ItemProvider } from '../services/item/item';
import { ToastProvider } from '../services/toast/toast';
import { OrderItem } from '../models/order-item';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-order-items-form',
  templateUrl: './order-items-form.page.html',
  styleUrls: ['./order-items-form.page.scss'],
})
export class OrderItemsFormPage implements OnInit {
  itens: Array<OrderItem> = [];
  orderWrk: Order;
  orderHandleType: OrderHandleType;
  draft: any;
  isDraft = false;
  title = 'Pedido - Itens';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderProvider: OrderProvider,
    private itemProvider: ItemProvider,
    private toastProvider: ToastProvider,
    private location: Location,
    private alertCtrl: AlertController
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.orderWrk = this.router.getCurrentNavigation().extras.state.orderWrk;
      this.orderHandleType = this.router.getCurrentNavigation().extras.state.orderHandleType;
      this.loadingOrder();
    }
  }

  async loadingOrder() {
    this.itens = this.orderWrk.itens;
    if (this.orderWrk.itens.length > 0) {
      this.title = 'Adicionando Itens';
    }
    if (this.orderHandleType === OrderHandleType.view) {
      this.title = 'Visualizando Itens';
    }
    if (!this.isDraft && this.orderWrk) {
      // preparar campos locais dos itens do pedido para visualizacao / edicao
      this.orderProvider.fillItensProps(this.orderWrk);
    }
  }

  ngOnInit() { }

  ionViewWillEnter() {
    if (this.orderWrk) {
      this.loadingOrder();
    }
  }

  goTo(page: string, params: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        params: JSON.stringify(params),
      }
    };
    this.router.navigate([page], navigationExtras);
  }

  back() {
    this.location.back();
  }

  next() {
    const navigationExtras: NavigationExtras = {
      state: {
        isView: (this.orderHandleType === OrderHandleType.view),
        orderWrk: this.orderWrk,
        orderHandleType: this.orderHandleType
      }
    };
    this.router.navigate(['/order-finish-form'], navigationExtras);
  }

  add() {
    const navigationExtras: NavigationExtras = {
      state: {
        orderWrk: this.orderWrk,
        orderHandleType: this.orderHandleType,
        orderItemHandleType: OrderHandleType.new
      }
    };
    this.router.navigate(['/order-item-form'], navigationExtras);
  }

  edit(orderItemWrk: OrderItem) {
    if (this.orderHandleType === OrderHandleType.view) {
      return;
    }
    const navigationExtras: NavigationExtras = {
      state: {
        orderWrk: this.orderWrk,
        orderHandleType: this.orderHandleType,
        orderItemHandleType: OrderHandleType.edit,
        idxEditing: orderItemWrk.idxItem
      }
    };
    this.router.navigate(['/order-item-form'], navigationExtras);
  }

  async remove(idx) {
    const confirm = await this.alertCtrl.create({
      header: 'Deletar item?',
      message: 'Deseja remover este item do pedido?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
          }
        },
        {
          text: 'Remover',
          handler: async () => {
            this.orderWrk.totalPedido -= this.orderWrk.itens[idx].totalItem;
            this.orderWrk.itens.splice(idx, 1);
            await this.orderProvider.saveOrderDraft(this.orderWrk);
          }
        }
      ]
    });
    confirm.present();
  }
}
