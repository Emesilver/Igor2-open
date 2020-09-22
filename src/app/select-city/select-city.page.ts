import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CityStateProvider } from '../services/city-state/city-state';
import { LoaderProvider } from '../services/loader/loader';

@Component({
  selector: 'app-select-city',
  templateUrl: './select-city.page.html',
  styleUrls: ['./select-city.page.scss'],
})
export class SelectCityPage implements OnInit {

  pageNumber = 1;
  cities: Array<any>;
  citiesRendered: Array<any>;
  state: any;

  constructor(
    private modalController: ModalController,
    private cityStateProvider: CityStateProvider,
    private navParams: NavParams,
    private loaderProvider: LoaderProvider,
  ) {
    this.state = this.navParams.get('state')
  }

  async ngOnInit() {
    await this.loaderProvider.show('Carregando cidades...');
    this.cities = await this.cityStateProvider.getCitiesByUf(this.state);
    this.citiesRendered = this.paginate(this.cities);
    await this.loaderProvider.close();
  }

  paginate(array) {
    let pageNumber = this.pageNumber;
    --pageNumber;
    return array.slice(pageNumber * 30, (pageNumber + 1) * 30);
  }

  loadData(event) {
    setTimeout(() => {
      this.pageNumber++;
      const moreData = this.paginate(this.cities);
      for (var index in moreData){
        this.citiesRendered.push(moreData[index]);
      }
      event.target.complete();
      if (this.citiesRendered.length === this.cities.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  selected(city) {
    this.modalController.dismiss({ city: city });
  }

  close() {
    this.modalController.dismiss({ city: null });
  }

  getItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.citiesRendered = this.cities.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.pageNumber = 1;
      this.citiesRendered = this.paginate(this.cities);
    }
  }
}
