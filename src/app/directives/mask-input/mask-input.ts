import { Directive, Input, HostListener } from '@angular/core';

/**
 * Generated class for the MaskInputDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[mask]'
})
export class MaskInput {

  constructor() {
  }

  @Input('mask') mask: string;
  @HostListener('keyup', ['$event'])
  @HostListener('blur', ['$event'])

  inputChanged(event: any): void {
    if (event.target.value) {
      if (event.key == 'Backspace')
        return;

      if (this.mask == 'money') {
        event.target.value = this.moneyMask(event.target.value);
        return;
      }
      if (this.mask == 'money-no-cents') {
        event.target.value = this.moneyNoCentsMask(event.target.value);
        return;
      }
      if (this.mask == 'document') {
        event.target.value = this.setDocumentMask(event);
        return;
      }
      if (this.mask == 'telephone') {
        event.target.value = this.setTelephoneMask(event);
        return;
      }

      event.target.value = this.setMask(event, this.mask)
    }
  }

  inputOnblur(event: any): void {
    if (this.mask == 'money') {
      event.target.value = this.moneyMask(event.target.value);
      return;
    }
    if (this.mask == 'money-no-cents') {
      event.target.value = this.moneyNoCentsMask(event.target.value);
      return;
    }
    if (this.mask == 'document') {
      event.target.value = this.setDocumentMask(event);
      return;
    }
    if (this.mask == 'telephone') {
      event.target.value = this.setTelephoneMask(event);
      return;
    }

    event.target.value = this.setMask(event, this.mask)
  }


  private setMask(event: any, mask: string): string {
    event.target.maxLength = mask.length;

    let value: string = event.target.value;
    let lengthValueSub1: number = value.length - 1;

    let newValue: string = value;
    let currentChar: string = value.charAt(lengthValueSub1);
    let currentCharMask: string = mask.charAt(lengthValueSub1);

    switch (currentCharMask) {
      case '0':
        if (!currentChar.match(/\d/)) {
          newValue = value.substr(0, lengthValueSub1);
        }
        break;

      case 'A':
        if (!currentChar.match(/([A-Z])/)) {
          newValue = value.substr(0, lengthValueSub1);
        }
        break;

      case 'a':
        if (!currentChar.match(/([a-z])/)) {
          newValue = value.substr(0, lengthValueSub1);
        }
        break;

      case 'x':
        if (!currentChar.match(/([a-zA-Z])/)) {
          newValue = value.substr(0, lengthValueSub1);
        }
        break;

      case '#':
        break;

      default:
        newValue = value.substr(0, lengthValueSub1);

        let maskChar: string = currentCharMask;
        let nextMaskChar: string = '';
        let c: number = 0;
        while (maskChar != '0' && maskChar != '#' && maskChar != 'A' && maskChar != 'a' && maskChar != 'x') {
          c++;
          nextMaskChar = mask.charAt(lengthValueSub1 + c);
          newValue += maskChar;
          maskChar = nextMaskChar;
        }

        if (nextMaskChar == '0') {
          if (currentChar.match(/\d/)) {
            newValue += currentChar;
          }
        }
        else if (nextMaskChar == 'A') {
          if (currentChar.match(/([A-Z])/)) {
            newValue += currentChar;
          }
        }
        else if (nextMaskChar == 'a') {
          if (currentChar.match(/([a-z])/)) {
            newValue += currentChar;
          }
        }
        else if (nextMaskChar == 'x') {
          if (currentChar.match(/([a-zA-Z])/)) {
            newValue += currentChar;
          }
        }
        else {
          newValue += currentChar;
        }

        break;
    }
    return newValue;
  }

  private setDocumentMask(event: any) {
    let value: string = event.target.value;
    if (value.length > 14) {
      event.target.maxLength = 18;
      return this.cnpj(value);
    } else {
      event.target.maxLength = 15;
      return this.cpf(value);
    }
  }

  private cnpj(v: string) {
    v = v.replace(/\D/g, '')
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
    return v
  }

  private cpf(v: string) {
    v = v.replace(/\D/g, '')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    return v
  }

  private setTelephoneMask(event: any) {
    event.target.maxLength = 15;
    return this.tel(event.target.value);
  }

  private tel(v: string) {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.length > 14 ?
      v.replace(/(\d)(\d{5})$/, "$1-$2") :
      v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v;
  }

  private moneyMask(v: any): string {
    v = v.replace(/[^0-9]/g, '');
    v = v.replace(/([0-9]{2})$/g, ',$1');
    return v;
  }
  private moneyNoCentsMask(v: any): string {
    v = v.replace(',00', '');
    v = v.replace(/[^0-9]/g, '');
    v += ',00';
    return v;
  }

}