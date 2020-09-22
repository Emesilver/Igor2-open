import { ToastProvider } from './../toast/toast';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { NetworkProvider } from '../network/network';
import { UrlHelperProvider } from '../url-helper/url-helper';
import _ from 'lodash';
import { AppState } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { Company } from 'src/app/models/company';
// import { analytics } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CustomHttpProvider {

  constructor(
    private httpClient: HttpClient,
//    private storage: Storage,
    private global: AppState,
    private urlHelperProvider: UrlHelperProvider,
    private toastProvider: ToastProvider,
    // private networkProvider: NetworkProvider,
    private customStorageProvider: CustomStorageProvider,
    ) {
  }

  getAccessCompanies(docOrEmail: string): Promise<Array<Company>> {
    return new Promise((resolve, reject) => {
      const online = this.global.getProperty('online')
      if (online) {
        const endPoint = `${this.global.API_URL}/acessos/${docOrEmail}`
        this.getObjURL(endPoint)
        .then((dataReturned) => {
          resolve(dataReturned)
        })
        .catch(() => {
          this.toastProvider.show('Não foi possível ler os acessos agora. Preciso de internet!');
          reject(null)
        })
      } else {
        resolve(null)
      }
    })
  }

  /*
  getTotalLoad(idEmp: string, codRepErp: string, model: string, readRemote: boolean): Promise<Array<any>> {
    const idEmp = this.global.getProperty('idEmp')
    return this.getTotalLoadByEmp(idEmp, codRepErp, model, readRemote)
  }
*/
  getTotalLoadByEmp(idEmp: string, codRepErp: string, model: string, readRemote: boolean): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
      const online = await this.global.getProperty('online');
      if (online && readRemote) {
        const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'GET', '/T/0')
        this.getObjURL(endPoint)
        .then((dataReturned) => {
          resolve(dataReturned)
        })
        .catch(() => {
          reject(null)
        })
      } else {
        // Se estiver offline, retornar null e a rotina chamadora deve tratar isso
        resolve(null)
      }
    });
  }

  getTotalLoadByCharge(idEmp: string, codRepErp: string, model: string, ultCarga): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
      const online = await this.global.getProperty('online');
      if (online) {
        const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'GET', '/T/' + ultCarga)
        this.getObjURL(endPoint)
        .then((dataReturned) => {
          resolve(dataReturned)
        })
        .catch(() => {
          reject(null)
        })
      } else {
        // Se estiver offline, retornar null e a rotina chamadora deve tratar isso
        resolve(null)
      }
    })
  }

  getPartialLoad(idEmp: string, codRepErp: string, model: string, ultCarga): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const online = this.global.getProperty('online')
      if (online) {
        const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'GET', '/P/' + ultCarga)
        this.getObjURL(endPoint)
        .then((dataReturned) => {
          resolve(dataReturned)
        })
        .catch(() => {
          reject(null)
        })
      } else {
        this.toastProvider.show('Estamos trabalhando offline (sem internet).');
        resolve(null)
      }
    });
  }

  // Retorna o resultado de uma consulta usando url base do model
  getByURLBase(idEmp: string, codRepErp: string, model: string): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const online = this.global.getProperty('online')
      if (online) {
        const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'GET', '')
        this.getObjURL(endPoint)
        .then((dataReturned) => {
          resolve(dataReturned)
        })
        .catch(() => {
          reject(null)
        })
      } else {
        this.toastProvider.show('Estamos trabalhando offline (sem internet).');
        resolve(null)
      }
    })
  }

  getMainItens(idEmp: string, codRepErp: string): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
      const model = this.global.modelNames.principais_produtos
      const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'GET', '')
      this.getObjURL(endPoint)
      .then((dataReturned) => {
        resolve(dataReturned)
      })
      .catch(() => {
        reject(null)
      })
    });
  }


  private getObjURL(url: string): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.getTokenBearer()
      .then((tokenBearer) => {
        const headers = { 'Content-Type': 'application/json' as const, authorization: 'Bearer ' + tokenBearer }
        this.httpClient.get<Array<any>>(url, { headers }).subscribe(data => {
          resolve(data);
        }, error => {
          console.error(error);
          reject(error);
        })
      })
    });
  }



  getLocal(collection: string): Promise<Array<any>> {
    return new Promise<Array<any>>((resolve, reject) => {
      this.customStorageProvider.getLocal(collection)
      .then((data: Array<any>) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      })
    })
  }

  saveManyLocal(collection: string, data: Array<any>): Promise<Array<any>> {
    return new Promise((resolve) => {
      this.getLocal(collection).then((localData: Array<any>) => {

        if (!localData) {
          localData = [];
        }

        const existsData = [];

        data.forEach(element => {
          existsData.push(localData.find(x => x.uid === element.uid));
        });

        localData = _.pullAllBy(localData, existsData, 'uid');

        data = _.unionBy(localData, data, 'uid');

        this.customStorageProvider.saveLocal(collection, data)
        .then((savedData) => {
          resolve(savedData);
        });
      });
    });
  }

  postObj(idEmp: string, codRepErp: string, model: string, obj: any): Promise<any> {
    const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'POST', '')
    return this.postObjURL(obj, endPoint)
  }

  private postObjURL(obj: any, url:string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTokenBearer()
      .then((tokenBearer) => {
        const headers = { 'Content-Type': 'application/json' as const, authorization: 'Bearer ' + tokenBearer }
        this.httpClient.post(url, JSON.stringify(obj), { headers })
        .subscribe(async data => {
          resolve(data)
        }, error => {
          reject(error)
        })
      })
    })
  }

//  registerTokenOnBackend( idEmp: string, codRepErp: string,
  registerTokenOnBackend(tokenData: { uuidDisp: string; tokenApp: string; cpf: string; email: string; }): Promise<any> {
    // const model = this.global.modelNames.token
    // const endPoint = this.urlHelperProvider.getURL(idEmp, codRepErp, model, 'POST', '')
    const endPoint = `${this.global.API_URL}/token`
    return this.postObjURL(tokenData, endPoint)
  }

  private getTokenBearer(): Promise<any> {
    return new Promise((resolve, reject) => {
      const bearerToken = this.global.getPropertyOrNull('bearerToken')
      let accessTokenRet = ''
      if (bearerToken) {
        const bearerExpiresAt = this.global.getPropertyOrNull('bearerExpiresAt')
        if (bearerExpiresAt) {
          const dateTimeNow = new Date()
          if (bearerExpiresAt > dateTimeNow.toISOString()) {
            accessTokenRet = bearerToken
          }
      } else {
          accessTokenRet = bearerToken
        }
      }

      if (accessTokenRet) {
        resolve(accessTokenRet)
      } else {
        const credentialStr = 'client_id=' + this.global.API_AUTH_CFG.client_id +
          '&client_secret=' + this.global.API_AUTH_CFG.client_secret +
          '&grant_type=client_credentials'
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' as const }
        this.httpClient.post(this.global.API_AUTH_CFG.url, credentialStr, { headers })
        .subscribe((jsonBearer: any) => {
          const expiresDateTime = new Date();
          if(jsonBearer.expires_in) {
            expiresDateTime.setSeconds(expiresDateTime.getSeconds() + jsonBearer.expires_in)
          }
          this.global.setProperty('bearerToken', jsonBearer.access_token)
          this.global.setProperty('bearerExpiresAt', expiresDateTime.toISOString())
          resolve(jsonBearer.access_token)
        }, error => {
          this.global.setProperty('bearerInfo', '')
          reject(error)
        })

      }

    })
  }

}
