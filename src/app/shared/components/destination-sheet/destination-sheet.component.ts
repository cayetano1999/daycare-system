import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Country } from 'src/app/features/top-up/pages/validate-phone/validate-phone.component';

@Component({
  selector: 'app-destination-sheet',
  templateUrl: './destination-sheet.component.html',
  styleUrls: ['./destination-sheet.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DestinationSheetComponent implements OnInit {

  //Services
  private readonly modalCtrl = inject(ModalController)

  @Input() destinations: Observable<Country[]> = new Observable<Country[]>();
  @Input() selectedDestination: any = null;
  destinationSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  selectDestination(destination: any) {
    // Emit the selected operator to the parent component
    this.destinationSelected.emit(destination);
    this.modalCtrl.dismiss(destination)
  }
}
