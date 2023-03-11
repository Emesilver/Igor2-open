export class Price {
  constructor(
    public idEmp: number,
    public idPre: number,
    public codTabErp: string,
    public codRepErp: string,
    public codCliErp: string,
    public codProErp: string,
    public vigenciaInicial: string,
    public vigenciaFinal: string,
    public qtdeMin: number,
    public qtdeMax: number,
    public totalMin: number,
    public totalMax: number,
    public precoMin: number,
    public precoMax: number,
    public tipoPreco: string,
    public precoPadrao: number,
    public unidadeFat: string,
    public fatorFat: number,
    public qtdeMultiplo: number,
    public obs: string
  ) {}
}
