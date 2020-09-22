import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomErrorPage } from './custom-error.page';

describe('CustomErrorPage', () => {
  let component: CustomErrorPage;
  let fixture: ComponentFixture<CustomErrorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomErrorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomErrorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
