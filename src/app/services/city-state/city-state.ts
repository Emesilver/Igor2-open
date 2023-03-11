import { Injectable } from '@angular/core';
import { cities } from './cities';
import { states } from './states';

export interface IState {
  id: string,
  initials: string,
  name: string,
}

@Injectable({
  providedIn: 'root'
})
export class CityStateProvider {

  constructor() {

  }

  getStates(): IState[] {
    return states;
  }

  getCitiesByUf(ufId: string) {
    return cities.filter(x => x.state === ufId);
  }
}
