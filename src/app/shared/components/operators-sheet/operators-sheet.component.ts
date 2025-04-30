import { Component, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-operators-sheet',
  templateUrl: './operators-sheet.component.html',
  styleUrls: ['./operators-sheet.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class OperatorsSheetComponent  implements OnInit {

  //Services
  private readonly modalCtrl = inject(ModalController)

  @Input() operators: any[] = [];
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
