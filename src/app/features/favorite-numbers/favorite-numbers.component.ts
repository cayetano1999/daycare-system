import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule, NavController } from '@ionic/angular';
import { cleanPhoneNumber } from 'src/app/core/constants/constants';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { ContactService } from 'src/app/core/services/contacts.service';
import { ToastControllerService } from 'src/app/core/services/ionic/toast-controller.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
interface FavoritiesContact {
  id?: string;
  name: string;
  phone: string;
  image: string;
  user_id: string;
}

@Component({
  selector: 'app-favorite-numbers',
  templateUrl: './favorite-numbers.component.html',
  styleUrls: ['./favorite-numbers.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, KuidoHeaderComponent]
})
export class FavoriteNumbersComponent implements OnInit {

  private readonly contactService = inject(ContactService)
  private readonly storageHelper = inject(StorageHelper)
  private readonly toastCtrl = inject(ToastControllerService);
  private readonly actionSheet = inject(ActionSheetController);
  private readonly nav = inject(NavController);
  private supabaseService = inject(SupabaseService);

  contacts: FavoritiesContact[] = [

  ];
  phoneSelected!: string;

  constructor() { }

  async ngOnInit() {
    await this.loadContacts();
  }


  async openContactPicker() {
    const contacts = await this.contactService.openContactPicker();
    const contactSelected = await this.contactService.openContactModal(contacts || []);
    console.log(contactSelected);

    //abrir un action sheet con el contacto seleccionado
    const actionSheet = await this.actionSheet.create({
      header: 'Select a phone number',
      subHeader: `Name: ${contactSelected?.name?.display || ''}`,
      buttons: [
        ...(contactSelected?.phones?.map((phone: any) => ({
          text: phone.number,
          handler: async () => {
            // Puedes guardar el número seleccionado aquí si lo necesitas
            // Por ejemplo: this.saveSelectedPhone(phone.number);
            this.phoneSelected = phone.number;
            if (contactSelected && this.phoneSelected) {
              const user = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);

              const newContact: FavoritiesContact = {
                name: contactSelected?.name?.display || contactSelected?.name?.given || contactSelected?.name?.family || contactSelected?.name?.middle || '',
                phone: cleanPhoneNumber(this.phoneSelected) || '',
                image: 'assets/img/shared/avatar-default.svg',
                user_id: user.id || '', // Aquí debes asignar el user_id correspondiente
              }

              const { data, error } = await this.supabaseService.createRecord('favorite_numbers', newContact);
              if (error) {
                await this.toastCtrl.showToastError('Error saving contact');
                return;
              }

              await this.toastCtrl.showToastSuccess('Contact saved', 2000);
              this.loadContacts();
            }
          }
        })) || []),
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();


  }

  async loadContacts() {

    const user = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    const { data, error } = await this.supabaseService.getRecords('favorite_numbers', ['id', 'name', 'phone', 'image'], 'user_id', user.id);
    if (error) {
      // await this.toastCtrl.showToastError('Error loading contacts');
      this.contacts = [];
      return;
    }
    this.contacts = data as any;
  }

  editContact(contact: any) {
    console.log('Editar contacto:', contact);
    // Lógica para editar
  }

  async deleteContact(contact: any) {
    // Lógica para eliminar
    const {data, error} = await this.supabaseService.deleteRecord('favorite_numbers', contact.id);
    if (error) {
      await this.toastCtrl.showToastError('Error deleting contact');
      return;
    }
    await this.toastCtrl.showToastSuccess('Contact deleted', 2000);
    this.loadContacts();
  }

  async actionsForContact(contact: any) {
    console.log('Acciones para el contacto:', contact);
    // Lógica para las acciones del contacto

    //aqui debe aparecer un action sheet con las opciones de "Recargar", "Eliminar contacto" en ingles

    const actionSheet = await this.actionSheet.create({
      header: 'Actions for Contact',
      buttons: [
        {
          text: `Top Up to ${contact.name}`,
          handler: () => {
            console.log('Recargar contacto:', contact);
            this.nav.navigateRoot('/top-up/validate-phone', { state: { phone: contact.phone } });
          }
        },
        {
          text: 'Delete Contact',
          handler: async () => {
            console.log('Eliminar contacto:', contact);
            await this.deleteContact(contact);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

}
