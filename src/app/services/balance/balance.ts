import { Balance } from '../../models/balance';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';

@Injectable({
    providedIn: 'root'
})
export class BalanceProvider {
    constructor(
        public customHttpProvider: CustomHttpProvider,
        public global: AppState,
        public storage: Storage
    ) { }

    getByCustomer(customer) {
        return new Promise<Balance>(async (resolve) => {
            const idEmp = this.global.getProperty('idEmp');
            const balances: Array<Balance> =
                await this.storage.get(this.global.modelNames.saldo + idEmp);
            const balance = balances.find(bal => bal.codCliErp === customer.codCliErp);
            resolve(balance);
        });
    }
}

