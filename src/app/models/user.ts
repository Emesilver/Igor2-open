import { Company } from './company';

export class User {
  constructor(
    public uuidDisp: string,
    public cpf: string,
    public email: string,
    public companies: Company[],
    public currentCompany?: Company
  ) {}
}
