import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FormatterProvider {

    constructor() { }

    moneyFormatter(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    round(value) {
        return Math.round(value * Math.pow(10, 2)) / Math.pow(10, 2);
    }
}