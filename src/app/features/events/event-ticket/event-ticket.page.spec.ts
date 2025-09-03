import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventTicketPage } from './event-ticket.page';

describe('EventTicketPage', () => {
  let component: EventTicketPage;
  let fixture: ComponentFixture<EventTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
