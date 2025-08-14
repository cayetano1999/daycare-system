import { inject, Injectable } from '@angular/core';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  supabaseService = inject(SupabaseService);
  supabaseClient = this.supabaseService.getSupabase();

  constructor() {
    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      console.log('PaymentSheetEventsEnum.Completed');
    });
    Stripe.addListener(PaymentSheetEventsEnum.Failed, (e) => {
      console.log('PaymentSheetEventsEnum.Failed', e);
    });
    Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, (e) => {
      console.log('PaymentSheetEventsEnum.FailedToLoad', e);
    });
  }

  async createPaymentIntent(data: { amount: number; currency: string; destination_number: string; }) {
    const { data: result, error } = await this.supabaseClient.functions.invoke('create-payment-intent', {
      body: data,
    });
    if (error) throw error;
    return result;
  }

  // Inicializa y muestra la hoja de pago
  async payWithStripe(customerId: string, customerEphemeralKeySecret: string,paymentIntentClientSecret: string) {
    try {

      await Stripe.createPaymentSheet({
        paymentIntentClientSecret,
        customerEphemeralKeySecret,
        merchantDisplayName: 'Kuido',
        customerId
      });
      return Stripe.presentPaymentSheet();
    } catch (err) {
      console.log("Error payWithStripe", err)
      throw err
    }
  }
}
