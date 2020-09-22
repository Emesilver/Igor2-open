import { FormatterProvider } from './../services/formatter/formatter';
import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { PaymentPlan } from '../models/payment-plan';
import { Order, OrderHandleType } from '../models/order';
import { ModalController } from '@ionic/angular';
import { PaymentPlanProvider } from '../services/payment-plan/payment-plan';
import { UserProvider } from '../services/user/user';
import { OrderProvider } from '../services/order/order';
import { ToastProvider } from '../services/toast/toast';
import { CustomerProvider } from '../services/customer/customer';
import { BalanceProvider } from '../services/balance/balance';
import { Customer } from '../models/customer';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { SelectCustomerPage } from '../select-customer/select-customer.page';
import { CustomerLimitPage } from '../customer-limit/customer-limit.page';
import { DeliveryType } from '../models/delivery-type';
import { DeliveryTypeProvider } from '../services/delivery-type/delivery-type';

@Component({
  selector: 'app-order-general-form',
  templateUrl: './order-general-form.page.html',
  styleUrls: ['./order-general-form.page.scss'],
})
export class OrderGeneralFormPage implements OnInit {

  user: User;
  paymentPlans: Array<PaymentPlan> = [];
  deliveryTypes: Array<DeliveryType> = [];
  showDeliveryTypes = false;
  submit = false;
  orderWrk: Order; // Pedido em trabalho na tela
  orderHandleType: OrderHandleType; // novo, edicao ou visualizacao
  isView = false;
  title: string;
  isBack = false;

