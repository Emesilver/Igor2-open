import { ModalController, NavParams } from '@ionic/angular';
import { Component} from '@angular/core';

@Component({
  selector: 'app-custom-error',
  templateUrl: './custom-error.page.html',
  styleUrls: ['./custom-error.page.scss'],
})
export class CustomErrorPage {
  errors: Array<string> = [];
  title: string;
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
  ) {
    this.errors = this.navParams.get('errors');
    this.title = this.navParams.get('title');
  }

  close() {
    this.modalController.dismiss();
  }
}
