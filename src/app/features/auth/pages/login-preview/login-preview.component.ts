import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { KuidoHeaderComponent } from 'src/app/shared/components/kuido-header/kuido-header.component';
import { KuidoSocialLoginComponent } from 'src/app/shared/components/kuido-social-login/kuido-social-login.component';
import { LoginSelectorComponent } from '../../components/login-selector/login-selector.component';

@Component({
  selector: 'app-login-preview',
  templateUrl: './login-preview.component.html',
  styleUrls: ['./login-preview.component.scss'],
  standalone: true,
  imports:[IonicModule, KuidoHeaderComponent, KuidoSocialLoginComponent, LoginSelectorComponent]
})
export class LoginPreviewComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
