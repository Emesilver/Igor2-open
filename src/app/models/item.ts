export class Item {
    constructor(
        public idEmp: number,
        public idPro: number,
        public codRepErp: string,
        public codCliErp: string,
        public codProErp: string,
        public descricao: string,
        public unidade: string,
        public obs: string,
        public total: number,
        public peso: number,
    ) { }
}
