import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {AvatarModule} from 'primeng/avatar';
import {OverlayBadgeModule} from 'primeng/overlaybadge';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { StatusBarHelper } from 'src/app/core/helpers/status-bar.helper';
import { COLORS } from 'src/app/core/constants/constants';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';

interface Service {
  id: number;
  title: string;
  icon: string;
  alt: string;
}

interface Transaction {
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
  imports: [IonicModule, AvatarModule, CardModule, TagModule, RouterModule, CommonModule, KuidoHeaderComponent]
})
export class HomePage  implements OnInit {

  //Services
  private readonly statusBar = inject(StatusBarHelper);
  private readonly router = inject(Router);
  constructor() { }

  ngOnInit() {}

  services: Service[] = [
    {
      id: 1,
      title: 'Top\nUps',
      icon: 'assets/img/shared/topups.svg',
      alt: 'Icon'
    },
    {
      id: 2,
      title: 'Bill Payment',
      icon: 'assets/img/shared/payments.svg',
      alt: 'Ticket alt duotone'
    },
    {
      id: 3,
      title: 'Gift\nCards',
      icon: 'assets/img/shared/cards.svg',
      alt: 'Icon'
    },
    {
      id: 4,
      title: 'Favorites\nNumbers',
      icon: 'assets/img/shared/favoritesnumbers.svg',
      alt: 'Estrella de la lista'
    }
  ];

  transactions: Transaction[] = [
    {
      name: 'Kathya Yu',
      image: 'assets/img/shared/person.svg',
      date: 'Jan 7, 2025',
      amount: '-$4.99',
      description: 'Sent top-up',
      isNegative: true
    },
    {
      name: 'Received',
      image: 'assets/img/shared/money.svg',
      date: 'Jan 7, 2025',
      amount: '$9.99',
      description: 'Received top-up',
      isNegative: false
    },
    {
      name: 'Key Food gif card',
      image: 'assets/img/shared/bag.svg',
      date: 'Jan 7, 2025',
      amount: '-$9.99',
      description: 'Sent gif card',
      isNegative: true
    }
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



  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  //Lifecycle
  async ionViewWillEnter() { 
    await this.statusBar.setStatusBarStyle(COLORS.white)

  }

}
