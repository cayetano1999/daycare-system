import { inject, Injectable } from "@angular/core";
import { ContactPayload, Contacts } from "@capacitor-community/contacts";
import { Capacitor } from "@capacitor/core";
import { StorageHelper } from "../helpers/storage.helper";
import { StorageKeys } from "../enums/storage.keys.enum";
import { ModalController } from "@ionic/angular";
import { ContactListComponent } from "src/app/shared/components/contact-list/contact-list.component";



@Injectable({
    providedIn: 'root'
})

export class ContactService {

    private readonly storageHelper = inject(StorageHelper);
    private readonly modalCtrl = inject(ModalController)

    constructor() {

    }

    async openContactPicker() {
        if (Capacitor.getPlatform() !== 'web') {

            const projection = {
                name: true,
                phones: true,
                postalAddresses: true,
            };
            const result = await Contacts.getContacts(
                {
                    projection
                }
            );
            return result.contacts;
        }
        else {
            return [];
        }
    }

    async getFavorities() {
        return await this.storageHelper.getStorageKey(StorageKeys.FAVORITIES_NUMBER) || []
    }

    async addFavoriteNumber(contact: any) {
        const favorities: any[] = await this.storageHelper.getStorageKey(StorageKeys.FAVORITIES_NUMBER) || []
        favorities.push(contact);
        await this.storageHelper.setStorageKey(StorageKeys.FAVORITIES_NUMBER, favorities);

    }

    async openContactModal(contactList: any) {
        const modal = await this.modalCtrl.create({
            component: ContactListComponent,
            componentProps: { contactsList: contactList },
            breakpoints: [1, 1, 1],
            initialBreakpoint: 1,
            backdropDismiss: true,
            canDismiss: true,

        });

        await modal.present();
        const result = await modal.onDidDismiss();
        const data: ContactPayload = result.data.item;
        return data || null;
    }



}