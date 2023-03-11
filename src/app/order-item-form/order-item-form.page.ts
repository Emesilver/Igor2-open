import { FormatterProvider } from './../services/formatter/formatter';
import { Component } from '@angular/core';
import { Item } from '../models/item';
import { Order, OrderHandleType } from '../models/order';
import { OrderItem } from '../models/order-item';
import { User } from '../models/user';
import { Price } from '../models/price';
import { Stock } from '../models/stock';
import { Discount } from '../models/discount';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { PriceProvider } from '../services/price/price';
import { StockProvider } from '../services/stock/stock';
import { UserProvider } from '../services/user/user';
import { LoaderProvider } from '../services/loader/loader';
import { OrderProvider } from '../services/order/order';
import { ToastProvider } from '../services/toast/toast';
import { ItemProvider } from '../services/item/item';
import { DiscountProvider } from '../services/discount/discount';
import { SelectItemPage } from '../select-item/select-item.page';
import { Location } from '@angular/common';
import { remove as _remove } from 'lodash';
import { ComissionProvider } from '../services/comission/comission';
import { Comission } from '../models/comission';
import { Operation } from '../models/operation';
import { OperationProvider } from '../services/operation/operation';
import { PaymentPlan } from '../models/payment-plan';
import { PaymentPlanProvider } from '../services/payment-plan/payment-plan';

