import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemFormPage } from './order-item-form.page';

describe('OrderItemFormPage', () => {
  let component: OrderItemFormPage;
  let fixture: ComponentFixture<OrderItemFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderItemFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderItemFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
