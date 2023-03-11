import { Component } from '@angular/core';
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
export class SynchronizePage {
  constructor(
    private alertCtrl: AlertController,
    private navController: NavController,
    private loaderProvider: LoaderProvider,
    private userProvider: UserProvider,
    private synchronizeProvider: SynchronizeProvider,
    private toastProvider: ToastProvider,
    private global: AppState
  ) {
    this.init();
  }

  async init() {
    const alert = await this.alertCtrl.create({
      header: 'Sincronizar dados',
      message:
        'A sincronização manual, normalmente, não é necessária. Deseja sincronizar agora?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.navController.navigateBack('/home');
          },
        },
        {
          text: 'Sincronizar',
          handler: async () => {
            await this.loaderProvider.show(
              'Sincronizando dados manualmente...'
            );
            const companies = await this.userProvider.getLocalCompanies();
            try {
              await this.synchronizeProvider.syncByCharge(companies);
            } catch (error) {
              await this.toastProvider.show('Erro ao sincronizar dos dados.');
            }

            this.loaderProvider.close();
            this.navController.navigateBack('/home');
          },
        },
      ],
    });
    alert.present();
  }
}
