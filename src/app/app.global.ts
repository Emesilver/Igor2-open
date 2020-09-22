import { Injectable } from '@angular/core';

// Configuracao para acesso ao Google RealTime Database (chat)
export const firebaseConfig = {
  apiKey: 'seu-apiKey',
  authDomain: 'seu-authDomain',
  databaseURL: 'https://sua-databaseURL',
  projectId: 'seu-projectId',
  storageBucket: 'seu-storageBucket',
  messagingSenderId: 'seu-messagingSenderId'
};

@Injectable({
  providedIn: 'root'
})
export class AppState {
  // Inicializo com idOper = 0 para saber que ainda nao foi definido nenhum operador
  _state = {idOper: 0};

  // already return a clone of the current state
  get state() {
    return this._state = this.clone(this._state);
  }

  // never allow mutation
  set state(value) {
    throw new Error('do not mutate the `.state` directly');
  }

  getProperty(prop?: any) {
    // use our state getter for the clone
    const state = this.state;
    return state.hasOwnProperty(prop) ? state[prop] : state;
  }

  // Retorna null se a propriedade nao existir (diferente da getProperty que sempre retorna algo)
  getPropertyOrNull(prop: string) {
    return this._state.hasOwnProperty(prop) ? this._state[prop] : null;
  }

  setProperty(prop: string, value: any) {
    // internally mutate our state
    return this._state[prop] = value;
  }

  get API_URL() {
    // Caso nao use o midware da silico, substituir pelo endereco REST dos microservicos do ERP
    return 'https://v2-dot-silico-java.appspot.com/v2'
  }

  get API_AUTH_CFG() {
    return {
      url: 'https://v2-dot-silico-java.appspot.com/v2/oauth2/token',
      client_id: 'seu-client_id-silico',
      client_secret: 'seu-client_secret-silico'
    }
  }

  private clone(object) {
    // simple object clone
    return JSON.parse(JSON.stringify(object));
  }

  public get modelNames() {
    return {
      // Nomes de modelos que sao utilizados na carga parcial
      // Nestas cargas a propriedade precisa coincidir com o nome da tabela na carga parcial
      par_venda: 'parVendas',
      produto: 'produtos',
      cliente: 'clientes',
      pedido: 'pedidos',
      desconto: 'descontos',
      plano: 'planos',
      preco: 'precos',
      saldo: 'saldos',
      estoque: 'estoques',
      comissao: 'comissoes',
      tipo_entrega: 'tiposEntrega',
      operacao: 'operacoes',
      carga: 'carga',
      token: 'token',
      // Nomes de modelos que nao sao utilizados na carga parcial (pode ser definido qualquer nome)
      principais_produtos: 'principais_produtos',
      tipo_entrega_capa: 'tiposEntregaCapa',
    };
  }

  public modelNameByTableName(tableName: string) {
    let modelNameRet = ''
    switch (tableName) {
      case 'par_venda': modelNameRet = 'parVendas'; break
      case 'produto': modelNameRet = 'produtos'; break
      case 'principais_produtos': modelNameRet = 'principais_produtos'; break
      case 'cliente': modelNameRet = 'clientes'; break
      case 'pedido': modelNameRet = 'pedidos'; break
      case 'desconto': modelNameRet = 'descontos'; break
      case 'plano': modelNameRet = 'planos'; break
      case 'preco': modelNameRet = 'precos'; break
      case 'saldo': modelNameRet = 'saldos'; break
      case 'estoque': modelNameRet = 'estoques'; break
      case 'comissao': modelNameRet = 'comissoes'; break
      case 'tipo_entrega': modelNameRet = 'tiposEntrega'; break
      case 'tipo_entrega_capa': modelNameRet = 'tiposEntregaCapa'; break
      case 'operacao': modelNameRet = 'operacoes'; break
    }
    return modelNameRet
  }

  public isArray(val: any): val is any[] { return Array.isArray(val); }

  public getFieldIdName(modelName: string) {
    const modelNames = this.modelNames;
    let fieldIdName: any = [];
    switch (modelName) {
      case modelNames.saldo:
      case modelNames.cliente:
        fieldIdName = ['codCliErp'];
        break;
      case modelNames.desconto:
      case modelNames.preco:
      case modelNames.produto:
        fieldIdName = ['codCliErp', 'codProErp'];
        break;
      case modelNames.estoque:
        fieldIdName = ['codCliErp', 'codProErp', 'dataEstoque'];
        break;
      case modelNames.pedido:
        fieldIdName = ['codPedGuid'];
        break;
      case modelNames.plano:
        fieldIdName = ['codPlaErp', 'codCliErp', 'codProErp', 'codFrmErp'];
        break;
      default:
        break;
    }
    return fieldIdName;
  }
}
