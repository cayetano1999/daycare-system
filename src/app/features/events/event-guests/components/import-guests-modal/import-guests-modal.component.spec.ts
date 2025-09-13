import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImportGuestsModalComponent } from './import-guests-modal.component';


describe('AddGuestsModalComponent', () => {
  let component: ImportGuestsModalComponent;
  let fixture: ComponentFixture<ImportGuestsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ImportGuestsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportGuestsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
