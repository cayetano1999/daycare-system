import { Country, Operator } from "src/app/features/top-up/pages/validate-phone/validate-phone.component";
import { DeviceInfo } from "./device.interface";

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