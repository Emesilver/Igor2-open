import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftsListPage } from './drafts-list.page';

describe('DraftsListPage', () => {
  let component: DraftsListPage;
  let fixture: ComponentFixture<DraftsListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftsListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
