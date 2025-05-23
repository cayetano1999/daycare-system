import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProfilePage {
  settingsItems = [
    {
      name: 'Notifications',
      icon: 'notifications-outline',
      hasToggle: true,
      hasChevron: false
    },
    {
      name: 'Change password',
      icon: 'key-outline',
      hasToggle: false,
      hasChevron: true
    },
    {
      name: 'Language',
      icon: 'globe-outline',
      hasToggle: false,
      hasChevron: true
    },
    {
      name: 'Terms and conditions',
      icon: 'document-text-outline',
      hasToggle: false,
      hasChevron: true
    }
  ];

  dangerItems = [
    {
      name: 'Deleted account',
      icon: 'person-remove-outline'
    },
    {
      name: 'Log out',
      icon: 'log-out-outline'
    }
  ];

  constructor() {}
}
