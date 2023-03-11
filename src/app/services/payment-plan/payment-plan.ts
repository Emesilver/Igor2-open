import { PaymentPlan } from './../../models/payment-plan';
import { Injectable } from '@angular/core';
import { AppState, ModelNames, Properties } from 'src/app/app.global';
import { CustomStorageProvider } from '../custom-storage/custom-storage';

@Injectable({
  providedIn: 'root',
})
export class PaymentPlanProvider {
  constructor(
    private global: AppState,
    private customStorage: CustomStorageProvider
  ) {}

  async getPaymentPlan(id: string): Promise<PaymentPlan> {
    const companyId = this.global.getProperty(Properties.ID_EMP);
    const paymentPlans: PaymentPlan[] =
      await this.customStorage.getLocal<PaymentPlan>(
        ModelNames.plano + companyId
      );
    let paymentPlan: any = paymentPlans.find((x) => x.codPlaErp === id);
    paymentPlan = paymentPlan ? paymentPlan : { codPlaErp: 0 };
    return paymentPlan;
  }

  async getByPriority(codCliErp: string) {
    const idEmp = this.global.getProperty(Properties.ID_EMP);
    const codRepErp = this.global.getProperty(Properties.COD_REP_ERP);
    const paymentPlans: PaymentPlan[] =
      await this.customStorage.getLocal<PaymentPlan>(ModelNames.plano + idEmp);
    if (paymentPlans) {
      return paymentPlans.filter(
        (p) =>
          (p.codCliErp === codCliErp && p.codRepErp === codRepErp) ||
          (p.codCliErp === '' && p.codRepErp === '') ||
          (p.codCliErp === '' && p.codRepErp === codRepErp) ||
          (p.codCliErp === codCliErp && p.codRepErp === '')
      );
    }
    return [];
  }
}
