import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Operator } from 'src/app/features/top-up/pages/validate-phone/validate-phone.component';

@Component({
  selector: 'app-operators-sheet',
  templateUrl: './operators-sheet.component.html',
  styleUrls: ['./operators-sheet.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class OperatorsSheetComponent  implements OnInit {

  //Services
  private readonly modalCtrl = inject(ModalController)

  @Input() operators: Observable<Operator[]> = new Observable<Operator[]>();
  @Input() selectedOperator: any = null;
  operatorSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  selectOperator(operator: any) {
    // Emit the selected operator to the parent component
    this.operatorSelected.emit(operator);
    this.modalCtrl.dismiss(operator)
  }

}
