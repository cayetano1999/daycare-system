import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-selector',
  templateUrl: './login-selector.component.html',
  styleUrls: ['./login-selector.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class LoginSelectorComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
