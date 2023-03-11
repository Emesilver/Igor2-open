import { LoaderProvider } from './services/loader/loader';
import { Component } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UserProvider } from './services/user/user';
import { Router } from '@angular/router';
import { SynchronizeProvider } from './services/synchronize/synchronize';
import { ToastProvider } from './services/toast/toast';
import { Company } from './models/company';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  public appPages = [
    {
      title: 'Início',
      url: '/home',
      icon: 'home',
    },
    {
      title: 'Clientes',
      url: '/customer-list',
      icon: 'person',
    },
    {
      title: 'Pedidos',
      url: '/order-list',
      icon: 'list',
    },
    {
      title: 'Sincronizar',
      url: '/synchronize',
      icon: 'sync',
    },
    {
      title: 'Política de Privacidade',
      url: '/politica',
      icon: 'clipboard',
    },
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userProvider: UserProvider,
    private router: Router,
    private loaderProvider: LoaderProvider,
    private synchronizeProvider: SynchronizeProvider,
    private menuCtrl: MenuController,
    private toastProvider: ToastProvider
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.platform.resume.subscribe(async () => {
      // App entrou em foreground (estava em background e foi ativada)
      await this.synchronizeStrategy('resume', 'C');
    });

    this.menuCtrl.enable(false, 'right');
  }

  showVersion() {
    this.toastProvider.show('Versão 2.6.18');
  }

  logout() {
    this.userProvider.logout();
    this.router.navigate(['/login']);
  }

  private async synchronizeStrategy(type: string, updateMode: string) {
    setTimeout(async () => {
      const companies = await this.userProvider.getLocalCompanies();

      if (type === 'resume') {
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
      await this.synchronizeProvider.syncByCharge(companies);
      this.loaderProvider.close();
    } else {
      await this.synchronizeProvider.syncByCharge(companies);
    }
  }
}
