import { inject, Injectable } from "@angular/core";
import { CreditCard } from "src/app/features/creditcard/pages/create-credit-card/create-credit-card.component";
import { StorageHelper } from "../helpers/storage.helper";
import { StorageKeys } from "../enums/storage.keys.enum";

@Injectable({
    providedIn: 'root'
})

export class CreditCardService {

    private readonly storageHelper = inject(StorageHelper);
    constructor() { }


    async saveCreditCard(data: CreditCard) {

        const cards = await this.storageHelper.getStorageKey<CreditCard[]>(StorageKeys.CREDIT_CARDS) || [];
        // Check if the card already exists
        const existingCardIndex = cards.findIndex((card: CreditCard) => card.cardNumber === data.cardNumber);
        if (existingCardIndex !== -1) {
            // Update existing card
            cards[existingCardIndex] = data;
        }
        else {
            // Add new card
            cards.push(data);
        }
        // Save the updated cards array back to storage
        await this.storageHelper.setStorageKey(StorageKeys.CREDIT_CARDS, cards);
        return cards;
    }

    async getCreditCards(): Promise<CreditCard[]> {
        return await this.storageHelper.getStorageKey<CreditCard[]>(StorageKeys.CREDIT_CARDS) || [];
    }

    // Method to validate credit card number using Luhn algorithm
    validateCardNumber(cardNumber: string): boolean {
        const sanitized = cardNumber.replace(/\D/g, '');
        let sum = 0;
        let alternate = false;

        for (let i = sanitized.length - 1; i >= 0; i--) {
            let n = parseInt(sanitized.charAt(i), 10);
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 === 0;
    }
}