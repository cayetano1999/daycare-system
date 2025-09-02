import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalGroupComponent } from './modal-group.component';

describe('ModalGroupComponent', () => {
  let component: ModalGroupComponent;
  let fixture: ComponentFixture<ModalGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
