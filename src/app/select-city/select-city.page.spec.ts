import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCityPage } from './select-city.page';

describe('SelectCityPage', () => {
  let component: SelectCityPage;
  let fixture: ComponentFixture<SelectCityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCityPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
