import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-kuido-social-login',
  templateUrl: './kuido-social-login.component.html',
  styleUrls: ['./kuido-social-login.component.scss'],
  standalone: true
})
export class KuidoSocialLoginComponent  implements OnInit {

  @Output() googleLogin = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {}

  emitGoogleLogin() {
    this.googleLogin.emit();
  }

}
