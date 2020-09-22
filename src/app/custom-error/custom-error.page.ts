import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-error',
  templateUrl: './custom-error.page.html',
  styleUrls: ['./custom-error.page.scss'],
})
export class CustomErrorPage implements OnInit {
  errors: Array<string> = [];
  title: string;
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
  ) {
    this.errors = this.navParams.get('errors');
    this.title = this.navParams.get('title');
  }

  ngOnInit() {
  }

  close() {
    this.modalController.dismiss();
  }
}
