import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLimitPage } from './customer-limit.page';

describe('CustomerLimitPage', () => {
  let component: CustomerLimitPage;
  let fixture: ComponentFixture<CustomerLimitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerLimitPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerLimitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
