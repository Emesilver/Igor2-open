import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConsultPage } from './consult.page';

describe('ConsultPage', () => {
  let component: ConsultPage;
  let fixture: ComponentFixture<ConsultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
