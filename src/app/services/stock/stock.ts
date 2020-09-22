import { Stock } from '../../models/stock';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AppState } from 'src/app/app.global';

@Injectable({
    providedIn: 'root'
})
export class StockProvider {
    constructor(
        public customHttpProvider: CustomHttpProvider,
        public global: AppState,
        public storage: Storage
    ) { }

    getByPriority(codProErp: string, codCliErp: string) {
        return new Promise<Stock>(async (resolve) => {
            const idEmp = this.global.getProperty('idEmp');
            const stocks: Array<Stock> =
                await this.storage.get(this.global.modelNames.estoque + idEmp);
            // Retornar na ordem de prioridade: cliente/produto, apenas produto
            let stock = stocks.find(stk =>
                stk.codCliErp === codCliErp &&
                stk.codProErp === codProErp
            );
            if (!stock) {
                stock = stocks.find(stk =>
                    stk.codProErp === codProErp
                );
            }
            resolve(stock);
        });
    }
}