@Component({
  selector: 'app-order-item-form',
  templateUrl: './order-item-form.page.html',
  styleUrls: ['./order-item-form.page.scss'],
})
export class OrderItemFormPage /*implements OnInit*/ {
  itemTitle = 'Novo item';
  codOperacErp!: string;
  itemSelected?: Item;
  orderWrk!: Order;
  orderItemWrk?: OrderItem; // item do pedido que está sendo trabalhado
  orderHandleType!: OrderHandleType;
  orderItemHandleType!: OrderHandleType;
  itens: Array<Item> = [];
  itemName!: string;
  user!: User;
  unitPrice!: number; // Preco na unidade do pedido
  unitPriceFormatted!: string;
  unitPriceFat!: number; // Preco na unidade de faturamento
  amountItemVen!: number; // Quantidade na unidade do pedido
  amountItemFat!: number; // Quantidade na unidade de faturamento
  fatorFat!: number;
  subTotal!: number;
  subTotalFormatted!: string;
  discount!: number;
  discountPercent!: number;
  discountAmount!: number;
  total!: number;
  totalFormatted!: string;
  oldTotalItem = 0;
  oldQtdTotal = 0;
  validatePrice = false;
  disablePrice = false;
  errorPrice = false;
  errorDiscount = false;
  idxEditing!: number;
  lastPrice?: string;
  lastQuantity!: number;
  priceObj?: Price;
  stockObj?: Stock;
  discountObj!: Discount;
  validateDiscount = false;
  disableDiscount = false;
  dualUnit = false; // Produto com unidade de pedido diferente da unidade de faturamento
  captionQtdFat = 'Quantidade';
  captionQtdPed = 'Quantidade';
  captionUntPriceFat = 'Preço';
  captionUntPricePed = 'Preço';
  showAditionals = false;
  showComission = false;
  showOperations = false;
  aditionalsOpened = false;
  comission!: number;
  comissionPercent!: number;
  comissionAmount!: number;
  comissionObj!: Comission;
  errorComission = false;
  paymentPlan!: PaymentPlan;
  operations!: Array<Operation>;
  unitWeight!: number;
  priceList!: Price[];
  private endFoto?: string;
  private fotos: string[] = [];
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private priceProvider: PriceProvider,
    private stockProvider: StockProvider,
    private userProvider: UserProvider,
    private loaderProvider: LoaderProvider,
    private orderProvider: OrderProvider,
    private toastProvider: ToastProvider,
    private itemProvider: ItemProvider,
    private discountProvider: DiscountProvider,
    private comissionProvider: ComissionProvider,
    private operationProvider: OperationProvider,
    private location: Location,
    private paymentPlanProvider: PaymentPlanProvider,
    private formatter: FormatterProvider
  ) {
    this.init();
  }

  async init() {
    this.loaderProvider.show('');
    this.resetVars();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.orderWrk = navigation.extras.state['orderWrk'];
      this.orderHandleType = navigation.extras.state['orderHandleType'];
      this.orderItemHandleType = navigation.extras.state['orderItemHandleType'];
      this.loadingOrderItem(navigation.extras.state['idxEditing']);
      this.paymentPlan = await this.paymentPlanProvider.getPaymentPlan(
        this.orderWrk.codPlaErp
      );
      this.priceProvider.buildPricesClient(
        this.orderWrk.codTabErp,
        this.orderWrk.codCliErp
      );
    }
    this.user = await this.userProvider.getUserLocal();
    this.endFoto = this.user.currentCompany?.endFoto;
    if (this.orderItemWrk) {
      this.itemTitle = 'Alterando Item';
      this.orderItemToVars(this.orderItemWrk);
    }
    this.loadOperations();
    this.loaderProvider.close();
  }

  async loadOperations() {
    this.operations = await this.operationProvider.getOperations();
    if (this.operations.length > 0) {
      this.showOperations = true;
      const defaultOperation = this.operations.filter((n) => {
        return n.operacPadrao === 'S';
      });
      this.codOperacErp = defaultOperation[0].codOperacErp;
    }
  }

  async loadingOrderItem(idx: number) {
    if (idx) {
      this.idxEditing = idx;
      if (this.orderWrk) {
        this.orderItemWrk = this.orderWrk.itens.find((elem) => {
          return elem.idxItem === idx;
        });
      }
    }
  }

  async selectItem() {
    const modal = await this.modalCtrl.create({
      component: SelectItemPage,
      componentProps: {
        codCliErp: this.orderWrk.codCliErp,
      },
    });
    modal.present();
    modal.onDidDismiss().then((response) => {
      if (response.data?.item) {
        this.checkSelectedItem(response.data.item);
      }
    });
  }

  async checkSelectedItem(item: Item) {
    this.resetVars();
    let itemValid = true;
    const existItem = this.orderProvider.itemExistInOrder(
      item.codProErp,
      this.orderWrk.itens
    );
    if (existItem) {
      const mens = 'Produto já está no pedido.';
      this.toastProvider.show(mens);
      itemValid = false;
    }

    if (itemValid) {
      this.buildFotos(item.fotoIni, item.fotoFin);
      this.stockObj = await this.stockProvider.getByPriority(
        item.codProErp,
        this.orderWrk.codCliErp
      );
      if (this.stockObj) {
        if (this.stockObj.bloqueado === 'S') {
          let mens = 'Produto com bloqueio.';
          if (this.stockObj.motivoBloq) {
            mens = mens + ' ' + this.stockObj.motivoBloq;
          }
          this.toastProvider.show(mens);
          itemValid = false;
        }
      }
    }

    if (itemValid) {
      this.itemSelected = item;
      this.priceList = await this.priceProvider.getProdPriceList(
        this.orderWrk.codTabErp,
        item.codProErp,
        this.orderWrk.codCliErp
      );
      this.priceObj = await this.priceProvider.getByPriority(
        this.orderWrk.codTabErp,
        item.codProErp,
        this.orderWrk.codCliErp,
        1
      );
      if (!this.priceObj) {
        // try a min quantity
        const minQtd = await this.priceProvider.getMinQtd(
          this.orderWrk.codTabErp,
          item.codProErp,
          this.orderWrk.codCliErp
        );
        this.priceObj = await this.priceProvider.getByPriority(
          this.orderWrk.codTabErp,
          item.codProErp,
          this.orderWrk.codCliErp,
          minQtd
        );
        if (this.priceObj) {
          this.amountItemFat = minQtd;
        }
      }
      await this.itemToVars(item);
      await this.totalizeItem();
    }
  }
  private buildFotos(fotoIni: string, fotoFin: string) {
    this.fotos = [];
    if (this.endFoto) {
      if (fotoIni && fotoFin) {
        if (
          fotoIni !== fotoFin &&
          fotoFin > fotoIni &&
          fotoIni.split('.')[0].endsWith('_a') &&
          fotoIni.length == fotoFin.length
        ) {
          let extension = fotoIni.split('.')[1];
          extension = extension ? '.' + extension : '';
          let current = fotoIni.split('.')[0];
          let letter = 'a';
          while (current <= fotoFin) {
            this.fotos.push(current + extension);
            letter = String.fromCharCode(letter.charCodeAt(0) + 1);
            current = current.split('_')[0] + '_' + letter;
          }
          return;
        }
      }
      if (fotoIni) {
        this.fotos.push(this.endFoto + '/' + fotoIni);
      } else if (fotoFin) {
        this.fotos.push(this.endFoto + '/' + fotoFin);
      }
    }
  }

  // Aplica regras de preço de acordo com regra de negócio
  private applyPrice(updateUnitPrice: boolean) {
    if (this.priceObj) {
      this.validatePrice = this.priceObj.tipoPreco === 'VAL';
      this.disablePrice = this.priceObj.tipoPreco === 'OBR';
      /**
       * quando carrega o item para edição nao sobrepoe o valor
       * que já estava no item.
       */
      if (updateUnitPrice) {
        this.unitPriceFat = this.priceObj.precoPadrao;
        this.setUnitPrice(this.priceObj.precoPadrao * this.fatorFat);
      }
    }
  }

  save(back: boolean) {
    this.loaderProvider.show('Salvando item...');

    // Aguardar todos os eventos serem processados
    setTimeout(() => {
      const errorSaving = this.saveItem();
      this.loaderProvider.close();
      if (!errorSaving) {
        if (back) {
          this.location.back();
        } else {
          this.resetVars();
          this.orderItemHandleType = OrderHandleType.new;
        }
      } else {
        this.toastProvider.show(errorSaving);
      }
    }, 300);
  }

  private saveItem(): string {
    if (this.orderHandleType !== OrderHandleType.view) {
      if (!this.amountItemFat) {
        return 'Faltou a quantidade.';
      }
      if (
        this.priceObj?.qtdeMultiplo &&
        this.amountItemFat % this.priceObj.qtdeMultiplo >= 1
      ) {
        return `Qtde precisa ser multipla de ${this.priceObj?.qtdeMultiplo}`;
      }
      this.varsToOrderItem();
      if (this.orderItemHandleType === OrderHandleType.edit) {
        _remove(this.orderWrk.itens, (elem: OrderItem) => {
          return elem.idxItem === this.idxEditing;
        });
      }
      if (
        this.orderItemHandleType !== OrderHandleType.view &&
        this.orderItemWrk
      ) {
        this.orderWrk.itens.push(this.orderItemWrk);
      }
      this.orderProvider.saveOrderDraft(this.orderWrk);
    }
    return '';
  }

  async saveAndAdd() {
    const confirm = await this.alertCtrl.create({
      header: 'Adicionar item?',
      message: 'Deseja salvar esse item e adicionar mais um no pedido?',
      buttons: [
        {
          text: 'Não',
          handler: () => {
            return undefined;
          },
        },
        {
          text: 'Sim',
          handler: () => {
            this.save(false);
          },
        },
      ],
    });
    confirm.present();
  }

  resetVars() {
    this.itemName = '';
    this.errorPrice = this.dualUnit = this.errorDiscount = false;
    this.itemSelected = this.lastPrice = undefined;
    this.priceObj = undefined;
    this.priceList = [];
    this.comissionPercent =
      this.comissionAmount =
      this.comission =
      this.discountPercent =
      this.discountAmount =
      this.amountItemFat =
      this.amountItemVen =
      this.unitPriceFat =
      this.lastQuantity =
        0;
    this.setUnitPrice(0);
    this.setSubTotal(0);
    this.setTotal(0);
  }

  changePriceFat() {
    // Transforma o preco da unidade de faturamento para preco na unidade de pedido. Ex: Kg -> Cx
    this.setUnitPrice(this.unitPriceFat * this.fatorFat);

    if (this.validatePrice && this.priceObj) {
      if (
        this.unitPriceFat > this.priceObj.precoMax ||
        this.unitPriceFat < this.priceObj.precoMin
      ) {
        this.errorPrice = true;
      } else {
        this.errorPrice = false;
      }
    }
    this.totalizeItem();
  }

  async totalizeItem() {
    if (this.itemSelected && this.unitPriceFat && this.amountItemFat) {
      // Verificar se tem preco diferenciado para a nova quantidade
      const newPriceObj = await this.priceProvider.getByPriority(
        this.orderWrk.codTabErp,
        this.itemSelected.codProErp,
        this.orderWrk.codCliErp,
        this.amountItemFat
      );
      if (!newPriceObj) {
        this.toastProvider.show('Preço não encontrado para esta quantidade.');
        return;
      }
      if (JSON.stringify(this.priceObj) !== JSON.stringify(newPriceObj)) {
        this.priceObj = newPriceObj;
        if (this.priceObj?.precoPadrao !== this.unitPriceFat) {
          this.toastProvider.show('Preço diferenciado para esta quantidade.');
          this.applyPrice(true);
          this.calculeUnitPrice();
        }
      }
      this.setSubTotal(+Math.abs(this.unitPriceFat * this.amountItemFat));
      if (!this.dualUnit) {
        this.amountItemVen = this.amountItemFat;
      }
      this.setTotal(this.subTotal);
      this.calculeDiscount();
    }
  }

  /**
   * quando existe o frete o valor unitario do item vai ser apurado.
   */
  private calculeUnitPrice() {
    if (this.orderWrk.freteVal && this.orderWrk.freteVal > 0) {
      const paymentPlanFator = this.paymentPlan.fator
        ? this.paymentPlan.fator
        : 0;
      const comissionVal = this.comissionPercent
        ? this.comissionPercent / 100
        : 0;
      const freightVal = (this.orderWrk.freteVal / 1000) * this.unitWeight;

      let totalVal = this.unitPriceFat + freightVal;
      totalVal = totalVal / (1 - comissionVal - paymentPlanFator);

      this.unitPriceFat = this.formatter.round(totalVal);
      this.setUnitPrice(this.unitPriceFat * this.fatorFat);
    }
  }

  async calculeAmountFat() {
    if (this.amountItemVen) {
      this.amountItemFat = this.amountItemVen * this.fatorFat;
      await this.totalizeItem();
    }
  }

  async orderItemToVars(orderItem: OrderItem) {
    this.itemSelected = await this.itemProvider.getByCodProErp(
      orderItem.codProErp
    );
    if (this.itemSelected) {
      this.buildFotos(this.itemSelected.fotoIni, this.itemSelected.fotoFin);
    }
    // Reservar o total do item atual para recalcular o total do pedido
    this.oldTotalItem = orderItem.totalItem;
    this.oldQtdTotal = orderItem.qtd;
    this.itemName = orderItem.descricao;
    this.amountItemVen = orderItem.qtd;
    this.amountItemFat = orderItem.qtdFat;
    this.unitPriceFat = orderItem.precoUnitFat;
    this.setUnitPrice(orderItem.precoUnit);
    this.setSubTotal(orderItem.totalItem);
    this.discountPercent = orderItem.desctoPerc;
    this.discountAmount = orderItem.desctoVal;
    this.comissionPercent = orderItem.comissaoPerc;
    this.comissionAmount = orderItem.comissaoVal;
    this.unitWeight = orderItem.pesoUnitario;

    const itemInLastOrder = await this.itemProvider.getInLastOrder(
      orderItem.codProErp,
      this.orderWrk.codCliErp
    );
    if (itemInLastOrder) {
      this.lastPrice =
        itemInLastOrder.precoUnit + '(' + itemInLastOrder.precoUnitFat + ')';
      this.lastQuantity = itemInLastOrder.qtd;
    }

    this.priceObj = await this.priceProvider.getByPriority(
      this.orderWrk.codTabErp,
      orderItem.codProErp,
      this.orderWrk.codCliErp,
      orderItem.qtd
    );

    if (this.priceObj) {
      this.dualUnit =
        this.priceObj.unidadeFat !== '' &&
        orderItem.unidade !== this.priceObj.unidadeFat;
      this.discountObj = await this.discountProvider.getByPriority(
        orderItem.codProErp,
        this.orderWrk.codCliErp
      );
      this.comissionObj = await this.comissionProvider.getByPriority(
        this.orderWrk.codCliErp,
        orderItem.codProErp
      );
    }

    this.fatorFat = 1;
    if (this.priceObj?.fatorFat) {
      if (this.dualUnit) {
        this.fatorFat = this.priceObj.fatorFat;
      }

      this.captionQtdFat = 'Quantidade ' + this.priceObj.unidadeFat;
      this.captionQtdPed = 'Quantidade ' + orderItem.unidade;
      this.captionUntPriceFat = 'Preço ' + this.priceObj.unidadeFat;
      this.captionUntPricePed = 'Preço ' + orderItem.unidade;
    }

    this.applyDiscount();
    this.applyComission();
    this.applyPrice(false);
    await this.totalizeItem();
  }

  private async itemToVars(item: Item) {
    this.itemName = item.descricao;
    this.unitWeight = item.peso;

    const itemInLastOrder = await this.itemProvider.getInLastOrder(
      item.codProErp,
      this.orderWrk.codCliErp
    );
    if (itemInLastOrder) {
      this.lastPrice =
        itemInLastOrder.precoUnit + '(' + itemInLastOrder.precoUnitFat + ')';
      this.lastQuantity = itemInLastOrder.qtd;
    }

    this.fatorFat = 1;
    if (this.priceObj) {
      this.dualUnit =
        this.priceObj.unidadeFat !== '' &&
        item.unidade !== this.priceObj.unidadeFat;
      this.captionQtdFat = 'Quantidade ' + this.priceObj.unidadeFat;
      this.captionUntPriceFat = 'Preço ' + this.priceObj.unidadeFat;
      this.discountObj = await this.discountProvider.getByPriority(
        item.codProErp,
        this.orderWrk.codCliErp
      );
      this.comissionObj = await this.comissionProvider.getByPriority(
        this.orderWrk.codCliErp,
        item.codProErp
      );
      if (this.dualUnit) {
        this.fatorFat = this.priceObj.fatorFat;
      }
      this.applyDiscount();
      this.applyComission();
      this.applyPrice(true);
      this.calculeUnitPrice();
    } else {
      this.toastProvider.show('Este produto está sem preço cadastrado.');
    }

    this.captionQtdPed = 'Quantidade ' + item.unidade;
    this.captionUntPricePed = 'Preço ' + item.unidade;
  }

  varsToOrderItem() {
    if (this.orderItemHandleType === OrderHandleType.new) {
      this.orderItemWrk = this.orderProvider.getNewOrderItemEmpty(
        this.orderWrk.itens.length + 1
      );
    }
    if (this.orderItemWrk && this.itemSelected) {
      this.orderItemWrk.codCliErp = this.itemSelected.codCliErp;
      this.orderItemWrk.codProErp = this.itemSelected.codProErp;
      this.orderItemWrk.descricao = this.itemSelected.descricao;
      this.orderItemWrk.unidade = this.itemSelected.unidade;
      this.orderItemWrk.precoUnit = this.unitPrice;
      this.orderItemWrk.qtd = this.amountItemVen;
      this.orderItemWrk.subTotalItem = this.subTotal;
      this.orderItemWrk.desctoPerc = this.discountPercent;
      this.orderItemWrk.desctoVal = this.discountAmount;
      this.orderItemWrk.comissaoPerc = this.comissionPercent;
      this.orderItemWrk.comissaoVal = this.comissionAmount;
      this.orderItemWrk.totalItem = this.total;
      this.orderItemWrk.precoUnitFat = this.unitPriceFat;
      this.orderItemWrk.qtdFat = this.amountItemFat;
      this.orderItemWrk.codOperacErp = this.codOperacErp;
      this.orderItemWrk.pesoUnitario = this.unitWeight;
      if (this.priceObj) {
        this.orderItemWrk.unidadeFat = this.priceObj.unidadeFat;
        this.orderItemWrk.livre1 =
          '{precoObs: "' + this.priceObj.obs + '"' + '}';
      } else {
        this.orderItemWrk.unidadeFat = this.itemSelected.unidade;
      }

      // Ajustar total do pedido
      this.orderWrk.totalItens +=
        this.orderItemWrk.totalItem - this.oldTotalItem;
      this.orderWrk.totalPedido +=
        this.orderItemWrk.totalItem - this.oldTotalItem;
      this.orderWrk.qtdTotal += this.orderItemWrk.qtd - this.oldQtdTotal;
    }
  }

  aditionalViewToggle() {
    this.aditionalsOpened = !this.aditionalsOpened;
  }

  // discount feature
  applyDiscount() {
    if (this.discountObj) {
      this.validateDiscount = this.disableDiscount = false;
      if (this.discountObj.tipoDesconto === 'SUG') {
        if (this.discountObj.descontoPadrao === 'MIN') {
          this.discountPercent = this.discountObj.descontoMin;
        } else {
          this.discountPercent = this.discountObj.descontoMax;
        }
      } else if (this.discountObj.tipoDesconto === 'VAL') {
        this.validateDiscount = true;
      } else {
        this.disableDiscount = true;
        if (this.discountObj.descontoPadrao === 'MIN') {
          this.discountPercent = this.discountObj.descontoMin;
        } else {
          this.discountPercent = this.discountObj.descontoMax;
        }
      }
    }
  }

  async changeDiscount() {
    // chamado quando o usuario alterar o valor do percentual na tela
    if (this.discountPercent < 90) {
      this.errorDiscount = false;
      if (!this.errorDiscount && this.discountObj && this.validateDiscount) {
        if (
          +this.discountPercent > +this.discountObj.descontoMax ||
          +this.discountPercent < +this.discountObj.descontoMin
        ) {
          this.errorDiscount = true;
        }
      }
      if (!this.errorDiscount) {
        await this.totalizeItem();
      }
    } else {
      this.errorDiscount = true;
    }
  }

  async calculeDiscountAmount() {
    // chamado quando o usuario alterar o valor da comissao na tela. Apura o percentual
    this.discountPercent = 0;
    const isNotNull = !!this.discountAmount;
    this.discountAmount = this.formatter.round(
      isNotNull ? this.discountAmount : 0
    );
    if (isNotNull) {
      const totalValue = this.total - this.discountAmount;
      this.discountPercent = +Math.abs(
        (totalValue * 100) / this.total - 100
      ).toFixed(2);
    }
    await this.changeDiscount();
  }

  calculeDiscount() {
    this.discountAmount = 0;
    const isNotNull = !!this.discountPercent;
    if (isNotNull) {
      const amount = this.total * (this.discountPercent / 100);
      this.discountAmount = this.formatter.round(amount);
    }
    this.setTotal(this.total - this.discountAmount);
  }

  applyComission() {
    if (this.comissionObj) {
      this.showComission = this.showAditionals = true;
      this.comissionPercent = this.comissionObj.comissaoPadrao;
    }
  }

  private setUnitPrice(value: number) {
    this.unitPrice = value;
    this.unitPriceFormatted = this.formatter.moneyFormatter(this.unitPrice);
  }
  setSubTotal(value: number) {
    this.subTotal = value;
    this.subTotalFormatted = this.formatter.moneyFormatter(this.subTotal);
  }
  setTotal(value: number) {
    this.total = value;
    this.totalFormatted = this.formatter.moneyFormatter(this.total);
  }
}
