import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { findIndex as _findIndex } from 'lodash';
import { AppState } from 'src/app/app.global';

@Injectable({
  providedIn: 'root'
})
export class CustomStorageProvider {

  constructor(
    public storage: Storage,
    private globals: AppState
  ) {
  }

  getLocal(collectionName: string): Promise<any> {
    return new Promise(async (resolve) => {
      resolve(await this.storage.get(collectionName));
    });
  }

  saveLocal(collectionName: string, data: any): Promise<any> {
    return this.storage.set(collectionName, data)
  }

  async updateLocal(oneOrMoreRecords: any, collectionName: string, keys: Array<string>) {
    if (this.globals.isArray(oneOrMoreRecords)) {
      for (const record of oneOrMoreRecords) {
        await this.logicUpdate(record, collectionName, keys)
      }
    } else {
      // oneOrMoreRecords tem apenas um registro aqui
      await this.logicUpdate(oneOrMoreRecords, collectionName, keys)
    }
  }

  private async logicUpdate(record: any, collectionName: string, keys: Array<string>) {
    const localDataCopy = await this.getLocal(collectionName) || [];
    if (localDataCopy.length > 0) {
      let localDataFiltered: any = localDataCopy.slice();
      for (const key of keys) {
        // Filtro sobre filtro para pegar todos os campos da chave (como um AND)
        localDataFiltered = localDataFiltered.filter(x => x[key] === record[key]);
      }

      // pegar o indice do registro encontrado
      const i = localDataFiltered[0] ? _findIndex(localDataCopy, localDataFiltered[0]) : -1;
      if (i !== -1) {
        localDataCopy[i] = record;
      } else {
        // registro nao encontrado sera incluido na primeira posicao
        localDataCopy.unshift(record);
      }

    } else {
      localDataCopy.unshift(record);
    }
    await this.storage.set(collectionName, localDataCopy);
  }

  clear() {
    return new Promise(async resolve => {
      await this.storage.clear();
      resolve();
    });
  }

}
