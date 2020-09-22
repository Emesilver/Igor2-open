import { Component, OnInit } from '@angular/core';
import { UserProvider } from '../services/user/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unfinished-login',
  templateUrl: './unfinished-login.page.html',
  styleUrls: ['./unfinished-login.page.scss'],
})
export class UnfinishedLoginPage implements OnInit {
  message: string;
  constructor(
    private userProvider: UserProvider,
    private router: Router
  ) {
    this.message = 'Aguarde a finalização do seu cadastro.';
    if (this.router.getCurrentNavigation().extras.state) {
      this.message = this.router.getCurrentNavigation().extras.state.message;
    }
  }

  ngOnInit() {
  }

  logout() {
    this.userProvider.logout();
  }
}
