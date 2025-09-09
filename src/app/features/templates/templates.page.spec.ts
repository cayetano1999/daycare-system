import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplatesPage } from './templates.page';

describe('TemplatesPage', () => {
  let component: TemplatesPage;
  let fixture: ComponentFixture<TemplatesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
