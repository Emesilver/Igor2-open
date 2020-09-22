export class PaymentPlan {
    constructor(
        public idEmp: number,
        public idPlano: number,
        public codRepErp: string,
        public codCliErp: string,
        public codProErp: string,
        public codPlaErp: string,
        public codFrmErp: string,
        public desPlano: string,
        public desForma: string,
        public obs: string,
        public fator: number
    ) { }
}
