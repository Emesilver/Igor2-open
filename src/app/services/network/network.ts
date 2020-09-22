import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { AppState } from 'src/app/app.global';

@Injectable({
  providedIn: 'root'
})
export class NetworkProvider {
  disconnectSubscription: any;
  connectSubscription: any;

  constructor(
    private storage: Storage,
    private network: Network,
    private global: AppState
  ) {

  }

  startMonitoring() {
    this.disconnectSubscription = this.network.onDisconnect();
    this.connectSubscription = this.network.onConnect();
    this.global.setProperty('online', true);

    this.disconnectSubscription.subscribe(() => {
      this.global.setProperty('online', false);
    });

    this.connectSubscription.subscribe(() => {
      this.global.setProperty('online', true);
    });
  }

  stopMonitoring() {
    this.connectSubscription.unsubscribe()
    this.disconnectSubscription.unsubscribe()
  }

  setLastSync(type: string): void {
    this.storage.set(`lastSync_${type}`, moment().format('YYYY-MM-DD HH:mm'));
  }

  getLastSync(type) {
    return this.storage.get(`lastSync_${type}`);
  }
}
