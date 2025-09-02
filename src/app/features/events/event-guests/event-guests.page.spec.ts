import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventGuestsPage } from './event-guests.page';

describe('EventGuestsPage', () => {
  let component: EventGuestsPage;
  let fixture: ComponentFixture<EventGuestsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventGuestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
