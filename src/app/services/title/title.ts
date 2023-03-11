import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { Title } from 'src/app/models/title';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class TitleProvider {
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider
  ) {}

  async filterByClient(codCliErp: string) {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const titles: Array<Title> = await this.customStorage.getLocal<Title>(
      ModelNames.titulo + idEmp
    );
    return titles.filter((title) => title.codCliErp === codCliErp);
  }
}
