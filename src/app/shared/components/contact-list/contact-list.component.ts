import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactPayload } from '@capacitor-community/contacts';
import { IonicModule, ModalController } from '@ionic/angular';
import { FestivaHeaderComponent } from '../festiva-header/festiva-header.component';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FestivaHeaderComponent],
})
export class ContactListComponent implements OnInit {
  //services
  private readonly modalCtrl = inject(ModalController);


  @Input() contactsList: ContactPayload[] | any [] = [];
  searchTerm: string = '';
  filteredContacts: ContactPayload[] | any[] = [];


  ngOnInit() {
    // Inicialmente, asignar la lista ordenada a los contactos filtrados
    this.filteredContacts = this.contactsList;
  }

  // Método para filtrar contactos
  filterContacts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contactsList.filter(contact => {
      const name = contact?.name?.display?.toLowerCase() || '';
      const phone = contact?.phones?.[0]?.number?.toLowerCase() || '';
      return name.includes(term) || phone.includes(term);
    });
  }

  selectContact(item: ContactPayload){
    this.modalCtrl.dismiss({item})
  }


  closeModal() {
    this.modalCtrl.dismiss();
  }
}
