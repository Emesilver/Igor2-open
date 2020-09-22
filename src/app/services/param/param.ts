import { Param } from '../../models/param';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';

@Injectable({
    providedIn: 'root'
})
export class ParamProvider {
    constructor(
        public customHttpProvider: CustomHttpProvider,
        public global: AppState,
        public storage: Storage
    ) { }

    getByCustomer(codCliErp: string) {
        return new Promise<Param>(async (resolve) => {
            const idEmp = this.global.getProperty('idEmp');
            const params: Array<Param> =
                await this.storage.get(this.global.modelNames.par_venda + idEmp);
            let param: Param = null;
            if (params) {
                param = params.find(par => par.codCliErp === codCliErp);
                if (!param) {
                    param = params.find(par => par.codCliErp === '');
                }
            }
            resolve(param);
        });
    }
}

