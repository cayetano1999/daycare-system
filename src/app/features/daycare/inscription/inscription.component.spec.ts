import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InscriptionPage } from './inscription.page';
import { InscriptionComponent } from 'src/app/shared/daycare/inscription/inscription.component';

describe('InscriptionPage', () => {
  let component: InscriptionPage;
  let fixture: ComponentFixture<InscriptionPage>; 
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InscriptionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
