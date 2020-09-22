import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectItemPage } from './select-item.page';

describe('SelectItemPage', () => {
  let component: SelectItemPage;
  let fixture: ComponentFixture<SelectItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
