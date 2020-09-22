export class Discount {
    constructor(
        public idEmp: number,
        public idDes: number,
        public codRepErp: string,
        public codCliErp: string,
        public codProErp: string,
        public vigenciaInicial: string,
        public vigenciaFinal: string,
        public qtdeMin: number,
        public qtdeMax: number,
        public totalMin: number,
        public totalMax: number,
        public descontoMin: number,
        public descontoMax: number,
        public tipoDesconto: string,
        public descontoPadrao: string,
        public obs: string,
    ) { }
}
