import { Component } from '@angular/core';
import { User } from '../models/user';
import { Item } from '../models/item';
import { LoaderProvider } from '../services/loader/loader';
import { UserProvider } from '../services/user/user';
import { ItemProvider } from '../services/item/item';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.page.html',
  styleUrls: ['./select-item.page.scss'],
})
export class SelectItemPage {
  user!: User;
  pageNumber = 1;

  allItems: Item[] = [];
  itemsFiltered: Item[] = [];
  itemsRendering: Item[] = [];

  itemsPrincipais: Array<Item> = [];
  itemsPrincipaisRendered: Array<Item> = [];
  codCliErp!: string;
  constructor(
    private loaderProvider: LoaderProvider,
    private userProvider: UserProvider,
    private itemProvider: ItemProvider,
    private modalController: ModalController,
    private navParams: NavParams
  ) {
    this.init();
  }

  async init() {
    this.loaderProvider.show('Carregando produtos...');
    this.codCliErp = this.navParams.get('codCliErp');

    this.user = await this.userProvider.getUserLocal();

    this.itemsPrincipais = await this.itemProvider.getMainItens();

    if (this.codCliErp) {
      this.itemsPrincipais = this.itemsPrincipais.filter((record) => {
        return record.codCliErp === this.codCliErp;
      });
    }

    this.allItems = await this.itemProvider.getLocalList();
    if (this.codCliErp) {
      this.allItems = this.allItems.filter((item) => {
        return item.codCliErp === '' || item.codCliErp === this.codCliErp;
      });
    }
    this.itemsFiltered = this.allItems;

    this.loaderProvider.close();
    this.itemsRendering = this.paginate(1, this.itemsFiltered);
    this.itemsPrincipaisRendered = this.itemsPrincipais;
  }

  filterItems(text: string) {
    // no filtro zera os itensPrincipais
    this.itemsPrincipaisRendered = [];
    this.pageNumber = 1;
    const minChars = 2;
    if (text && text.trim() !== '' && text.length >= minChars) {
      this.itemsFiltered = this.allItems.filter((item) => {
        const textLC = text.toLocaleLowerCase();
        const itemDescLC = item.descricao.toLocaleLowerCase();
        return (
          textLC.split(' ').every((word) => itemDescLC.indexOf(word) > -1) ||
          item.codProErp.indexOf(text) > -1
        );
      });
    } else {
      this.itemsFiltered = this.allItems;
    }
    this.itemsRendering = this.paginate(this.pageNumber, this.itemsFiltered);
  }

  select(item: Item) {
    this.modalController.dismiss({ item });
  }

  close() {
    this.modalController.dismiss({ item: null });
  }

  private paginate(page: number, items: Item[]) {
    return items.slice(page * 30 - 30, page * 30);
  }

  loadData(event: { target: { complete: () => void; disabled: boolean } }) {
    setTimeout(() => {
      this.pageNumber++;
      this.itemsRendering = this.itemsRendering.concat(
        this.paginate(this.pageNumber, this.itemsFiltered)
      );
      event.target.complete();

      if (this.itemsRendering.length === this.itemsFiltered.length) {
        event.target.disabled = true;
      }
    }, 300);
  }
}
