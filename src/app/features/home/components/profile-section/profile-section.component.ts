import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile-section',
  templateUrl: './profile-section.component.html',
  styleUrls: ['./profile-section.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProfileSectionComponent  implements OnInit {

  @Input() profile!: any;

  constructor() { }

  ngOnInit() {
    if (!this.profile?.avatar_url) {
      this.profile.avatar_url = 'assets/img/shared/avatar-profile.png'; // Default avatar
      console.log('Profile Section Component Initialized', this.profile);
    }
  }

}
