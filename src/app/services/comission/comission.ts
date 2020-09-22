import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';
import { Comission } from 'src/app/models/comission';
import { PriorityProvider } from '../priority/priority';

@Injectable({
    providedIn: 'root'
})
export class ComissionProvider {

    constructor(
        private global: AppState,
        private storage: Storage,
        private customHttpProvider: CustomHttpProvider,
        private priorityProvider: PriorityProvider,
    ) { }

    getByPriority(codRepErp: string, codCliErp: string, codProErp: string) {
        return new Promise<Comission>(async (resolve) => {
            const idEmp = this.global.getProperty('idEmp');
            const comissions: Array<Comission> =
                await this.storage.get(this.global.modelNames.comissao + idEmp);
            const comission = this.priorityProvider.getByPriority(comissions, codCliErp, codProErp);
            resolve(comission);
        });
    }
}
