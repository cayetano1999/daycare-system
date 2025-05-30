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
  private readonly apiService = inject(ApiService);
  private readonly countryService = inject(CountryService);
  private readonly operatorService = inject(OperatorService);
  private readonly alertService = inject(AlertControllerService);

  selectedOperator: Operator | null = null;
  selectedDestination: Country | null = null;
  phoneNumber: string = '';
  operators$: BehaviorSubject<Operator[]> = new BehaviorSubject<Operator[]>([]);

  // Example data - Replace with your actual data source
  // operators$: this.operatorService.getOperators();
  countries$ = this.countryService.getCountries(); // Replace with your actual data source
  // data$ = combineLatest({
  //   countries: this.countryService.getCountries(),
  // })
  // countries = this.countryService.getCountries(); // Replace with your actual data source
  contactsList: ContactPayload[] = [];
  contactName: string = '';
  showInputs: boolean = false;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  async openOperatorSheet() {
    this.alertService.openModalAlert();

    this.operators$.subscribe({
      next: async (operators) => {
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
      },
      error: (err) => {
        console.error('Error fetching operators:', err);
      }
    })


  }

  async openDestinationSheet() {

    //      const modal = await this.modalController.create({
    //           component: DestinationSheetComponent, // Create this component
    //           breakpoints: [0, 1, 1],
    //           initialBreakpoint: 1,

    //           componentProps: {
    //             destinations: [
    //     {
    //         "iso_code": "PHL",
    //         "name": "Philippines",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ph.png",
    //         "prefix": "+63"
    //     },
    //     {
    //         "iso_code": "VCT",
    //         "name": "Saint Vincent and the Grenadines",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/vc.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "SLV",
    //         "name": "El Salvador",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/sv.png",
    //         "prefix": "+503"
    //     },
    //     {
    //         "iso_code": "BWA",
    //         "name": "Botswana",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bw.png",
    //         "prefix": "+267"
    //     },
    //     {
    //         "iso_code": "ANT",
    //         "name": "Netherlands Antilles",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/an.png",
    //         "prefix": "+599"
    //     },
    //     {
    //         "iso_code": "VEN",
    //         "name": "Venezuela",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ve.png",
    //         "prefix": "+58"
    //     },
    //     {
    //         "iso_code": "USA",
    //         "name": "United States",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/us.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "BRA",
    //         "name": "Brazil",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/br.png",
    //         "prefix": "+55"
    //     },
    //     {
    //         "iso_code": "PRT",
    //         "name": "Portugal",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pt.png",
    //         "prefix": "+351"
    //     },
    //     {
    //         "iso_code": "MDA",
    //         "name": "Moldova",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/md.png",
    //         "prefix": "+373"
    //     },
    //     {
    //         "iso_code": "BGD",
    //         "name": "Bangladesh",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bd.png",
    //         "prefix": "+880"
    //     },
    //     {
    //         "iso_code": "YEM",
    //         "name": "Yemen",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ye.png",
    //         "prefix": "+967"
    //     },
    //     {
    //         "iso_code": "MDG",
    //         "name": "Madagascar",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mg.png",
    //         "prefix": "+261"
    //     },
    //     {
    //         "iso_code": "HTI",
    //         "name": "Haiti",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ht.png",
    //         "prefix": "+509"
    //     },
    //     {
    //         "iso_code": "DEU",
    //         "name": "Germany",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/de.png",
    //         "prefix": "+49"
    //     },
    //     {
    //         "iso_code": "IDN",
    //         "name": "Indonesia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/id.png",
    //         "prefix": "+62"
    //     },
    //     {
    //         "iso_code": "UKR",
    //         "name": "Ukraine",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ua.png",
    //         "prefix": "+380"
    //     },
    //     {
    //         "iso_code": "KAZ",
    //         "name": "Kazakhstan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/kz.png",
    //         "prefix": "+7"
    //     },
    //     {
    //         "iso_code": "NGA",
    //         "name": "Nigeria",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ng.png",
    //         "prefix": "+234"
    //     },
    //     {
    //         "iso_code": "BDI",
    //         "name": "Burundi",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bi.png",
    //         "prefix": "+257"
    //     },
    //     {
    //         "iso_code": "TJK",
    //         "name": "Tajikistan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tj.png",
    //         "prefix": "+992"
    //     },
    //     {
    //         "iso_code": "AZE",
    //         "name": "Azerbaijan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/az.png",
    //         "prefix": "+994"
    //     },
    //     {
    //         "iso_code": "MAR",
    //         "name": "Morocco",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ma.png",
    //         "prefix": "+212"
    //     },
    //     {
    //         "iso_code": "CRI",
    //         "name": "Costa Rica",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cr.png",
    //         "prefix": "+506"
    //     },
    //     {
    //         "iso_code": "HND",
    //         "name": "Honduras",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/hn.png",
    //         "prefix": "+504"
    //     },
    //     {
    //         "iso_code": "COM",
    //         "name": "Comoros",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/km.png",
    //         "prefix": "+269"
    //     },
    //     {
    //         "iso_code": "TUN",
    //         "name": "Tunisia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tn.png",
    //         "prefix": "+216"
    //     },
    //     {
    //         "iso_code": "NRU",
    //         "name": "Nauru",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/nr.png",
    //         "prefix": "+674"
    //     },
    //     {
    //         "iso_code": "COD",
    //         "name": "Democratic Republic of the Congo",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cd.png",
    //         "prefix": "+243"
    //     },
    //     {
    //         "iso_code": "WSM",
    //         "name": "Samoa",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ws.png",
    //         "prefix": "+685"
    //     },
    //     {
    //         "iso_code": "LKA",
    //         "name": "Sri Lanka",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/lk.png",
    //         "prefix": "+94"
    //     },
    //     {
    //         "iso_code": "ARG",
    //         "name": "Argentina",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ar.png",
    //         "prefix": "+54"
    //     },
    //     {
    //         "iso_code": "MEX",
    //         "name": "Mexico",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mx.png",
    //         "prefix": "+52"
    //     },
    //     {
    //         "iso_code": "EGY",
    //         "name": "Egypt",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/eg.png",
    //         "prefix": "+20"
    //     },
    //     {
    //         "iso_code": "NPL",
    //         "name": "Nepal",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/np.png",
    //         "prefix": "+977"
    //     },
    //     {
    //         "iso_code": "POL",
    //         "name": "Poland",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pl.png",
    //         "prefix": "+48"
    //     },
    //     {
    //         "iso_code": "AIA",
    //         "name": "Anguilla",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ai.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "SGP",
    //         "name": "Singapore",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/sg.png",
    //         "prefix": "+65"
    //     },
    //     {
    //         "iso_code": "JAM",
    //         "name": "Jamaica",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/jm.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "KEN",
    //         "name": "Kenya",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ke.png",
    //         "prefix": "+254"
    //     },
    //     {
    //         "iso_code": "GNB",
    //         "name": "Guinea-Bissau",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gw.png",
    //         "prefix": "+245"
    //     },
    //     {
    //         "iso_code": "IND",
    //         "name": "India",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/in.png",
    //         "prefix": "+91"
    //     },
    //     {
    //         "iso_code": "THA",
    //         "name": "Thailand",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/th.png",
    //         "prefix": "+66"
    //     },
    //     {
    //         "iso_code": "FJI",
    //         "name": "Fiji",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/fj.png",
    //         "prefix": "+679"
    //     },
    //     {
    //         "iso_code": "BHS",
    //         "name": "Bahamas",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bs.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "DZA",
    //         "name": "Algeria",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/dz.png",
    //         "prefix": "+213"
    //     },
    //     {
    //         "iso_code": "NIC",
    //         "name": "Nicaragua",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ni.png",
    //         "prefix": "+505"
    //     },
    //     {
    //         "iso_code": "ZAF",
    //         "name": "South Africa",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/za.png",
    //         "prefix": "+27"
    //     },
    //     {
    //         "iso_code": "ESP",
    //         "name": "Spain",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/es.png",
    //         "prefix": "+34"
    //     },
    //     {
    //         "iso_code": "KWT",
    //         "name": "Kuwait",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/kw.png",
    //         "prefix": "+965"
    //     },
    //     {
    //         "iso_code": "BHR",
    //         "name": "Bahrain",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bh.png",
    //         "prefix": "+973"
    //     },
    //     {
    //         "iso_code": "ZMB",
    //         "name": "Zambia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/zm.png",
    //         "prefix": "+260"
    //     },
    //     {
    //         "iso_code": "CHL",
    //         "name": "Chile",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cl.png",
    //         "prefix": "+56"
    //     },
    //     {
    //         "iso_code": "GTM",
    //         "name": "Guatemala",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gt.png",
    //         "prefix": "+502"
    //     },
    //     {
    //         "iso_code": "BLZ",
    //         "name": "Belize",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bz.png",
    //         "prefix": "+501"
    //     },
    //     {
    //         "iso_code": "ABW",
    //         "name": "Aruba",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/aw.png",
    //         "prefix": "+297"
    //     },
    //     {
    //         "iso_code": "CYP",
    //         "name": "Cyprus",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cy.png",
    //         "prefix": "+357"
    //     },
    //     {
    //         "iso_code": "UZB",
    //         "name": "Uzbekistan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/uz.png",
    //         "prefix": "+998"
    //     },
    //     {
    //         "iso_code": "PAK",
    //         "name": "Pakistan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pk.png",
    //         "prefix": "+92"
    //     },
    //     {
    //         "iso_code": "MYS",
    //         "name": "Malaysia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/my.png",
    //         "prefix": "+60"
    //     },
    //     {
    //         "iso_code": "CIV",
    //         "name": "Ivory Coast",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ci.png",
    //         "prefix": "+225"
    //     },
    //     {
    //         "iso_code": "MMR",
    //         "name": "Myanmar",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mm.png",
    //         "prefix": "+95"
    //     },
    //     {
    //         "iso_code": "ARE",
    //         "name": "United Arab Emirates",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ae.png",
    //         "prefix": "+971"
    //     },
    //     {
    //         "iso_code": "COL",
    //         "name": "Colombia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/co.png",
    //         "prefix": "+57"
    //     },
    //     {
    //         "iso_code": "PAN",
    //         "name": "Panama",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pa.png",
    //         "prefix": "+507"
    //     },
    //     {
    //         "iso_code": "GIN",
    //         "name": "Guinea",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gn.png",
    //         "prefix": "+224"
    //     },
    //     {
    //         "iso_code": "MSR",
    //         "name": "Montserrat",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ms.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "VUT",
    //         "name": "Vanuatu",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/vu.png",
    //         "prefix": "+678"
    //     },
    //     {
    //         "iso_code": "PRI",
    //         "name": "Puerto Rico",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pr.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "PSE",
    //         "name": "Palestinian Territory",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ps.png",
    //         "prefix": "+97"
    //     },
    //     {
    //         "iso_code": "ROU",
    //         "name": "Romania",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ro.png",
    //         "prefix": "+407"
    //     },
    //     {
    //         "iso_code": "GHA",
    //         "name": "Ghana",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gh.png",
    //         "prefix": "+233"
    //     },
    //     {
    //         "iso_code": "URY",
    //         "name": "Uruguay",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/uy.png",
    //         "prefix": "+598"
    //     },
    //     {
    //         "iso_code": "TZA",
    //         "name": "Tanzania",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tz.png",
    //         "prefix": "+255"
    //     },
    //     {
    //         "iso_code": "ECU",
    //         "name": "Ecuador",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ec.png",
    //         "prefix": "+593"
    //     },
    //     {
    //         "iso_code": "BOL",
    //         "name": "Bolivia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bo.png",
    //         "prefix": "+591"
    //     },
    //     {
    //         "iso_code": "TTO",
    //         "name": "Trinidad and Tobago",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tt.png",
    //         "prefix": "+1868"
    //     },
    //     {
    //         "iso_code": "BMU",
    //         "name": "Bermuda",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bm.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "AFG",
    //         "name": "Afghanistan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/af.png",
    //         "prefix": "+93"
    //     },
    //     {
    //         "iso_code": "ASM",
    //         "name": "American Samoa",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/as.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "TUR",
    //         "name": "Turkey",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tr.png",
    //         "prefix": "+90"
    //     },
    //     {
    //         "iso_code": "PRY",
    //         "name": "Paraguay",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/py.png",
    //         "prefix": "+595"
    //     },
    //     {
    //         "iso_code": "UGA",
    //         "name": "Uganda",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ug.png",
    //         "prefix": "+256"
    //     },
    //     {
    //         "iso_code": "ETH",
    //         "name": "Ethiopia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/et.png",
    //         "prefix": "+251"
    //     },
    //     {
    //         "iso_code": "TCA",
    //         "name": "Turks and Caicos Islands",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tc.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "VNM",
    //         "name": "Vietnam",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/vn.png",
    //         "prefix": "+84"
    //     },
    //     {
    //         "iso_code": "VGB",
    //         "name": "British Virgin Islands",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/vg.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "GRD",
    //         "name": "Grenada",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gd.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "KOR",
    //         "name": "South Korea",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/kr.png",
    //         "prefix": "+82"
    //     },
    //     {
    //         "iso_code": "ALB",
    //         "name": "Albania",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/al.png",
    //         "prefix": "+355"
    //     },
    //     {
    //         "iso_code": "AGO",
    //         "name": "Angola",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ao.png",
    //         "prefix": "+244"
    //     },
    //     {
    //         "iso_code": "PER",
    //         "name": "Peru",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pe.png",
    //         "prefix": "+51"
    //     },
    //     {
    //         "iso_code": "SEN",
    //         "name": "Senegal",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/sn.png",
    //         "prefix": "+221"
    //     },
    //     {
    //         "iso_code": "LAO",
    //         "name": "Laos",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/la.png",
    //         "prefix": "+856"
    //     },
    //     {
    //         "iso_code": "ITA",
    //         "name": "Italy",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/it.png",
    //         "prefix": "+39"
    //     },
    //     {
    //         "iso_code": "LBR",
    //         "name": "Liberia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/lr.png",
    //         "prefix": "+231"
    //     },
    //     {
    //         "iso_code": "CMR",
    //         "name": "Cameroon",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cm.png",
    //         "prefix": "+237"
    //     },
    //     {
    //         "iso_code": "GMB",
    //         "name": "Gambia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gm.png",
    //         "prefix": "+220"
    //     },
    //     {
    //         "iso_code": "CUB",
    //         "name": "Cuba",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cu.png",
    //         "prefix": "+53"
    //     },
    //     {
    //         "iso_code": "GUF",
    //         "name": "French Guiana",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gf.png",
    //         "prefix": "+594"
    //     },
    //     {
    //         "iso_code": "PNG",
    //         "name": "Papua New Guinea",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/pg.png",
    //         "prefix": "+675"
    //     },
    //     {
    //         "iso_code": "NER",
    //         "name": "Niger",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ne.png",
    //         "prefix": "+227"
    //     },
    //     {
    //         "iso_code": "ATG",
    //         "name": "Antigua and Barbuda",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ag.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "BEN",
    //         "name": "Benin",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bj.png",
    //         "prefix": "+229"
    //     },
    //     {
    //         "iso_code": "KGZ",
    //         "name": "Kyrgyzstan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/kg.png",
    //         "prefix": "+996"
    //     },
    //     {
    //         "iso_code": "SUR",
    //         "name": "Suriname",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/sr.png",
    //         "prefix": "+597"
    //     },
    //     {
    //         "iso_code": "JOR",
    //         "name": "Jordan",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/jo.png",
    //         "prefix": "+962"
    //     },
    //     {
    //         "iso_code": "ZWE",
    //         "name": "Zimbabwe",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/zw.png",
    //         "prefix": "+263"
    //     },
    //     {
    //         "iso_code": "IRQ",
    //         "name": "Iraq",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/iq.png",
    //         "prefix": "+964"
    //     },
    //     {
    //         "iso_code": "CYM",
    //         "name": "Cayman Islands",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ky.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "DMA",
    //         "name": "Dominica",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/dm.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "MNG",
    //         "name": "Mongolia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mn.png",
    //         "prefix": "+976"
    //     },
    //     {
    //         "iso_code": "KHM",
    //         "name": "Cambodia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/kh.png",
    //         "prefix": "+855"
    //     },
    //     {
    //         "iso_code": "LTU",
    //         "name": "Lithuania",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/lt.png",
    //         "prefix": "+370"
    //     },
    //     {
    //         "iso_code": "GUY",
    //         "name": "Guyana",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/gy.png",
    //         "prefix": "+592"
    //     },
    //     {
    //         "iso_code": "DOM",
    //         "name": "Dominican Republic",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/do.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "LBN",
    //         "name": "Lebanon",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/lb.png",
    //         "prefix": "+961"
    //     },
    //     {
    //         "iso_code": "CAF",
    //         "name": "Central African Republic",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cf.png",
    //         "prefix": "+236"
    //     },
    //     {
    //         "iso_code": "LCA",
    //         "name": "Saint Lucia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/lc.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "BFA",
    //         "name": "Burkina Faso",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bf.png",
    //         "prefix": "+226"
    //     },
    //     {
    //         "iso_code": "SLE",
    //         "name": "Sierra Leone",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/sl.png",
    //         "prefix": "+232"
    //     },
    //     {
    //         "iso_code": "TON",
    //         "name": "Tonga",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/to.png",
    //         "prefix": "+676"
    //     },
    //     {
    //         "iso_code": "KNA",
    //         "name": "Saint Kitts and Nevis",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/kn.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "MLI",
    //         "name": "Mali",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/ml.png",
    //         "prefix": "+223"
    //     },
    //     {
    //         "iso_code": "ARM",
    //         "name": "Armenia",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/am.png",
    //         "prefix": "+374"
    //     },
    //     {
    //         "iso_code": "BRB",
    //         "name": "Barbados",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/bb.png",
    //         "prefix": "+1"
    //     },
    //     {
    //         "iso_code": "MWI",
    //         "name": "Malawi",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mw.png",
    //         "prefix": "+265"
    //     },
    //     {
    //         "iso_code": "MOZ",
    //         "name": "Mozambique",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mz.png",
    //         "prefix": "+258"
    //     },
    //     {
    //         "iso_code": "CPV",
    //         "name": "Cape Verde",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cv.png",
    //         "prefix": "+238"
    //     },
    //     {
    //         "iso_code": "BLR",
    //         "name": "Belarus",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/by.png",
    //         "prefix": "+375"
    //     },
    //     {
    //         "iso_code": "CHN",
    //         "name": "China",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cn.png",
    //         "prefix": "+86"
    //     },
    //     {
    //         "iso_code": "SWZ",
    //         "name": "Swaziland",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/sz.png",
    //         "prefix": "+268"
    //     },
    //     {
    //         "iso_code": "TGO",
    //         "name": "Togo",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/tg.png",
    //         "prefix": "+228"
    //     },
    //     {
    //         "iso_code": "COG",
    //         "name": "Republic of the Congo",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/cg.png",
    //         "prefix": "+242"
    //     },
    //     {
    //         "iso_code": "MTQ",
    //         "name": "Martinique",
    //         "flag": "https://pos-app.kuidopay.com/images/flags/mq.png",
    //         "prefix": "+596"
    //     }
    // ],
    //             selectedDestination: this.selectedDestination
    //           }
    //         });
    //         await modal.present();
    //           const { data } = await modal.onWillDismiss();
    //         if (data) {
    //           this.selectedDestination = data;
    //           this.selectedOperator = null;
    //           this.operatorService.getOperators("1", data.iso_code).subscribe({
    //             next: (operators) => {
    //               this.operators$.next(operators);
    //               console.log('operators', operators);
    //             },
    //             error: (error) => {
    //               console.error('Error fetching operators:', error);
    //             }
    //           });
    //         }


    //         return;
    this.alertService.openModalAlert();
    this.countries$.subscribe({
      next: async (countries) => {
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
          this.selectedOperator = null;
          this.operatorService.getOperators("1", data.iso_code).subscribe({
            next: (operators) => {
              this.operators$.next(operators);
              console.log('operators', operators);
            },
            error: (error) => {
              console.error('Error fetching operators:', error);
            }
          });
        }
      }
    })





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
    this.alertService.openModalAlert();
    setTimeout(() => {
      this.alertService.dismiss();
      this.showInputs = true;
    }, 3000);
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


  }

  //cicli de vida de inic cuando se abandona la pagina 
  async ionViewWillLeave() {
    await this.storage.removeStorageKey(StorageKeys.TOP_UP_DATA);
  }

  cleanString(value: string): string {
    return value.replace(/[\s()-]/g, '');
  }


}