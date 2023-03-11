import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/models/item';
import { LoaderProvider } from 'src/app/services/loader/loader';
import { ItemProvider } from 'src/app/services/item/item';

@Component({
  selector: 'app-consult-items',
  templateUrl: './consult-items.page.html',
  styleUrls: ['./consult-items.page.scss'],
})
export class ConsultItemsPage implements OnInit {
  allItems: Item[] = [];
  itemsFiltered: Item[] = [];
  itemsRendering: Item[] = [];
  pageNumber = 1;

  constructor(
    private loaderProvider: LoaderProvider,
    private itemProvider: ItemProvider
  ) {}

  async ngOnInit() {
    this.loaderProvider.show('Carregando produtos...');
    this.allItems = await this.itemProvider.getLocalList();
    this.itemsFiltered = this.allItems.slice(0, this.allItems.length);
    this.itemsRendering = this.paginate(1, this.allItems);
    this.loaderProvider.close();
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

  filterItems(text: string) {
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
}
