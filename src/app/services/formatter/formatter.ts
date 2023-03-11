import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormatterProvider {
  moneyFormatter(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
  round(value: number) {
    return Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
  }
}
