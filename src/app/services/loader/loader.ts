import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderProvider {
  isLoading = false;
  constructor(public loadingCtrl: LoadingController) { }

  async show(message: string = null) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: message || 'Carregando...'
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async close() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss();
  }
}
