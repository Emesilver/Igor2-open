export class Balance {
    constructor(
        public idEmp: number,
        public idSld: number,
        public codRepErp: string,
        public codCliErp: string,
        public credito: number,
        public bloqueado: string,
        public motivoBloq: string,
        public obs: string
    ) { }
}
