import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateTicketModalComponent } from './create-ticket-modal.component';

describe('CreateTicketModalComponent', () => {
  let component: CreateTicketModalComponent;
  let fixture: ComponentFixture<CreateTicketModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CreateTicketModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTicketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
