import { Injectable } from '@angular/core';
import { cities } from './cities';
import { states } from './states';

@Injectable({
  providedIn: 'root'
})
export class CityStateProvider {

  constructor() {

  }

  getStates() {
    return states;
  }

  getCitiesByUf(ufId) {
    return cities.filter(x => x.state === ufId);
  }
}
