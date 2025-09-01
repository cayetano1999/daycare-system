import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventManagementPage } from './event-management.page';

describe('EventManagementPage', () => {
  let component: EventManagementPage;
  let fixture: ComponentFixture<EventManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
