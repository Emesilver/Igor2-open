import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastProvider {
  constructor(public toastCtrl: ToastController) {}

  async show(message: string, position = null, duration = null) {
    const toast = await this.toastCtrl.create({
      message: message,
      position: position || 'bottom',
      duration: duration || 3000,
    });

    await toast.present();
  }
}
