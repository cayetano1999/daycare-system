import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { KuidoSocialLoginComponent } from './kuido-social-login.component';

describe('KuidoSocialLoginComponent', () => {
  let component: KuidoSocialLoginComponent;
  let fixture: ComponentFixture<KuidoSocialLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KuidoSocialLoginComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(KuidoSocialLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
