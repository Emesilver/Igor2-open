import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoaderProvider } from '../services/loader/loader';
import { CustomerProvider } from '../services/customer/customer';
import { AlertController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import {
  LaunchNavigator,
  LaunchNavigatorOptions,
} from '@ionic-native/launch-navigator/ngx';
import { ToastProvider } from '../services/toast/toast';
import { Customer } from '../models/customer';
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.page.html',
  styleUrls: ['./customer-list.page.scss'],
})
export class CustomerListPage implements OnInit {
  // user: User;
  pageNumber = 1;
  customers: Customer[] = [];
  customersRendered: Array<any> = [];
  drafts: Array<any> = [];
  address!: string;
  constructor(
    private router: Router,
    private loaderProvider: LoaderProvider,
    // private userProvider: UserProvider,
    private customerProvider: CustomerProvider,
    private alertController: AlertController,
    private callNumber: CallNumber,
    private launchNavigator: LaunchNavigator,
    private toastProvider: ToastProvider
  ) {}

  ngOnInit() {
    this.init();
  }

  async init() {
    await this.loaderProvider.show('Carregando clientes...');
    this.customers = await this.customerProvider.getLocalCustomers();
    this.customersRendered = this.paginate(this.customers);
    this.drafts = await this.customerProvider.getDraftLocalCustomers();
    await this.loaderProvider.close();
  }

  goTo(page: string, customer: any) {
    if (customer) {
      const navigationExtras: NavigationExtras = {
        state: {
          customer,
        },
      };
      this.router.navigate([page], navigationExtras);
    } else {
      this.router.navigate([page]);
    }
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

  paginate(array: Customer[]) {
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
  callCustomer(customer: Customer) {
    this.callNumber
      .callNumber(`${customer.foneContato1}`, true)
      .then((res) => console.log('Iniciando ligação!', res))
      .catch((err) =>
        this.toastProvider.show(
          'Erro! Não foi possi­vel iniciar a chamada! Erro: ' + err
        )
      );
  }
  openNavigator(customer: Customer) {
    this.address = `${customer.endereco} - ${customer.bairro}, ${customer.cidade} - ${customer.uf}`;
    const options: LaunchNavigatorOptions = {
      app: this.launchNavigator.APP.USER_SELECT,
      transportMode: this.launchNavigator.TRANSPORT_MODE.DRIVING,
      appSelection: {
        dialogHeaderText: 'Escolha o app para navegação',
        cancelButtonText: 'Cancelar',
        rememberChoice: {
          enabled: false,
        },
      },
    };
    this.launchNavigator.navigate(this.address, options).then(
      (success) => console.log('Iniciando navegação'),
      (error) =>
        this.toastProvider.show(
          'Não foi possível abrir o aplicativo! Erro: ' + error
        )
    );
  }
  newOrder(page: any, customer: Customer) {
    const navigationExtras: NavigationExtras = {
      state: {
        customer,
      },
    };
    this.router.navigate([page], navigationExtras);
  }
  async confirmRemoveDraft(uuid: string) {
    const alert = await this.alertController.create({
      header: 'Deletar rascunho.',
      message: 'Deseja excluir esse rascunho?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            return undefined;
          },
        },
        {
          text: 'Deletar',
          handler: () => {
            this.removeCustomerDraft(uuid);
          },
        },
      ],
    });
    alert.present();
  }
  async removeCustomerDraft(uuid: string) {
    await this.customerProvider.removeDraft(uuid);
    this.drafts.splice(
      this.drafts.findIndex((x) => x.cliGuid === uuid),
      1
    );
  }
}
