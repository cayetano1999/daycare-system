import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-header',
  templateUrl: './login-header.component.html',
  styleUrls: ['./login-header.component.scss'],
  standalone: true,
  imports:[CommonModule, FormsModule, IonicModule],
})
export class LoginHeaderComponent  {

  //Inputs
  @Input({required: true}) label!: string;
  @Input({required: true}) image!: string;
  @Input({ required: true }) keyBoard!: boolean;

  constructor() { }


}
