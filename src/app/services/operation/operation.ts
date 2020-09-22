// import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { AppState } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
    providedIn: 'root'
})
export class OperationProvider {
    constructor(
        // private httpProvider: CustomHttpProvider,
        private customStorageProvider: CustomStorageProvider,
        private global: AppState
    ) {
    }

    getLocalList(): Promise<Array<any>> {
        return this.customStorageProvider.getLocal(this.global.modelNames.operacao + this.global.getProperty('idEmp'))
        // return new Promise(async (resolve, reject) => {
        //     resolve(
        //         await this.httpProvider.getTotalLoad(
        //             this.global.modelNames.operacao,
        //             false
        //         )
        //     );
        // });
    }

}
