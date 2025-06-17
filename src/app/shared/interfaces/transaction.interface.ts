
import { Country } from "src/app/core/models/country.type";
import { DeviceInfo } from "./device.interface";
import { Operator } from "src/app/core/models/operator.type";

export interface ContactInfo {
    name: string;
    phoneNumber: string;
}

export interface Transaction {
    id: string;
    countryDestination: Country;
    operator: Operator;
    amount: number;
    currency: string;
    date: Date;
    device: DeviceInfo;
    contactInfo: ContactInfo;
}