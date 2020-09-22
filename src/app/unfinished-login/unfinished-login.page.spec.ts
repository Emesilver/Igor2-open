import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnfinishedLoginPage } from './unfinished-login.page';

describe('UnfinishedLoginPage', () => {
  let component: UnfinishedLoginPage;
  let fixture: ComponentFixture<UnfinishedLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnfinishedLoginPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnfinishedLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
