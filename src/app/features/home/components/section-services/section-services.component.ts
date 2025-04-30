import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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

  constructor() { }

  ngOnInit() {}

}
