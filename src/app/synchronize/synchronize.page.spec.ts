import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SynchronizePage } from './synchronize.page';

describe('SynchronizePage', () => {
  let component: SynchronizePage;
  let fixture: ComponentFixture<SynchronizePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SynchronizePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SynchronizePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
