import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Balance } from '../models/balance';
import { BalanceProvider } from '../services/balance/balance';
import { OrderProvider } from '../services/order/order';
import { IonContent } from '@ionic/angular';
import * as moment from 'moment';


@Component({
  selector: 'app-customer-view',
  templateUrl: './customer-view.page.html',
  styleUrls: ['./customer-view.page.scss'],
})
export class CustomerViewPage implements OnInit {
  @ViewChild(IonContent, {static: false}) content: IonContent;
  view = 'general';
  customer: any = {};
  customerForm: FormGroup;
  balance: Balance;
  lastOrderDataPedFormatted: string;
  lastOrderTotalPedidoFormatted: string;
  penulOrderDataPedFormatted: string;
  penulOrderTotalPedidoFormatted: string;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private balanceProvider: BalanceProvider,
    private orderProvider: OrderProvider,
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.customer = this.router.getCurrentNavigation().extras.state.customer;
    }

    this.customerForm = this.formBuilder.group({
      idEmp: [''],
      codRepErp: [''],
      codCliErp: [''],
      cpfCnpj: [''],
      razao: [''],
      fantasia: [''],
      contato1: [''],
      foneContato1: [''],
      foneCli: [''],
      cep: [''],
      uf: [''],
      cidade: [''],
      endereco: [''],
      bairro: [''],
      emailCli: [''],
      emailFin: [''],
      emailFis: [''],
      limiteTotal: 0,
      credito: 0,
      obs: [''],
    });

    if (this.customer) {
      this.customerForm.patchValue(this.customer);
      this.fillBalance();
    }
  }

  async ngOnInit() {
    const orders = await this.orderProvider.getLastOrderByCustomer(this.customer.codCliErp, 2);
    if (orders) {
      this.lastOrderDataPedFormatted = moment(orders[0].dataPed, 'YYYY-MM-DD').format('DD/MM/YYYY');
      this.lastOrderTotalPedidoFormatted = orders[0].totalPedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      this.penulOrderDataPedFormatted = moment(orders[1].dataPed, 'YYYY-MM-DD').format('DD/MM/YYYY');
      this.penulOrderTotalPedidoFormatted = orders[1].totalPedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  }

  async fillBalance() {
    this.balance = await this.balanceProvider.getByCustomer(this.customer);
    if (this.balance) {
      this.customerForm.patchValue({ credito: this.balance.credito });
    }
  }

  edit() {
    const navigationExtras: NavigationExtras = {
      state: {
        customer: this.customer
      }
    };
    this.router.navigate(['/customer-form'], navigationExtras);
  }

  moveToBottom() {
    setTimeout(() => {
      this.view = 'historic';
      this.content.scrollToBottom();
    }, 200);
  }

  moveToTop() {
    setTimeout(() => {
      this.view = 'general';
      this.content.scrollToTop();
    }, 200);
  }
}
