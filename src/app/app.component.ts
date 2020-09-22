import { LoaderProvider } from './services/loader/loader';
import { Component } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UserProvider } from './services/user/user';
import { Router } from '@angular/router';
import { SynchronizeProvider } from './services/synchronize/synchronize';
import { firebaseConfig } from './app.global';
import * as firebase from 'firebase/app';
import { ToastProvider } from './services/toast/toast';
import { Company } from './models/company';
import { NetworkProvider } from './services/network/network';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Início',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Clientes',
      url: '/customer-list',
      icon: 'person'
    },
    {
      title: 'Pedidos',
      url: '/order-list',
      icon: 'list'
    },
    {
      title: 'Sincronizar',
      url: '/synchronize',
      icon: 'sync'
    },
    {
      title: 'Política de Privacidade',
      url: '/politica',
      icon: 'clipboard'
    },
  ];
//  hasNotification = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userProvider: UserProvider,
    private router: Router,
    private loaderProvider: LoaderProvider,
    private synchronizeProvider: SynchronizeProvider,
    private menuCtrl: MenuController,
    private toastProvider: ToastProvider,
    private networkProvider: NetworkProvider,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready().then(() => {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
      this.networkProvider.startMonitoring()
    });

    this.platform.resume.subscribe(async () => {
      // App entrou em foreground (estava em background e foi ativada)
      await this.synchronizeStrategy('resume', 'C');
    });

    this.menuCtrl.enable(false, 'right');

    // necessario para execucao do chat
    firebase.initializeApp(firebaseConfig);
  }

  showVersion() {
    this.toastProvider.show('Versão 2.4.5');
    // alert('vai simular recebimento de notification')
    // this.synchronizeStrategy('manual', 'A')
}

  logout() {
    this.userProvider.logout();
//    if (this.platform.is('ios') || this.platform.is('android')) {
//      const appLiteral = 'app';
//      navigator[appLiteral].exitApp();
//    } else {
    this.router.navigate(['/login']);
//    }
  }

  private async synchronizeStrategy(type, updateMode: string) {
    setTimeout(async () => {
      const companies = await this.userProvider.getLocalCompanies()

      if (type === 'resume' /*&& this.hasNotification*/) {
        // this.hasNotification = false;
        this.synchronize(companies, updateMode);
      } else if (type === 'init') {
        this.synchronize(companies, updateMode);
      } else if (type === 'manual') {
        this.synchronize(companies, updateMode);
      }
    }, 500);
  }

  /**
   *
   * @param user Dados do usuario
   * @param updateMode C-Confirmar A-Automatico
   */
  private async synchronize(companies: Array<Company>, updateMode: string) {
    if (updateMode === 'C') {
      this.loaderProvider.show('Sincronizando dados...');
      await this.synchronizeProvider.syncByCharge(companies)
      this.loaderProvider.close();
    } else {
      await this.synchronizeProvider.syncByCharge(companies)
    }
  }
}
