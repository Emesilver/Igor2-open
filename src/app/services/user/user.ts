import { Platform } from '@ionic/angular';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { Injectable } from '@angular/core';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';
import { AlertController } from '@ionic/angular';
import { Company } from 'src/app/models/company';
import { User } from 'src/app/models/user';
import { kMaxLength } from 'buffer';
import { LoaderProvider } from '../loader/loader';
import { SynchronizeProvider } from '../synchronize/synchronize';
import { ToastProvider } from '../toast/toast';

@Injectable({
  providedIn: 'root'
})
export class UserProvider {
  private deviceUUID: string;
  private deviceTokenFCM: string;
  constructor(
    private customHttpProvider: CustomHttpProvider,
    private storage: Storage,
    private global: AppState,
    private alertCtrl: AlertController,
    private fcm: FCM,
    private device: UniqueDeviceID,
    private platform: Platform,
    private loaderProvider: LoaderProvider,
    private synchronizeProvider: SynchronizeProvider,
    private toastProvider: ToastProvider,
  ) {
    this.deviceUUID = '1a2b3c4d5e6f7g';
    this.deviceTokenFCM = '01234567890123456789';
  }

  getLocalCompanies(): Promise<Array<any>> {
    return new Promise((resolve) => {
      this.getUserLocal().then((user) => {
        if (user) {
          resolve(user.companies);
        } else {
          resolve(null)
        }
      });
    });
  }

  setCurrentCompany(company: Company) {
    return new Promise((resolve) => {
      this.getUserLocal().then((user) => {
        user.currentCompany = company;
        this.saveUserLocal(user).then(() => {
          this.global.setProperty('idEmp', user.currentCompany.idEmp);
          this.global.setProperty('idOper', user.currentCompany.idOper);
          this.global.setProperty('codRepErp', user.currentCompany.codRepErp);
          resolve();
        });
      });
    });
  }

  saveUserLocal(user: User) {
    this.initializeUser(user)
    return this.storage.set('user', user);
  }

  getUserLocal(): Promise<User> {
    return new Promise(async (resolve) => {
      const user = await this.storage.get('user')
      if (user && user.currentCompany) {
        this.initializeUser(user)
      }
      resolve(user);
    });
  }

  private initializeUser(user: User) {
    if(user.currentCompany) {
      this.global.setProperty('idEmp', user.currentCompany.idEmp)
      this.global.setProperty('idOper', user.currentCompany.idOper)
      this.global.setProperty('codRepErp', user.currentCompany.codRepErp)
    }
  }

  async showMessageSuccessLogin() {
    const alert = await this.alertCtrl.create({
      header: 'Cadastrado com sucesso.',
      message: 'Aguarde até os administradores finalizarem seu cadastro.',
      buttons: ['OK']
    });

    alert.present();
  }

  async showMessageEmptyCompanies() {
    const alert = await this.alertCtrl.create({
      header: 'Cadastro não finalizado.',
      message: 'Aguarde até os administradores finalizarem seu cadastro.',
      buttons: ['OK']
    });

    alert.present();
  }

  logout() {
    return this.storage.clear();
  }

  async registerFCMToken(user: User) {
    const online = await this.global.getProperty('online');
//    let tokenInfo;
    if (online) {
      if (this.platform.is('ios') || this.platform.is('android')) {
//        if (user.currentCompany) {
          this.deviceUUID = await this.device.get();
          // this.deviceTokenFCM = await this.fcm.getToken();
          this.fcm.getToken()
          .then((tokenFCM) => {
            this.deviceTokenFCM = tokenFCM
            this.customHttpProvider.registerTokenOnBackend(
//              user.currentCompany.idEmp, user.currentCompany.codRepErp,
              {
                uuidDisp: this.deviceUUID,
                tokenApp: this.deviceTokenFCM,
                cpf: user.cpf,
                email: user.email,
              }
            )
            .catch((error) => {
              alert('Falha ao registrar token FCM:' + error)
            })
          })
          .catch((error) => {
            alert('Falha ao pegar token FCM:' + error)
          })
//        } else {
//          alert('Nenhuma empresa definida para registrar token')
//        }
      }

      // await this.customHttpProvider.registerTokenOnBackend(idEmp, codRepErp,
      //   {
      //     uuidDisp: this.deviceUUID,
      //     tokenApp: this.deviceTokenFCM,
      //     cpf: user.cpf,
      //     email: user.email,
      //   }
      // );

  //    tokenInfo = { token: this.deviceTokenFCM, uuid: this.deviceUUID };
    }
  //  return(tokenInfo);
  }

  /**
   * Baixa empresas, pega o Token do FCM, grava o token no Backend
   * @param user Usuario logado
   */
  async authenticate(user: User) {
    let ret = false
    let online = await this.global.getProperty('online');

    // Buscar as empresas do backend ou local
    let companyOk = false;
    if (online) {
      if (user.companies && user.companies.length > 0) {
        // já existem empresas localmente, entao basta atualizar por carga
        await this.loaderProvider.show('Atualizando últimas informações...');
        await this.synchronizeProvider.syncByCharge(user.companies);
        await this.loaderProvider.close();
        companyOk = true;
      } else {
        // não existe empresas ainda, tem que inicializar as empresas
        let companies: Array<any>;
        await this.loaderProvider.show('Buscando empresas...');
        if (user.cpf) {
          companies = await this.customHttpProvider.getAccessCompanies(user.cpf);
        } else {
          companies = await this.customHttpProvider.getAccessCompanies(user.email);
        }
        await this.loaderProvider.close();

        if (companies && companies.length > 0) {
          user.companies = companies;
          user.currentCompany = companies[0];
          await this.saveUserLocal(new User(
            user.uuidDisp,
            user.cpf,
            user.email,
//            user.tokenFCM,
            user.currentCompany,
            companies,
          ));

          const data = companies.map(x => ({ idEmp: x.idEmp, codRepErp: x.codRepErp, idOper: x.idOper }));

          await this.loaderProvider.show('Baixando informações do servidor...');
          await this.synchronizeProvider.syncComplete(data);
          await this.loaderProvider.close();

          companyOk = true;
        }
      }
      // Se for usuario novo, inclui com o registro abaixo
      this.registerFCMToken(user);
    } else {
      // OffLine
      companyOk = user.companies && user.companies.length > 0;
    }

    if (companyOk) {
      online = await this.global.getProperty('online');
      if (online) {
        // Setar ou atualizar o token no backend
//        const tokenInfo = await this.registerFCMToken(user);
//        this.registerFCMToken(user);
//         if (tokenInfo) {
//           await this.saveUserLocal(new User(
//             tokenInfo.uuid,
//             user.cpf,
//             user.email,
// //            tokenInfo.token,
//             user.currentCompany,
//             user.companies
//           ));
//         }
      } else {
        this.toastProvider.show('Não consegui ler os dados online agora, mas não tem problemas. Eu sei trabalhar offline também!');
      }
      ret = true
    }
    return ret
  }


}
