import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AuthorizedPersonManagementPage } from './authorized-person-management.page';

describe('AuthorizedPersonManagementPage', () => {
  let component: AuthorizedPersonManagementPage;
  let fixture: ComponentFixture<AuthorizedPersonManagementPage>;  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorizedPersonManagementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizedPersonManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
