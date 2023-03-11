import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { findIndex as _findIndex } from 'lodash';
import { AppState } from 'src/app/app.global';

@Injectable({
  providedIn: 'root',
})
export class CustomStorageProvider {
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private globals: AppState) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async getLocal<T>(collectionName: string) {
    return (await this._storage?.get(collectionName)) as T[];
  }

  async saveLocal<T>(collectionName: string, data: T[]) {
    return await this._storage?.set(collectionName, data);
  }

  async remove(collectionName: string) {
    await this._storage?.remove(collectionName);
  }

  async getRawData(key: string) {
    return this._storage?.get(key);
  }

  async saveRowData(key: string, data: unknown) {
    return this._storage?.set(key, data);
  }

  async updateLocal(
    oneOrMoreRecords: any,
    collectionName: string,
    keys: Array<string>
  ) {
    if (this.globals.isArray(oneOrMoreRecords)) {
      for (const record of oneOrMoreRecords) {
        await this.logicUpdate(record, collectionName, keys);
      }
    } else {
      // oneOrMoreRecords tem apenas um registro aqui
      await this.logicUpdate(oneOrMoreRecords, collectionName, keys);
    }
  }

  private async logicUpdate(
    record: any,
    collectionName: string,
    keys: Array<string>
  ) {
    const localDataCopy = (await this.getLocal<any>(collectionName)) || [];
    if (localDataCopy.length > 0) {
      let localDataFiltered = localDataCopy.slice();
      for (const key of keys) {
        // Filtro sobre filtro para pegar todos os campos da chave (como um AND)
        localDataFiltered = localDataFiltered.filter(
          (x: any) => x[key] === record[key]
        );
      }

      // pegar o indice do registro encontrado
      const i = localDataFiltered[0]
        ? _findIndex(localDataCopy, localDataFiltered[0])
        : -1;
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

  async clear() {
    await this.storage.clear();
  }
}
