import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { LoaderProvider } from '../services/loader/loader';
import { UserProvider } from '../services/user/user';
import { SynchronizeProvider } from '../services/synchronize/synchronize';
import { ToastProvider } from '../services/toast/toast';
import { AppState } from '../app.global';

@Component({
  selector: 'app-synchronize',
  templateUrl: './synchronize.page.html',
  styleUrls: ['./synchronize.page.scss'],
})
export class SynchronizePage implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private navController: NavController,
    private loaderProvider: LoaderProvider,
    private userProvider: UserProvider,
    private synchronizeProvider: SynchronizeProvider,
    private toastProvider: ToastProvider,
    private global: AppState,
  ) {
    this.init();
  }

  ngOnInit() {
  }

  async init() {
    const alert = await this.alertCtrl.create({
      header: 'Sincronizar dados',
      message: 'A sincronização manual, normalmente, não é necessária. Deseja sincronizar agora?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.navController.navigateBack('/home');
          }
        },
        {
          text: 'Sincronizar',
          handler: () => {
            if (this.global.getProperty('online')) {
              this.loaderProvider.show('Sincronizando dados manualmente...');
              this.userProvider.getLocalCompanies()
              .then((companies) => {
                this.synchronizeProvider.syncByCharge(companies)
                .then(() => {
                  this.loaderProvider.close();
                  this.navController.navigateBack('/home')
                })
                .catch(() => {
                  this.toastProvider.show('Erro ao sincronizar dos dados.');
                  this.loaderProvider.close();
                  this.navController.navigateBack('/home')
                })
              })
            } else {
              this.toastProvider.show('Impossível sincronizar agora, estamos offline!');
              this.loaderProvider.close();
              this.navController.navigateBack('/home')
            }
          }
        }
      ]
    });
    alert.present();
  }
}
