import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddTableModalComponent } from './add-table-modal.component';

describe('AddTableModalComponent', () => {
  let component: AddTableModalComponent;
  let fixture: ComponentFixture<AddTableModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AddTableModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
