import { Storage } from '@ionic/storage';
import { PaymentPlan } from './../../models/payment-plan';
import { CustomHttpProvider } from './../custom-http/custom-http';
import { Injectable } from '@angular/core';
import { AppState } from 'src/app/app.global';

@Injectable({
  providedIn: 'root'
})
export class PaymentPlanProvider {

  constructor(
    public global: AppState,
    public storage: Storage,
    public customHttpProvider: CustomHttpProvider,
  ) { }

  getByIdLocal(id): Promise<PaymentPlan> {
    return new Promise(async resolve => {
      const companyId = this.global.getProperty('idEmp');
      const paymentPlans: Array<PaymentPlan> = await this.storage.get(this.global.modelNames.plano + companyId);
      let paymentPlan: any = paymentPlans.find(x => x.codPlaErp === id);
      paymentPlan = paymentPlan ? paymentPlan : { codPlaErp: 0 };
      resolve(paymentPlan);
    });
  }

  async getByPriority(codCliErp: string, codRepErp: string) {
    return new Promise<Array<PaymentPlan>>(async (resolve) => {
      const idEmp = this.global.getProperty('idEmp');
      const paymentPlans: Array<PaymentPlan> =
        await this.storage.get(this.global.modelNames.plano + idEmp);
      let paymentPlan = [];
      if (paymentPlans) {
        paymentPlan = paymentPlans.filter(p =>
          ((p.codCliErp === codCliErp && p.codRepErp === codRepErp)
            ||
            (p.codCliErp === '' && p.codRepErp === '')
            ||
            (p.codCliErp === '' && p.codRepErp === codRepErp)
            ||
            (p.codCliErp === codCliErp && p.codRepErp === '')
          )
        );
      }

      resolve(paymentPlan);
    });
  }
}
