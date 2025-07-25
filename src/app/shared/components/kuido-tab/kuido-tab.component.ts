import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-kuido-tab',
  templateUrl: './kuido-tab.component.html',
  styleUrls: ['./kuido-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class KuidoTabComponent implements OnInit {

  isIos: boolean = Capacitor.getPlatform() === 'ios';

  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);

  constructor() { }

  ngOnInit() { }


  redirect(url: string) {
    this.navCtrl.navigateRoot(url);
  }


getTabIcon(tab: string): string {
  const url = this.router.url;

  switch (tab) {
    case 'home':
      return url === '/home' ? '../../../../assets/img/shared/home_single_active.svg' : '../../../../assets/img/shared/home_single.svg';
    case 'bills':
      return url === '/bills' ? '../../../assets/img/shared/bills_active.svg' : '../../../assets/img/shared/bills.svg';
    case 'main':
      return '../../../assets/img/shared/kuidocircle.svg'; // Este no cambia
    case 'gifcards':
      return url === '/gifcards' ? '../../../assets/img/shared/bagfooter_active.svg' : '../../../assets/img/shared/bagfooter.svg';
    case 'profile':
      return url === '/profile' ? '../../../assets/img/shared/user_3_active.svg' : '../../../assets/img/shared/user_3.svg';
    default:
      return '';
  }
}


}
