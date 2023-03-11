import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderProvider {
  private isLoading = false;
  constructor(public loadingCtrl: LoadingController) {}

  async show(message: string) {
    this.isLoading = true;
    return await this.loadingCtrl
      .create({
        message: message || 'Carregando...',
      })
      .then((loadingElement) => {
        loadingElement.present().then(() => {
          if (!this.isLoading) {
            // loadingElement.dismiss().then(() => console.log('abort presenting'));
            loadingElement.dismiss();
          }
        });
      });
  }

  async close() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss();
  }
}
