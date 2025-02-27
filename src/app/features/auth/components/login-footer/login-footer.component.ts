import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-footer',
  templateUrl: './login-footer.component.html',
  styleUrls: ['./login-footer.component.scss'],
  standalone: true,
  imports:[IonicModule]
})
export class LoginFooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
