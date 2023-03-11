import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { Operation } from 'src/app/models/operation';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class OperationProvider {
  constructor(
    private customStorageProvider: CustomStorageProvider,
    private global: AppState
  ) {}

  async getOperations(): Promise<Operation[]> {
    return this.customStorageProvider.getLocal(
      ModelNames.operacao + this.global.getProperty(Properties.ID_EMP)
    );
  }
}
