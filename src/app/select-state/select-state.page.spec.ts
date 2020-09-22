import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectStatePage } from './select-state.page';

describe('SelectStatePage', () => {
  let component: SelectStatePage;
  let fixture: ComponentFixture<SelectStatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectStatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectStatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
