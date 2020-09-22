export class Stock {
    constructor(
        public idEmp: number,
        public idEst: number,
        public codRepErp: string,
        public codCliErp: string,
        public codProErp: string,
        public dataEstoque: string,
        public unidade: string,
        public qtde: number,
        public dataLeitEst: string,
        public bloqueado: string,
        public motivoBloq: string,
        public obs: string
    ) { }
}
