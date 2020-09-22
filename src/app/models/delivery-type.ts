export class DeliveryType {
    constructor(
        public idEmp: number,
        public idEnt: number,
        public codRepErp: string,
        public codCliErp: string,
        public codEntErp: string,
        public codProErp: string,
        public desEnt: string,
        public unidadeTe: string,
        public vigenciaInicial: string,
        public vigenciaFinal: string,
        public freteMin: number,
        public freteMax: number,
        public fretePadrao: number,
        public obs: string,
    ) { }
}
