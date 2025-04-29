import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-selector',
  templateUrl: './login-selector.component.html',
  styleUrls: ['./login-selector.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class LoginSelectorComponent  implements OnInit {

  @Output() loginWithEmail = new EventEmitter<void>();
  @Output() loginWithPhone = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {}

  onLoginEmail() {
    this.loginWithEmail.emit();
  }

  onLoginPhone() {
    this.loginWithPhone.emit();
  }

}
