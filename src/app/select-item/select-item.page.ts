import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { Item } from '../models/item';
import { LoaderProvider } from '../services/loader/loader';
import { UserProvider } from '../services/user/user';
import { ItemProvider } from '../services/item/item';
import { ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { CustomHttpProvider } from '../services/custom-http/custom-http';
import { CustomStorageProvider } from '../services/custom-storage/custom-storage';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.page.html',
  styleUrls: ['./select-item.page.scss'],
})
export class SelectItemPage implements OnInit {
  user: User;
  pageNumber = 1;
  items: Array<Item> = [];
  itemsRendered: Array<Item> = [];
  itemsPrincipais: Array<Item> = [];
  itemsPrincipaisRendered: Array<Item> = [];
  codCliErp: string;
  constructor(
    private loaderProvider: LoaderProvider,
    private userProvider: UserProvider,
    private itemProvider: ItemProvider,
    private modalController: ModalController,
    private navParams: NavParams,
  ) {
    this.init();
  }

  ngOnInit() {
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

    this.items = await this.itemProvider.getLocalList();

    if (this.codCliErp) {
      this.items = this.items.filter((record) => {
        return (record.codCliErp === this.codCliErp || record.codCliErp === '');
      });
    }

    this.loaderProvider.close();
    this.itemsRendered = this.paginate(this.items);
    this.itemsPrincipaisRendered = this.itemsPrincipais;
  }

  getItems(ev: any) {
    // no filtro zera os itensPrincipais
    this.itemsPrincipaisRendered = [];
    let filtered = this.items;
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      filtered = filtered.filter((item) => {
        return (item.descricao.toLowerCase().indexOf(val.toLowerCase()) > -1
          || item.codProErp.indexOf(val) > -1);
      });
    } else {
      // retorna os itens principais quando limpa o filtro
      this.itemsPrincipaisRendered = this.itemsPrincipais;
    }
    this.itemsRendered = filtered;
  }

  select(item) {
    this.modalController.dismiss({ item });
  }

  close() {
    this.modalController.dismiss({ item: null });
  }

  paginate(array) {
    let pageNumber = this.pageNumber;
    --pageNumber;
    return array.slice(pageNumber * 30, (pageNumber + 1) * 30);
  }

  loadData(event) {
    setTimeout(() => {
      this.pageNumber++;
      const dataPage = this.paginate(this.items);
      for (const dataItem of dataPage) {
        this.itemsRendered.push(dataItem);
      }
      event.target.complete();
      if (this.itemsRendered.length === this.items.length) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
