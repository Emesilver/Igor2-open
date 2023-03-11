import { Injectable } from '@angular/core';
//import { Storage } from '@ionic/storage-angular';
import { UtilProvider } from '../util/util';
import moment from 'moment';

/*
  Generated class for the LogProvider provider.
  Depreciado: EXCLUIR!
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root',
})
export class LogProvider {
  //  constructor(public storage: Storage, public utilProvider: UtilProvider) {}

  save(message: string, error = '') {
    // this.storage.set(this.utilProvider.generateUUID(), {
    //   message,
    //   error,
    //   date: moment().format('DD/MM/YYYY HH:mm'),
    // });
  }
}
