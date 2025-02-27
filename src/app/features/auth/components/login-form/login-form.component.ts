import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
    imports:[IonicModule]
  
})
export class LoginFormComponent  implements OnInit {

  @Output() onLogin = new EventEmitter();

  constructor() { }

  ngOnInit() {}


  login() {
    this.onLogin.emit();
  }


}
