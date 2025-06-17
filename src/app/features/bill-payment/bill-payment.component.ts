import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoTabComponent } from 'src/app/shared/components/kuido-tab/kuido-tab.component';

interface ServiceOption {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
}

@Component({
  selector: 'app-bill-payment',
  templateUrl: './bill-payment.component.html',
  styleUrls: ['./bill-payment.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, KuidoHeaderComponent, KuidoTabComponent]
})
export class BillPaymentComponent  implements OnInit {

  serviceOptions: ServiceOption[] = [
    {
      id: 1,
      name: 'Mobile\nbill',
      icon: '/assets/img/shared/phone-form.svg',
      isActive: true,
    },
    {
      id: 2,
      name: 'Electric\nbill',
      icon: '/assets/img/shared/electricity.svg',
      isActive: false,
    },
    {
      id: 3,
      name: 'Internet\nbill',
      icon: '/assets/img/shared/wifi.svg',
      isActive: false,
    },
    {
      id: 4,
      name: 'Garbage\nbill',
      icon: '/assets/img/shared/delivery.svg',
      isActive: false,
    }
  ];

  selectService(id: number): void {
    this.serviceOptions = this.serviceOptions.map(service => ({
      ...service,
      isActive: service.id === id
    }));
  }

  ngOnInit() {}

}
