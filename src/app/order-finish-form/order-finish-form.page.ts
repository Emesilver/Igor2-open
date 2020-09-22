import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderProvider } from '../services/order/order';
import { Order, OrderHandleType } from '../models/order';
import { LoaderProvider } from '../services/loader/loader';
import { User } from '../models/user';
import { PaymentPlan } from '../models/payment-plan';
import { PaymentPlanProvider } from '../services/payment-plan/payment-plan';
import { UserProvider } from '../services/user/user';
import { Customer } from '../models/customer';
import { CustomerProvider } from '../services/customer/customer';
import { Price } from '../models/price';
import { DiscountProvider } from '../services/discount/discount';
import { PriceProvider } from '../services/price/price';
import { Param } from '../models/param';
import { ParamProvider } from '../services/param/param';
import { ToastProvider } from '../services/toast/toast';
import { ModalController, NavController } from '@ionic/angular';
import { BalanceProvider } from '../services/balance/balance';
import { Location } from '@angular/common';
import { SelectCustomerPage } from '../select-customer/select-customer.page';
import { CustomErrorPage } from '../custom-error/custom-error.page';
import { AppState } from '../app.global';

@Component({
  selector: 'app-order-finish-form',
  templateUrl: './order-finish-form.page.html',
  styleUrls: ['./order-finish-form.page.scss'],
})
export class OrderFinishFormPage implements OnInit {
  orderWrk: Order;
  orderHandleType: OrderHandleType;
  title = 'Finalizar pedido';
  isView = false;
  user: User;
  paymentPlans: Array<PaymentPlan>;
  customerName = '';
  customer: Customer;
  customerOrder = '';
  obs = '';
  deliveryDate: string;
  amountItens = 0;
  amountTotalItens = 0;
  totalItens = 0;
  totalItensFormatted: string;
  discountItenPercent = 0;
  discountItenAmount = 0;
  discountItenAmountFormatted: string;
  discount = 0;
  discountPercent = 0;
  discountAmount = 0;
  total = 0;
  totalFormatted: string;
  paymentPlan = '';
  isOnline = false;

