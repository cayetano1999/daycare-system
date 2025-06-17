import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Transaction } from '../../shared/interfaces/transaction.interface';
import { StorageHelper } from '../helpers/storage.helper';
import { StorageKeys } from '../enums/storage.keys.enum';
import { ToUpsData } from 'src/app/features/top-up/pages/send-top-ups/send-top-ups.component';
import { v4 as uuidv4 } from 'uuid'; // Using uuid library for generating unique IDs


@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    // countriesBehaviorSubject = new BehaviorSubject<Country[]>([]);
    httpClient = inject(HttpClient);
    storageHelper = inject(StorageHelper);
    constructor() { }

    async saveTransaction(transaction: Transaction) {
        const transactions = await this.storageHelper.getStorageKey<Transaction[]>(StorageKeys.TRANSACTIONS) || [];
        transactions.push(transaction);
        await this.storageHelper.setStorageKey(StorageKeys.TRANSACTIONS, transactions);
        return transaction;
    }



    //Maping Methods

    async mapTransactionToInterface(data: ToUpsData, amount: number) {
        return {
            id: uuidv4(), // Generate a unique ID for the transaction
            countryDestination: data.selectedDestination,
            operator: data.selectedOperator,
            amount: amount,
            currency: 'USD', // Assuming USD as the currency
            date: new Date(),
            device: await this.storageHelper.getStorageKey<string>(StorageKeys.FINGERPRINT_DEVICE_ID as string),
            contactInfo: {
                name: data.contactName || 'Unknown',
                phoneNumber: data.phoneNumber
            }
        };
    }

    async getTransactions(): Promise<Transaction[]> {
        return await this.storageHelper.getStorageKey<Transaction[]>(StorageKeys.TRANSACTIONS) || [];
    }


}
