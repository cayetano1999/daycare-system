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
import { FingerprintService } from 'src/app/core/services/fingerprint.service';
import { ALERT_ICONS } from 'src/app/core/constants/constants';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { PaymentService } from 'src/app/core/services/payment.service';
import { loadStripe } from '@stripe/stripe-js';

interface TopUpOption {
  id: number;
  usdAmount: number;
  currency: string;
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
  imports: [IonicModule, CommonModule, FormsModule, KuidoHeaderComponent, KuidoTabComponent],
  providers: [FingerprintService]

})
export class SendTopUpsComponent implements OnInit {

  //Services
  private readonly navCtrl = inject(NavController);
  private readonly supabaseService = inject(SupabaseService);
  private readonly alertCtrl = inject(AlertControllerService);
  private readonly location = inject(Location);
  private readonly storageHelper = inject(StorageHelper);
  private readonly transactionService = inject(TransactionService)
  private readonly operatorService = inject(OperatorService)
  private readonly fingerprint = inject(FingerprintService);
  private readonly alertCtrlIonic = inject(AlertController);
  private readonly paymentService = inject(PaymentService);

  amount: number = 0;
  currency: string = "";
  topUpOptions: TopUpOption[] = [];


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
    this.currency = selectedOption.currency;
    this.confirmTopUp();
  }

  async doTopUp() {
    let userId = "";
    if (this.supabaseService.session?.user.id)
      userId = this.supabaseService.session.user.id;

    const data = {
      amount: this.amount, // en centavos (ej: $10.00)
      currency: this.currency,
      destination_number: this.topUpData.phoneNumber,
    };

    try {
      // 1. Solicita el PaymentIntent a tu función Edge de Supabase
      const { paymentIntent, ephemeralKey, customer, stripe_pk } = await this.paymentService.createPaymentIntent(data);
      console.log("Response", paymentIntent, ephemeralKey, customer, stripe_pk);

      // 2. Muestra el formulario de Stripe para pagar
      // const result = await this.paymentService.payWithStripe(customer, ephemeralKey ,paymentIntent);

      // const stripe = await loadStripe(stripe_pk);
      // if (stripe) {
      //   const elements = stripe.elements({ clientSecret: paymentIntent });

      //   const paymentElement = elements.create('payment'); // shows saved cards + add new
      //   paymentElement.mount('#payment-element');

      //   Later, confirm:
      //   const { error } = await stripe.confirmPayment({
      //     elements,
      //     confirmParams: { return_url: 'https://your.app/return' }, // or handle result without redirect
      //   });
      // }

      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: ephemeralKey,
        merchantDisplayName: 'Kuido',
        customerId: customer,
      });


      // const result = await Stripe.presentPaymentSheet();
      const result = await Stripe.presentPaymentSheet();
      // // Confirm PaymentFlow. Completed.
      // const confirmResult = await Stripe.confirmPaymentFlow();
      if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
        alert('Recarga exitosa');
      } else {
        alert('Pago no completado');
      }
    } catch (error) {
      console.log("Error en el pago", error);
    }
  }

  async confirmTopUp() {
    try {
      const result = await this.alertCtrl.openModalConfirmTopUp(this.amount, this.currency);
      if (result?.success) {
        const topUpData = await this.storageHelper.getStorageKey<ToUpsData>(StorageKeys.TOP_UP_DATA);
        await this.doTopUp();

        const authentication = await this.fingerprint.authenticate();
        if (!authentication) {
          this.alertCtrl.openModalAlertMessage('Please try again.', 'Authentication Failed', ALERT_ICONS.ERROR, 'alert', 'OK');
          return;
        }

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
    catch (error) {
      console.error('Error confirming top-up:', error);
      this.alertCtrl.error('Error', JSON.stringify(error));
    }
  }


  async loginWithBiometrics() {
    const credentials = await this.fingerprint.authenticate();

    alert('Biometric authentication result: ' + JSON.stringify(credentials));


  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrlIonic.create({
      header: title,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async ionViewWillEnter() {
    const navState = this.location.getState() as ToUpsData;
    console.log('Received data from navigation:', navState);
    this.topUpData = navState;

    this.alertCtrl.openModalAlert();
    const topUpOptions = await this.operatorService.getProductAmmounts(ServiceType.TopUp, this.topUpData.selectedDestination.iso_code, this.topUpData.selectedOperator.id);
    console.log('Top Up Options:', topUpOptions);
    if (topUpOptions) {
      this.topUpOptions = topUpOptions.map((item, index) => {
        return {
          id: index,
          usdAmount: Number(item.amount),

          currency: item.unit,
          //Todo: Change conversion rate
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