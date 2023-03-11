import { Param } from '../../models/param';
import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { PriorityProvider } from '../priority/priority';

@Injectable({
  providedIn: 'root',
})
export class ParamProvider {
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider,
    private priorityProvider: PriorityProvider
  ) {}

  async getParamByCustomer(codCliErp: string) {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const params: Param[] = await this.customStorage.getLocal<Param>(
      ModelNames.par_venda + idEmp
    );
    const paramsCli = this.priorityProvider.filterByPriorityRC(
      params,
      codCliErp
    );
    if (params.length > 0) {
      return paramsCli[0];
    }
    return new Param(+idEmp, '', '', '00:00:00', '23:59:59');
  }
}