  constructor(
    private orderProvider: OrderProvider,
    private router: Router,
    private loaderProvider: LoaderProvider,
    private paymentPlanProvider: PaymentPlanProvider,
    private userProvider: UserProvider,
    private customerProvider: CustomerProvider,
    private discountProvider: DiscountProvider,
    private priceProvider: PriceProvider,
    private paramProvider: ParamProvider,
    private toastProvider: ToastProvider,
    private modalController: ModalController,
    private balanceProvider: BalanceProvider,
    private location: Location,
    private navCtrl: NavController,
    private global: AppState
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.orderWrk = this.router.getCurrentNavigation().extras.state.orderWrk;
      this.orderHandleType = this.router.getCurrentNavigation().extras.state.OrderHandleType;
      this.isView = this.router.getCurrentNavigation().extras.state.isView;
    }
    this.init();
  }

  ngOnInit() {
  }

  async init() {
    this.loaderProvider.show('Carregando...');
    this.isOnline = this.global.getProperty('online');
    this.user = await this.userProvider.getUserLocal();

    if (this.orderHandleType === OrderHandleType.view) {
      this.title = 'Visualizando Pedido';
    }
    this.paymentPlans = await this.paymentPlanProvider
      .getByPriority(this.orderWrk.codCliErp, this.user.currentCompany.codRepErp);
    await this.orderToVars();
    this.calculeDiscountAmount();
    this.loaderProvider.close();
  }

  // Copia as propriedades do objeto pedido para as variaveis
  async orderToVars() {
    this.customer = await this.customerProvider.getByIdLocal(this.orderWrk.codCliErp, this.user.currentCompany.idEmp);
    this.customerName = this.customer.fantasia;
    this.customerOrder = this.orderWrk.pedCli;
    this.paymentPlan = this.orderWrk.codPlaErp;
    this.deliveryDate = this.orderWrk.dataEnt;
    this.obs = this.orderWrk.obs;
    this.amountItens = this.orderWrk.itens.length;
    this.amountTotalItens = this.sumArrayProperty(this.orderWrk.itens, 'qtd');
    this.setTotalItens(this.sumArrayProperty(this.orderWrk.itens, 'totalItem'));
    this.setTotal(this.sumArrayProperty(this.orderWrk.itens, 'totalItem'));
    this.discountItenPercent = +(+this.sumArrayProperty(this.orderWrk.itens, 'desctoPerc') / +this.amountItens).toFixed(2);
    this.setDiscountItenAmount(this.sumArrayProperty(this.orderWrk.itens, 'desctoVal'));
    this.setDiscountAmount(this.orderWrk.desctoPedidoVal);
    this.discountPercent = this.orderWrk.desctoPedidoPerc;
    this.setTotal(this.orderWrk.totalPedido);
  }

  sumArrayProperty(array, property) {
    let total = 0;
//    for (let index = 0; index < array.length; index++) {
    for (const element of array) {
//      const value = array[index][property];
      const value = element[property];
      if (value != null && value !== undefined) {
        total += +value;
      }
    }
    return total;
  }

  calculeDiscountAmount() {
    const isNull = !!this.discountAmount;
    this.discountAmount = isNull ? this.discountAmount : 0;
    this.setTotal(this.totalItens);
    this.discountPercent = +Math.abs(this.discountAmount * 100 / this.total).toFixed(2);
    this.setTotal(this.total - this.discountAmount);
    this.setDiscountAmount(isNull ? this.discountAmount : 0);
    this.discountPercent = isNull ? this.discountPercent : 0;
    this.saveOnBlur();
  }

  async saveOnBlur() {
    if (!(this.orderHandleType === OrderHandleType.view)) {
      this.varsToOrder();
      await this.orderProvider.saveOrderDraft(this.orderWrk);
    }
  }
  // Copia as variaveis para o objeto de pedido em trabalho
  varsToOrder() {
    this.orderWrk.desCli = this.customerName;
    this.orderWrk.pedCli = this.customerOrder;
    this.orderWrk.dataEnt = this.deliveryDate;
    this.orderWrk.obs = this.obs;
    this.orderWrk.qtdItens = this.amountItens;
    this.orderWrk.totalItens = this.amountTotalItens;

    this.orderWrk.desctoItensVal = this.discountItenAmount;
    this.orderWrk.desctoItensPerc = this.discountItenPercent;

    this.orderWrk.desctoPedidoVal = this.discountAmount;
    this.orderWrk.desctoPedidoPerc = this.discountPercent;
    this.orderWrk.totalPedido = this.total;

    this.orderWrk.codPlaErp = this.paymentPlan;
  }


  // Valida formulário e enviar para API
  async save() {

    // TODO: validar cliente


    this.varsToOrder();
    this.orderProvider.saveOrderDraft(this.orderWrk);
    const valid = await this.validate();
    if (valid.ok) {
      const param: Param = await this.paramProvider.getByCustomer(this.orderWrk.codCliErp);
      if (this.checkTimeToSend(param)) {
        try {
          this.loaderProvider.show('Enviando pedido...');
          await this.orderProvider.saveBackend(this.orderWrk);
          this.loaderProvider.close();
          this.toastProvider.show('Pedido enviado com sucesso.');
          this.navCtrl.navigateRoot('/order-list');
        } catch (error) {
          this.loaderProvider.close();
        }
      }

    } else {
      const modal = await this.modalController.create({
        component: CustomErrorPage,
        componentProps: { errors: valid.errors, title: 'Existem erros no pedido' }
      });
      modal.present();
    }
  }

  checkTimeToSend(param: Param): boolean {
    let ret = true;
    if (param) {
      if (param.horPadIni !== '' && param.horPadFin !== '') {
        const actualDate = new Date();
        const actualTime = actualDate.toTimeString();
        ret = (actualTime >= param.horPadIni) && (actualTime <= param.horPadFin);
        if (!ret) {
          this.toastProvider.show('Horário bloqueado! (' + param.horPadIni + '-' + param.horPadFin + ')');
        }
      }
    } else {
      this.toastProvider.show('Não temos a tabela de parâmetros');
    }
    return ret;
  }

  // Valida o objeto orderWrk e seus itens
  async validate(): Promise<{ ok: boolean, errors: Array<string> }> {
    return new Promise<{ ok: boolean, errors: Array<string> }>(async resolve => {
      this.loaderProvider.show('Validando pedido...');
      const errors: Array<string> = [];
      if (!this.orderWrk.codCliErp) {
        errors.push('Cliente não foi selecionado.');
      }
      const balance = await this.balanceProvider.getByCustomer(this.customer);
      if (balance) {
        if (balance.bloqueado === 'S') {
          if (balance.motivoBloq && balance.motivoBloq !== '') {
            errors.push('Cliente bloqueado: ' + balance.motivoBloq);
          } else {
            errors.push('Cliente bloqueado');
          }
        }
      }

      if (this.orderWrk.itens.length === 0) {
        errors.push('Falta definir os produtos.');
      }

      if (!this.paymentPlan) {
        errors.push('Selecione um plano de pagamento.');
      }

      if (!this.orderWrk.dataEnt || this.orderWrk.dataEnt === '') {
        errors.push('Falou selecionar a data de entrega.');
      }

      for (const orderItem of this.orderWrk.itens) {
//      for (let index = 0; index < this.orderWrk.itens.length; index++) {
//        const orderItem: OrderItem = this.orderWrk.itens[index];
        if (orderItem.codCliErp && orderItem.codCliErp !== '') {
          if (orderItem.codCliErp !== this.customer.codCliErp) {
            errors.push(`Produto ${orderItem.descricao} não pertencem a esse cliente.`);
          }
        }
        const priceObj = await this.priceProvider.getByPriority(this.orderWrk.codTabErp,
          orderItem.codProErp, this.orderWrk.codCliErp, this.user.currentCompany.codRepErp
        );
        if (priceObj) {
          const aRefError = [''];
          if (!this.validatePrice(priceObj, orderItem.precoUnitFat, aRefError)) {
            errors.push('O produto ' + orderItem.descricao + ' está com preço ' + aRefError[0]);
          }
        } else {
          errors.push(`Produto ${orderItem.descricao} sem preço. Retire este produto e coloque novamente no pedido.`);
        }
        const discountObj = await this.discountProvider.getByPriority(
          orderItem.codProErp, this.orderWrk.codCliErp, this.user.currentCompany.codRepErp
        );
        if (discountObj) {
          if (!this.validateDiscount(discountObj, orderItem.desctoPerc)) {
            errors.push(`O produto ${orderItem.descricao} com desconto fora do intervalo.`);
          }
        }
        if (!orderItem.unidade) {
          errors.push(`O produto ${orderItem.descricao} está sem unidade de medida.` +
          ` Retire este produto e coloque novamente no pedido.`);
        }
        if (!orderItem.unidadeFat) {
          errors.push(`O produto ${orderItem.descricao} está sem unidade de faturamento.` +
          ` Retire este produto e coloque novamente no pedido.`);
        }
        if (!orderItem.qtdFat) {
          errors.push(`O produto ${orderItem.descricao} está sem qtde para faturamento.` +
          ` Retire este produto e coloque novamente no pedido.`);
        }

        if (orderItem.unidade.toUpperCase() === 'CX') {
          if (orderItem.qtd % 1 !== 0 ) {
            errors.push(`O produto ${orderItem.descricao} está em CX e não pode ter decimais na quantidade.`);
          }
        }

      }
      this.loaderProvider.close();
      resolve({ ok: errors.length === 0, errors });
    });
  }


  validateDiscount(discount, discountValue) {
    if (discount) {
      if (discount.codCliErp && discount.codCliErp !== this.customer.codCliErp) {
        return false;
      }
      if (discount.tipoDesconto === 'VAL') {
        if (+discountValue > +discount.descontoMax ||
          +discountValue < +discount.descontoMin) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  validatePrice(price: Price, unitPrice, aRefError): boolean {
    if (!unitPrice) {
      return false;
    }
    if (price) {
      if (price.codCliErp && price.codCliErp !== this.customer.codCliErp) {
        return false;
      }
      if (price.tipoPreco === 'VAL') {
        return this.verifyPrice(price, unitPrice, aRefError);
      }
      return true;
    }
    return true;
  }

  verifyPrice(price: Price, unitPrice, aRefError): boolean {
    if (unitPrice > price.precoMax) {
      aRefError[0] = 'acima do permitido';
    }
    if (unitPrice < price.precoMin) {
      aRefError[0] = 'abaixo do permitido';
    }
    return (aRefError[0] === '');
  }

  calculeDiscountPercent() {
    const isNull = !!this.discountPercent;
    this.discountPercent = isNull ? this.discountPercent : 0;
    const tempTotal = this.total = this.totalItens;
    this.setTotal(+Math.abs((this.total * (this.discountPercent / 100) - this.total)));
    this.discount = +Math.abs(this.discountAmount = (tempTotal * (this.discountPercent / 100)));
    this.discountPercent = isNull ? this.discountPercent : 0;
    this.setDiscountAmount(isNull ? this.discountAmount : 0);
    this.saveOnBlur();
  }

  async selectCustomer() {
    if (!this.isView) {
      const modal = await this.modalController.create({
        component: SelectCustomerPage
      });
      modal.present();
      modal.onDidDismiss().then((response) => {
        if (response.data.customer) {
          this.customerName = response.data.customer.fantasia;
          this.customer = response.data.customer;
          this.orderWrk.codCliErp = response.data.customer.codCliErp;
          this.orderWrk.codTabErp = response.data.customer.codTabErp;
          this.paymentPlan = null;
          this.orderWrk.codPlaErp = this.paymentPlan;
          this.getPaymentPlansSelected(this.orderWrk.codCliErp, this.user.currentCompany.codRepErp);
          this.saveOrderDraft();
        }
      });
    }
  }

  async validateOrder() {
    this.varsToOrder();
    this.orderProvider.saveOrderDraft(this.orderWrk);
    const valid = await this.validate();
    if (valid.ok) {
      this.toastProvider.show('Pedido validado, pronto para o envio.');
    } else {
      const modal = await this.modalController.create({
        component: CustomErrorPage,
        componentProps: { errors: valid.errors, title: 'Existem erros no pedido' }
      });
      modal.present();
    }
  }

  async getPaymentPlansSelected(codCliErp: string, codRepErp: string) {
    this.paymentPlans = await this.paymentPlanProvider.getByPriority(codCliErp, codRepErp);
  }

  async saveOrderDraft() {
    await this.orderProvider.saveOrderDraft(this.orderWrk);
  }

  back() {
    this.location.back();
  }

  close() {
    // this.router.navigate(['/home']);
    this.navCtrl.navigateRoot('/home');
  }

  setDiscountAmount(value: number) {
    this.discountAmount = Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
  }

  setDiscountItenAmount(value: number) {
    this.discountItenAmount = value;
    this.discountItenAmountFormatted = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  setTotalItens(value: number) {
    this.totalItens = value;
    this.totalItensFormatted = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  setTotal(value: number) {
    this.total = value;
    this.totalFormatted = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
