import { inject, Injectable } from "@angular/core";
import { StorageHelper } from "../helpers/storage.helper";
import { StorageKeys } from "../enums/storage.keys.enum";

@Injectable({
    providedIn: 'root'
})

export class CreditCardService {

    private readonly storageHelper = inject(StorageHelper);
    constructor() { }
    
}