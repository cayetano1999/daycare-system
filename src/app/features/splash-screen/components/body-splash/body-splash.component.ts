import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { RoutesApp } from 'src/app/core/enums/routes.enum';

@Component({
  selector: 'app-body-splash',
  templateUrl: './body-splash.component.html',
  styleUrls: ['./body-splash.component.scss'],
  imports: [IonicModule],
})
export class BodySplashComponent  implements OnInit {

  //Outputs
  @Output() onNextClick = new EventEmitter<void>();
  @Output() onNoLoginVersionClick = new EventEmitter<void>();

  ngOnInit() {}


  onNext() {
    this.onNextClick.emit();
  }

  onNoLoginVersion() {
    this.onNoLoginVersionClick.emit();
  }

}
