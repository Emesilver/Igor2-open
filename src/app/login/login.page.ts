import { Component, OnInit } from '@angular/core';
import { UserProvider } from '../services/user/user';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isEmail = false;
  sentences: Array<string>;
  login = '';
  messageCount = 0;
  backButtonSubscription: any;
  exitEventListner!: EventListener;

  constructor(private userProvider: UserProvider, private router: Router) {
    this.sentences = [
      ' Olá, eu sou o IGOR, seu assistente para lançamento de pedidos. Vamos começar?',
      'Apenas desta vez, me informe o seu Email para que eu possa te reconhecer.',
    ];
  }

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    //    this.init();
  }

  async init() {
    const user = await this.userProvider.getUserLocal();
    if (user && user.currentCompany) {
      if (await this.userProvider.authenticate(user)) {
        this.router.navigate(['/home']);
      } else {
        //        this.removeExitEvent();
        this.userProvider.showMessageEmptyCompanies();
        this.router.navigate(['/unfinished-login']);
      }
    } else {
      //      this.createExitEvent();
    }
  }

  /* Logando no primeiro acesso ou ainda nao tem empresa liberada */
  async onSubmit() {
    if (this.login) {
      this.login = this.login.trim();
      this.login = this.login.toLowerCase();
    }
    const regex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    const user = new User('', '', '', [], undefined);

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
    const autenticated = await this.userProvider.authenticate(user);
    if (autenticated) {
      this.router.navigate(['/home']);
    } else {
      //      this.removeExitEvent();
      this.userProvider.showMessageEmptyCompanies();
      this.router.navigate(['/unfinished-login']);
    }
  }

  // createExitEvent() {
  //   const appLiteral = 'app';
  //   this.exitEventListner = (e: Event) => navigator[appLiteral].exitApp();
  //   document.addEventListener('backbutton', this.exitEventListner);
  // }

  // removeExitEvent() {
  //   document.removeEventListener('backbutton', this.exitEventListner);
  // }
}
