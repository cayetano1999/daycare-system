import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventMembersPage } from './event-members.page';

describe('EventMembersPage', () => {
  let component: EventMembersPage;
  let fixture: ComponentFixture<EventMembersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
