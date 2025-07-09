import { inject, Injectable } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  supabaseService = inject(SupabaseService);
  supabaseClient = this.supabaseService.getSupabase();

  async createPaymentIntent(data: { amount: number; currency: string; user_id: string; destination_number: string; }) {
    const { data: result, error } = await this.supabaseClient.functions.invoke('create-payment-intent', {
      body: data,
    });
    if (error) throw error;
    return result as { client_secret: string };
  }

  // Inicializa y muestra la hoja de pago
  async payWithStripe(clientSecret: string) {
    try {
      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Kuido',
      });
      const result = await Stripe.presentPaymentSheet();
      return result;
    } catch (err) {
      console.log("Error payWithStripe",err)
      throw err
    }
  }
}
