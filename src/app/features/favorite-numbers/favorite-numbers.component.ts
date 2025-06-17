import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { ContactService } from 'src/app/core/services/contacts.service';
import { ToastControllerService } from 'src/app/core/services/ionic/toast-controller.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
interface FavoritiesContact {
  id: number;
  name: string;
  phone: string;
  image: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-favorite-numbers',
  templateUrl: './favorite-numbers.component.html',
  styleUrls: ['./favorite-numbers.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, KuidoHeaderComponent]
})
export class FavoriteNumbersComponent  implements OnInit {

  private readonly contactService = inject(ContactService)
  private readonly storageHelper = inject(StorageHelper)
  private readonly toastCtrl = inject(ToastControllerService)

  contacts: FavoritiesContact[] = [
    {
      id: 1,
      name: 'Kathya Yu',
      phone: '(+84) 984 943 432',
      image: 'assets/img/shared/person.svg',
      isFavorite: true,
    },
    {
      id: 2,
      name: 'Arlene McCoy',
      phone: '(307) 555-0133',
      image: 'assets/img/shared/profile.svg',
      isFavorite: false,
    }
  ];

  constructor() { }

  async ngOnInit() {
   await this.loadContacts();
  }

  async openContactPicker(){
    const contacts = await this.contactService.openContactPicker();
    const contactSelected = await this.contactService.openContactModal(contacts || []);
    console.log(contactSelected);

    if(contactSelected) {

      const newContact: FavoritiesContact = {
        id: +contactSelected.contactId,
        name: contactSelected?.name?.display || contactSelected?.name?.given || contactSelected?.name?.family || contactSelected?.name?.middle || '',
        phone: contactSelected?.phones?.[0]?.number || '',
        image: 'assets/img/shared/avatar-default.svg',
        isFavorite: true
      }
      const favorities: any[] = await this.storageHelper.getStorageKey(StorageKeys.FAVORITIES_NUMBER) || [];
      favorities.push(newContact);
      await this.storageHelper.setStorageKey(StorageKeys.FAVORITIES_NUMBER,favorities);
      await this.toastCtrl.showToastSuccess('Contact saved', 2000);
      this.loadContacts();
    }

  }

  async loadContacts() {
     this.contacts = await this.storageHelper.getStorageKey(StorageKeys.FAVORITIES_NUMBER) || [];
  }

  editContact(contact: any) {
  console.log('Editar contacto:', contact);
  // Lógica para editar
}

deleteContact(contact: any) {
  console.log('Eliminar contacto:', contact);
  // Lógica para eliminar
}

}
