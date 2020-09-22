import { Injectable } from '@angular/core';
import { CustomHttpProvider } from '../custom-http/custom-http';
import { AppState } from 'src/app/app.global';
import { PriorityProvider } from '../priority/priority';
import { DeliveryType } from 'src/app/models/delivery-type';
import { ToastProvider } from '../toast/toast';
import { CustomStorageProvider } from '../custom-storage/custom-storage';


@Injectable({
    providedIn: 'root'
})
export class DeliveryTypeProvider {
    constructor(
        private customHttpProvider: CustomHttpProvider,
        private global: AppState,
        private priorityProvider: PriorityProvider,
        private toastProvider: ToastProvider,
        private customStorageProvider: CustomStorageProvider,
    ) {
    }

    getDeliveriesCapa(): Promise<Array<any>> {
        return this.customStorageProvider.getLocal(
            this.global.modelNames.tipo_entrega_capa + this.global.modelNames.tipo_entrega_capa
        )
        // return new Promise(async (resolve, reject) => {
        //     resolve(await this.customHttpProvider.getTotalLoad(
        //         this.global.modelNames.tipo_entrega_capa,
        //         false
        //     ));
        // });
    }

    getByPriority(codCliErp: string, codProErp: string, codEntErp: string): Promise<DeliveryType> {
        return new Promise(async (resolve, reject) => {

            let deliveries = await this.customStorageProvider.getLocal(
                this.global.modelNames.tipo_entrega + this.global.getProperty('idEmp'))
            // let deliveries = await this.customHttpProvider.getTotalLoad(
            //     this.global.modelNames.tipo_entrega,
            //     false
            // );
            deliveries = deliveries.filter(n => {
                return n.codEntErp = codEntErp;
            });
            const delivery = this.priorityProvider.getByPriority(deliveries, codCliErp, codProErp);
            resolve(delivery);
        });
    }
}
