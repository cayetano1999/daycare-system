import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AddGuestModalComponent } from './add-guests-modal.component';


describe('AddGuestsModalComponent', () => {
  let component: AddGuestModalComponent;
  let fixture: ComponentFixture<AddGuestModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AddGuestModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddGuestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
