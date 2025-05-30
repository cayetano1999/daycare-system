import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { ToastControllerService } from 'src/app/core/services/ionic/toast-controller.service';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

export interface CreditCard {
  cardNumber: string;
  holder: string;
  cvv: string;
  expiry: string;
}

@Component({
  selector: 'app-create-credit-card',
  templateUrl: './create-credit-card.component.html',
  styleUrls: ['./create-credit-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CreateCreditCardComponent {

  private readonly toastCtrl = inject(ToastControllerService);
  private readonly creditCardService = inject(CreditCardService);
  private readonly alertCtrl = inject(AlertControllerService);
  private readonly navCtrl = inject(NavController);

  cardForm!: FormGroup;
  cvvVisible = false;

  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      cardNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{16,19}$/)
        ]
      ],
      holder: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\\s]+$/)
        ]
      ],
      cvv: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3,4}$/)
        ]
      ],
      expiry: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
        ]
      ]
    });
  }

  togglePasswordVisibility() {
    this.cvvVisible = !this.cvvVisible;
  }

 async onSubmit() {
    if (this.cardForm.valid) {
      console.log('Card registered:', this.cardForm.value);
      // Puedes emitir o enviar los datos aquí
      this.alertCtrl.openModalAlert();
      setTimeout(async () => {
        await this.creditCardService.saveCreditCard(this.cardForm.value as CreditCard);
        this.alertCtrl.dismiss();
        this.toastCtrl.showToastSuccess('Credit card has been saved', 2000);
        this.navCtrl.navigateRoot(RoutesApp.PROFILE);
      }, 3000);

    } else {
      this.cardForm.markAllAsTouched();
    }
  }

  back(){
    this.navCtrl.back();
  }
}
