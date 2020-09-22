import { SynchronizeProvider } from './../services/synchronize/synchronize';
import { Component, OnInit } from '@angular/core';
import { UserProvider } from '../services/user/user';
import { LoaderProvider } from '../services/loader/loader';
import { User } from '../models/user';
import { AppState } from '../app.global';
import { Router, NavigationExtras } from '@angular/router';
import { ToastProvider } from '../services/toast/toast';
import { CustomHttpProvider } from '../services/custom-http/custom-http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  isEmail = false;
  sentences: Array<string>;
  login = '';
  messageCount = 0;
  backButtonSubscription: any;
  exitEventListner: EventListener;

  constructor(
    private userProvider: UserProvider,
    private loaderProvider: LoaderProvider,
    private synchronizeProvider: SynchronizeProvider,
    private global: AppState,
    private router: Router,
    private toastProvider: ToastProvider,
    private customHttpProvider: CustomHttpProvider,
  ) {

  }

  ngOnInit() {
//    alert('ngoninit')
    this.init();
}

  ionViewWillEnter() {
//    alert('ionViewWillEnter')
//    this.init();
  }

  async init() {
    const user = await this.userProvider.getUserLocal();
    if (user && user.currentCompany) {
      if (this.userProvider.authenticate(user) ) {
        this.router.navigate(['/home']);
      } else {
        this.removeExitEvent();
        this.userProvider.showMessageEmptyCompanies();
        this.router.navigate(['/unfinished-login']);
      }
    } else {
      this.createExitEvent();
      this.sentences = [
        ' Olá, eu sou o IGOR, seu assistente para lançamento de pedidos. Vamos começar?',
        'Apenas desta vez, me informe o seu Email para que eu possa te reconhecer.'
      ];
    }
  }


  /* Logando no primeiro acesso ou ainda nao tem empresa liberada */
  async onSubmit() {
    if (this.login) {
      this.login = this.login.trim();
      this.login = this.login.toLowerCase();
    }
    const regex = (/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i);
    const user = new User(
      '',
      '',
//      '',
      '',
      null,
      null
    );

    // Verifica se o valor inserido é um e-mail
    if (regex.test(this.login)) {
      user.email = this.login;
    } else {
      user.cpf = this.login;
    }
    await this.userProvider.saveUserLocal(user);

    // (Registrar token inicial no backend) -> foi para authenticate()
    // const tokenInicial = await this.userProvider.registerFCMToken(user);
    // if (!tokenInicial) {
    //   alert('Falha ao registrar token inicial');
    // }
    const autenticated = await this.userProvider.authenticate(user)
    if (autenticated) {
      this.router.navigate(['/home']);
    } else {
      this.removeExitEvent();
      this.userProvider.showMessageEmptyCompanies();
      this.router.navigate(['/unfinished-login']);

    }
  }

  createExitEvent() {
    const appLiteral = 'app';
    this.exitEventListner = (e: Event) => navigator[appLiteral].exitApp();
    document.addEventListener('backbutton', this.exitEventListner);
  }

  removeExitEvent() {
    document.removeEventListener('backbutton', this.exitEventListner);
  }
}
