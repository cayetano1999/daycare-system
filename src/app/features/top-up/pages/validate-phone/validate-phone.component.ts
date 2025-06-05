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
import { ApiService } from 'src/app/core/services/api/api.service';
import { CountryService } from 'src/app/core/services/country.service';
import { OperatorService } from 'src/app/core/services/operator.service';
import { BehaviorSubject, take } from 'rxjs';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { TopUpService } from 'src/app/core/services/top-up.service';

export type Operator = {
  country: Country;
  logo: string;
  name: string;
  id: number;
  service: {
    id: number;
    name: string;
  }
}

export type Country = {
  iso_code: string;
  name: string;
  flag: string;
  prefix: string;
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
  private readonly countryService = inject(CountryService);
  private readonly operatorService = inject(OperatorService);
  private readonly alertService = inject(AlertControllerService);
  private readonly topUpService = inject(TopUpService);

  selectedOperator: Operator | null = null;
  selectedDestination: Country | null = null;
  phoneNumber: string = '';
  operators: Operator[] = [];
  countries: Country[] = [];


  contactsList: ContactPayload[] = [];
  contactName: string = '';
  showInputs: boolean = false;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    
  }


  async openOperatorSheet() {
    this.alertService.openModalAlert();

    const showOperatorsModal = async (operators: Operator[]) => {
      const modal = await this.modalController.create({
        component: OperatorsSheetComponent, // Create this component
        breakpoints: [0, 1, 1],
        initialBreakpoint: 1,
        componentProps: {
          operators: operators,
          selectedOperator: this.selectedOperator
        }
      });

      this.alertService.dismiss();
      await modal.present();

      const { data } = await modal.onWillDismiss();
      console.log('data', data);
      if (data) {
        this.selectedOperator = data;
      }
    }

    if (this.operators.length <= 0) {
      this.operatorService.getOperators("1", this.selectedDestination?.iso_code || '').subscribe({
        next: async (operators) => {
          this.operators = operators;
          await showOperatorsModal(operators);
        },
        error: (error) => {
          console.error('Error fetching operators:', error);
          this.alertService.dismiss();
        }
      });
    }
    else {
      await showOperatorsModal(this.operators);
    }
  }

  async openDestinationSheet() {

    this.alertService.openModalAlert();
    const showModal = async (countries: Country[]) => {
      const modal = await this.modalController.create({
        component: DestinationSheetComponent, // Create this component
        breakpoints: [0, 1, 1],
        initialBreakpoint: 1,

        componentProps: {
          destinations: countries,
          selectedDestination: this.selectedDestination
        }
      });
      this.alertService.dismiss();
      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data) {
        this.selectedDestination = data;
        const prefix = this.selectedDestination?.prefix.replace("+", "");
        if(prefix && !this.phoneNumber.startsWith(prefix)) {
         this.phoneNumber = prefix+this.phoneNumber;
        }
        this.selectedOperator = null;
        this.operatorService.getOperators("1", data.iso_code).subscribe({
          next: (operators) => {
            this.operators = operators;
          },
          error: (error) => {
            console.error('Error fetching operators:', error);
          }
        });
      }
    }
    if (this.countries.length <= 0) {
      this.countryService.getCountries().subscribe({
        next: async (countries) => {
          this.countries = countries;
          await showModal(countries);
        }
      })
    }
    else {
      await showModal(this.countries)
    }
  }

  async openContactPicker() {

    if (Capacitor.getPlatform() !== 'web') {

      this.alertService.openModalAlert();
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
      this.alertService.dismiss();
    }


  }

  validatePhoneNumber() {
    if (this.phoneNumber.trim() !== '' && !this.selectedOperator && !this.selectedDestination) {
      this.alertService.openModalAlert();
      this.topUpService.getPhoneLookup(this.phoneNumber).subscribe({
        next: (response: any) => {
          if (!response.errors) {

            this.selectedDestination = response.country;
            this.selectedOperator = {
              id: response.id,
              name: response.name,
              logo: response.logo,
              country: response.country,
              service: response.service
            };
            this.operatorService.getOperators("1", response.country.iso_code).pipe(take(1)).subscribe({
              next: (operators) => {
                this.operators = operators;
                console.log('operators', operators);
              },
              error: (error) => {
                console.error('Error fetching operators:', error);
              }
            })
          }
          this.showInputs = true;

        },
        error: (error) => {
          console.error('Error fetching phone lookup:', error);
        },
        complete: () => {
          this.alertService.dismiss();
        }
      });
    }
  }


  async openContactModal() {
    const modal = await this.modalCtrl.create({
      component: ContactListComponent,
      componentProps: { contactsList: this.contactsList },
      breakpoints: [1, 1, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,

    });

    await modal.present();
    const result = await modal.onDidDismiss();
    const data: ContactPayload = result.data.item;
    if (data) {
      this.phoneNumber = this.cleanString(data.phones?.[0]?.number || '').replace(this.selectedOperator?.country?.prefix || '', '');
      this.contactName = data?.name?.display || data?.name?.given || data?.name?.family || data?.name?.middle || '';

      if (this.contactName === 'Unknown') {
        this.contactName = this.phoneNumber;
      }
      console.log('Selected contact:', data);

    }
  }

  goToSend() {
    this.navCtrl.navigateRoot(RoutesApp.TOP_UP_SEND_TOP_UPS, {
      state: {
        selectedDestination: this.selectedDestination,
        selectedOperator: this.selectedOperator,
        phoneNumber: this.phoneNumber,
        contactName: this.contactName || null
      }
    });
  }

  async ionViewWillEnter() {
    const data = await this.storage.getStorageKey(StorageKeys.TOP_UP_DATA);
    if (data) {
      this.selectedDestination = data.selectedDestination;
      this.selectedOperator = data.selectedOperator;
      this.phoneNumber = data.phoneNumber;
    } else {
      this.selectedDestination = null;
      this.selectedOperator = null;
      this.phoneNumber = '';
    }

    if(this.selectedDestination || this.selectedOperator){
      this.showInputs = true;
    }
  }

  //cicli de vida de inic cuando se abandona la pagina 
  async ionViewWillLeave() {
    await this.storage.removeStorageKey(StorageKeys.TOP_UP_DATA);
  }

  cleanString(value: string): string {
    return value.replace(/[\s()-]/g, '');
  }

}