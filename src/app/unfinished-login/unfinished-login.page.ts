import { Component } from '@angular/core';
import { UserProvider } from '../services/user/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unfinished-login',
  templateUrl: './unfinished-login.page.html',
  styleUrls: ['./unfinished-login.page.scss'],
})
export class UnfinishedLoginPage {
  message: string;
  constructor(private userProvider: UserProvider, private router: Router) {
    this.message = 'Aguarde a finalização do seu cadastro.';
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.message = navigation.extras.state['message'];
    }
  }

  logout() {
    this.userProvider.logout();
  }
}
