import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventScannerPage } from './event-scanner.page';

describe('EventScannerPage', () => {
  let component: EventScannerPage;
  let fixture: ComponentFixture<EventScannerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventScannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
