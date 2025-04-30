import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile-section',
  templateUrl: './profile-section.component.html',
  styleUrls: ['./profile-section.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProfileSectionComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
