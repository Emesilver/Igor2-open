import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { EventsService } from '../services/events/events.service';
import { Router } from '@angular/router';
import { ToastProvider } from '../services/toast/toast';
import { OrderProvider } from '../services/order/order';
import { CustomerProvider } from '../services/customer/customer';
import * as moment from 'moment';
import { sumBy as _sumBy } from 'lodash';
import { UserProvider } from '../services/user/user';
import { AppState } from '../app.global';
import { getPromise } from '@ionic-native/core';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { SynchronizeProvider } from '../services/synchronize/synchronize';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {
  daySel = 0;
  dayOrderQty = 0;
  dayCustomerPos = 0;
  monthSel = 0;
  orderQty = 0;
  customerPos = 0;
  constructor(
    private userProvider: UserProvider,
    private events: EventsService,
    private router: Router,
    private toastProvider: ToastProvider,
    private orderProvider: OrderProvider,
    private customerProvider: CustomerProvider,
    private alertCtrl: AlertController,
    private global: AppState,
    private platform: Platform,
    private fcm: FCM,
    private synchronizeProvider: SynchronizeProvider,
  ) {
    this.init();
  }

  ionViewDidEnter() {
    this.events.publish('countDrafts', {})
    this.getInfos()
    this.events.subscribe('refreshInfo', () => {
      this.getInfos();
    });
}

  ionViewDidLeave() {
    this.events.destroy('refreshInfo')
  }

  async init() {
    // Se o operador jah esta configurado, nao preciso autenticar aqui novamente
    if( ! (await this.global.getProperty('idOper')) ) {
      const user = await this.userProvider.getUserLocal();
      if (user && user.currentCompany) {
        if (await this.userProvider.authenticate(user)) {
          this.getInfos();
          this.events.publish('countDrafts', {})

          // Registrar a atualizacao por pushes
          if (this.platform.is('ios') || this.platform.is('android')) {
            // Registrar a recepcao de atualizacoes 30 segundos apos entrar, pois na entrada jah faz uma atualizacao
            this.fcm.onNotification().subscribe(async (data) => {
              if (data.wasTapped) {
                // Recebeu notificacao e está em background
                // this.hasNotification = true;
                // nao precisa tratar a atualizacao aqui, pois vai atualizar pelo evento platform.resume
              } else {
                /*
                // Recebeu notificacao e está em foreground
                if (data.updateMode === 'C') {
                  // deixar sem confirmacao, temporariamente
                  this.synchronizeStrategy('manual', 'A');
                } else {
                  this.userProvider.getUserLocal().then(user => {
                    this.synchronizeStrategy('manual', data.updateMode);
                  });
                }
                */
               const companies = await this.userProvider.getLocalCompanies()
               this.synchronizeProvider.syncByCharge(companies)
              }
            });
          }
      

        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  async getInfos() {
    const ordersMonth = await this.orderProvider.getByDatePedPerMonth(moment().month());
    if (ordersMonth) {
      this.monthSel = _sumBy(ordersMonth, 'totalPedido');
      this.orderQty = ordersMonth.length;

      const customers: any = await this.customerProvider.getAllNotDraft();
      if (customers) {
        const customerWithOrder = customers.filter(c => !!ordersMonth.find(o => c.codCliErp === o.codCliErp));
        if (customerWithOrder && customerWithOrder.length > 0) {
          this.customerPos = customerWithOrder.length / customers.length * 100;
        }
      }
      const ordersDay = ordersMonth.filter(o => moment(o.dataPed).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'));
      if (ordersDay) {
        this.daySel = _sumBy(ordersDay, 'totalPedido');
        this.dayOrderQty = ordersDay.length;
        if (customers) {
          const customerWithOrder = customers.filter(c => !!ordersDay.find(o => c.codCliErp === o.codCliErp));
          if (customerWithOrder && customerWithOrder.length > 0) {
            // calcular com base em uma media de 22 dias por mes
            this.dayCustomerPos = ((customerWithOrder.length / customers.length) / 22) * 100;
          }
        }
      }
    }
  }

  gotoPage(link: string) {
    this.router.navigate([link]);
  }

  noConfig() {
    this.toastProvider.show('Acesso não configurado');
  }

  ngOnInit() { }

  ngAfterViewInit() {
  /*
    this.exitEventListner = (e:Event) => this.exit();
    document.addEventListener("backbutton", this.exitEventListner);
  */
  }
  ngOnDestroy() {
  /*
    document.removeEventListener("backbutton", this.exitEventListner);
  */
  }
  /*
  async exit() {
    const alert = await this.alertCtrl.create({
      header: 'Sair do App',
      message: 'Deseja realmente sair do app?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Sim',
          handler: () => {
            const stApp = 'app';
            navigator[stApp].exitApp();
          }
        }
      ]
    });
    alert.present();
  }
  */
}
