import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuestVerificationPage } from './guest-verification.page';

describe('GuestVerificationPage', () => {
  let component: GuestVerificationPage;
  let fixture: ComponentFixture<GuestVerificationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestVerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
