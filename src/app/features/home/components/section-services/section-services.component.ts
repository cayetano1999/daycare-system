import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { Service } from '../../home.page';

@Component({
  selector: 'app-section-services',
  templateUrl: './section-services.component.html',
  styleUrls: ['./section-services.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SectionServicesComponent  implements OnInit {

  //Inputs
  @Input() services: Service[] = [];

  //Services
  private readonly navCtrl = inject(NavController)

  constructor() { }

  ngOnInit() {}

  redirectToService(service: Service) {
    this.navCtrl.navigateRoot(service.url);
  }

}
