import { Component, OnInit } from '@angular/core';
import { CityStateProvider } from '../services/city-state/city-state';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-select-state',
  templateUrl: './select-state.page.html',
  styleUrls: ['./select-state.page.scss'],
})
export class SelectStatePage implements OnInit {
  states: Array<any> = [];
  constructor(
    private cityStateProvider: CityStateProvider,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.states = this.cityStateProvider.getStates();
  }

  selected(state) {
    this.modalController.dismiss({ state: state });
  }

  close() {
    this.modalController.dismiss({ state: null });
  }
}
