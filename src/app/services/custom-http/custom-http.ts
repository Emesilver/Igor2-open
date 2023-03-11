import { ToastProvider } from './../toast/toast';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlHelperProvider } from '../url-helper/url-helper';
import _ from 'lodash';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { Company } from 'src/app/models/company';

interface OAuth2Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}
@Injectable({
  providedIn: 'root',
})
export class CustomHttpProvider {
  constructor(
    private httpClient: HttpClient,
    private global: AppState,
    private urlHelperProvider: UrlHelperProvider,
    private toastProvider: ToastProvider,
    private customStorageProvider: CustomStorageProvider
  ) {}

  async getAccessCompanies(docOrEmail: string): Promise<Company[] | undefined> {
    const endPoint = `${this.global.API_ACESSOS_V3}/${docOrEmail}`;
    try {
      const companies = (await this.getObjURL(endPoint)) as Company[];
      return companies;
    } catch (error) {
      this.toastProvider.show(
        'Não foi possível ler os acessos agora. Preciso de internet!'
      );
    }
    return undefined;
  }

  async createOperator(cpf: string, email: string) {
    const endPoint = this.global.API_URL + '/operadores';
    const obj = {
      cpf,
      email,
    };
    return await this.postObjURL(obj, endPoint);
  }

  async getTotalLoadByEmp(
    company: Company,
    model: string,
    readRemote: boolean
  ): Promise<any[]> {
    if (readRemote) {
      const endPoint = await this.urlHelperProvider.getURL(
        company.idEmp,
        company.codRepErp,
        model,
        'GET',
        '/T/0'
      );
      return this.getObjURL(endPoint);
    }
    return [];
  }

  async getTotalLoadByCharge(
    company: Company,
    model: string,
    ultCarga: number
  ): Promise<any[]> {
    const endPoint = await this.urlHelperProvider.getURL(
      company.idEmp,
      company.codRepErp,
      model,
      'GET',
      '/T/' + ultCarga
    );
    return this.getObjURL(endPoint);
  }

  async getPartialLoad(
    company: Company,
    model: string,
    ultCarga: number
  ): Promise<any[] | undefined> {
    const endPoint = await this.urlHelperProvider.getURL(
      company.idEmp,
      company.codRepErp,
      model,
      'GET',
      '/P/' + ultCarga
    );
    return this.getObjURL(endPoint);
  }

  private getObjURL(url: string): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.getTokenBearer().then((tokenBearer) => {
        const headers = {
          'Content-Type': 'application/json' as const,
          authorization: 'Bearer ' + tokenBearer,
        };
        this.httpClient.get<Array<any>>(url, { headers }).subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  async getTypedObjURL<T>(url: string): Promise<T[]> {
    const tokenBearer = await this.getTokenBearer();
    const headers = {
      'Content-Type': 'application/json' as const,
      authorization: `Bearer ${tokenBearer}`,
    };
    return this.httpClient.get<T[]>(url, { headers }).toPromise();
  }

  // Remover no futuro (pode ser substituida por customStorageProvider.getLocal)
  async getLocal<T>(collection: string): Promise<T[]> {
    return this.customStorageProvider.getLocal(collection);
  }

  // private async saveManyLocal(collection: string, data: any[]): Promise<any[]> {
  //   return new Promise((resolve) => {
  //     this.customStorageProvider
  //       .getLocal(collection)
  //       .then((localData: Array<any>) => {
  //         if (!localData) {
  //           localData = [];
  //         }

  //         const existsData: _.List<any> | undefined = [];

  //         data.forEach((element) => {
  //           existsData.push(localData.find((x) => x.uid === element.uid));
  //         });

  //         localData = _.pullAllBy(localData, existsData, 'uid');

  //         data = _.unionBy(localData, data, 'uid');

  //         this.customStorageProvider
  //           .saveLocal(collection, data)
  //           .then((savedData) => {
  //             resolve(savedData);
  //           });
  //       });
  //   });
  // }

  async postObj(
    idEmp: string,
    codRepErp: string,
    model: string,
    obj: any
  ): Promise<any> {
    const endPoint = await this.urlHelperProvider.getURL(
      idEmp,
      codRepErp,
      model,
      'POST',
      ''
    );
    return await this.postObjURL(obj, endPoint);
  }

  private postObjURL(obj: any, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTokenBearer().then((tokenBearer) => {
        const headers = {
          'Content-Type': 'application/json' as const,
          authorization: 'Bearer ' + tokenBearer,
        };
        this.httpClient.post(url, JSON.stringify(obj), { headers }).subscribe(
          async (data) => {
            resolve(data);
          },
          (error) => {
            if (error.status === 401) {
              this.global.setProperty(Properties.BEARER_INFO, '');
            }
            reject(error);
          }
        );
      });
    });
  }

  private async getTokenBearer(): Promise<string> {
    const bearerToken = this.global.getProperty(
      Properties.BEARER_TOKEN
    ) as string;
    if (bearerToken) {
      const bearerExpiresAt = this.global.getProperty(
        Properties.BEARER_EXPIRES_AT
      ) as string;
      if (bearerExpiresAt) {
        const dateTimeNow = new Date();
        if (bearerExpiresAt > dateTimeNow.toISOString()) {
          return bearerToken;
        }
      } else {
        return bearerToken;
      }
    }
    this.global.setProperty(Properties.BEARER_INFO, '');

    const credentialStr =
      'client_id=' +
      this.global.API_AUTH_CFG.client_id +
      '&client_secret=' +
      this.global.API_AUTH_CFG.client_secret +
      '&grant_type=client_credentials';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded' as const,
    };
    const endPoint = await this.urlHelperProvider.getURL(
      '',
      '',
      ModelNames.token,
      'POST',
      ''
    );
    const jsonBearer = (await this.httpClient
      .post(endPoint, credentialStr, { headers })
      .toPromise()) as OAuth2Token;
    const expiresDateTime = new Date();
    if (jsonBearer.expires_in) {
      expiresDateTime.setSeconds(
        expiresDateTime.getSeconds() + jsonBearer.expires_in
      );
    }
    this.global.setProperty(Properties.BEARER_TOKEN, jsonBearer.access_token);
    this.global.setProperty(
      Properties.BEARER_EXPIRES_AT,
      expiresDateTime.toISOString()
    );
    return jsonBearer.access_token;
  }
}
