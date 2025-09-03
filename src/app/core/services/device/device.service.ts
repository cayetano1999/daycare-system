import { inject, Injectable } from '@angular/core';
import { StorageHelper } from '../../helpers/storage.helper';
import { StorageKeys } from '../../enums/storage.keys.enum';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

@Injectable({providedIn: 'root'})
export class DeviceService {
    constructor() { }
    
    private storageHelper = inject(StorageHelper);

    public async getDeviceInfo(){
        const device_id = await this.storageHelper.getStorageKey(StorageKeys.FINGERPRINT_DEVICE_ID);
        const device_info = await Device.getInfo();
        const device_name = `${Capacitor.getPlatform()} - ${device_info.name || device_info.model || 'Desconocido'}`;
        return { device_id, device_name };
    }
    
}