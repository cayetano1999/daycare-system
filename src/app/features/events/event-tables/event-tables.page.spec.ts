import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventTablesPage } from './event-tables.page';

describe('EventTablesPage', () => {
  let component: EventTablesPage;
  let fixture: ComponentFixture<EventTablesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTablesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
