import { Component } from '@angular/core';
import { User } from '../models/user';
import { Customer } from '../models/customer';
import { ModalController } from '@ionic/angular';
import { CustomerProvider } from '../services/customer/customer';
import { UserProvider } from '../services/user/user';
import { LoaderProvider } from '../services/loader/loader';
@Component({
  selector: 'app-select-customer',
  templateUrl: './select-customer.page.html',
  styleUrls: ['./select-customer.page.scss'],
})
export class SelectCustomerPage {
  user!: User;
  pageNumber = 1;
  customers: Array<Customer> = [];
  customersRendered: Array<Customer> = [];
  unregisterBackAction: any;
  constructor(
    private customerProvider: CustomerProvider,
    private userProvider: UserProvider,
    private loaderProvider: LoaderProvider,
    private modalController: ModalController
  ) {
    this.init();
  }
  async init() {
    this.loaderProvider.show('Carregando clientes...');
    this.user = await this.userProvider.getUserLocal();
    this.customers = await this.customerProvider.getLocalCustomers();
    this.customersRendered = this.paginate(this.customers);
    this.loaderProvider.close();
  }

  getItems(ev: any) {
    const val = ev.target.value;
    const minChars = (this.customers.length / 2 / 100) | 0;
    if (val && val.trim() !== '' && val.length > minChars) {
      this.customersRendered = this.customers.filter((item) => {
        return (
          (
            item.cpfCnpj +
            item.fantasia +
            item.razao +
            item.cidade +
            '-' +
            item.bairro
          )
            .toLowerCase()
            .indexOf(val.toLowerCase()) > -1
        );
      });
    } else {
      this.pageNumber = 1;
      this.customersRendered = this.paginate(this.customers);
    }
  }

  private paginate(array: Customer[]) {
    let pageNumber = this.pageNumber;
    --pageNumber;
    return array.slice(pageNumber * 30, (pageNumber + 1) * 30);
  }

  loadData(event: any) {
    setTimeout(() => {
      this.pageNumber++;
      const customers = this.paginate(this.customers);
      customers.forEach((customer) => {
        this.customersRendered.push(customer);
      });
      event.target.complete();
      if (this.customersRendered.length === this.customers.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  select(customer: Customer) {
    this.modalController.dismiss({ customer });
  }

  close() {
    this.modalController.dismiss({ customer: null });
  }
}
