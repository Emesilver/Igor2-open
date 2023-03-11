import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { PriorityProvider } from '../priority/priority';
import { DeliveryType } from 'src/app/models/delivery-type';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class DeliveryTypeProvider {
  constructor(
    private global: AppState,
    private priorityProvider: PriorityProvider,
    private customStorageProvider: CustomStorageProvider
  ) {}

  async getDeliveriesCapa(codCliErp: string): Promise<DeliveryType[]> {
    const deliveriesCapa = await this.customStorageProvider.getLocal<
      DeliveryType[]
    >(
      ModelNames.tipo_entrega_capa + this.global.getProperty(Properties.ID_EMP)
    );
    // Nesta versao ainda nao aceita tipo de entrega por produto, apenas por cliente e representante
    return this.priorityProvider.filterByPriorityRC(deliveriesCapa, codCliErp);
  }

  async getByPriority(
    codCliErp: string,
    codProErp: string,
    codEntErp: string
  ): Promise<DeliveryType> {
    let deliveries = await this.customStorageProvider.getLocal<DeliveryType>(
      ModelNames.tipo_entrega + this.global.getProperty(Properties.ID_EMP)
    );
    deliveries = deliveries.filter((deliveryType: DeliveryType) => {
      return (deliveryType.codEntErp = codEntErp);
    });
    return this.priorityProvider.getByPriority(
      deliveries,
      codCliErp,
      codProErp
    );
  }
}