  // Variaveis necessárias para tela (objetos não estão sendo aceitos no html)
  idEmp: number;
  codCliErp: string;
  codRepErp: string;
  desCli: string;
  codPlaErp: string;
  codEntErp: string;
  limiteTotal: string;
  credito: string;
  obs: string;
  paymentPlan: any;
  disabledFreight = true;
  freightAmount = 0;
  deliveryTypeSelected: DeliveryType;
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private paymentPlanProvider: PaymentPlanProvider,
    private userProvider: UserProvider,
    private orderProvider: OrderProvider,
    private toastProvider: ToastProvider,
    private customerProvider: CustomerProvider,
    private balanceProvider: BalanceProvider,
    private deliveryTypeProvider: DeliveryTypeProvider,
    private formatter: FormatterProvider,
  ) {
    let order = null;
    let customer = null;
    if (this.router.getCurrentNavigation().extras.state) {
      this.isView = this.router.getCurrentNavigation().extras.state.isView;
      order = this.router.getCurrentNavigation().extras.state.order;
      customer = this.router.getCurrentNavigation().extras.state.customer;
    }
    if (order) {
      this.title = 'Alterando Pedido';
      this.orderHandleType = OrderHandleType.edit;
      this.orderWrk = order;
    } else {
      this.title = 'Novo Pedido';
      this.orderHandleType = OrderHandleType.new;
    }

    if (this.isView) {
      this.orderHandleType = OrderHandleType.view;
      this.title = 'Visualizando Pedido';
      this.isView = true;
    }
    this.init(customer);
  }

  async init(customer) {
    this.obs = this.orderWrk ? this.orderWrk.obs : '';
    this.codCliErp = this.orderWrk ? this.orderWrk.codCliErp : '';
    this.user = await this.userProvider.getUserLocal();
    if (this.orderHandleType === OrderHandleType.new) {
      this.orderWrk = await this.orderProvider.getNewEmpty(this.user.currentCompany.codRepErp);
      if (customer) {
        this.fillCustomer(customer);
      }
    } else {
      // Necessario usar variavel porque o html nao está mapeando o orderWrk.variaveis
      this.desCli = this.orderWrk.desCli;
      this.paymentPlans = await this.paymentPlanProvider
      .getByPriority(this.orderWrk.codCliErp, this.orderWrk.codRepErp);
      this.codPlaErp = this.orderWrk.codPlaErp;
      await this.loadDeliveryTypes();
      await this.selectFreightAmout();
      this.freightAmount = this.orderWrk.freteVal;
    }
  }

  ngOnInit(): void {
  }

  async fillCustomer(customer: Customer) {
    if (customer) {
      if (customer.codCliErp != null && customer.codCliErp !== '') {
        this.orderWrk.codCliErp = customer.codCliErp;
        this.idEmp = customer.idEmp;
        this.codCliErp = customer.codCliErp;
        this.codRepErp = customer.codRepErp;
        this.orderWrk.codTabErp = customer.codTabErp;
        this.orderWrk.desCli = customer.fantasia;
        this.desCli = this.orderWrk.desCli;
        this.limiteTotal = customer.limiteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        this.credito = '';
        await this.setBalance(customer);
        this.paymentPlans = await this.paymentPlanProvider
          .getByPriority(this.orderWrk.codCliErp, this.orderWrk.codRepErp);
        this.loadDeliveryTypes();
        if (this.paymentPlans.length === 1) {
          this.codPlaErp = this.paymentPlans[0].codPlaErp;
        } else {
          this.codPlaErp = customer.codPlaErpPadrao;
        }
      } else {
        this.toastProvider.show('Cliente bloqueado: Cliente em fase de cadastro.');
      }
    }
  }

  async setBalance(customer) {
    const balance = await this.balanceProvider.getByCustomer(customer);
    if (balance) {
      this.credito = balance.credito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      if (balance.bloqueado === 'S') {
        if (balance.motivoBloq && balance.motivoBloq !== '') {
          this.toastProvider.show('Cliente bloqueado: ' + balance.motivoBloq);
        } else {
          this.toastProvider.show('Cliente bloqueado');
        }
      }
    }
  }

  async selectCustomer() {
    if (this.orderHandleType !== OrderHandleType.view) {
      const modal = await this.modalCtrl.create({
        component: SelectCustomerPage
      });
      modal.present();
      modal.onDidDismiss().then((response) => {
        if (response.data.customer) {
          this.fillCustomer(response.data.customer);
        }
      });
    }
  }

  async requestLimit() {
    // Verifica se está no modo de edicao
    if (this.orderHandleType !== OrderHandleType.view) {
      const customer = {
        idEmp: this.idEmp,
        codCliErp: this.codCliErp,
        codRepErp: this.codRepErp,
        limit: this.limiteTotal,
        credit: this.credito,
        limiteTotal: 0
      };
      const modal = await this.modalCtrl.create({
        component: CustomerLimitPage,
        componentProps: {
          customer
        }
      });
      modal.present();
    }
  }

  orderValid(): boolean {
    if (!this.orderWrk.codCliErp) {
      this.toastProvider.show('Selecione um cliente.');
      return false;
    }
    if (!this.orderWrk.codPlaErp) {
      this.toastProvider.show('Selecione um plano de pagamento.');
      return false;
    }
    if (this.showDeliveryTypes && !this.orderWrk.codEntErp) {
      this.toastProvider.show('Selecione um tipo de entrega.');
      return false;
    }
    if (this.isFreightAmountRequired() && !this.orderWrk.freteVal) {
      this.toastProvider.show('Informe o valor do frete');
      return false;
    }
    return true;
  }

  async next() {
    try {
      let isView = true;
      let isValid = true;
      if (this.orderHandleType !== OrderHandleType.view) {
        // Necessario porque o html nao está mapeando diretamente o objeto orderWrk
        this.orderWrk.codPlaErp = this.codPlaErp;
        this.orderWrk.codEntErp = this.codEntErp;
        this.orderWrk.freteVal = this.freightAmount;
        if (this.orderValid()) {
          await this.orderProvider.saveOrderDraft(this.orderWrk);
          isView = false;
        } else {
          isValid = false;
        }
      }
      if (isValid) {
        const navigationExtras: NavigationExtras = {
          state: {
            isView,
            orderWrk: this.orderWrk,
            orderHandleType: this.orderHandleType
          }
        };
        this.router.navigate(['/order-items-form'], navigationExtras);
      }
    } catch (error) {
      this.toastProvider.show('Erro ao tratar pedido.');
    }
  }

  async repeatByCustomer() {
    if (!this.orderWrk.codCliErp) {
      this.toastProvider.show('Selecione um cliente.');
      return;
    }
    const lastOrder = await this.orderProvider.getLastOrderByCustomer(this.orderWrk.codCliErp);

    this.nextStepRepeat(lastOrder);
  }

  async repeatOrder() {
    const lastOrder = await this.orderProvider.getLastOrder();

    this.nextStepRepeat(lastOrder);
  }

  async nextStepRepeat(lastOrder: Order) {
    if (lastOrder) {
      this.orderWrk = Object.assign(this.orderWrk, lastOrder);
      this.orderWrk.codPedGuid = null;
      this.orderWrk.codPedErp = '';
      this.orderWrk.obs = '';
      this.orderWrk.statusPed = 'RAS'; // rascunho
      this.orderWrk.dataEnt = this.orderProvider.getDueDate();
      this.desCli = this.orderWrk.desCli;
      this.codPlaErp = this.orderWrk.codPlaErp;
      this.paymentPlans = await this.paymentPlanProvider.getByPriority(
        this.orderWrk.codCliErp, this.orderWrk.codRepErp
      );
      await this.setBalance({ codCliErp: this.orderWrk.codCliErp });
      this.limiteTotal = (
        await this.customerProvider.getByIdLocal(this.orderWrk.codCliErp)
      ).limiteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      this.orderProvider.fillItensProps(this.orderWrk);
    } else {
      this.toastProvider.show('Nenhum pedido encontrado.');
    }
  }

  close() {
    if (!this.isView) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/order-list']);
    }
  }

  private async loadDeliveryTypes() {
    this.deliveryTypes = await this.deliveryTypeProvider.getDeliveriesCapa();
    if (this.deliveryTypes) {
      this.deliveryTypes = this.deliveryTypes.filter(dt => {
        return ((dt.codRepErp === this.user.currentCompany.codRepErp) || (dt.codRepErp === '')) &&
          ((dt.codCliErp === this.codCliErp) || (dt.codCliErp === ''));
      });
      if (this.deliveryTypes.length > 0) {
        this.showDeliveryTypes = true;
      }
      if (this.orderWrk.codEntErp) {
        this.codEntErp = this.orderWrk.codEntErp;
      } else if (this.deliveryTypes.length === 1) {
        this.codEntErp = this.deliveryTypes[0].codEntErp;
      }
    }
  }

  /**
   *
   * vai buscar o valor do frete na tabela de tipos de entrega
   * caso nao encontre, ou o valor for igual a zero vai habilitar
   * pro usuario preencher.
   * para FOB, todos os valores irão vir zerados e nao vai habilitar
   * para edição.
   */
  async selectFreightAmout() {
    this.deliveryTypeSelected = await this.deliveryTypeProvider.getByPriority(
      this.codCliErp, '', this.codEntErp
    );
    if (!this.deliveryTypeSelected || (this.isFreightAmountRequired())) {
      this.disabledFreight = false;
      this.freightAmount = 0;
    } else {
      this.disabledFreight = true;
      this.freightAmount = this.formatter.round(this.deliveryTypeSelected.fretePadrao);
    }
  }

  isFreightAmountRequired() {
    if (this.deliveryTypeSelected) {
      if (this.deliveryTypeSelected.codEntErp.toUpperCase() === 'FOB') {
        return false;
      }
      return true;
    }
    return this.showDeliveryTypes;
  }
}
