import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/models/item';
import { LoaderProvider } from 'src/app/services/loader/loader';
import { User } from 'src/app/models/user';
import { UserProvider } from 'src/app/services/user/user';
import { ItemProvider } from 'src/app/services/item/item';

@Component({
  selector: 'app-consult-items',
  templateUrl: './consult-items.page.html',
  styleUrls: ['./consult-items.page.scss'],
})
export class ConsultItemsPage implements OnInit {

  items: Array<Item> = [];
  itemsRendered: Array<Item> = [];
  pageNumber = 1;

  constructor(
    private loaderProvider: LoaderProvider,
    private userProvider: UserProvider,
    private itemProvider: ItemProvider,

  ) { }

  ngOnInit() {
    this.loaderProvider.show('Carregando produtos...');
    this.userProvider.getUserLocal()
    .then((user) => {
      this.itemProvider.getLocalList()
        .then((items) => {
          this.items = items
          this.itemsRendered = this.paginate(this.items)
          this.loaderProvider.close()
        })
        .catch(() => {
          this.loaderProvider.close()
        })
    })
    .catch(() => {
      this.loaderProvider.close()
    })
  }

  paginate(array: any[]) {
    let pageNumber = this.pageNumber;
    --pageNumber;
    return array.slice(pageNumber * 30, (pageNumber + 1) * 30);
  }

  loadData(event: { target: { complete: () => void; disabled: boolean; }; }) {
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

  filterItems(ev: any) {
    this.itemsRendered = this.items
    const val = ev.target.value
    if (val && val.trim() !== '') {
      const itensTmp = this.itemsRendered.filter((item) => {
        return (item.descricao.toLowerCase().indexOf(val.toLowerCase()) > -1
          || item.codProErp.indexOf(val) > -1);
      })
      this.itemsRendered = itensTmp
    } else {
      this.itemsRendered = this.items
    }
  }


}
