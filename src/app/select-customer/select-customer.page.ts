import { Component, OnInit } from '@angular/core';
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
export class SelectCustomerPage implements OnInit {
  user: User;
  pageNumber = 1;
  customers: Array<Customer> = [];
  customersRendered: Array<Customer> = [];
  unregisterBackAction: any;
  constructor(
    private customerProvider: CustomerProvider,
    private userProvider: UserProvider,
    private loaderProvider: LoaderProvider,
    private modalController: ModalController,
  ) {
    this.init();
  }
  async init() {
    this.loaderProvider.show('Carregando clientes...');
    this.user = await this.userProvider.getUserLocal();
    this.customers = await this.customerProvider.getLocalList();
//    this.customers = this.customers.filter(customer => customer.codCliErp != null && customer.codCliErp !== '');
    this.customersRendered = this.paginate(this.customers);
    this.loaderProvider.close();
  }
  ngOnInit() {
  }
  getItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.customersRendered = this.customers.filter((item) => {
        return ((item.cpfCnpj +
          item.fantasia +
          item.razao +
          item.cidade + '-' +
          item.bairro).toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.pageNumber = 1;
      this.customersRendered = this.paginate(this.customers);
    }
  }
  paginate(array) {
    let pageNumber = this.pageNumber;
    --pageNumber;
    return array.slice(pageNumber * 30, (pageNumber + 1) * 30);
  }
  loadData(event) {
    setTimeout(() => {
      this.pageNumber++;
      const moreData = this.paginate(this.customers);
      for (var index in moreData){
        this.customersRendered.push(moreData[index]);
      }
      event.target.complete();
      if (this.customersRendered.length === this.customers.length) {
        event.target.disabled = true;
      }
    }, 500);
  }
  select(customer) {
    this.modalController.dismiss({ customer });
  }
  close() {
    this.modalController.dismiss({ customer: null });
  }
}
