import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
interface UserData {
  id: string;
  contact: string;
  full_name: string;
  userName: string;
  avatar_url?: string;
}

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
  imports: [IonicModule, CommonModule]

})

export class UpdateProfileComponent implements OnInit {

  private readonly modalCtrl = inject(ModalController);
  constructor() { }

  @Input() profile!: UserData;

  ngOnInit() { }


  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.profile.full_name = target.value;
  }

  onSave(): void {
    this.modalCtrl.dismiss(this.profile);
    // Implement your save logic here
  }

  onCancel(): void {
    this.modalCtrl.dismiss(null);
    // Implement your cancel logic here
  }

}
