import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CustomerProvider } from '../services/customer/customer';
import { LoaderProvider } from '../services/loader/loader';
import { ToastProvider } from '../services/toast/toast';

export interface CustomerLimit {
  idEmp: number;
  codCliErp: string;
  codRepErp: string;
  limit: string;
  credit: string;
  limiteTotal: number;
}
@Component({
  selector: 'app-customer-limit',
  templateUrl: './customer-limit.page.html',
  styleUrls: ['./customer-limit.page.scss'],
})
export class CustomerLimitPage {
  limiteTotal: string;
  credito: string;
  novoLimite: string;
  customerLimit: CustomerLimit;
  constructor(
    public navParams: NavParams,
    private modalController: ModalController,
    public customerProvider: CustomerProvider,
    public loaderProvider: LoaderProvider,
    public toastProvider: ToastProvider
  ) {
    this.novoLimite = '';
    this.customerLimit = this.navParams.get('customerLimit');
    this.limiteTotal = this.customerLimit.limit;
    this.credito = this.customerLimit.credit;
  }

  close() {
    this.modalController.dismiss();
  }

  onlyNumbers() {
    return this.novoLimite.toString().replace(/\D/g, '');
  }

  async requestLimit() {
    if (
      parseInt(this.novoLimite, 10) >
      parseInt(this.limiteTotal, 10) - parseInt(this.credito, 10)
    ) {
      this.loaderProvider.show('Solicitando aumento...');
      try {
        this.customerLimit.limiteTotal = +this.novoLimite;
        await this.customerProvider.saveLimitUpdate(this.customerLimit);
        this.loaderProvider.close();
        this.toastProvider.show('Solicitação feita com sucesso!');
        this.close();
      } catch (error) {
        this.loaderProvider.close();
        this.toastProvider.show(
          'Não foi possível solicitar o aumento agora. Tente mais tarde.'
        );
        this.close();
      }
    } else {
      this.toastProvider.show(
        'Informe um valor maior que o valor utilizado para solicitar o aumento!'
      );
    }
  }
}
