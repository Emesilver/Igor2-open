import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AlertController } from '@ionic/angular';
import { EventsService } from '../../services/events/events.service';
import { UserProvider } from 'src/app/services/user/user';

@Component({
  selector: 'select-company',
  templateUrl: './select-company.component.html',
  styleUrls: ['./select-company.component.scss'],
})
export class SelectCompanyComponent implements OnInit {
  user: User;
  companyName = '';

  constructor(
    private alertController: AlertController,
    private userProvider: UserProvider,
    private events: EventsService
  ) {
    this.init();
  }

  async init() {
    this.user = await this.userProvider.getUserLocal();
    if (!this.user.currentCompany) {
      this.user.currentCompany = this.user.companies ? this.user.companies[0] : null;
    }
    this.companyName = this.user.currentCompany.fantasiaEmp;
  }

  async selectCompany() {
    const inputs = [];
    this.user.companies.forEach((company) => {
      inputs.push({
        value: company.idEmp,
        type: 'radio',
        label: company.fantasiaEmp
      });
    });

    const alert = await this.alertController.create({
      header: 'Selecione uma empresa',
      inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'OK',
          handler: data => {
            if (data) {
              const newCurrentCompany = this.user.companies.find(x => x.idEmp === data);
              this.companyName = newCurrentCompany.fantasiaEmp;
              this.userProvider.setCurrentCompany(newCurrentCompany).then(() => {
                this.events.publish('refreshInfo', {});
              });
            }
          }
        }
      ]
    });
    alert.present();
  }

  ngOnInit() { }

}
