import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
// import { User } from '../models/user';
import { LoaderProvider } from '../services/loader/loader';
import { UserProvider } from '../services/user/user';
import { CustomerProvider } from '../services/customer/customer';
import { AlertController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { ToastProvider } from '../services/toast/toast';
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.page.html',
  styleUrls: ['./customer-list.page.scss'],
})
export class CustomerListPage implements OnInit {
  // user: User;
  pageNumber = 1;
  customers: Array<any> = [];
  customersRendered: Array<any> = [];
  drafts: Array<any> = [];
  address: string;
  constructor(
    private router: Router,
    private loaderProvider: LoaderProvider,
    // private userProvider: UserProvider,
    private customerProvider: CustomerProvider,
    private alertController: AlertController,
    private callNumber: CallNumber,
    private launchNavigator: LaunchNavigator,
    private toastProvider: ToastProvider
  ) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    await this.loaderProvider.show('Carregando clientes...');
    // this.user = await this.userProvider.getUserLocal();
    this.customers = await this.customerProvider.getLocalList()
    this.customersRendered = this.paginate(this.customers);
    this.drafts = await this.customerProvider.getAllDraftLocal();
    await this.loaderProvider.close();
  }

  goTo(page: string, customer: any) {
    if (customer) {
      const navigationExtras: NavigationExtras = {
        state: {
          customer
        }
      };
      this.router.navigate([page], navigationExtras);
    } else {
      this.router.navigate([page]);
    }
  }

  getItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.customersRendered = this.customers.filter((item) => {
        return ((item.cpfCnpj +
          item.fantasia +
          item.razao +
          item.cidade + '-' +
          item.bairro
        ).toLowerCase().indexOf(val.toLowerCase()) > -1);
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
  callCustomer(customer) {
    this.callNumber.callNumber(`${customer.foneContato1}`, true)
      .then(res => console.log('Iniciando ligação!', res))
      .catch(err => this.toastProvider.show('Erro! Não foi possi­vel iniciar a chamada! Erro: ' + err));
  }
  openNavigator(customer) {
    this.address = `${customer.endereco} - ${customer.bairro}, ${customer.cidade} - ${customer.uf}`;
    const options: LaunchNavigatorOptions = {
      app: this.launchNavigator.APP.USER_SELECT,
      transportMode: this.launchNavigator.TRANSPORT_MODE.DRIVING,
      appSelection: {
        dialogHeaderText: 'Escolha o app para navegação',
        cancelButtonText: 'Cancelar',
        rememberChoice: {
          enabled: false
        }
      },
    };
    this.launchNavigator.navigate(this.address, options)
      .then(
        success => console.log('Iniciando navegação'),
        error => this.toastProvider.show('Não foi possível abrir o aplicativo! Erro: ' + error)
      );
  }
  newOrder(page, customer) {
    const navigationExtras: NavigationExtras = {
      state: {
        customer
      }
    };
    this.router.navigate([page], navigationExtras);
  }
  async confirmRemoveDraft(uuid) {
    const alert = await this.alertController.create({
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
            this.removeCustomerDraft(uuid);
          }
        }
      ]
    });
    alert.present();
  }
  async removeCustomerDraft(uuid) {
    await this.customerProvider.removeDraft(uuid);
    this.drafts.splice(this.drafts.findIndex(x => x.cliGuid === uuid), 1);
  }
}
