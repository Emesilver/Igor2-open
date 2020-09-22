import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CustomerProvider } from '../services/customer/customer';
import { LoaderProvider } from '../services/loader/loader';
import { ToastProvider } from '../services/toast/toast';

@Component({
  selector: 'app-customer-limit',
  templateUrl: './customer-limit.page.html',
  styleUrls: ['./customer-limit.page.scss'],
})
export class CustomerLimitPage implements OnInit {
  limiteTotal: string;
  credito: string;
  novoLimite: string;
  customer;
  constructor(
    public navParams: NavParams,
    private modalController: ModalController,
    public customerProvider: CustomerProvider,
    public loaderProvider: LoaderProvider,
    public toastProvider: ToastProvider
  ) {
    this.customer = this.navParams.get('customer');
    this.limiteTotal = this.customer.limit;
    this.credito = this.customer.credit;
  }

  ngOnInit() {
  }

  close() {
    this.modalController.dismiss();
  }

  onlyNumbers() {
    return this.novoLimite.toString().replace(/\D/g, '');
  }

  async requestLimit() {
    if (parseInt(this.novoLimite, 10) > (parseInt(this.limiteTotal, 10) - parseInt(this.credito, 10))) {
      this.loaderProvider.show('Solicitando aumento...');
      try {
        this.customer.limiteTotal = this.novoLimite;
        await this.customerProvider.saveLimitUpdate(this.customer);
        this.loaderProvider.close();
        this.toastProvider.show('Solicitação feita com sucesso!');
        this.close();
      } catch (error) {
        console.log(error);
        this.loaderProvider.close();
        this.toastProvider.show('Não foi possível solicitar o aumento.');
        this.close();
      }
    } else {
      this.toastProvider.show('Informe um valor maior que o valor utilizado para solicitar o aumento!');
    }
  }
}
