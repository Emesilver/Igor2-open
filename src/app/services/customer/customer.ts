import { UtilProvider } from './../util/util';
import { LogProvider } from './../log/log';
import { ToastProvider } from './../toast/toast';
import { CustomStorageProvider } from '../custom-storage/custom-storage';
import { Storage } from '@ionic/storage';
import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { Customer } from '../../models/customer';
import _ from 'lodash';
import { AppState } from 'src/app/app.global';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CustomerProvider {
  private draft = 'draftCustomer';

  constructor(
    public global: AppState,
    public customHttpProvider: CustomHttpProvider,
    public storage: Storage,
    public customStorageProvider: CustomStorageProvider,
    public toastProvider: ToastProvider,
    public logProvider: LogProvider,
    public utilProvider: UtilProvider,
  ) { }

  getLocalList(): Promise<Array<any>> {
    return this.customStorageProvider.getLocal(this.global.modelNames.cliente + this.global.getProperty('idEmp'))
  }

  getByIdLocal(id, companyId?): Promise<Customer> {
    return new Promise(async resolve => {
      companyId = this.global.getProperty('idEmp');
      const customers: Array<Customer> = await this.storage.get(this.global.modelNames.cliente + companyId);
      resolve(customers.find(x => x.codCliErp === id));
    });
  }

  getAllDraftLocal(): Promise<Array<any>> {
    return new Promise(async (resolve) => {
      resolve(await this.storage.get(this.draft + this.global.getProperty('idEmp')));
    });
  }

  saveDraft(customer: Customer) {
    return new Promise(async (resolve, reject) => {
      const idEmp = this.global.getProperty('idEmp');
      const customers: Array<any> = (await this.getAllDraftLocal()) || [];
      if (customer.cliGuid) {
        // UPDATE

        const oldcustomer = customers.find((el) => {
          return el.cliGuid === customer.cliGuid;
        });

        if (oldcustomer) {
          _.remove(customers, (el) => {
            return el.cliGuid === customer.cliGuid;
          });

          customers.unshift(customer);
          this.storage.set(this.draft + idEmp, customers);
          resolve(customer);

        } else {
          this.logProvider
            .save(`Erro ao encontrar pedido pelo UUID na edição do passo geral. UUID: ${customer.cliGuid}`);
          reject();
        }
      } else {
        // INSERT
        customer.cliGuid = this.utilProvider.generateUUID();

        customers.unshift(customer);
        this.storage.set(this.draft + idEmp, customers);
        resolve(customer);
      }
    });
  }

  async removeDraft(cliGuid) {
    const drafts = await this.getAllDraftLocal();
    drafts.splice(drafts.findIndex(x => x.cliGuid === cliGuid), 1);
    await this.storage.set(this.draft + this.global.getProperty('idEmp'), drafts);
  }

  saveCustomer(customer: Customer) {
    return new Promise(async (resolve, reject) => {
      const c = new Customer(
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
        '',
        '',
        '',
        '',
        '',
        '',
        customer.foneCli,
        0,
        moment().format('YYYY-MM-DD'),
        customer.rede,
        '',
        '',
        '',
        customer.cliGuid || this.utilProvider.generateUUID()
      );
      const idEmp = this.global.getProperty('idEmp')
      const codRepErp = this.global.getProperty('codRepErp')
      this.customHttpProvider.postObj(idEmp, codRepErp, this.global.modelNames.cliente, c)
      .then((data) => {
        this.removeDraft(customer.cliGuid);
        resolve(data);
      })
      .catch((error) => {
        this.toastProvider.show('Erro ao enviar novo cliente. Cliente foi salvo como rascunho, tente novamente mais tarde.');
        this.toastProvider.show(error.message);
        reject();
      })
    });
  }

  saveLimitUpdate(customer) {
    return new Promise(async (resolve, reject) => {
      const c = new Customer(
        customer.idEmp,
        0,
        customer.codRepErp,
        customer.codCliErp,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '<<ALTERAR_LIMITE_CREDITO>>',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        customer.limiteTotal,
        moment().format('YYYY-MM-DD'),
        '',
        '',
        '',
        customer.cliGuid || this.utilProvider.generateUUID()
      );

      const idEmp = this.global.getProperty('idEmp')
      const codRepErp = this.global.getProperty('codRepErp')
      this.customHttpProvider.postObj(idEmp, codRepErp, this.global.modelNames.cliente, c)
      .then((data) => {
        resolve(data)
      })
      .catch((error) => {
        this.toastProvider.show('Erro ao solicitar aumento. Tente novamente mais tarde.');
        reject(error);
      })
    });
  }

  getAllNotDraft() {
    return new Promise(async resolve => {
      resolve(await this.storage.get(this.global.modelNames.cliente + this.global.getProperty('idEmp')));
    });
  }
}
