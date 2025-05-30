import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Operator } from 'src/app/features/top-up/pages/validate-phone/validate-phone.component';

@Component({
  selector: 'app-operators-sheet',
  templateUrl: './operators-sheet.component.html',
  styleUrls: ['./operators-sheet.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],

})
export class OperatorsSheetComponent implements OnInit {

  //Services
  private readonly modalCtrl = inject(ModalController)

  @Input() operators: Operator[] = [];
  @Input() selectedOperator: any = null;
  operatorSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  searchTerm: string = '';
  filteredOperators: Operator[] = [];

  ngOnInit() {
    this.filteredOperators = this.getOperatorsCountries();

    // this.filterCountries();
  }

  filterOperators() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOperators = this.getOperatorsCountries().filter(country =>
      country.name.toLowerCase().includes(term)
    );
  }

  getOperatorsCountries(): Operator[] {
    return [...this.operators].sort((a, b) => a.name.localeCompare(b.name));
  }


  selectOperator(operator: any) {
    // Emit the selected operator to the parent component
    this.operatorSelected.emit(operator);
    this.modalCtrl.dismiss(operator)
  }

}
