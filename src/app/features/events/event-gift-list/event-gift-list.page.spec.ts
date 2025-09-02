import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventGiftListPage } from './event-gift-list.page';

describe('EventGiftListPage', () => {
  let component: EventGiftListPage;
  let fixture: ComponentFixture<EventGiftListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventGiftListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
