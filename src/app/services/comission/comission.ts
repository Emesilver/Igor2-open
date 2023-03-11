import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { Comission } from 'src/app/models/comission';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { PriorityProvider } from '../priority/priority';

@Injectable({
  providedIn: 'root',
})
export class ComissionProvider {
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider,
    private priorityProvider: PriorityProvider
  ) {}

  async getByPriority(codCliErp: string, codProErp: string) {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const comissions: Array<Comission> =
      await this.customStorage.getLocal<Comission>(ModelNames.comissao + idEmp);
    return this.priorityProvider.getByPriority(
      comissions,
      codCliErp,
      codProErp
    );
  }
}
