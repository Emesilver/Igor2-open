import { Injectable } from '@angular/core';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { AppState, Properties } from 'src/app/app.global';
import { AlertController } from '@ionic/angular';
import { Company } from 'src/app/models/company';
import { User } from 'src/app/models/user';
import { LoaderProvider } from '../loader/loader';
import { SynchronizeProvider } from '../synchronize/synchronize';
import { ToastProvider } from '../toast/toast';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class UserProvider {
  constructor(
    private customHttpProvider: CustomHttpProvider,
    private customStorage: CustomStorageProvider,
    private global: AppState,
    private alertCtrl: AlertController,
    private loaderProvider: LoaderProvider,
    private synchronizeProvider: SynchronizeProvider,
    private toastProvider: ToastProvider
  ) {}

  async getLocalCompanies(): Promise<Company[]> {
    return (await this.getUserLocal()).companies;
    //   return new Promise((resolve) => {
    //     this.getUserLocal().then((user) => {
    //       if (user) {
    //         resolve(user.companies);
    //       } else {
    //         resolve(null);
    //       }
    //     });
    //   });
  }

  async setCurrentCompany(company: Company) {
    const userLocal = await this.getUserLocal();
    userLocal.currentCompany = company;
    await this.saveUserLocal(userLocal);
    this.global.setProperty(Properties.ID_EMP, userLocal.currentCompany.idEmp);
    this.global.setProperty(
      Properties.ID_OPER,
      userLocal.currentCompany.idOper
    );
    this.global.setProperty(
      Properties.COD_REP_ERP,
      userLocal.currentCompany.codRepErp
    );

    // return new Promise<void>((resolve) => {
    //   this.getUserLocal().then((user) => {
    //     user.currentCompany = company;
    //     this.saveUserLocal(user).then(() => {
    //       this.global.setProperty('idEmp', user.currentCompany.idEmp);
    //       this.global.setProperty('idOper', user.currentCompany.idOper);
    //       this.global.setProperty('codRepErp', user.currentCompany.codRepErp);
    //       resolve();
    //     });
    //   });
    // });
  }

  saveUserLocal(user: User) {
    this.initializeUser(user);
    return this.customStorage.saveRowData('user', user);
  }

  async getUserLocal(): Promise<User> {
    const user = await this.customStorage.getRawData('user');
    if (user && user.currentCompany) {
      this.initializeUser(user);
    }
    return user;
  }

  private initializeUser(user: User) {
    if (user.currentCompany) {
      this.global.setProperty(Properties.ID_EMP, user.currentCompany.idEmp);
      this.global.setProperty(Properties.ID_OPER, user.currentCompany.idOper);
      this.global.setProperty(
        Properties.COD_REP_ERP,
        user.currentCompany.codRepErp
      );
    }
  }

  async showMessageSuccessLogin() {
    const alert = await this.alertCtrl.create({
      header: 'Cadastrado com sucesso.',
      message: 'Aguarde até os administradores finalizarem seu cadastro.',
      buttons: ['OK'],
    });

    alert.present();
  }

  async showMessageEmptyCompanies() {
    const alert = await this.alertCtrl.create({
      header: 'Cadastro não finalizado.',
      message: 'Aguarde até os administradores finalizarem seu cadastro.',
      buttons: ['OK'],
    });

    alert.present();
  }

  logout() {
    return this.customStorage.clear();
  }

  /**
   * Baixa empresas, pega o Token do FCM, grava o token no Backend
   * @param user Usuario logado
   */
  async authenticate(user: User) {
    // Buscar as empresas do backend ou local
    let companyOk = false;
    if (
      user.companies &&
      user.companies.length > 0 &&
      user.currentCompany?.apiLeitura
    ) {
      // já existem empresas localmente, entao basta atualizar por carga
      await this.loaderProvider.show('Atualizando últimas informações...');
      await this.synchronizeProvider.syncByCharge(user.companies);
      await this.loaderProvider.close();
      companyOk = true;
    } else {
      // não existe empresas ainda, tem que inicializar as empresas
      const cpfEmail = user.cpf ? user.cpf : user.email;
      await this.loaderProvider.show('Buscando empresas...');
      const companies = await this.customHttpProvider.getAccessCompanies(
        cpfEmail
      );
      await this.loaderProvider.close();

      if (companies && companies.length > 0) {
        user.companies = companies;
        user.currentCompany = companies[0];
        await this.saveUserLocal(
          new User(
            user.uuidDisp,
            user.cpf,
            user.email,
            companies,
            user.currentCompany
          )
        );

        await this.loaderProvider.show('Baixando informações do servidor...');
        await this.synchronizeProvider.syncComplete(companies);
        await this.loaderProvider.close();

        companyOk = true;
      } else {
        await this.loaderProvider.show('Incluindo novo operador...');
        try {
          await this.customHttpProvider.createOperator(user.cpf, user.email);
        } catch (error) {
          this.toastProvider.show(
            'Operador já foi adicionado. Entre em contato com o suporte.'
          );
        }
        await this.loaderProvider.close();
      }
    }
    return companyOk;
  }
}
