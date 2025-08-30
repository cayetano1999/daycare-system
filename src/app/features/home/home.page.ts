import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { COLORS } from 'src/app/core/constants/constants';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoTabComponent } from 'src/app/shared/components/kuido-tab/kuido-tab.component';
import { ProfileSectionComponent } from './components/profile-section/profile-section.component';
import { SectionServicesComponent } from './components/section-services/section-services.component';
import { SectionTransactionsComponent } from './components/section-transactions/section-transactions.component';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { StorageHelper } from 'src/app/core/helpers/storage.helper';
import { StorageKeys } from 'src/app/core/enums/storage.keys.enum';
import { Transaction } from 'src/app/shared/interfaces/transaction.interface';
import { OperatorService } from 'src/app/core/services/operator.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { v4 as uuidv4 } from 'uuid'; // Using uuid library for generating unique IDs
import { AlertControllerService } from 'src/app/core/services/ionic/alert-controller.service';


export interface Service {
  id: number;
  title: string;
  icon: string;
  alt: string;
  url: string;
  active: boolean;
}

export interface TransactionTemplate {
  name: string;
  image: string;
  date: string;
  amount: string;
  description: string;
  isNegative: boolean;
}

interface NavItem {
  id: number;
  label: string;
  isActive: boolean;
  position: string;
  imgSrc?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, AvatarModule, CardModule, TagModule, RouterModule, CommonModule, KuidoHeaderComponent, KuidoTabComponent, ProfileSectionComponent, SectionServicesComponent, SectionTransactionsComponent],
})
export class HomePage implements OnInit {

  //Services
  private readonly statusBar = inject(StatusBarHelper);
  private readonly router = inject(Router);
  private readonly storageHelper = inject(StorageHelper);
  private readonly alertCtrl = inject(AlertControllerService);

  supabase = inject(SupabaseService);
  paymentService = inject(PaymentService);
  profile: any;
  session: any;
  supabaseClient = this.supabase.getSupabase();

  constructor() { }

  async ngOnInit() {

  }


  services: Service[] = [
    {
      id: 1,
      title: 'Top\nUps',
      icon: 'assets/img/shared/topups.svg',
      alt: 'Icon',
      url: 'top-up/validate-phone',
      active: true,
    },
    {
      id: 2,
      title: 'Bill Payment',
      icon: 'assets/img/shared/bill-disabled.svg',
      alt: 'Ticket alt duotone',
      url: 'bill-payment',
      active: false,
    },
    {
      id: 3,
      title: 'Gift\nCards',
      icon: 'assets/img/shared/gift-card-disabled.svg',
      alt: 'Icon',
      url: 'gift-cards',
      active: false,
    },
    {
      id: 4,
      title: 'Favorites\nNumbers',
      icon: 'assets/img/shared/favoritesnumbers.svg',
      alt: 'Estrella de la lista',
      url: 'favorite-numbers',
      active: true,
    }
  ];

  transactionsTemplate: TransactionTemplate[] = [
  
  ];

  navItems: NavItem[] = [
    {
      id: 1,
      label: 'Home',
      isActive: true,
      position: 'left-3'
    },
    {
      id: 2,
      label: 'Bills',
      isActive: false,
      position: 'left-[83px]',
      imgSrc: '/assets/img/shared/klogo.svg'
    },
    {
      id: 3,
      label: 'Gift Cards',
      isActive: false,
      position: 'left-[241px]',
      imgSrc: '/assets/img/shared/klogo.svg'

    },
    {
      id: 4,
      label: 'Profile',
      isActive: false,
      position: 'left-[318px]'
    }
  ];


  //Lifecycle
  async ionViewWillEnter() {
    // await this.statusBar.setStatusBarStyle(COLORS.headerGreen);
    await this.storageHelper.removeStorageKey(StorageKeys.TOP_UP_DATA)
    this.transactionsTemplate = await this.getTransactions();
    console.log('Transactions Template:', this.transactionsTemplate);

    //group service array by status active and the order by id
    this.services = this.services
      .sort((a, b) => {
        if (a.active === b.active) {
          return a.id - b.id;
        }
        return a.active ? -1 : 1;
      });

    await this.fillMissingProfileFileds();

  }


  async getTransactions() {
    let transactions = await this.storageHelper.getStorageKey<Transaction>(StorageKeys.TRANSACTIONS) || [];
    //Take first 10
    console.log('Transactions from Storage:', transactions);
    const test = transactions.map((transaction: Transaction) => ({
      name: transaction?.contactInfo?.name == 'Unknown' ? transaction.contactInfo?.phoneNumber : transaction?.contactInfo?.name || transaction?.contactInfo?.phoneNumber || transaction.countryDestination.name,
      image: transaction.countryDestination.flag,
      date: new Date(transaction.date),
      amount: `${transaction.amount} ${transaction.currency}`,
      description: `Sent top-up`,
      isNegative: true
    }));

    console.log('Mapped Transactions:', test);
    return test.reverse().slice(0, 10);
  }

  async fillMissingProfileFileds() {
    await this.alertCtrl.openModalAlert();

    const profile = await this.supabase.profile();
    await this.storageHelper.setStorageKey(StorageKeys.USER_DATA, profile.data);
    console.log('Profile SUPABASE:', profile);
    const session = (await this.supabaseClient.auth.getSession()).data.session;
      console.log('Session SUPABASE:', session);
    if ((!session?.user?.id || profile.data?.full_name) && profile.data?.avatar_url) {
      this.profile = profile.data;
      await this.alertCtrl.dismiss();
      return;
    }


    if(!session){
      await this.alertCtrl.dismiss();
      return;
    }
    const full_name = await this.storageHelper.getStorageKey<string>(StorageKeys.USER_FULL_NAME);
    const { data, error } = await this.supabaseClient.functions.invoke('fill-profile-fields', {
      body: { user_id: session.user.id, username: session.user.email || session.user.phone, full_name: full_name || 'Kuido User' }
    });
    if (error) {
      await this.alertCtrl.dismiss();
      console.error('Error calling function:', error.message);
    } else {
      await this.alertCtrl.dismiss();

      console.log('Profile filled successfully:', data);
      this.profile = data.profile;
      await this.alertCtrl.dismiss();
    }
  }

  handleTopUp() {
    this.router.navigate(['top-up/validate-phone']);
  }

}
