import { Company } from './company';

export class User {
    constructor(
        public uuidDisp: string,
        public cpf: string,
        public email: string,
//        public tokenFCM: string,
        public currentCompany?: Company,
        public companies?: Array<Company>
    ) { }
}
