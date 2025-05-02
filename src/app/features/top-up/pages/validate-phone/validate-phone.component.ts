import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, NavController } from '@ionic/angular';
import { DestinationSheetComponent } from 'src/app/shared/components/destination-sheet/destination-sheet.component';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { OperatorsSheetComponent } from 'src/app/shared/components/operators-sheet/operators-sheet.component';
import { ContactPayload, Contacts } from '@capacitor-community/contacts';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { ContactListComponent } from 'src/app/shared/components/contact-list/contact-list.component';
import { Capacitor } from '@capacitor/core';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

interface Operator {
  id: string;
  name: string;
  icon: string;
}

interface Destination {
  id: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-validate-phone',
  templateUrl: './validate-phone.component.html',
  styleUrls: ['./validate-phone.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, KuidoHeaderComponent]
})
export class ValidatePhoneComponent implements OnInit {
  //Services
  private readonly loadingCtrl = inject(LoadingController);
  private readonly storage = inject(StorageHelper);
  private readonly modalCtrl = inject(ModalController);
  private readonly navCtrl = inject(NavController)

  selectedOperator: Operator | null = null;
  selectedDestination: Destination | null = null;
  phoneNumber: string = '';


  // Example data - Replace with your actual data source
  operators: Operator[] = [
    {
      id: '1',
      name: 'Claro',
      icon: '/assets/img/shared/claro.svg'
    }
    // Add more operators
  ];

  destinations: Destination[] = [
    {
      id: '1',
      name: 'United States',
      flag: '/assets/img/shared/usflag.svg'
    }
    // Add more destinations
  ];
  contactsList: ContactPayload[] = [];

  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  async openOperatorSheet() {
    alert('openOperatorSheet');
    const modal = await this.modalController.create({
      component: OperatorsSheetComponent, // Create this component
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.8,
      componentProps: {
        operators: this.operators,
        selectedOperator: this.selectedOperator
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('data', data);
    if (data) {
      this.selectedOperator = data;
    }
  }

  async openDestinationSheet() {
    const modal = await this.modalController.create({
      component: DestinationSheetComponent, // Create this component
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.8,
      componentProps: {
        destinations: this.destinations,
        selectedDestination: this.selectedDestination
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedDestination = data;
    }
  }

  async openContactPicker() {

    if (Capacitor.getPlatform() !== 'web') {
      
      const loading = await this.loadingCtrl.create({
        message: 'Abriendo Directorio',
      });
      await loading.present();
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
      this.contactsList = result.contacts;
      // }
      console.log('contacts', this.contactsList);
      await this.storage.setStorageKey(StorageKeys.CONTACTS, this.contactsList);

      if (this.contactsList.length > 0) {
        const selectedContact = this.contactsList[0]; // Puedes mostrar una lista para que el usuario elija
        this.openContactModal();
      }
      loading.dismiss();
    }


  }


  async openContactModal() {
    const modal = await this.modalCtrl.create({
      component: ContactListComponent,
      componentProps: { contactsList: this.contactsList },
      breakpoints: [1, 1, 1],
      initialBreakpoint: 0.9
    });

    await modal.present();
    const result = await modal.onDidDismiss();
    const data: ContactPayload = result.data.item;
    if (data) {
      this.phoneNumber = data.phones?.[0]?.number || '';
    }
  }

  goToSend(){
    this.navCtrl.navigateRoot(RoutesApp.TOP_UP_SEND_TOP_UPS)
  }



}