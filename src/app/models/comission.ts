export class Comission {
  constructor(
    public idEmp: number,
    public idCom: number,
    public codRepErp: string,
    public codCliErp: string,
    public codProErp: string,
    public vigenciaInicial: string,
    public vigenciaFinal: string,
    public comissaoMin: number,
    public comissaoMax: number,
    public comissaoPadrao: number,
    public obs: string
  ) {}
}
