export class Title {
  constructor(
    public idEmp: number,
    public idTitulo: number,
    public codRepErp: string,
    public codCliErp: string,
    public referencia: string,
    public dataVencto: string,
    public valorOriginal: number,
    public situacao: string, //PAG-Pago, PEN-Pendente
    public obs: string
  ) {}
}
