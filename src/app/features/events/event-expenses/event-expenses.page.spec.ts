import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventExpensesPage } from './event-expenses.page';

describe('EventExpensesPage', () => {
  let component: EventExpensesPage;
  let fixture: ComponentFixture<EventExpensesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
