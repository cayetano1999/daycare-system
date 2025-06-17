import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoTabComponent } from 'src/app/shared/components/kuido-tab/kuido-tab.component';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { RoutesApp } from 'src/app/core/enums/routes.enum';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Operator } from 'src/app/core/models/operator.type';
import { Country } from 'src/app/core/models/country.type';
import { OperatorService } from 'src/app/core/services/operator.service';
import { ServiceType } from 'src/app/core/enums/service-type.enum';

interface TopUpOption {
  id: number;
  usdAmount: number;
  dopAmount: number;
  icon: string;
  isSelected: boolean;
}

export interface ToUpsData {
  phoneNumber: string;
  selectedOperator: Operator;
  selectedDestination: Country;
  navigationId: number;
  contactName?: string;
}
@Component({
  selector: 'app-send-top-ups',
  templateUrl: './send-top-ups.component.html',
  styleUrls: ['./send-top-ups.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, KuidoHeaderComponent, KuidoTabComponent]

})
export class SendTopUpsComponent implements OnInit {

  //Services
  private readonly navCtrl = inject(NavController);
  private readonly alertCtrl = inject(AlertControllerService);
  private readonly location = inject(Location);
  private readonly storageHelper = inject(StorageHelper);
  private readonly transactionService = inject(TransactionService)
  private readonly operatorService = inject(OperatorService)

  amount: number = 0;
  topUpOptions: TopUpOption[] = [];
  // [
  //   {
  //     id: 1,
  //     usdAmount: 4.99,
  //     dopAmount: 317.25,
  //     icon: '/assets/img/shared/sendtopup.svg',
  //     isSelected: true
  //   },
  //   {
  //     id: 2,
  //     usdAmount: 9.99,
  //     dopAmount: 634.50,
  //     icon: '/assets/img/shared/sendtopup.svg',
  //     isSelected: false
  //   },
  //   {
  //     id: 3,
  //     usdAmount: 14.99,
  //     dopAmount: 951.75,
  //     icon: '/assets/img/shared/sendtopup.svg',
  //     isSelected: false
  //   }
  // ];

  topUpData!: ToUpsData;

  constructor() {
    // Recibir por state los parámetros selectedDestination, selectedOperator y phoneNumber
  }


  async ngOnInit() {
    

  }

  goBack() {
    this.navCtrl.back();
  }

  selectTopUp(selectedOption: TopUpOption) {
    this.topUpOptions = this.topUpOptions.map(option => ({
      ...option,
      isSelected: option.id === selectedOption.id
    }));
    this.amount = selectedOption.usdAmount;
    this.confirmTopUp();
  }

  async confirmTopUp() {
    const result = await this.alertCtrl.openModalConfirmTopUp(this.amount);
    if (result?.success) {
      const topUpData = await this.storageHelper.getStorageKey<ToUpsData>(StorageKeys.TOP_UP_DATA);
      this.alertCtrl.openModalAlert();
      setTimeout(async () => {
        const transaction = await this.transactionService.mapTransactionToInterface(topUpData, this.amount);
        await this.transactionService.saveTransaction(transaction);
        this.alertCtrl.dismiss();
        this.alertCtrl.openModalTopUpSuccess(topUpData).then(result => {
          this.navCtrl.navigateForward(RoutesApp.HOME)
        });
      }, 3000);

    }


  }

  async ionViewWillEnter() {
    const navState = this.location.getState() as ToUpsData;
    console.log('Received data from navigation:', navState);
    this.topUpData = navState;

    this.alertCtrl.openModalAlert();
    const topUpOptions = await this.operatorService.getProductAmmounts(ServiceType.TopUp, this.topUpData.selectedDestination.iso_code, this.topUpData.selectedOperator.id);
    console.log('Top Up Options:', topUpOptions);
    if (topUpOptions) {
      this.topUpOptions = topUpOptions.map((item,index) => {
        return {
          id: index,
          usdAmount: Number(item.amount),
          dopAmount: Number(item.amount) * 60,
          icon: '/assets/img/shared/sendtopup.svg',
          isSelected: false
        }
      });
    }
    this.alertCtrl.dismiss();


    await this.storageHelper.setStorageKey(StorageKeys.TOP_UP_DATA, this.topUpData);

  }
}