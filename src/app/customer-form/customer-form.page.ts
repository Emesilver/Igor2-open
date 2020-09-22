import { SelectCityPage } from './../select-city/select-city.page';
import { SelectStatePage } from './../select-state/select-state.page';
import { Component, OnInit } from '@angular/core';
import { Customer } from '../models/customer';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppState } from '../app.global';
import { CustomerProvider } from '../services/customer/customer';
import { ToastProvider } from '../services/toast/toast';
import { UserProvider } from '../services/user/user';
import { CityStateProvider } from '../services/city-state/city-state';
import { ModalController } from '@ionic/angular';
import { LoaderProvider } from '../services/loader/loader';
import { isValidCpf } from '../../validation/validateCpf';
import { isValidCnpj } from '../../validation/validateCnpj';
import { User } from '../models/user';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.page.html',
  styleUrls: ['./customer-form.page.scss'],
})
export class CustomerFormPage implements OnInit {
  customer: Customer;
  customerForm: FormGroup;
  submitAttempt = false;
  validDocument = true;
  user: User;
  stateName: string;
  stateId: string;
  cityName: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private global: AppState,
    private customerProvider: CustomerProvider,
    private toastProvider: ToastProvider,
    private userProvider: UserProvider,
    private modalController: ModalController,
    private loaderProvider: LoaderProvider
  ) {

    this.customerForm = this.formBuilder.group({
      idEmp: [''],
      codRepErp: [''],
      codCliErp: [''],
      cpfCnpj: ['', [Validators.required]],
      razao: [''],
      fantasia: ['', [Validators.required]],
      contato1: ['', [Validators.required]],
      foneContato1: ['', [Validators.required]],
      foneCli: ['', [Validators.required]],
      cep: [''],
      uf: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      endereco: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      emailCli: [''],
      emailFin: [''],
      emailFis: [''],
      rede: [''],
      obs: [''],
      cliGuid: ['']
    });
    // Passing parameters by state works fine as well
    if (this.router.getCurrentNavigation().extras.state) {
      this.customer = this.router.getCurrentNavigation().extras.state.customer;
    }

    if (this.customer) {
      this.customerForm.patchValue(this.customer);
      if (this.customer.uf) {
        this.stateName = this.customer.uf;
      }
      if (this.customer.cidade) {
        this.cityName = this.customer.cidade;
      }
    }
  }

  async ngOnInit() {
    this.user = await this.userProvider.getUserLocal();
  }

  // Valida formulário e enviar para API
  async save() {
    this.validate();
    if (this.customerForm.valid && this.validDocument) {
      this.loaderProvider.show('Enviando cadastro...');
      try {
        await this.customerProvider.saveCustomer(this.customerForm.value);
        this.router.navigate(['/customer-list']);
      } catch (error) {
      }
      this.loaderProvider.close();
    }
  }

  // Valida formulário sem enviar
  async validate() {
    this.submitAttempt = true;

    this.validateDocument();

    if (this.customerForm.valid && this.validDocument) {
      this.validDocument = true;
      this.toastProvider.show('Cliente validado com sucesso');
    }
    let saveDraft = false;
    for (const propertyName in this.customerForm.controls) {
      if (propertyName === 'cliGuid' ||
        propertyName === 'idEmp' ||
        propertyName === 'codRepErp' ||
        propertyName === 'codCliErp'
      ) { continue; }

      const value = this.customerForm.controls[propertyName].value;

      if (value && value !== '') {
        saveDraft = true;
        break;
      }
    }
    if (saveDraft) {
      this.saveOnBlur({ value: 1 });
    }
  }


  async saveOnBlur(event) {
    if (event.target && (event.target.value && event.target.value !== '')) {
      const c: any = await this.customerProvider.saveDraft(this.customerForm.value);
      const idEmp = this.global.getProperty('idEmp');
      const codRepErp = this.user.currentCompany.codRepErp;
      //      this.customerForm.patchValue({ cliGuid: c.cliGuid, codRepErp: codRepErp, idEmp: idEmp });
      this.customerForm.patchValue({ cliGuid: c.cliGuid, codRepErp, idEmp });
    }
  }


  async openStatePage() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: SelectStatePage,
    });
    modal.present();
    modal.onDidDismiss().then((response) => {
      if (response.data.state != null && this.customerForm.value.uf !== response.data.state.initials) {
        this.stateName = response.data.state.initials;
        this.stateId = response.data.state.id;
        this.cityName = '';
        this.customerForm.patchValue({ cidade: this.cityName, uf: this.stateName });
        this.saveOnBlur({ value: 1 });
      }
    });
  }

  async openCityPage() {
    if (this.stateId) {
      const modal: HTMLIonModalElement = await this.modalController.create({
        component: SelectCityPage,
        componentProps: {
          state: this.stateId
        }
      });

      modal.onDidDismiss().then((response) => {
        if (response.data.city != null && this.customerForm.value.cidade !== response.data.city.name) {
          this.cityName = response.data.city.name;
          this.customerForm.patchValue({ cidade: this.cityName });
          this.saveOnBlur({ value: 1 });
        }
      });
      await modal.present();
    }
  }

  validateDocument() {
    if (this.customerForm.value.cpfCnpj) {
      if (!isValidCpf(this.customerForm.value.cpfCnpj) &&
        !isValidCnpj(this.customerForm.value.cpfCnpj)
      ) {
        this.validDocument = false;
      } else {
        this.validDocument = true;
      }
    }
  }
}
