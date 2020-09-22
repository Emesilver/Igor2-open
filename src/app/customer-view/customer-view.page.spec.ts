import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerViewPage } from './customer-view.page';

describe('CustomerViewPage', () => {
  let component: CustomerViewPage;
  let fixture: ComponentFixture<CustomerViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerViewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
