import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Country } from 'src/app/core/models/country.type';

@Component({
  selector: 'app-destination-sheet',
  templateUrl: './destination-sheet.component.html',
  styleUrls: ['./destination-sheet.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class DestinationSheetComponent implements OnInit {
  private readonly modalCtrl = inject(ModalController);

  @Input() destinations: Country[] = [];
  @Input() countrySelected: Country | null = null;
  @Input() selectedDestination: any = null;
  destinationSelected: EventEmitter<any> = new EventEmitter();

  searchTerm: string = '';
  filteredCountries: Country[] = [];

  ngOnInit() {
    this.filteredCountries = this.getSortedCountries();

    // this.filterCountries();
  }

  filterCountries() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCountries = this.getSortedCountries().filter(country =>
      country.name.toLowerCase().includes(term)
    );
  }

  getSortedCountries(): Country[] {
    return [...this.destinations].sort((a, b) => a.name.localeCompare(b.name));
  }

  selectDestination(destination: any) {
    this.destinationSelected.emit(destination);
    this.modalCtrl.dismiss(destination);
  }
}
