import { Injectable } from '@angular/core';

export enum Properties {
  ID_OPER = 'id-oper',
  ID_EMP = 'id-emp',
  COD_REP_ERP = 'cod-rep-erp',
  BEARER_INFO = 'bearer-info',
  BEARER_TOKEN = 'bearer-token',
  BEARER_EXPIRES_AT = 'bearer-expires-at',
}

// Nomes de modelos que sao utilizados na carga parcial
// Nestas cargas a propriedade precisa coincidir com o nome da tabela na carga parcial
export enum ModelNames {
  par_venda = 'parVendas',
  produto = 'produtos',
  cliente = 'clientes',
  pedido = 'pedidos',
  desconto = 'descontos',
  plano = 'planos',
  preco = 'precos',
  saldo = 'saldos',
  estoque = 'estoques',
  comissao = 'comissoes',
  tipo_entrega = 'tiposEntrega',
  operacao = 'operacoes',
  titulo = 'titulos',
  carga = 'carga',
  token = 'token',
  // Nomes de modelos que nao sao utilizados na carga parcial (pode ser definido qualquer nome)
  principais_produtos = 'principais_produtos',
  tipo_entrega_capa = 'tiposEntregaCapa',
}
@Injectable({
  providedIn: 'root',
})
export class AppState {
  _state: Record<string, string | number | boolean> = {};

  constructor() {
    // Inicializo com idOper = 0 para saber que ainda nao foi definido nenhum operador
    this.setProperty(Properties.ID_OPER, 0);
  }

  // already return a clone of the current state
  get state() {
    return (this._state = this.clone(this._state));
  }

  // never allow mutation
  set state(value) {
    throw new Error('do not mutate the `.state` directly');
  }
  getProperty(prop: Properties): string | number | boolean {
    return this.state[prop];
    // use our state getter for the clone
    // const state = this.state;
    // return prop in state ? state[prop] : state;
  }

  // Retorna null se a propriedade nao existir (diferente da getProperty que sempre retorna algo)
  // getPropertyOrNull(prop: Properties) {
  //   return prop in this._state ? this._state[prop] : null;
  // }

  setProperty(prop: Properties, value: string | number) {
    // internally mutate our state
    this._state[prop] = value;
  }

  get API_URL() {
    // let idEmp = this.get('idEmp');
    // idEmp = parseInt(idEmp, 10);
    // if (Number.isInteger(idEmp) && idEmp < 10) {
    // return 'https://develop-dot-silico-java.appspot.com/v1';
    // }
    //    return 'https://silico-java.appspot.com/v1';
    //    return 'https://v2-dot-silico-java.appspot.com/v2'
    return 'https://v3-dot-silico-java.uc.r.appspot.com';
  }

  get API_AUTH_CFG() {
    return {
      // enquanto estiver fazendo post na v2 tem que pegar token nela.
      //      url: 'https://v2-dot-silico-java.appspot.com/v2/oauth2/token',
      // url: 'https://v3-dot-silico-java.uc.r.appspot.com/oauth2/token',
      client_id: '6bb79fa8-610c-4d1c-932e-1d723ec83a3f',
      client_secret:
        'e1216de5437bcc4439511ec4c307daf4a7d8e5ff43a282c6699c1369af356f88',
    };
  }

  // Funcao temporaria (ateh migracao completa para V3)
  get API_ACESSOS_V3() {
    return 'https://v3-dot-silico-java.uc.r.appspot.com/acessos';
  }

  private clone(object: Record<string, unknown>) {
    // simple object clone
    return JSON.parse(JSON.stringify(object));
  }

  public modelNameByTableName(tableName: ModelNames): string {
    return (ModelNames as any)[tableName];
  }

  public isArray(val: any): val is any[] {
    return Array.isArray(val);
  }

  public getModelKeys(modelNames: string) {
    let keys: string[] = [];
    switch (modelNames) {
      case ModelNames.saldo:
      case ModelNames.cliente:
        keys = ['codCliErp'];
        break;
      case ModelNames.preco:
        keys = ['codTabErp', 'codCliErp', 'codProErp'];
        break;
      case ModelNames.desconto:
      case ModelNames.produto:
        keys = ['codCliErp', 'codProErp'];
        break;
      case ModelNames.estoque:
        keys = ['codCliErp', 'codProErp', 'dataEstoque'];
        break;
      case ModelNames.pedido:
        keys = ['codPedGuid'];
        break;
      case ModelNames.plano:
        keys = ['codPlaErp', 'codCliErp', 'codProErp', 'codFrmErp'];
        break;
      default:
        break;
    }
    return keys;
  }
}
