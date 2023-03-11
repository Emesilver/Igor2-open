import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { User } from 'src/app/models/user';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class UrlHelperProvider {
  constructor(
    public global: AppState,
    private customStorage: CustomStorageProvider
  ) {}

  async getURL(
    idEmp: string,
    codRepErp: string,
    model: string,
    type: string,
    sufixo: string
  ) {
    const user = (await this.customStorage.getRawData('user')) as User;
    const currentCompany = user.currentCompany;

    let urlRet = '';
    const idOper = this.global.getProperty(Properties.ID_OPER);
    if (type === 'GET') {
      const baseUrlRead = currentCompany?.apiLeitura
        ? currentCompany.apiLeitura
        : this.global.API_URL;
      switch (model) {
        case ModelNames.tipo_entrega:
          urlRet = `${baseUrlRead}/tipos-entrega/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`;
          break;
        case ModelNames.principais_produtos:
          urlRet = `${baseUrlRead}/${ModelNames.produto}/carga/${idEmp}/${codRepErp}/principais`;
          break;
        case ModelNames.tipo_entrega_capa:
          urlRet = `${baseUrlRead}/tipos-entrega/capa/${idEmp}/${codRepErp}`;
          break;
        case ModelNames.carga:
          urlRet = `${baseUrlRead}/carga/${idOper}/${idEmp}`;
          break;
        default:
          urlRet = `${baseUrlRead}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`;
          break;
      }
    } else if (type === 'POST') {
      const baseUrlSave = currentCompany?.apiEscrita
        ? currentCompany.apiEscrita
        : this.global.API_URL;
      switch (model) {
        case ModelNames.carga:
          // urlRet = `${this.global.API_URL}/carga/${idOper}/${idEmp}`
          // Temporario - forcar post carga de todas as empresas na v3
          urlRet = `https://v3-dot-silico-java.uc.r.appspot.com/carga/${idOper}/${idEmp}`;
          break;
        case ModelNames.token:
          urlRet = `${baseUrlSave}/oauth2/token`;
          break;
        case ModelNames.pedido:
          urlRet = `${baseUrlSave}/disp/${ModelNames.pedido}`;
          break;
        case ModelNames.cliente:
          urlRet = `${baseUrlSave}/disp/${ModelNames.cliente}`;
          break;
      }
    }
    if (!urlRet) {
      console.error('getURL: retorno vazio para o model=' + model);
    }
    return urlRet;
  }
}
