import { Component } from '@angular/core';
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
import { AppState, Properties } from '../app.global';
import { Discount } from '../models/discount';
import { OrderItem } from '../models/order-item';

@Component({
  selector: 'app-order-finish-form',
  templateUrl: './order-finish-form.page.html',
  styleUrls: ['./order-finish-form.page.scss'],
})
export class OrderFinishFormPage {
  orderWrk!: Order;
  orderHandleType!: OrderHandleType;
  title = 'Finalizar pedido';
  isView = false;
  user!: User;
  paymentPlans!: Array<PaymentPlan>;
  customerName = '';
  customer?: Customer;
  customerOrder = '';
  obs = '';
  deliveryDate!: string;
  amountItens = 0;
  amountTotalItens = 0;
  totalItens = 0;
  totalItensFormatted!: string;
  discountItenPercent = 0;
  discountItenAmount = 0;
  discountItenAmountFormatted!: string;
  discount = 0;
  discountPercent = 0;
  discountAmount = 0;
  total = 0;
  totalFormatted!: string;
  paymentPlan = '';

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
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.orderWrk = navigation.extras.state['orderWrk'];
      this.orderHandleType = navigation.extras.state['orderHandleType'];
      this.isView = navigation.extras.state['isView'];
    }
    this.init();
  }

  async init() {
    this.loaderProvider.show('Carregando...');
    this.user = await this.userProvider.getUserLocal();

    if (this.orderHandleType === OrderHandleType.view) {
      this.title = 'Visualizando Pedido';
    }
    if (this.user.currentCompany) {
      this.paymentPlans = await this.paymentPlanProvider.getByPriority(
        this.orderWrk.codCliErp
      );
    }
    await this.orderToVars();
    this.calculeDiscountAmount();
    this.loaderProvider.close();
  }

  // Copia as propriedades do objeto pedido para as variaveis
  async orderToVars() {
    this.customer = await this.customerProvider.getByIdLocal(
      this.orderWrk.codCliErp
    );
    if (this.customer) {
      this.customerName = this.customer.fantasia;
    }

    this.customerOrder = this.orderWrk.pedCli;
    this.paymentPlan = this.orderWrk.codPlaErp;
    this.deliveryDate = this.orderWrk.dataEnt;
    this.obs = this.orderWrk.obs;
    this.amountItens = this.orderWrk.itens.length;
    this.amountTotalItens = this.sumItens('qtd');
    this.setTotalItens(this.sumItens('totalItem'));
    this.setTotal(this.sumItens('totalItem'));
    this.discountItenPercent = +(
      +this.sumItens('desctoPerc') / +this.amountItens
    ).toFixed(2);
    this.setDiscountItenAmount(this.sumItens('desctoVal'));
    this.setDiscountAmount(this.orderWrk.desctoPedidoVal);
    this.discountPercent = this.orderWrk.desctoPedidoPerc;
    this.setTotal(this.orderWrk.totalPedido);
  }

  private sumItens(property: string) {
    return this.orderWrk.itens.reduce(
      (a, b) => a + Number(b[property as keyof OrderItem]),
      0
    );
  }

  calculeDiscountAmount() {
    const isNull = !!this.discountAmount;
    this.discountAmount = isNull ? this.discountAmount : 0;
    this.setTotal(this.totalItens);
    this.discountPercent = +Math.abs(
      (this.discountAmount * 100) / this.total
    ).toFixed(2);
    this.setTotal(this.total - this.discountAmount);
    this.setDiscountAmount(isNull ? this.discountAmount : 0);
    this.discountPercent = isNull ? this.discountPercent : 0;
    this.saveOnBlur();
  }

  async saveOnBlur() {
    if (this.orderHandleType !== OrderHandleType.view) {
      this.varsToOrder();
      this.orderProvider.saveOrderDraft(this.orderWrk);
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
  async send() {
    this.varsToOrder();
    this.orderProvider.saveOrderDraft(this.orderWrk);
    const orderErrors = await this.validate();
    if (!orderErrors.length) {
      const param = await this.paramProvider.getParamByCustomer(
        this.orderWrk.codCliErp
      );
      if (this.checkTimeToSend(param)) {
        try {
          this.loaderProvider.show('Enviando pedido...');
          this.orderWrk.livre1 = '{operador: "' + this.user.email + '"' + '}';
          await this.orderProvider.sendToSLC(this.orderWrk);
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
        componentProps: {
          errors: orderErrors,
          title: 'Existem erros no pedido',
        },
      });
      modal.present();
    }
  }

  checkTimeToSend(param: Param | undefined): boolean {
    let ret = true;
    if (param) {
      if (param.horPadIni !== '' && param.horPadFin !== '') {
        const actualDate = new Date();
        const actualTime = actualDate.toTimeString();
        ret = actualTime >= param.horPadIni && actualTime <= param.horPadFin;
        if (!ret) {
          this.toastProvider.show(
            'Horário bloqueado! (' +
              param.horPadIni +
              '-' +
              param.horPadFin +
              ')'
          );
        }
      }
    } else {
      this.toastProvider.show('Não temos a tabela de parâmetros');
    }
    return ret;
  }

  // Valida o objeto orderWrk e seus itens
  private async validate() {
    this.loaderProvider.show('Validando pedido...');

    const errors: Array<string> = [];

    await this.validateCustomer(errors);

    if (!this.paymentPlan) {
      errors.push('Selecione um plano de pagamento.');
    }

    if (!this.orderWrk.dataEnt || this.orderWrk.dataEnt === '') {
      errors.push('Falou selecionar a data de entrega.');
    }

    await this.validateItems(errors);

    this.loaderProvider.close();

    return errors;
  }

  private async validateCustomer(errors: string[]) {
    if (!this.orderWrk.codCliErp) {
      errors.push('Cliente não foi selecionado.');
      return;
    }
    const balance = await this.balanceProvider.getByCustomer(
      this.orderWrk.codCliErp
    );
    if (balance) {
      if (balance.bloqueado === 'S') {
        if (balance.motivoBloq && balance.motivoBloq !== '') {
          errors.push('Cliente bloqueado: ' + balance.motivoBloq);
        } else {
          errors.push('Cliente bloqueado');
        }
      }
    }
  }

  private async validateItems(errors: string[]) {
    if (this.orderWrk.itens.length === 0) {
      errors.push('Falta definir os produtos.');
    }

    for (const orderItem of this.orderWrk.itens) {
      if (orderItem.codCliErp) {
        if (orderItem.codCliErp !== this.orderWrk.codCliErp) {
          errors.push(
            `Produto ${orderItem.descricao} não pertencem a esse cliente.`
          );
        }
      }
      const priceObj = await this.priceProvider.getByPriority(
        this.orderWrk.codTabErp,
        orderItem.codProErp,
        this.orderWrk.codCliErp,
        orderItem.qtd
      );
      if (priceObj) {
        const aRefError = [''];
        if (!this.validatePrice(priceObj, orderItem.precoUnitFat, aRefError)) {
          errors.push(
            'O produto ' +
              orderItem.descricao +
              ' está com preço ' +
              `${aRefError[0]}.` +
              ' Retire este produto e coloque novamente no pedido.'
          );
        }
      } else {
        errors.push(
          `Produto ${orderItem.descricao} sem preço. Retire este produto e coloque novamente no pedido.`
        );
      }
      const discountObj = await this.discountProvider.getByPriority(
        orderItem.codProErp,
        this.orderWrk.codCliErp
      );
      if (discountObj) {
        if (!this.validateDiscount(discountObj, orderItem.desctoPerc)) {
          errors.push(
            `O produto ${orderItem.descricao} com desconto fora do intervalo.`
          );
        }
      }
      if (!orderItem.unidade) {
        errors.push(
          `O produto ${orderItem.descricao} está sem unidade de medida.` +
            ' Retire este produto e coloque novamente no pedido.'
        );
      }
      if (!orderItem.unidadeFat) {
        errors.push(
          `O produto ${orderItem.descricao} está sem unidade de faturamento.` +
            ' Retire este produto e coloque novamente no pedido.'
        );
      }
      if (!orderItem.qtdFat) {
        errors.push(
          `O produto ${orderItem.descricao} está sem qtde para faturamento.` +
            ' Retire este produto e coloque novamente no pedido.'
        );
      }

      if (orderItem.unidade.toUpperCase() === 'CX') {
        if (orderItem.qtd % 1 !== 0) {
          errors.push(
            `O produto ${orderItem.descricao} está em CX e não pode ter decimais na quantidade.`
          );
        }
      }
    }
  }

  private validateDiscount(discount: Discount, discountPerc: number) {
    if (discount) {
      if (discountPerc > 90) {
        return false;
      }
      if (
        discount.codCliErp &&
        discount.codCliErp !== this.orderWrk.codCliErp
      ) {
        return false;
      }
      if (discount.tipoDesconto === 'VAL') {
        if (
          +discountPerc > +discount.descontoMax ||
          +discountPerc < +discount.descontoMin
        ) {
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

  validatePrice(price: Price, unitPrice: number, aRefError: string[]): boolean {
    if (!unitPrice) {
      return false;
    }
    if (price) {
      if (price.codCliErp && price.codCliErp !== this.orderWrk.codCliErp) {
        return false;
      }
      if (price.tipoPreco === 'VAL') {
        return this.verifyPrice(price, unitPrice, aRefError);
      }
      if (price.tipoPreco === 'OBR' && price.precoPadrao !== unitPrice) {
        aRefError[0] = 'diferente do permitido';
        return false;
      }
    }
    return true;
  }

  verifyPrice(price: Price, unitPrice: number, aRefError: string[]): boolean {
    if (unitPrice > price.precoMax) {
      aRefError[0] = 'acima do permitido';
    }
    if (unitPrice < price.precoMin) {
      aRefError[0] = 'abaixo do permitido';
    }
    return aRefError[0] === '';
  }

  calculeDiscountPercent() {
    const isNull = !!this.discountPercent;
    this.discountPercent = isNull ? this.discountPercent : 0;
    const tempTotal = (this.total = this.totalItens);
    this.setTotal(
      +Math.abs(this.total * (this.discountPercent / 100) - this.total)
    );
    this.discount = +Math.abs(
      (this.discountAmount = tempTotal * (this.discountPercent / 100))
    );
    this.discountPercent = isNull ? this.discountPercent : 0;
    this.setDiscountAmount(isNull ? this.discountAmount : 0);
    this.saveOnBlur();
  }

  async selectCustomer() {
    if (!this.isView) {
      const modal = await this.modalController.create({
        component: SelectCustomerPage,
      });
      modal.present();
      modal.onDidDismiss().then((response) => {
        if (response.data.customer) {
          this.customerName = response.data.customer.fantasia;
          this.customer = response.data.customer;
          this.orderWrk.codCliErp = response.data.customer.codCliErp;
          this.orderWrk.codTabErp = response.data.customer.codTabErp;
          this.paymentPlan = '';
          this.orderWrk.codPlaErp = this.paymentPlan;
          this.getPaymentPlansSelected(this.orderWrk.codCliErp);
          this.saveOrderDraft();
        }
      });
    }
  }

  async validateOrder() {
    this.varsToOrder();
    this.orderProvider.saveOrderDraft(this.orderWrk);
    const orderErrors = await this.validate();
    if (!orderErrors.length) {
      this.toastProvider.show('Pedido validado, pronto para o envio.');
    } else {
      const modal = await this.modalController.create({
        component: CustomErrorPage,
        componentProps: {
          errors: orderErrors,
          title: 'Existem erros no pedido',
        },
      });
      modal.present();
    }
  }

  async getPaymentPlansSelected(codCliErp: string) {
    this.paymentPlans = await this.paymentPlanProvider.getByPriority(codCliErp);
  }

  async saveOrderDraft() {
    this.orderProvider.saveOrderDraft(this.orderWrk);
  }

  back() {
    this.location.back();
  }

  close() {
    this.navCtrl.navigateRoot('/home');
  }

  setDiscountAmount(value: number) {
    this.discountAmount = Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
  }

  setDiscountItenAmount(value: number) {
    this.discountItenAmount = value;
    this.discountItenAmountFormatted = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  setTotalItens(value: number) {
    this.totalItens = value;
    this.totalItensFormatted = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  setTotal(value: number) {
    this.total = value;
    this.totalFormatted = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
