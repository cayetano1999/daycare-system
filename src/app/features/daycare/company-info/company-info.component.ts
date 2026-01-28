import { Component, inject, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { SupabaseClient } from '@supabase/supabase-js';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { CommunicationService } from 'src/app/core/services/comunication/communication.service';
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';
import { SupabaseStorageService } from 'src/app/core/services/supabase-storage.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { CustomHeaderComponent } from 'src/app/shared/daycare/custom-header/custom-header.component';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
  standalone: true,
  imports: [...StandAloneModules, CustomHeaderComponent],
})
export class CompanyInfoComponent {

  supabaseService = inject(SupabaseService);
  storageHelper = inject(StorageHelper);
  supabaseStorage = inject(SupabaseStorageService);
  alertCtrl = inject(AlertControllerService);
  comunicationService = inject(CommunicationService);
  supabase!: SupabaseClient;

  company: any = {
    full_name: '',
    phone_number: '',
    address: '',
    identification: '',
    avatar_url: '',
    footer_message: ''
  };

  loading = false;
  selectedFile: File | null = null;

  constructor() { }

  async ionViewWillEnter() {
    this.supabase = this.supabaseService.getSupabase();
    await this.loadCompany();
  }

  async getSecureUrl(url: string): Promise<string> {
    const path = url.split('babyhouse')[1];
    return this.supabaseStorage.getSignedUrl(`${path}`);
  }

  async loadCompany() {
    this.alertCtrl.openFestivaAlert('loading', 'Cargando información de la guardería...', 'por favor espera');
    const userData = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);
    const { data } = await this.supabase
      .from('user_profiles'
      )
      .select(`
        *,
        company(*)
        `)
      .eq('id', userData?.id)
      .limit(1)
      .single();

    if (data.company) {
      this.company = data?.company;
    }
    this.alertCtrl.dismiss();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadLogo(): Promise<string | null> {
    this.alertCtrl.openFestivaAlert('loading', 'Subiendo logo de la guardería...', 'por favor espera');
    if (!this.selectedFile) return this.company.avatar_url;

    const fileExt = this.selectedFile.name.split('.').pop();
    const filePath = `logos/${this.company.identification}.${fileExt}`;

    const { error } = await this.supabase.storage
      .from('companies')
      .upload(filePath, this.selectedFile, {
        upsert: true
      });

    if (error) {
      this.alertCtrl.dismiss();
      throw error
    };

    const { data } = this.supabase.storage
      .from('companies')
      .getPublicUrl(filePath);

    this.alertCtrl.dismiss();
    return data.publicUrl;
  }

  async saveCompany() {
    this.alertCtrl.openFestivaAlert('loading', 'Guardando información de la guardería...', 'por favor espera');
    try {
      this.loading = true;

      const logoUrl = await this.uploadLogo();

      const payload = {
        ...this.company,
        avatar_url: logoUrl
      };

      let companyResult = null;
      if (this.company.id) {
        companyResult = await this.supabase
          .from('company')
          .update(payload)
          .eq('id', this.company.id).select().single();
      } else {
        companyResult = await this.supabase
          .from('company')
          .insert(payload).select().single();
      }

      let userData = await this.storageHelper.getStorageKey(StorageKeys.USER_DATA);

      if (userData) {
        userData = {  
          ...userData,
          company: {
            ...companyResult.data
          }
        };
        await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, userData);
      }

      this.comunicationService.sendMessage('company-info-updated');
      await this.alertCtrl.openFestivaAlert('success', 'Información guardada', 'La información de la guardería se ha guardado correctamente.');
      await this.loadCompany();
    } catch (e) {
      console.error(e);
      await this.alertCtrl.openFestivaAlert('danger', 'Error guardando los datos', 'Ha ocurrido un error al guardar la información de la guardería.');
    } finally {
      this.loading = false;
    }
  }
}
