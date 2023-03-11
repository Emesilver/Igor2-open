import { UtilProvider } from './../util/util';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Customer } from '../../models/customer';
import _ from 'lodash';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import * as moment from 'moment';
import { CustomerLimit } from 'src/app/customer-limit/customer-limit.page';

@Injectable({
  providedIn: 'root',
})
export class CustomerProvider {
  private draft = 'draftCustomer';

  constructor(
    private global: AppState,
    private customHttpProvider: CustomHttpProvider,
    private customStorageProvider: CustomStorageProvider,
    private utilProvider: UtilProvider
  ) {}

  async getLocalCustomers(): Promise<Customer[]> {
    return this.customStorageProvider.getLocal<Customer>(
      ModelNames.cliente + this.global.getProperty(Properties.ID_EMP)
    );
  }

  async getByIdLocal(id: string): Promise<Customer | undefined> {
    const customers: Array<Customer> =
      await this.customStorageProvider.getLocal<Customer>(
        ModelNames.cliente + this.global.getProperty(Properties.ID_EMP)
      );
    return customers.find((customer) => customer.codCliErp === id);
  }

  async getDraftLocalCustomers(): Promise<Customer[]> {
    return this.customStorageProvider.getLocal<Customer>(
      this.draft + this.global.getProperty(Properties.ID_EMP)
    );
  }

  async saveDraft(customer: Customer) {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const draftCustomers = (await this.getDraftLocalCustomers()) || [];
    if (customer.cliGuid) {
      // UPDATE
      _.remove(
        draftCustomers,
        (el: Customer) => el.cliGuid === customer.cliGuid
      );
    } else {
      // INSERT
      customer.cliGuid = this.utilProvider.generateUUID();
    }
    draftCustomers.unshift(customer);
    this.customStorageProvider.saveLocal(this.draft + idEmp, draftCustomers);
    return customer;
  }

  async removeDraft(cliGuid: string) {
    const drafts = await this.getDraftLocalCustomers();
    drafts.splice(
      drafts.findIndex((x) => x.cliGuid === cliGuid),
      1
    );
    await this.customStorageProvider.saveLocal(
      this.draft + this.global.getProperty(Properties.ID_EMP),
      drafts
    );
  }

  async saveCustomer(customer: Customer) {
    const newCustomer = new Customer(
      customer.idEmp,
      customer.idCli,
      customer.codRepErp,
      customer.codCliErp,
      customer.cpfCnpj,
      customer.fantasia,
      customer.razao,
      customer.contato1,
      customer.foneContato1,
      customer.cep,
      customer.uf,
      customer.cidade,
      customer.endereco,
      customer.bairro,
      customer.emailCli,
      customer.emailFin,
      customer.emailFis,
      customer.obs,
      customer.insEstadual,
      '',
      '',
      '',
      '',
      '',
      customer.foneCli,
      0,
      moment().format('YYYY-MM-DD'),
      '',
      customer.rede,
      '',
      '',
      customer.cliGuid || this.utilProvider.generateUUID()
    );
    const idEmp = this.global.getProperty(Properties.ID_EMP) as string;
    const codRepErp = this.global.getProperty(Properties.COD_REP_ERP) as string;
    await this.customHttpProvider.postObj(
      idEmp,
      codRepErp,
      ModelNames.cliente,
      newCustomer
    );
    if (customer.cliGuid) {
      this.removeDraft(customer.cliGuid);
    }
  }

  async saveLimitUpdate(customerLimit: CustomerLimit) {
    const newLimit = this.emptyCustomer();
    newLimit.codCliErp = customerLimit.codCliErp;
    newLimit.obs = '<<ALTERAR_LIMITE_CREDITO>>';
    newLimit.limiteTotal = customerLimit.limiteTotal;
    newLimit.dataCadastro = moment().format('YYYY-MM-DD');
    newLimit.cliGuid = this.utilProvider.generateUUID();

    await this.customHttpProvider.postObj(
      `${newLimit.idEmp}`,
      newLimit.codRepErp,
      ModelNames.cliente,
      newLimit
    );
  }

  emptyCustomer(): Customer {
    return {
      idEmp: this.global.getProperty(Properties.ID_EMP) as number,
      idCli: 0,
      codRepErp: this.global.getProperty(Properties.COD_REP_ERP) as string,
      codCliErp: '',
      cpfCnpj: '',
      fantasia: '',
      razao: '',
      contato1: '',
      foneContato1: '',
      cep: '',
      uf: '',
      cidade: '',
      endereco: '',
      bairro: '',
      emailCli: '',
      emailFin: '',
      emailFis: '',
      obs: '',
      insEstadual: '',
      grupo: '',
      emailContato1: '',
      contato2: '',
      foneContato2: '',
      emailContato2: '',
      foneCli: '',
      limiteTotal: 0,
      dataCadastro: '',
      dataPriCompra: '',
      rede: '',
      codTabErp: '',
      codPlaErpPadrao: '',
    };
  }
}
