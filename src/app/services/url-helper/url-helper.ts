import { Injectable } from '@angular/core';
import { AppState } from 'src/app/app.global';

@Injectable({
  providedIn: 'root'
})
export class UrlHelperProvider {

  constructor(
    public global: AppState,
  ) {}

  getURL(idEmp: string, codRepErp: string, model: string, type: string, sufixo: string) {
    let urlRet = ''
    const idOper = this.global.getProperty('idOper')
    if (type==='GET') {
      switch (model) {
        case this.global.modelNames.par_venda:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.produto:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.preco:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.cliente:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.pedido:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.desconto:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.plano:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.saldo:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.estoque:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.comissao:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.tipo_entrega:
          urlRet = `${this.global.API_URL}/tipos-entrega/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break
        case this.global.modelNames.operacao:
          urlRet = `${this.global.API_URL}/${model}/carga/${idEmp}/${codRepErp}/${idOper}${sufixo}`
        break

        case this.global.modelNames.principais_produtos:
          urlRet = `${this.global.API_URL}/${this.global.modelNames.produto}/carga/${idEmp}/${codRepErp}/principais`
        break
        case this.global.modelNames.tipo_entrega_capa:
          urlRet = `${this.global.API_URL}/tipos-entrega/capa/${idEmp}/${codRepErp}`
        break

        case this.global.modelNames.carga:
          urlRet = `${this.global.API_URL}/carga/${idOper}/${idEmp}`
        break
      }
    } else if (type==='POST') {
      switch (model) {
        case this.global.modelNames.carga:
          urlRet = `${this.global.API_URL}/carga/${idOper}/${idEmp}`
        break
        case this.global.modelNames.token:
          urlRet = `${this.global.API_URL}/token`
        break
        case this.global.modelNames.pedido:
          urlRet = `${this.global.API_URL}/disp/${this.global.modelNames.pedido}`
        break
        case this.global.modelNames.cliente:
          urlRet = `${this.global.API_URL}/disp/${this.global.modelNames.cliente}`
        break
      }
    }
    if (!urlRet) {
      console.error('getURL: retorno vazio para o model=' + model)
    }
    return urlRet
  }

}
