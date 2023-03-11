import { OrderItem } from './order-item';

export enum OrderHandleType {
  new,
  edit,
  view,
}

export class Order {
  constructor(
    public idEmp: string,
    public idPed: number,
    public codPedErp: string,
    public codPedGuid: string,
    public statusPed: string,
    public notaErp: string,
    public serieErp: string,
    public codRepErp: string,
    public codCliErp: string,
    public desCli: string,
    public dataPed: string,
    public idPlano: number,
    public codPlaErp: string,
    public desPlaErp: string,
    public codFrmErp: string,
    public desFrmErp: string,
    public pedCli: string,
    public dataEnt: string,
    public qtdItens: number,
    public qtdTotal: number,
    public desctoItensPerc: number,
    public desctoItensVal: number,
    public totalItens: number,
    public desctoPedidoPerc: number,
    public desctoPedidoVal: number,
    public totalPedido: number,
    public obs: string,
    public itens: Array<OrderItem>,
    public unsync: boolean,
    public codTabErp: string, // tabela de precos do cliente
    public codEntErp: string,
    public freteVal: number,
    public livre1: string
  ) {
    if (this.unsync === undefined || this.unsync === null) {
      this.unsync = true;
    }
  }
}
