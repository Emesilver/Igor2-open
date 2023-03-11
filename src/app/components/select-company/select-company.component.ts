import { Component } from '@angular/core';
import {
  AlertButton,
  AlertController,
  AlertInput,
  AlertOptions,
} from '@ionic/angular';
import { EventsService } from '../../services/events/events.service';
import { UserProvider } from 'src/app/services/user/user';

@Component({
  selector: 'select-company',
  templateUrl: './select-company.component.html',
  styleUrls: ['./select-company.component.scss'],
})
export class SelectCompanyComponent {
  companyName = '';

  constructor(
    private alertController: AlertController,
    private userProvider: UserProvider,
    private events: EventsService
  ) {
    this.init();
  }

  async init() {
    const user = await this.userProvider.getUserLocal();
    if (!user.currentCompany) {
      user.currentCompany = user.companies ? user.companies[0] : undefined;
    }
    if (user.currentCompany?.fantasiaEmp) {
      this.companyName = user.currentCompany?.fantasiaEmp;
    } else {
      this.companyName = 'Indefinida';
    }
  }

  async selectCompany() {
    const inputs: AlertInput[] = [];
    const user = await this.userProvider.getUserLocal();
    user.companies.forEach((company) => {
      inputs.push({
        value: company.idEmp,
        type: 'radio',
        label: company.fantasiaEmp,
      });
    });
    const buttons: AlertButton[] = [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'OK',
        handler: async (idEmp: string) => {
          if (idEmp) {
            const user = await this.userProvider.getUserLocal();
            const newCurrentCompany = user.companies.find(
              (company) => company.idEmp === idEmp
            );
            if (newCurrentCompany) {
              this.companyName = newCurrentCompany.fantasiaEmp;
              await this.userProvider.setCurrentCompany(newCurrentCompany);
              this.events.publish('refreshInfo', {});
            }
          }
        },
      },
    ];
    const alertOptions: AlertOptions = {
      header: 'Selecione uma empresa',
      inputs,
      buttons,
    };
    const alert = await this.alertController.create(alertOptions);
    alert.present();
  }
}
